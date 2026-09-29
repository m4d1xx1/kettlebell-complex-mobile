import { ExerciseDefinition, WorkoutPlan } from '../types';

export type ExercisePairing = { exerciseId: string; reason: string };
const pair = (exerciseId: string, reason: string): ExercisePairing => ({ exerciseId, reason });
const squat = pair('goblet-squat', 'Adds a knee-dominant leg movement alongside the hip hinge.');
const row = pair('row', 'Adds an upper-body pull to balance pressing or lower-body work.');
const press = pair('strict-press', 'Adds controlled overhead pressing to the complex.');
const core = pair('plank', 'Adds a static trunk-control exercise between dynamic movements.');
const bwSquat = pair('air-squat', 'Adds lower-body work without equipment.');
const pushup = pair('push-up', 'Adds horizontal pressing for the upper body.');
const bridge = pair('glute-bridge', 'Adds controlled hip extension on the floor.');
const side = pair('side-plank', 'Adds lateral trunk stability to the workout.');
const hinge = pair('deadlift', 'Adds a controlled hip hinge alongside the squat or lunge.');
const kbPush = [row, squat, core];
const kbHinge = [squat, press, core];
const kbLegs = [hinge, row, core];
const carries = [squat, row, pushup];

/** Workout-building suggestions, not a mandatory sequence or a load prescription. */
export const EXERCISE_PAIRINGS: Record<string, ExercisePairing[]> = {
  'swing': kbHinge,
  'single-arm-swing': [squat, press, side],
  'clean': [pair('strict-press', 'The clean finishes in the rack, ready for a strict press.'), pair('front-squat', 'Uses the rack position reached at the end of the clean.'), row],
  'snatch': [squat, row, core],
  'high-pull': kbHinge,
  'strict-press': kbPush,
  'push-press': kbPush,
  'clean-and-press': [squat, row, side],
  'row': [press, squat, core],
  'deadlift': [squat, pushup, side],
  'romanian-deadlift': kbHinge,
  'goblet-squat': kbLegs,
  'front-squat': [pair('clean', 'Brings the kettlebell into the rack used for the front squat.'), row, core],
  'reverse-lunge': [hinge, press, side],
  'thruster': [row, hinge, core],
  'halo': [squat, hinge, core],
  'around-the-world': [squat, press, core],
  'suitcase-hold': carries,
  'rack-hold': carries,
  'farmer-march': carries,
  'front-rack-march': carries,
  'floor-press': [row, squat, bridge],
  'windmill': [squat, row, core],
  'air-squat': [pushup, bridge, core],
  'push-up': [bwSquat, bridge, side],
  'plank': [bwSquat, pushup, bridge],
  'side-plank': [bwSquat, pushup, bridge],
  'glute-bridge': [bwSquat, pushup, side],
  'mountain-climber': [bwSquat, bridge, side],
  'burpee': [bridge, core, side],
  'high-knees': [bwSquat, pushup, bridge],
  'bodyweight-reverse-lunge': [pushup, bridge, side]
};
const pattern = (e: ExerciseDefinition) => ['swing','clean','snatch','deadlift'].includes(e.visual) ? 'hinge' : ['press','floor-press','pushup'].includes(e.visual) ? 'push' : e.visual === 'row' || e.visual === 'high-pull' ? 'pull' : ['squat','lunge'].includes(e.visual) ? 'legs' : 'core';
export function getExercisePairings(exercise: ExerciseDefinition, available: ExerciseDefinition[], plan?: WorkoutPlan) {
  const selected = new Set(plan?.items.map(item => item.exerciseId) ?? []);
  const patterns = new Set(available.filter(item => selected.has(item.id)).map(pattern));
  return (EXERCISE_PAIRINGS[exercise.id] ?? [])
    .filter(pairing => pairing.exerciseId !== exercise.id)
    .flatMap(pairing => {
      const match = available.find(item => item.id === pairing.exerciseId);
      return match ? [{ exercise: match, reason: pairing.reason }] : [];
    })
    .sort((a,b) => Number(selected.has(a.exercise.id)) - Number(selected.has(b.exercise.id)) || Number(patterns.has(pattern(a.exercise))) - Number(patterns.has(pattern(b.exercise))))
    .map(pairing => ({ ...pairing, reason: selected.has(pairing.exercise.id) ? `${pairing.reason} Already in your workout.` : plan?.items.length && !patterns.has(pattern(pairing.exercise)) ? `${pairing.reason} Adds a movement type not yet in your plan.` : pairing.reason }));
}
