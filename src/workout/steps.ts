import { ExerciseDefinition, SideMode, WorkoutPlan } from '../types';

export type WorkoutStep = {
  stepKey: string;
  itemKey: string;
  exercise: ExerciseDefinition;
  side: SideMode | 'none';
  sideLabel?: string;
  mode: 'reps' | 'time';
  value: number;
};

export function buildRoundSteps(plan: WorkoutPlan, catalog: ExerciseDefinition[]): WorkoutStep[] {
  const byId = new Map(catalog.map((x) => [x.id, x]));
  const steps: WorkoutStep[] = [];

  for (const item of plan.items) {
    const exercise = byId.get(item.exerciseId);
    if (!exercise) continue;

    const base = {
      itemKey: item.key,
      exercise,
      mode: item.mode,
      value: item.value
    } as const;

    if (!exercise.unilateral) {
      steps.push({ ...base, stepKey: `${item.key}:none`, side: 'none' });
      continue;
    }

    if (item.side === 'both') {
      steps.push({ ...base, stepKey: `${item.key}:left`, side: 'left', sideLabel: 'LEFT' });
      steps.push({ ...base, stepKey: `${item.key}:right`, side: 'right', sideLabel: 'RIGHT' });
    } else if (item.side === 'left') {
      steps.push({ ...base, stepKey: `${item.key}:left`, side: 'left', sideLabel: 'LEFT' });
    } else if (item.side === 'right') {
      steps.push({ ...base, stepKey: `${item.key}:right`, side: 'right', sideLabel: 'RIGHT' });
    } else {
      steps.push({ ...base, stepKey: `${item.key}:alternate`, side: 'alternate', sideLabel: 'ALTERNATE' });
    }
  }
  return steps;
}

export function calculatePlanStats(plan: WorkoutPlan, catalog: ExerciseDefinition[]) {
  const steps = buildRoundSteps(plan, catalog);
  const repsPerRound = steps.filter((x) => x.mode === 'reps').reduce((sum, x) => sum + x.value, 0);
  const loadedRepsPerRound = steps
    .filter((x) => x.mode === 'reps' && x.exercise.equipment !== 'bodyweight')
    .reduce((sum, x) => sum + x.value, 0);
  const timedSecondsPerRound = steps.filter((x) => x.mode === 'time').reduce((sum, x) => sum + x.value, 0);
  const estimatedWorkSecondsPerRound = steps.reduce((sum, x) => sum + (x.mode === 'time' ? x.value : x.value * 2.6), 0);
  const totalReps = repsPerRound * plan.rounds;
  return {
    stepsPerRound: steps.length,
    repsPerRound,
    totalReps,
    timedSecondsPerRound,
    volumeKg: loadedRepsPerRound * plan.rounds * plan.weightKg,
    estimatedSeconds: Math.round(estimatedWorkSecondsPerRound * plan.rounds + Math.max(0, plan.rounds - 1) * plan.restSeconds)
  };
}


export type BodyweightSummaryItem = {
  exerciseId: string;
  name: string;
  reps: number;
  seconds: number;
};

export function calculateBodyweightSummary(plan: WorkoutPlan, catalog: ExerciseDefinition[]) {
  const steps = buildRoundSteps(plan, catalog).filter((step) => step.exercise.equipment === 'bodyweight');
  const byExercise = new Map<string, BodyweightSummaryItem>();

  for (const step of steps) {
    const current = byExercise.get(step.exercise.id) ?? {
      exerciseId: step.exercise.id,
      name: step.exercise.name,
      reps: 0,
      seconds: 0
    };

    if (step.mode === 'reps') current.reps += step.value * plan.rounds;
    else current.seconds += step.value * plan.rounds;

    byExercise.set(step.exercise.id, current);
  }

  const items = [...byExercise.values()];
  return {
    totalReps: items.reduce((sum, item) => sum + item.reps, 0),
    totalSeconds: items.reduce((sum, item) => sum + item.seconds, 0),
    items
  };
}
