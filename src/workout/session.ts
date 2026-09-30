import { ExerciseDefinition, WorkoutPlan } from '../types';
import { buildRoundSteps, WorkoutStep } from './steps';
import { validPlan, validExercise, object, number } from '../storage/validation';

export type SessionPhase = 'countdown' | 'transition' | 'exercise' | 'rest' | 'done';
export type StepResult = { round: number; index: number; reps: number; seconds: number; workSeconds?: number; estimatedReps?: boolean; completed: boolean };
export type AutoTiming = { secondsPerRep: number; transitionSeconds: number };
export type WorkoutSession = {
  autoTiming?: AutoTiming;
  version: 1; id: string; finishedAt?: string; plan: WorkoutPlan; steps: WorkoutStep[]; manualRest: boolean; fingerprint: string;
  phase: SessionPhase; round: number; index: number; phaseMs: number; workMs: number; restMs: number; pauseMs: number;
  paused: boolean; waiting: boolean; lastAt: number; results: StepResult[]; status: 'completed' | 'partial';
};
export function planFingerprint(plan: WorkoutPlan, catalog: ExerciseDefinition[], manualRest: boolean, autoTiming?: AutoTiming): string {
  return JSON.stringify({ ...(autoTiming ? { autoTiming } : {}), rounds: plan.rounds, weight: plan.weightKg, rest: plan.restSeconds, manualRest,
    steps: buildRoundSteps(plan, catalog).map(s => [s.exercise.id, s.exercise.equipment ?? 'kettlebell', s.side, s.mode, s.value]) });
}
export function createSession(plan: WorkoutPlan, catalog: ExerciseDefinition[], manualRest: boolean, now: number, autoTiming?: AutoTiming): WorkoutSession {
  if (autoTiming && (!number(autoTiming.secondsPerRep, 1, 10) || !number(autoTiming.transitionSeconds, 0, 60) || !Number.isInteger(autoTiming.transitionSeconds))) throw new Error('Invalid automatic timing');
  const frozen = JSON.parse(JSON.stringify(plan)) as WorkoutPlan;
  if (!validPlan(frozen)) throw new Error('Invalid workout plan');
  const steps = JSON.parse(JSON.stringify(buildRoundSteps(frozen, catalog))) as WorkoutStep[];
  if (!steps.length || new Set(steps.map(s => s.itemKey)).size !== frozen.items.length) throw new Error('An exercise is missing from this workout. Review it in the builder.');
  return { version: 1, id: `session-${Date.now()}-${Math.random().toString(36).slice(2,9)}`, plan: frozen, steps, manualRest, ...(autoTiming ? { autoTiming: { ...autoTiming } } : {}),
    fingerprint: planFingerprint(frozen, catalog, manualRest, autoTiming), phase: 'countdown', round: 1, index: 0, phaseMs: 0,
    workMs: 0, restMs: 0, pauseMs: 0, paused: false, waiting: false, lastAt: now, results: [], status: 'completed' };
}
function record(s: WorkoutSession, completed: boolean, actualReps?: number, estimatedReps = false) {
  const step = s.steps[s.index];
  s.results = [...s.results.filter(r => r.round !== s.round || r.index !== s.index), { round: s.round, index: s.index,
    workSeconds: s.phaseMs / 1000, ...(estimatedReps ? { estimatedReps: true } : {}),
    reps: step.mode === 'reps' ? actualReps ?? (completed ? step.value : 0) : 0,
    seconds: step.mode === 'time' ? Math.min(step.value, s.phaseMs / 1000) : 0,
    completed: completed && (step.mode !== 'time' || s.phaseMs >= step.value * 1000) }];
}
function enter(s: WorkoutSession, phase: SessionPhase) { if (phase === 'done') s.finishedAt = new Date().toISOString(); s.phase = phase; s.phaseMs = 0; s.waiting = false; }
function next(s: WorkoutSession) {
  if (s.index + 1 < s.steps.length) { s.index++; enter(s, s.autoTiming?.transitionSeconds ? 'transition' : 'exercise'); }
  else if (s.round < s.plan.rounds) {
    if (s.plan.restSeconds > 0) enter(s, 'rest');
    else { s.round++; s.index = 0; enter(s, s.autoTiming?.transitionSeconds ? 'transition' : 'exercise'); }
  } else {
    enter(s, 'done'); s.status = s.results.every(r => r.completed) ? 'completed' : 'partial';
  }
}
function phaseTarget(s: WorkoutSession): number {
  const step = s.steps[s.index];
  return s.phase === 'countdown' ? 3 : s.phase === 'transition' ? s.autoTiming?.transitionSeconds ?? 0 : s.phase === 'rest' ? s.plan.restSeconds : s.phase === 'exercise' ? (step.mode === 'time' ? step.value : step.value * (s.autoTiming?.secondsPerRep ?? 0)) : 0;
}
export function remainingSeconds(s: WorkoutSession): number {
  const target = phaseTarget(s);
  return Math.max(0, Math.ceil(target - s.phaseMs / 1000));
}
/** Consume real elapsed milliseconds, including across delayed foreground callbacks. */
export function tickSession(previous: WorkoutSession, now: number): WorkoutSession {
  if (previous.phase === 'done' || now <= previous.lastAt) return previous;
  const s = { ...previous, results: [...previous.results], lastAt: now };
  let delta = now - previous.lastAt;
  if (s.paused || s.waiting) { s.pauseMs += delta; return s; }
  while (delta > 0 && s.phase !== 'done') {
    const step = s.steps[s.index];
    if (s.phase === 'exercise' && step.mode === 'reps' && !s.autoTiming) { s.phaseMs += delta; s.workMs += delta; break; }
    const target = phaseTarget(s) * 1000;
    const consume = Math.min(delta, Math.max(0, target - s.phaseMs));
    s.phaseMs += consume; delta -= consume;
    if (s.phase === 'exercise') s.workMs += consume;
    if (s.phase === 'rest' || s.phase === 'transition') s.restMs += consume;
    if (s.phaseMs < target) break;
    if (s.phase === 'countdown' || s.phase === 'transition') enter(s, 'exercise');
    else if (s.phase === 'rest') {
      if (s.manualRest) { s.waiting = true; s.pauseMs += delta; break; }
      s.round++; s.index = 0; enter(s, 'exercise');
    } else { record(s, true, undefined, step.mode === 'reps' && !!s.autoTiming); next(s); }
  }
  return s;
}
export type RepAction = { type: 'record-reps'; reps: number; stepKey: string; round: number; endWorkout: boolean };
export type SessionAction = RepAction | 'pause' | 'resume' | 'next' | 'skip' | 'continue' | 'back' | 'finish-partial';
export function actOnSession(previous: WorkoutSession, action: SessionAction, now: number): WorkoutSession {
  const s = { ...tickSession(previous, now) };
  if (s.phase === 'done') return s;
  if (typeof action === 'object') {
    const step = s.steps[s.index];
    if (s.phase !== 'exercise' || step.mode !== 'reps' || step.stepKey !== action.stepKey || s.round !== action.round || !Number.isInteger(action.reps) || action.reps < 0 || action.reps > step.value) return s;
    record(s, action.reps === step.value, action.reps);
    if (action.endWorkout) { enter(s, 'done'); s.status = s.results.length === s.steps.length * s.plan.rounds && s.results.every(r => r.completed) ? 'completed' : 'partial'; }
    else { s.paused = false; next(s); }
    return s;
  }
  if (action === 'pause') { s.paused = true; return s; }
  if (action === 'resume') { s.paused = false; return s; }
  if (action === 'finish-partial') { if (s.phase === 'exercise') record(s, false); enter(s, 'done'); s.status = 'partial'; return s; }
  if (action === 'back') {
    if (s.phase === 'rest') enter(s, 'exercise');
    else if (s.index > 0) { s.index--; enter(s, 'exercise'); }
    else if (s.round > 1) { s.round--; s.index = s.steps.length - 1; enter(s, 'exercise'); }
    else enter(s, 'exercise');
    s.results = s.results.filter(r => (r.round - 1) * s.steps.length + r.index < (s.round - 1) * s.steps.length + s.index);
    s.paused = false; return s;
  }
  // Ignore stale taps when a deadline advanced to another phase/step first.
  if (s.phase !== previous.phase || s.index !== previous.index || s.round !== previous.round) return s;
  if (action === 'continue' && s.phase === 'transition') { s.paused = false; enter(s, 'exercise'); }
  else if (action === 'continue' && s.phase === 'rest') { s.round++; s.index = 0; s.paused = false; enter(s, 'exercise'); }
  else if ((action === 'next' || action === 'skip') && s.phase === 'exercise' && !s.paused) { record(s, action === 'next'); next(s); }
  return s;
}
export function restoreSession(s: WorkoutSession, now: number): WorkoutSession {
  // Never guess what was performed while the app was not running.
  return { ...s, paused: s.phase !== 'done', lastAt: now };
}
export function sessionSummary(s: WorkoutSession) {
  let totalReps = 0, volumeKg = 0;
  const byExercise = new Map<string, { exerciseId: string; name: string; reps: number; seconds: number }>();
  for (const r of s.results) {
    const step = s.steps[r.index]; totalReps += r.reps;
    if (step.exercise.equipment !== 'bodyweight') volumeKg += r.reps * s.plan.weightKg;
    else if (r.reps > 0 || r.seconds > 0) {
      const item = byExercise.get(step.exercise.id) ?? { exerciseId: step.exercise.id, name: step.exercise.name, reps: 0, seconds: 0 };
      item.reps += r.reps; item.seconds += r.seconds; byExercise.set(item.exerciseId, item);
    }
  }
  const items = [...byExercise.values()].map(item => ({ ...item, seconds: Math.floor(item.seconds) }));
  let rounds = 0;
  for (let round = 1; round <= s.plan.rounds; round++) if (s.results.filter(r => r.round === round && r.completed).length === s.steps.length) rounds++;
  return { totalReps, volumeKg, rounds, durationSeconds: Math.round((s.workMs + s.restMs) / 1000), workSeconds: Math.round(s.workMs / 1000), restSeconds: Math.round(s.restMs / 1000), pauseSeconds: Math.round(s.pauseMs / 1000), wallSeconds: Math.round((s.workMs + s.restMs + s.pauseMs) / 1000),
    bodyweight: { items, totalReps: items.reduce((n, r) => n + r.reps, 0), totalSeconds: items.reduce((n, r) => n + r.seconds, 0) } };
}
export function validSession(x: unknown): x is WorkoutSession {
  if (!object(x) || x.version !== 1 || typeof x.id !== 'string' || !validPlan(x.plan) || !Array.isArray(x.steps) || !x.steps.length || typeof x.fingerprint !== 'string' || typeof x.manualRest !== 'boolean') return false;
  if (x.autoTiming !== undefined && (!object(x.autoTiming) || !number(x.autoTiming.secondsPerRep,1,10) || !number(x.autoTiming.transitionSeconds,0,60) || !Number.isInteger(x.autoTiming.transitionSeconds))) return false;
  if (x.phase === 'transition' && !x.autoTiming?.transitionSeconds) return false;
  if (x.finishedAt !== undefined && (typeof x.finishedAt !== 'string' || !Number.isFinite(Date.parse(x.finishedAt)))) return false;
  if (!['countdown','transition','exercise','rest','done'].includes(x.phase) || !['completed','partial'].includes(x.status) || typeof x.paused !== 'boolean' || typeof x.waiting !== 'boolean') return false;
  if (!['round','index','phaseMs','workMs','restMs','pauseMs'].every(k => number(x[k])) || !number(x.lastAt, 0, 1e15) || !Number.isInteger(x.round) || x.round < 1 || x.round > x.plan.rounds || !Number.isInteger(x.index) || x.index >= x.steps.length) return false;
  if (!x.steps.every((s: any) => object(s) && validExercise(s.exercise) && ['reps','time'].includes(s.mode) && number(s.value,1,3600) && typeof s.itemKey === 'string' && typeof s.stepKey === 'string' && ['none','both','left','right','alternate'].includes(s.side))) return false;
  const expected = buildRoundSteps(x.plan, x.steps.map((s: WorkoutStep) => s.exercise));
  if (JSON.stringify(expected) !== JSON.stringify(x.steps) || x.fingerprint !== planFingerprint(x.plan, x.steps.map((s: WorkoutStep) => s.exercise), x.manualRest, x.autoTiming)) return false;
  if (x.waiting && (x.phase !== 'rest' || !x.manualRest || x.phaseMs !== x.plan.restSeconds * 1000)) return false;
  return Array.isArray(x.results) && x.results.every((r: any) => object(r) && Number.isInteger(r.round) && r.round >= 1 && r.round <= x.plan.rounds && Number.isInteger(r.index) && r.index >= 0 && r.index < x.steps.length && number(r.reps) && number(r.seconds) && (r.workSeconds === undefined || number(r.workSeconds)) && (r.estimatedReps === undefined || (r.estimatedReps === true && !!x.autoTiming && x.steps[r.index].mode === 'reps')) && typeof r.completed === 'boolean' && (x.steps[r.index].mode === 'time' ? r.reps === 0 && r.seconds <= x.steps[r.index].value && (!r.completed || r.seconds === x.steps[r.index].value) : r.seconds === 0 && Number.isInteger(r.reps) && r.reps <= x.steps[r.index].value && (!r.completed || r.reps === x.steps[r.index].value))) && new Set(x.results.map((r: StepResult) => `${r.round}:${r.index}`)).size === x.results.length;
}
