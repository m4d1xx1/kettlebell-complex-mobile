export type ExerciseMode = 'reps' | 'time';
export type ExerciseCategory = 'Ballistic' | 'Strength' | 'Legs' | 'Core';
export type SideMode = 'both' | 'left' | 'right' | 'alternate';
export type ExerciseVisual = 'swing' | 'clean' | 'press' | 'snatch' | 'squat' | 'lunge' | 'row' | 'deadlift' | 'halo' | 'carry';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type VoiceLanguage = 'en-US' | 'sv-SE';
export type UILanguage = 'en' | 'sv';

export type ExerciseDefinition = {
  id: string;
  name: string;
  category: ExerciseCategory;
  defaultMode: ExerciseMode;
  defaultValue: number;
  unilateral?: boolean;
  visual: ExerciseVisual;
  custom?: boolean;
  description?: string;
  technique?: string[];
  focus?: string[];
  difficulty?: Difficulty;
};

export type ComplexItem = {
  key: string;
  exerciseId: string;
  mode: ExerciseMode;
  value: number;
  side: SideMode;
};

export type WorkoutPlan = {
  name: string;
  weightKg: number;
  rounds: number;
  restSeconds: number;
  items: ComplexItem[];
};

export type SavedComplex = WorkoutPlan & {
  id: string;
  savedAt: string;
  favorite?: boolean;
};

export type WorkoutHistoryEntry = {
  id: string;
  planName: string;
  completedAt: string;
  durationSeconds: number;
  weightKg: number;
  rounds: number;
  exerciseCount: number;
  totalReps: number;
  volumeKg: number;
  plan?: WorkoutPlan;
};

export type AppSettings = {
  uiLanguage: UILanguage;
  onboardingComplete: boolean;
  defaultWeightKg: number;
  defaultRounds: number;
  defaultRestSeconds: number;
  soundCues: boolean;
  voiceCues: boolean;
  countdownVoice: boolean;
  haptics: boolean;
  voiceLanguage: VoiceLanguage;
};
