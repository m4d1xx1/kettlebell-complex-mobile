import { AppSettings, ExerciseDefinition, SavedComplex, WorkoutHistoryEntry, WorkoutPlan } from '../types';
export const object = (x: unknown): x is Record<string, any> => !!x && typeof x === 'object' && !Array.isArray(x);
export const number = (x: unknown, min = 0, max = 1e10) => typeof x === 'number' && Number.isFinite(x) && x >= min && x <= max;
const integer = (x: unknown, min = 0, max = 1e6) => number(x, min, max) && Number.isInteger(x);
const text = (x: unknown) => typeof x === 'string' && x.length > 0;
const date = (x: unknown) => text(x) && Number.isFinite(Date.parse(x as string));
export const strings = (x: unknown): x is string[] => Array.isArray(x) && x.every(v => typeof v === 'string');
export function validPlan(x: unknown): x is WorkoutPlan {
  return object(x) && typeof x.name === 'string' && number(x.weightKg, 0, 500) && integer(x.rounds, 1, 100) && integer(x.restSeconds, 0, 3600) && Array.isArray(x.items) && x.items.length <= 1000 &&
    x.items.every((v: unknown) => object(v) && text(v.key) && text(v.exerciseId) && ['reps', 'time'].includes(v.mode) && integer(v.value, 1, 3600) && ['both','left','right','alternate'].includes(v.side)) && new Set(x.items.map((v: any) => v.key)).size === x.items.length;
}
export function validExercise(x: unknown): x is ExerciseDefinition {
  return object(x) && text(x.id) && text(x.name) && ['Ballistic','Strength','Legs','Core'].includes(x.category) && ['reps','time'].includes(x.defaultMode) && integer(x.defaultValue, 1, 3600) &&
    ['swing','clean','high-pull','press','snatch','squat','lunge','row','deadlift','halo','carry','pushup','plank','burpee','bridge','high-knees','windmill','floor-press'].includes(x.visual) &&
    (x.equipment === undefined || ['kettlebell','bodyweight'].includes(x.equipment)) && (x.unilateral === undefined || typeof x.unilateral === 'boolean') &&
    (x.description === undefined || typeof x.description === 'string') && (x.technique === undefined || strings(x.technique)) && (x.focus === undefined || strings(x.focus));
}
export const validExercises = (x: unknown): x is ExerciseDefinition[] => Array.isArray(x) && x.every(validExercise) && new Set(x.map(v => v.id)).size === x.length;
export const validSaved = (x: unknown): x is SavedComplex[] => Array.isArray(x) && x.every(v => object(v) && text(v.id) && date(v.savedAt) && validPlan(v));
export function validHistory(x: unknown): x is WorkoutHistoryEntry[] {
  return Array.isArray(x) && x.every(v => object(v) && text(v.id) && typeof v.planName === 'string' && date(v.completedAt) && number(v.durationSeconds) && number(v.weightKg) && integer(v.rounds) && integer(v.exerciseCount) && number(v.totalReps) && number(v.volumeKg) && (v.plan === undefined || validPlan(v.plan)) && (v.results === undefined || Array.isArray(v.results) && v.results.every((r: unknown) => object(r) && integer(r.round,1) && integer(r.index) && text(r.exerciseId) && text(r.name) && ['kettlebell','bodyweight'].includes(r.equipment) && ['none','both','left','right','alternate'].includes(r.side) && ['time','reps'].includes(r.mode) && number(r.target,1) && number(r.reps) && number(r.seconds) && (r.workSeconds === undefined || number(r.workSeconds)) && (r.estimatedReps === undefined || typeof r.estimatedReps === 'boolean') && typeof r.completed === 'boolean')) && (v.status === undefined || ['completed','partial'].includes(v.status)) && (v.timeBasis === undefined || ['active-v1','monotonic-v2'].includes(v.timeBasis)) && (v.fingerprint === undefined || typeof v.fingerprint === 'string') && ['workSeconds','restSeconds','pauseSeconds','wallSeconds'].every(key => v[key] === undefined || number(v[key])));
}
export function validSettings(x: unknown): x is AppSettings {
  return object(x) && ['soundCues','voiceCues','countdownVoice','haptics','manualContinueAfterRest','autoAdvanceExercises','onboardingComplete'].every(key => x[key] === undefined || typeof x[key] === 'boolean') &&
    (x.secondsPerRep === undefined || number(x.secondsPerRep, 1, 10)) && (x.transitionSeconds === undefined || integer(x.transitionSeconds, 0, 60)) &&
    (x.defaultWeightKg === undefined || number(x.defaultWeightKg, 0, 500)) && (x.defaultRounds === undefined || integer(x.defaultRounds, 1, 100)) && (x.defaultRestSeconds === undefined || integer(x.defaultRestSeconds, 0, 3600));
}
