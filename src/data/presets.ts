import { Difficulty, ExerciseMode, SideMode, WorkoutPlan } from '../types';

export type PresetId =
  | 'cps' | 'simple5' | 'swing' | 'kb-strength' | 'kb-conditioning' | 'legs-core'
  | 'kb-first-step' | 'kb-lunch-break' | 'kb-no-overhead' | 'kb-grip-posture' | 'kb-power-practice'
  | 'bodyweight-basics' | 'bodyweight-hiit' | 'bodyweight-core'
  | 'bodyweight-first-step' | 'bodyweight-no-jump' | 'bodyweight-standing-break'
  | 'bodyweight-floor-foundation' | 'bodyweight-push-core' | 'bodyweight-legs-balance'
  | 'bodyweight-steady-circuit' | 'bodyweight-short-burst';

export type PresetItem = {
  exerciseId: string;
  value: number;
  mode: ExerciseMode;
  side: SideMode;
};

export type PresetDefinition = {
  id: PresetId;
  label: string;
  name: string;
  equipment: 'kettlebell' | 'bodyweight';
  difficulty: Difficulty;
  focus: string;
  description: string;
  coaching: string;
  rounds: number;
  restSeconds: number;
  items: PresetItem[];
};

const reps = (exerciseId: string, value: number, side: SideMode = 'alternate'): PresetItem => ({ exerciseId, value, mode: 'reps', side });
const seconds = (exerciseId: string, value: number, side: SideMode = 'alternate'): PresetItem => ({ exerciseId, value, mode: 'time', side });

