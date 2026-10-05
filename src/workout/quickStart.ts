import { ExerciseDefinition, WorkoutPlan } from '../types';
import { calculatePlanStats } from './steps';
import type { AutoTiming } from './session';
export function quickStartPlan(equipment: 'kettlebell' | 'bodyweight', minutes: number, level: 'Beginner' | 'Intermediate', goal: 'Strength' | 'Conditioning', weightKg: number, catalog: ExerciseDefinition[], autoTiming?: AutoTiming): WorkoutPlan {
  const advanced = level === 'Intermediate';
  const conditioning = goal === 'Conditioning';
  const ids = equipment === 'bodyweight'
    ? conditioning ? advanced ? ['air-squat','mountain-climber','glute-bridge','high-knees'] : ['air-squat','glute-bridge','high-knees']
      : advanced ? ['bodyweight-reverse-lunge','push-up','side-plank'] : ['air-squat','glute-bridge','plank']
    : conditioning ? advanced ? ['swing','goblet-squat','farmer-march'] : ['deadlift','goblet-squat','farmer-march']
      : advanced ? ['deadlift','strict-press','row','goblet-squat'] : ['deadlift','goblet-squat','row'];
  const plan: WorkoutPlan = { name: `${equipment === 'bodyweight' ? 'Bodyweight' : 'Kettlebell'} ${goal} · About ${minutes} min`, weightKg: equipment === 'bodyweight' ? 0 : weightKg, rounds: 1,
    restSeconds: conditioning ? advanced ? 30 : 45 : advanced ? 75 : 60,
    items: ids.map((id, index) => {
      const exercise = catalog.find(e => e.id === id);
      if (!exercise) throw new Error(`Quick workout exercise is unavailable: ${id}`);
      return { key: `quick-${Date.now()}-${index}`, exerciseId: id, mode: exercise.defaultMode,
        value: exercise.defaultMode === 'time' ? advanced ? 35 : 20 : conditioning ? advanced ? 12 : 10 : advanced ? 8 : 6,
        side: exercise.unilateral ? 'both' : 'alternate' };
    }) };
  // Choose the closest whole-round prescription using the same clock as preview.
  let closest = Infinity;
  for (let rounds = 1; rounds <= 30; rounds++) {
    const difference = Math.abs(calculatePlanStats({ ...plan, rounds }, catalog, autoTiming).estimatedSeconds - minutes * 60);
    if (difference < closest) { closest = difference; plan.rounds = rounds; }
  }
  return plan;
}
