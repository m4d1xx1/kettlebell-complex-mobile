import { ExerciseMode, SideMode } from '../types';

export type PresetId =
  | 'cps'
  | 'simple5'
  | 'swing'
  | 'kb-strength'
  | 'kb-conditioning'
  | 'legs-core'
  | 'bodyweight-basics'
  | 'bodyweight-hiit'
  | 'bodyweight-core';

export type PresetItem = {
  exerciseId: string;
  value?: number;
  mode?: ExerciseMode;
  side?: SideMode;
};

export type PresetDefinition = {
  id: PresetId;
  label: string;
  name: string;
  rounds?: number;
  restSeconds?: number;
  items: PresetItem[];
};

export const PRESETS: PresetDefinition[] = [
  {
    id: 'cps',
    label: 'C·P·S',
    name: 'Clean · Press · Squat',
    items: [
      { exerciseId: 'clean', value: 5 },
      { exerciseId: 'strict-press', value: 5 },
      { exerciseId: 'front-squat', value: 5 }
    ]
  },
  {
    id: 'simple5',
    label: 'Simple 5',
    name: 'Simple 5',
    items: [
      { exerciseId: 'swing', value: 10 },
      { exerciseId: 'goblet-squat', value: 5 },
      { exerciseId: 'strict-press', value: 5 },
      { exerciseId: 'row', value: 5 },
      { exerciseId: 'reverse-lunge', value: 5 }
    ]
  },
  {
    id: 'swing',
    label: 'Swing 20',
    name: 'Swing Intervals',
    rounds: 10,
    restSeconds: 30,
    items: [{ exerciseId: 'swing', value: 20 }]
  },
  {
    id: 'kb-strength',
    label: 'KB Strength',
    name: 'Kettlebell Strength',
    rounds: 4,
    restSeconds: 75,
    items: [
      { exerciseId: 'romanian-deadlift', value: 10 },
      { exerciseId: 'goblet-squat', value: 8 },
      { exerciseId: 'floor-press', value: 8 },
      { exerciseId: 'row', value: 8 },
      { exerciseId: 'farmer-march', value: 30, mode: 'time' }
    ]
  },
  {
    id: 'kb-conditioning',
    label: 'KB Engine',
    name: 'Kettlebell Engine',
    rounds: 5,
    restSeconds: 45,
    items: [
      { exerciseId: 'single-arm-swing', value: 10, side: 'both' },
      { exerciseId: 'clean', value: 5, side: 'both' },
      { exerciseId: 'push-press', value: 5, side: 'both' },
      { exerciseId: 'goblet-squat', value: 10 },
      { exerciseId: 'front-rack-march', value: 30, mode: 'time', side: 'both' }
    ]
  },
  {
    id: 'legs-core',
    label: 'Legs + Core',
    name: 'Legs + Core',
    rounds: 4,
    restSeconds: 60,
    items: [
      { exerciseId: 'romanian-deadlift', value: 10 },
      { exerciseId: 'front-squat', value: 6 },
      { exerciseId: 'reverse-lunge', value: 6, side: 'both' },
      { exerciseId: 'windmill', value: 5, side: 'both' },
      { exerciseId: 'rack-hold', value: 30, mode: 'time', side: 'both' }
    ]
  },
  {
    id: 'bodyweight-basics',
    label: 'BW Basics',
    name: 'Bodyweight Basics',
    rounds: 4,
    restSeconds: 45,
    items: [
      { exerciseId: 'air-squat', value: 12 },
      { exerciseId: 'push-up', value: 8 },
      { exerciseId: 'bodyweight-reverse-lunge', value: 10 },
      { exerciseId: 'glute-bridge', value: 12 },
      { exerciseId: 'plank', value: 30, mode: 'time' }
    ]
  },
  {
    id: 'bodyweight-hiit',
    label: 'BW HIIT',
    name: 'Bodyweight HIIT',
    rounds: 5,
    restSeconds: 30,
    items: [
      { exerciseId: 'burpee', value: 8 },
      { exerciseId: 'mountain-climber', value: 30, mode: 'time' },
      { exerciseId: 'air-squat', value: 15 },
      { exerciseId: 'high-knees', value: 30, mode: 'time' },
      { exerciseId: 'push-up', value: 10 }
    ]
  },
  {
    id: 'bodyweight-core',
    label: 'BW Core',
    name: 'Bodyweight Core',
    rounds: 4,
    restSeconds: 30,
    items: [
      { exerciseId: 'plank', value: 40, mode: 'time' },
      { exerciseId: 'side-plank', value: 25, mode: 'time', side: 'both' },
      { exerciseId: 'glute-bridge', value: 15 },
      { exerciseId: 'mountain-climber', value: 30, mode: 'time' }
    ]
  }
];
