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
  },
  {
    id: 'single-arm-swing', name: 'Single-Arm Swing', category: 'Ballistic', defaultMode: 'reps', defaultValue: 10, unilateral: true, visual: 'swing',
    difficulty: 'Intermediate', focus: ['Hips', 'Grip', 'Anti-rotation'],
    description: 'A one-arm kettlebell swing that adds a greater grip and anti-rotation demand.',
    technique: ['Hinge rather than squatting.', 'Keep the shoulder packed on the backswing.', 'Drive the bell with the hips, not the arm.', 'Stay square through the torso as the bell floats.']
  },
  {
    id: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'Strength', defaultMode: 'reps', defaultValue: 10, visual: 'deadlift',
    difficulty: 'Beginner', focus: ['Hamstrings', 'Glutes', 'Hinge'],
    description: 'A controlled hip hinge emphasizing hamstrings and glutes while keeping the kettlebell close.',
    technique: ['Soften the knees and push the hips back.', 'Keep the bell close to the legs.', 'Stop when hamstring tension limits the hinge.', 'Stand by driving the hips forward without leaning back.']
  },
  {
    id: 'floor-press', name: 'Floor Press', category: 'Strength', defaultMode: 'reps', defaultValue: 8, unilateral: true, visual: 'floor-press',
    difficulty: 'Beginner', focus: ['Chest', 'Triceps', 'Shoulders'],
    description: 'A press from the floor that limits shoulder extension and builds upper-body pressing strength.',
    technique: ['Lie with the bell securely in the rack.', 'Keep the forearm vertical.', 'Press until the elbow is straight without shrugging.', 'Lower under control until the upper arm meets the floor.']
  },
  {
    id: 'farmer-march', name: 'Farmer March', category: 'Core', defaultMode: 'time', defaultValue: 30, unilateral: true, visual: 'carry',
    difficulty: 'Beginner', focus: ['Grip', 'Core', 'Hip stability'],
    description: 'A loaded march with the kettlebell held at the side to train posture and trunk stability.',
    technique: ['Stand tall and keep the shoulders level.', 'Lift one knee without leaning away from the bell.', 'Keep the ribs stacked over the pelvis.', 'Move slowly enough to maintain balance.']
  },
  {
    id: 'front-rack-march', name: 'Front Rack March', category: 'Core', defaultMode: 'time', defaultValue: 30, unilateral: true, visual: 'carry',
    difficulty: 'Intermediate', focus: ['Core', 'Rack', 'Hip stability'],
    description: 'A controlled march while maintaining a strong one-arm rack position.',
    technique: ['Set the bell quietly in the rack.', 'Keep the torso tall as each knee lifts.', 'Do not let the loaded side collapse.', 'Breathe without losing trunk position.']
  },
  {
    id: 'windmill', name: 'Windmill', category: 'Core', defaultMode: 'reps', defaultValue: 5, unilateral: true, visual: 'windmill',
    difficulty: 'Advanced', focus: ['Core', 'Shoulders', 'Hamstrings'],
    description: 'A controlled hinge and rotation performed under a stable overhead kettlebell.',
    technique: ['Lock the bell out overhead before moving.', 'Push the hip away from the loaded arm.', 'Keep your eyes on the bell.', 'Move only through a range you can control without losing the overhead position.']
  },
  {
    id: 'around-the-world', name: 'Around the World', category: 'Core', defaultMode: 'reps', defaultValue: 10, visual: 'halo',
    difficulty: 'Beginner', focus: ['Core', 'Grip', 'Shoulders'],
    description: 'Passes the kettlebell around the torso while maintaining a tall, stable posture.',
    technique: ['Stand tall and brace lightly.', 'Pass the bell smoothly from hand to hand.', 'Keep the circle close to the body.', 'Reverse direction evenly.']
  },
  {
    id: 'clean-and-press', name: 'Clean & Press', category: 'Strength', defaultMode: 'reps', defaultValue: 5, unilateral: true, visual: 'press',
    difficulty: 'Intermediate', focus: ['Hips', 'Shoulders', 'Full body'],
    description: 'Combines a clean into the rack with a controlled overhead press.',
    technique: ['Clean the bell softly into the rack.', 'Reset your brace before pressing.', 'Finish stacked overhead.', 'Return to the rack under control before the next rep.']
  },
  {
    id: 'air-squat', name: 'Air Squat', category: 'Legs', defaultMode: 'reps', defaultValue: 15, equipment: 'bodyweight', visual: 'squat',
    difficulty: 'Beginner', focus: ['Quads', 'Glutes', 'Mobility'],
    description: 'A bodyweight squat used for leg strength, movement quality and conditioning.',
    technique: ['Keep the whole foot on the floor.', 'Sit down between the hips.', 'Let the knees track with the toes.', 'Stand tall without losing balance.']
  },
  {
    id: 'push-up', name: 'Push-Up', category: 'Strength', defaultMode: 'reps', defaultValue: 10, equipment: 'bodyweight', visual: 'pushup',
    difficulty: 'Beginner', focus: ['Chest', 'Triceps', 'Core'],
    description: 'A horizontal bodyweight press performed while maintaining a rigid trunk.',
    technique: ['Set the hands slightly wider than shoulder width.', 'Keep head, ribs and hips aligned.', 'Lower the chest under control.', 'Press the floor away without letting the hips sag.']
  },
  {
    id: 'plank', name: 'Plank', category: 'Core', defaultMode: 'time', defaultValue: 30, equipment: 'bodyweight', visual: 'plank',
    difficulty: 'Beginner', focus: ['Core', 'Shoulders', 'Bracing'],
    description: 'A static bodyweight hold that trains full-body bracing and trunk control.',
    technique: ['Keep the body in one long line.', 'Brace the abdomen and glutes.', 'Push the floor away.', 'Breathe while maintaining position.']
  },
  {
    id: 'side-plank', name: 'Side Plank', category: 'Core', defaultMode: 'time', defaultValue: 25, unilateral: true, equipment: 'bodyweight', visual: 'plank',
    difficulty: 'Beginner', focus: ['Obliques', 'Shoulders', 'Hip stability'],
    description: 'A side-facing static hold for lateral trunk and shoulder stability.',
    technique: ['Stack the shoulder over the supporting elbow or hand.', 'Keep hips lifted.', 'Maintain a straight line through the body.', 'Avoid rotating the chest toward the floor.']
  },
  {
    id: 'glute-bridge', name: 'Glute Bridge', category: 'Legs', defaultMode: 'reps', defaultValue: 15, equipment: 'bodyweight', visual: 'bridge',
    difficulty: 'Beginner', focus: ['Glutes', 'Hamstrings', 'Core'],
    description: 'A floor-based hip extension exercise emphasizing the glutes.',
    technique: ['Plant the feet firmly.', 'Brace lightly before lifting.', 'Drive through the feet and squeeze the glutes.', 'Stop before the lower back takes over.']
  },
  {
    id: 'mountain-climber', name: 'Mountain Climber', category: 'Core', defaultMode: 'time', defaultValue: 30, equipment: 'bodyweight', visual: 'pushup',
    difficulty: 'Intermediate', focus: ['Core', 'Shoulders', 'Conditioning'],
    description: 'A dynamic plank exercise alternating knee drives for conditioning and trunk control.',
    technique: ['Start in a strong plank.', 'Drive one knee forward without lifting the hips.', 'Switch legs smoothly.', 'Keep pressure through the hands throughout.']
  },
  {
    id: 'burpee', name: 'Burpee', category: 'Ballistic', defaultMode: 'reps', defaultValue: 8, equipment: 'bodyweight', visual: 'burpee',
    difficulty: 'Intermediate', focus: ['Full body', 'Conditioning', 'Power'],
    description: 'A full-body conditioning movement moving from standing to the floor and back up.',
    technique: ['Place the hands securely before sending the feet back.', 'Keep the trunk controlled in the plank.', 'Bring the feet back under the body.', 'Stand or jump tall before starting the next rep.']
  },
  {
    id: 'high-knees', name: 'High Knees', category: 'Ballistic', defaultMode: 'time', defaultValue: 30, equipment: 'bodyweight', visual: 'high-knees',
    difficulty: 'Beginner', focus: ['Conditioning', 'Hip flexors', 'Coordination'],
    description: 'Fast alternating knee drives performed upright for simple bodyweight conditioning.',
    technique: ['Stay tall through the torso.', 'Land softly under the body.', 'Drive the arms naturally.', 'Use a pace that keeps the movement controlled.']
  },
  {
    id: 'bodyweight-reverse-lunge', name: 'Bodyweight Reverse Lunge', category: 'Legs', defaultMode: 'reps', defaultValue: 10, equipment: 'bodyweight', visual: 'lunge',
    difficulty: 'Beginner', focus: ['Glutes', 'Quads', 'Balance'],
    description: 'An alternating backward lunge requiring no equipment.',
    technique: ['Step back far enough to keep balance.', 'Keep the front foot planted.', 'Lower under control.', 'Drive through the front foot to return to standing.']
  }
];