// Every prescription is explicit: profile round/rest defaults never change a template.
// Unilateral `both` targets are per side; alternating lunge targets are total reps.
export const PRESETS: PresetDefinition[] = [
  {
    id: 'kb-first-step', label: 'First Step', name: 'Kettlebell First Step',
    equipment: 'kettlebell', difficulty: 'Beginner', focus: 'Getting started', rounds: 2, restSeconds: 60,
    description: 'A short introduction to the hinge, squat, pull and hold. A manageable place to restart.',
    coaching: 'Choose a bell you can control comfortably. Finish the row and hold on each side; take extra pauses when you need them.',
    items: [reps('deadlift', 6), reps('goblet-squat', 6), reps('row', 6, 'both'), seconds('suitcase-hold', 20, 'both')]
  },
  {
    id: 'kb-lunch-break', label: 'Lunch Break', name: 'Kettlebell Lunch Break',
    equipment: 'kettlebell', difficulty: 'Beginner', focus: 'Full-body strength', rounds: 3, restSeconds: 60,
    description: 'A compact full-body circuit built around controlled lifts and an upright march.',
    coaching: 'Keep the lowering phase steady. Set the bell down between exercises to reset your grip and position.',
    items: [reps('romanian-deadlift', 8), reps('goblet-squat', 8), reps('row', 6, 'both'), seconds('farmer-march', 20, 'both')]
  },
  {
    id: 'kb-no-overhead', label: 'Grounded Strength', name: 'Grounded Kettlebell Strength',
    equipment: 'kettlebell', difficulty: 'Beginner', focus: 'Strength · no overhead lifts', rounds: 3, restSeconds: 75,
    description: 'Hinge, row, squat and floor press without overhead work or ballistic movements.',
    coaching: 'Move carefully into and out of the floor press. Pause the workout for position changes rather than rushing.',
    items: [reps('deadlift', 8), reps('row', 6, 'both'), reps('goblet-squat', 6), reps('floor-press', 6, 'both')]
  },
  {
    id: 'kb-grip-posture', label: 'Stand Tall', name: 'Kettlebell Stand Tall',
    equipment: 'kettlebell', difficulty: 'Beginner', focus: 'Grip · trunk control', rounds: 3, restSeconds: 60,
    description: 'Controlled pulls, a suitcase hold and marching work with time to settle into each position.',
    coaching: 'Keep your shoulders level during the holds and marches. Set the bell down before grip fatigue changes your posture.',
    items: [reps('deadlift', 8), reps('row', 6, 'both'), seconds('suitcase-hold', 25, 'both'), seconds('farmer-march', 20, 'both')]
  },
  {
    id: 'simple5', label: 'Simple 5', name: 'Simple 5',
    equipment: 'kettlebell', difficulty: 'Intermediate', focus: 'Full-body strength', rounds: 3, restSeconds: 75,
    description: 'Five familiar patterns covering hips, legs, pressing and pulling. Best once swings and overhead presses feel familiar.',
    coaching: 'Complete left and right where shown. The workout groups each exercise by side; set the bell down to reset between movements.',
    items: [reps('swing', 10), reps('goblet-squat', 6), reps('strict-press', 4, 'both'), reps('row', 6, 'both'), reps('reverse-lunge', 4, 'both')]
  },
  {
    id: 'cps', label: 'Clean · Press · Squat', name: 'Clean · Press · Squat',
    equipment: 'kettlebell', difficulty: 'Intermediate', focus: 'Rack · overhead strength', rounds: 3, restSeconds: 75,
    description: 'A focused three-movement session with modest rep targets and recovery between rounds.',
    coaching: 'Clean left then right, press left then right, then squat. Reset your rack between steps; this is not an unbroken one-arm complex.',
    items: [reps('clean', 4, 'both'), reps('strict-press', 4, 'both'), reps('front-squat', 6)]
  },
  {
    id: 'swing', label: 'Swing Intervals', name: 'Swing Intervals',
    equipment: 'kettlebell', difficulty: 'Intermediate', focus: 'Hinge · conditioning', rounds: 6, restSeconds: 45,
    description: 'Short sets of two-hand swings with a deliberate reset after every set. Use once the swing technique is familiar.',
    coaching: 'Let the hips drive each rep. Finish the set while the hinge stays crisp and use the round break to reset.',
    items: [reps('swing', 15)]
  },
  {
    id: 'kb-strength', label: 'KB Strength', name: 'Kettlebell Strength',
    equipment: 'kettlebell', difficulty: 'Beginner', focus: 'Full-body strength', rounds: 3, restSeconds: 75,
    description: 'A longer controlled session with lower-body work, a press, a row and a loaded march.',
    coaching: 'Group the standing lifts before the floor press. Take your time getting back up for the march and review the load before starting.',
    items: [reps('romanian-deadlift', 8), reps('goblet-squat', 8), reps('row', 6, 'both'), reps('floor-press', 6, 'both'), seconds('farmer-march', 25, 'both')]
  },
  {
    id: 'kb-power-practice', label: 'Power Practice', name: 'Kettlebell Power Practice',
    equipment: 'kettlebell', difficulty: 'Intermediate', focus: 'Power · technique', rounds: 3, restSeconds: 75,
    description: 'Low-rep one-arm swings, cleans and push presses with generous breaks between rounds.',
    coaching: 'Keep the sets crisp instead of chasing speed. Each left-side set is followed by its right-side set.',
    items: [reps('single-arm-swing', 6, 'both'), reps('clean', 3, 'both'), reps('push-press', 3, 'both')]
  },
  {
    id: 'kb-conditioning', label: 'KB Engine', name: 'Kettlebell Engine',
    equipment: 'kettlebell', difficulty: 'Intermediate', focus: 'Full-body conditioning', rounds: 3, restSeconds: 60,
    description: 'A denser circuit combining ballistic work, leg drive and rack control for experienced kettlebell users.',
    coaching: 'Review the clean and push press before starting. Use the pause button whenever you need more recovery between exercises.',
    items: [reps('single-arm-swing', 8, 'both'), reps('clean', 4, 'both'), reps('push-press', 4, 'both'), reps('goblet-squat', 8), seconds('front-rack-march', 20, 'both')]
  },
  {
    id: 'legs-core', label: 'Legs + Core', name: 'Legs + Core',
    equipment: 'kettlebell', difficulty: 'Advanced', focus: 'Legs · trunk control', rounds: 3, restSeconds: 75,
    description: 'A technical leg-and-core session including the overhead windmill. For users already comfortable with that movement.',
    coaching: 'Use a load you can control in the windmill, not your heaviest squat load. Keep every rep within a controlled range.',
    items: [reps('romanian-deadlift', 8), reps('front-squat', 6), reps('reverse-lunge', 5, 'both'), reps('windmill', 3, 'both'), seconds('rack-hold', 20, 'both')]
  },
  {
    id: 'bodyweight-first-step', label: 'First Step', name: 'Bodyweight First Step',
    equipment: 'bodyweight', difficulty: 'Beginner', focus: 'Getting started', rounds: 2, restSeconds: 60,
    description: 'Three movements and two rounds. A small, repeatable session when getting started matters more than doing more.',
    coaching: 'Work at a comfortable pace. Start with one round or shorten the plank if the full prescription is too much today.',
    items: [reps('air-squat', 6), reps('glute-bridge', 8), seconds('plank', 15)]
  },
  {
    id: 'bodyweight-basics', label: 'BW Basics', name: 'Bodyweight Basics',
    equipment: 'bodyweight', difficulty: 'Beginner', focus: 'Full-body strength', rounds: 2, restSeconds: 60,
    description: 'A simple mix of standing leg work, a floor press pattern and trunk control. No jumping or equipment.',
    coaching: 'Lunge reps are the total across both legs. Choose a push-up rep target you can complete with control; adjust it in the builder.',
    items: [reps('air-squat', 8), reps('bodyweight-reverse-lunge', 8), reps('push-up', 4), reps('glute-bridge', 10), seconds('plank', 20)]
  },
  {
    id: 'bodyweight-no-jump', label: 'No-Jump Circuit', name: 'Bodyweight No-Jump Circuit',
    equipment: 'bodyweight', difficulty: 'Beginner', focus: 'Legs · core · no jumping', rounds: 3, restSeconds: 45,
    description: 'A steady session for a small space, using squats, alternating lunges, bridges and a plank.',
    coaching: 'Keep each rep controlled. Alternate your lunges evenly: 8 total means 4 per leg.',
    items: [reps('air-squat', 10), reps('bodyweight-reverse-lunge', 8), reps('glute-bridge', 10), seconds('plank', 20)]
  },
  {
    id: 'bodyweight-standing-break', label: 'Standing Break', name: 'Bodyweight Standing Break',
    equipment: 'bodyweight', difficulty: 'Beginner', focus: 'Legs · upright conditioning', rounds: 3, restSeconds: 45,
    description: 'A standing-only sequence for when you want to move without getting down on the floor.',
    coaching: 'Alternate the lunges and keep high knees at a controlled pace. The timer measures time, not speed.',
    items: [reps('air-squat', 8), reps('bodyweight-reverse-lunge', 8), seconds('high-knees', 20)]
  },
  {
    id: 'bodyweight-floor-foundation', label: 'Floor Foundations', name: 'Bodyweight Floor Foundations',
    equipment: 'bodyweight', difficulty: 'Beginner', focus: 'Glutes · core', rounds: 2, restSeconds: 60,
    description: 'Short holds and bridges, grouped together on the floor with no standing transitions within a round.',
    coaching: 'Breathe through the holds. Each side plank has its own timer; pause while changing position if needed.',
    items: [reps('glute-bridge', 10), seconds('plank', 15), seconds('side-plank', 10, 'both')]
  },
  {
    id: 'bodyweight-push-core', label: 'Push + Core', name: 'Bodyweight Push + Core',
    equipment: 'bodyweight', difficulty: 'Beginner', focus: 'Upper body · core', rounds: 3, restSeconds: 60,
    description: 'Small push-up sets separated from plank work by a bridge set. A focused floor-based session.',
    coaching: 'Use controlled push-ups and stop the set before your trunk position changes. Adjust the target in the builder if needed.',
    items: [reps('push-up', 4), reps('glute-bridge', 10), seconds('plank', 20)]
  },
  {
    id: 'bodyweight-legs-balance', label: 'Legs + Balance', name: 'Bodyweight Legs + Balance',
    equipment: 'bodyweight', difficulty: 'Beginner', focus: 'Legs · balance', rounds: 3, restSeconds: 60,
    description: 'Alternating lunges, squats and bridges with no pressing or jumping.',
    coaching: 'The 12 lunges are total reps: 6 per leg. Place each step deliberately and move at a pace that lets you stay balanced.',
    items: [reps('bodyweight-reverse-lunge', 12), reps('air-squat', 10), reps('glute-bridge', 12)]
  },
  {
    id: 'bodyweight-core', label: 'BW Core', name: 'Bodyweight Core',
    equipment: 'bodyweight', difficulty: 'Intermediate', focus: 'Core · trunk control', rounds: 3, restSeconds: 45,
    description: 'Front and side holds, bridges and controlled knee drives for a varied core session.',
    coaching: 'Do not race the mountain climbers. Keep breathing through the holds and use pauses to reset your position.',
    items: [seconds('plank', 20), seconds('side-plank', 15, 'both'), reps('glute-bridge', 10), seconds('mountain-climber', 20)]
  },
  {
    id: 'bodyweight-steady-circuit', label: 'Steady Circuit', name: 'Bodyweight Steady Circuit',
    equipment: 'bodyweight', difficulty: 'Intermediate', focus: 'Timed full-body conditioning', rounds: 3, restSeconds: 60,
    description: 'A timer-led circuit with no rep counting. Standing movements lead into floor work.',
    coaching: 'Move smoothly for each interval instead of chasing reps. Lunges alternate within one timer; pause for floor transitions when needed.',
    items: [seconds('air-squat', 30), seconds('bodyweight-reverse-lunge', 30), seconds('glute-bridge', 30), seconds('mountain-climber', 20)]
  },
  {
    id: 'bodyweight-short-burst', label: 'Short Bursts', name: 'Bodyweight Short Bursts',
    equipment: 'bodyweight', difficulty: 'Intermediate', focus: 'Conditioning', rounds: 4, restSeconds: 45,
    description: 'Short upright and floor intervals with a small squat set in between and a break after every round.',
    coaching: 'Keep the first round measured so you can repeat it. Quality of movement comes before faster intervals.',
    items: [seconds('high-knees', 20), reps('air-squat', 8), seconds('mountain-climber', 20)]
  },
  {
    id: 'bodyweight-hiit', label: 'BW HIIT', name: 'Bodyweight HIIT',
    equipment: 'bodyweight', difficulty: 'Intermediate', focus: 'Full-body conditioning', rounds: 3, restSeconds: 60,
    description: 'A more demanding circuit with burpees and knee-drive intervals, for when the basics already feel comfortable.',
    coaching: 'Burpees can include a jump. Keep landings controlled and add pauses between exercises rather than losing your form.',
    items: [reps('burpee', 5), seconds('high-knees', 20), reps('air-squat', 10), reps('push-up', 6), seconds('mountain-climber', 20)]
  }
];

/** Preview and loading share exactly the same targets, side expansion inputs and rest. */
export function createPresetPlan(
  preset: PresetDefinition,
  weightKg: number,
  keyForItem: (index: number) => string = index => `preset-${preset.id}-${index}`
): WorkoutPlan {
  return {
    name: preset.name,
    weightKg: preset.equipment === 'bodyweight' ? 0 : weightKg,
    rounds: preset.rounds,
    restSeconds: preset.restSeconds,
    items: preset.items.map((item, index) => ({ ...item, key: keyForItem(index) }))
  };
}
