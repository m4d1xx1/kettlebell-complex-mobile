import { ExerciseDefinition } from '../types';

export const BASE_EXERCISES: ExerciseDefinition[] = [
  {
    id: 'swing', name: 'Kettlebell Swing', category: 'Ballistic', defaultMode: 'reps', defaultValue: 15, visual: 'swing',
    difficulty: 'Beginner', focus: ['Hips', 'Glutes', 'Conditioning'],
    description: 'A ballistic hip-hinge that drives the kettlebell with the hips rather than the arms.',
    technique: ['Hinge, do not squat the swing.', 'Keep the bell close on the backswing.', 'Stand tall by snapping the hips; avoid leaning back.', 'Let the arms guide the bell instead of lifting it.']
  },
  {
    id: 'clean', name: 'Clean', category: 'Ballistic', defaultMode: 'reps', defaultValue: 5, unilateral: true, visual: 'clean',
    difficulty: 'Intermediate', focus: ['Hips', 'Rack', 'Grip'],
    description: 'Moves the kettlebell from the swing path into a controlled rack position.',
    technique: ['Keep the bell close to the body.', 'Guide the hand around the bell instead of letting it crash over the wrist.', 'Finish in a stacked, quiet rack.', 'Use hip drive; do not curl the bell.']
  },
  {
    id: 'snatch', name: 'Snatch', category: 'Ballistic', defaultMode: 'reps', defaultValue: 5, unilateral: true, visual: 'snatch',
    difficulty: 'Advanced', focus: ['Hips', 'Shoulders', 'Conditioning'],
    description: 'A one-arm ballistic lift taking the kettlebell from the backswing to overhead in one movement.',
    technique: ['Drive from the hips.', 'Keep the bell close as it rises.', 'Punch the hand through softly at the top.', 'Finish with ribs down and elbow locked overhead.']
  },
  {
    id: 'high-pull', name: 'High Pull', category: 'Ballistic', defaultMode: 'reps', defaultValue: 8, unilateral: true, visual: 'clean',
    difficulty: 'Intermediate', focus: ['Hips', 'Upper back', 'Conditioning'],
    description: 'A swing variation that adds a fast elbow pull while preserving hip-driven power.',
    technique: ['Start with a strong swing.', 'Pull the elbow back rather than lifting straight up.', 'Keep the wrist neutral.', 'Reconnect smoothly into the backswing.']
  },
  {
    id: 'strict-press', name: 'Strict Press', category: 'Strength', defaultMode: 'reps', defaultValue: 5, unilateral: true, visual: 'press',
    difficulty: 'Intermediate', focus: ['Shoulders', 'Triceps', 'Core'],
    description: 'A strict overhead press from the rack without leg drive.',
    technique: ['Brace before pressing.', 'Keep the forearm vertical from the rack.', 'Press around the head and finish stacked overhead.', 'Avoid side-bending or leaning back.']
  },
  {
    id: 'push-press', name: 'Push Press', category: 'Strength', defaultMode: 'reps', defaultValue: 5, unilateral: true, visual: 'press',
    difficulty: 'Intermediate', focus: ['Shoulders', 'Leg drive', 'Power'],
    description: 'An overhead press assisted by a short dip and explosive leg drive.',
    technique: ['Dip straight down with the torso tall.', 'Drive through the floor.', 'Transfer leg power into the bell.', 'Finish with a stable overhead lockout.']
  },
  {
    id: 'row', name: 'Bent Over Row', category: 'Strength', defaultMode: 'reps', defaultValue: 8, unilateral: true, visual: 'row',
    difficulty: 'Beginner', focus: ['Upper back', 'Lats', 'Grip'],
    description: 'A hinged rowing movement for upper-back and lat strength.',
    technique: ['Hinge and keep the spine long.', 'Pull the elbow toward the hip.', 'Keep the shoulder away from the ear.', 'Control the lowering phase.']
  },
  {
    id: 'deadlift', name: 'Deadlift', category: 'Strength', defaultMode: 'reps', defaultValue: 10, visual: 'deadlift',
    difficulty: 'Beginner', focus: ['Hips', 'Glutes', 'Hamstrings'],
    description: 'A foundational kettlebell hip hinge from the floor.',
    technique: ['Place the bell between the feet.', 'Push the hips back while keeping the spine neutral.', 'Grip with straight arms.', 'Stand by driving the floor away and extending the hips.']
  },
  {
    id: 'goblet-squat', name: 'Goblet Squat', category: 'Legs', defaultMode: 'reps', defaultValue: 8, visual: 'squat',
    difficulty: 'Beginner', focus: ['Quads', 'Glutes', 'Core'],
    description: 'A front-loaded squat holding the kettlebell close to the chest.',
    technique: ['Keep the bell close to the chest.', 'Sit between the hips.', 'Keep the whole foot connected to the floor.', 'Stand tall without losing trunk position.']
  },
  {
    id: 'front-squat', name: 'Front Squat', category: 'Legs', defaultMode: 'reps', defaultValue: 5, visual: 'squat',
    difficulty: 'Intermediate', focus: ['Quads', 'Glutes', 'Rack'],
    description: 'A squat performed with the kettlebell held in the rack position.',
    technique: ['Set a solid rack before descending.', 'Brace the trunk.', 'Keep knees tracking with the toes.', 'Drive up while keeping the bell connected to the body.']
  },
  {
    id: 'reverse-lunge', name: 'Reverse Lunge', category: 'Legs', defaultMode: 'reps', defaultValue: 6, unilateral: true, visual: 'lunge',
    difficulty: 'Beginner', focus: ['Glutes', 'Quads', 'Balance'],
    description: 'A controlled backward lunge that can be loaded in rack or suitcase position.',
    technique: ['Step back far enough to create space.', 'Keep the front foot planted.', 'Lower under control.', 'Drive through the front leg to return.']
  },
  {
    id: 'thruster', name: 'Thruster', category: 'Legs', defaultMode: 'reps', defaultValue: 6, visual: 'press',
    difficulty: 'Intermediate', focus: ['Legs', 'Shoulders', 'Conditioning'],
    description: 'A squat directly connected to an overhead press.',
    technique: ['Keep the bell secure through the squat.', 'Accelerate as you stand.', 'Use leg drive to start the press.', 'Finish stacked overhead before the next rep.']
  },
  {
    id: 'halo', name: 'Halo', category: 'Core', defaultMode: 'reps', defaultValue: 8, visual: 'halo',
    difficulty: 'Beginner', focus: ['Shoulders', 'Upper back', 'Core'],
    description: 'A controlled circle around the head for shoulder mobility and trunk control.',
    technique: ['Keep the ribs down.', 'Move slowly around the head.', 'Keep the bell close without touching the head.', 'Reverse direction evenly.']
  },
  {
    id: 'suitcase-hold', name: 'Suitcase Hold', category: 'Core', defaultMode: 'time', defaultValue: 30, unilateral: true, visual: 'carry',
    difficulty: 'Beginner', focus: ['Grip', 'Obliques', 'Posture'],
    description: 'A one-sided static hold that challenges grip and anti-lateral-flexion strength.',
    technique: ['Stand tall.', 'Keep shoulders level.', 'Do not lean away from the bell.', 'Maintain quiet breathing and a braced trunk.']
  },
  {
    id: 'rack-hold', name: 'Rack Hold', category: 'Core', defaultMode: 'time', defaultValue: 30, unilateral: true, visual: 'carry',
    difficulty: 'Beginner', focus: ['Rack', 'Core', 'Breathing'],
    description: 'A static rack-position hold for posture, breathing and trunk strength.',
    technique: ['Keep the forearm close to the body.', 'Relax unnecessary grip tension.', 'Keep ribs stacked over pelvis.', 'Breathe behind the shield without losing position.']
  }
];
