import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { BASE_EXERCISES } from '../data/exercises';
import { PRESETS, PresetId } from '../data/presets';
import {
  AppSettings, ComplexItem, ExerciseCategory, ExerciseDefinition, ExerciseMode,
  ExerciseVisual, SavedComplex, SideMode, WorkoutHistoryEntry, WorkoutPlan
} from '../types';

const PLAN_KEY = 'kb.currentPlan.v2';
const SAVED_KEY = 'kb.savedComplexes.v2';
const HISTORY_KEY = 'kb.history.v2';
const CUSTOM_KEY = 'kb.customExercises.v2';
const FAVORITES_KEY = 'kb.favoriteExercises.v3';
const SETTINGS_KEY = 'kb.settings.v4';

const initialLanguage = 'en' as const;

const defaultSettings: AppSettings = {
  uiLanguage: initialLanguage,
  onboardingComplete: false,
  defaultWeightKg: 24,
  defaultRounds: 5,
  defaultRestSeconds: 60,
  soundCues: true,
  voiceCues: false,
  countdownVoice: false,
  haptics: true,
  manualContinueAfterRest: false,
  voiceLanguage: 'en-US'
};

const defaultPlan: WorkoutPlan = {
  name: 'My Complex',
  weightKg: defaultSettings.defaultWeightKg,
  rounds: defaultSettings.defaultRounds,
  restSeconds: defaultSettings.defaultRestSeconds,
  items: []
};

type ContextValue = {
  hydrated: boolean;
  plan: WorkoutPlan;
  saved: SavedComplex[];
  history: WorkoutHistoryEntry[];
  customExercises: ExerciseDefinition[];
  exercises: ExerciseDefinition[];
  favoriteExerciseIds: string[];
  settings: AppSettings;
  setPlan: React.Dispatch<React.SetStateAction<WorkoutPlan>>;
  addExercise: (exerciseId: string) => void;
  removeItem: (key: string) => void;
  reorderItems: (items: ComplexItem[]) => void;
  moveItem: (key: string, direction: -1 | 1) => void;
  updateItem: (key: string, patch: Partial<Pick<ComplexItem, 'mode' | 'value' | 'side'>>) => void;
  saveCurrent: () => Promise<void>;
  loadSaved: (id: string) => void;
  deleteSaved: (id: string) => Promise<void>;
  toggleSavedFavorite: (id: string) => Promise<void>;
  loadPreset: (preset: PresetId) => void;
  applyProfileDefaults: () => void;
  addCustomExercise: (input: { name: string; category: ExerciseCategory; mode: ExerciseMode; value: number; unilateral: boolean }) => Promise<void>;
  toggleExerciseFavorite: (id: string) => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  completeWorkout: (entry: Omit<WorkoutHistoryEntry, 'id' | 'completedAt'>) => Promise<void>;
  loadHistoryPlan: (id: string) => boolean;
  clearHistory: () => Promise<void>;
};

const WorkoutContext = createContext<ContextValue | null>(null);

const makeKey = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

function makeItem(catalog: ExerciseDefinition[], exerciseId: string, value?: number, mode?: ExerciseMode, side?: SideMode): ComplexItem {
  const definition = catalog.find((x) => x.id === exerciseId);
  if (!definition) throw new Error(`Exercise not found: ${exerciseId}`);
  return {
    key: makeKey(),
    exerciseId,
    mode: mode ?? definition.defaultMode,
    value: value ?? definition.defaultValue,
    side: side ?? (definition.unilateral ? 'both' : 'alternate')
  };
}

function clonePlan(plan: WorkoutPlan): WorkoutPlan {
  return { ...plan, items: plan.items.map((x) => ({ ...x, key: makeKey() })) };
}

export function WorkoutProvider({ children }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(false);
  const [plan, setPlan] = useState<WorkoutPlan>(defaultPlan);
  const [saved, setSaved] = useState<SavedComplex[]>([]);
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [customExercises, setCustomExercises] = useState<ExerciseDefinition[]>([]);
  const [favoriteExerciseIds, setFavoriteExerciseIds] = useState<string[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const exercises = useMemo(() => [...BASE_EXERCISES, ...customExercises], [customExercises]);

  useEffect(() => {
    (async () => {
      try {
        const [planRaw, savedRaw, historyRaw, customRaw, favoriteRaw, settingsRaw] = await Promise.all([
          AsyncStorage.getItem(PLAN_KEY),
          AsyncStorage.getItem(SAVED_KEY),
          AsyncStorage.getItem(HISTORY_KEY),
          AsyncStorage.getItem(CUSTOM_KEY),
          AsyncStorage.getItem(FAVORITES_KEY),
          AsyncStorage.getItem(SETTINGS_KEY)
        ]);
        if (planRaw) setPlan(JSON.parse(planRaw));
        if (savedRaw) setSaved(JSON.parse(savedRaw));
        if (historyRaw) setHistory(JSON.parse(historyRaw));
        if (customRaw) setCustomExercises(JSON.parse(customRaw));
        if (favoriteRaw) setFavoriteExerciseIds(JSON.parse(favoriteRaw));

        if (settingsRaw) {
          const stored = JSON.parse(settingsRaw);
          setSettings({ ...defaultSettings, ...stored, uiLanguage: 'en', voiceLanguage: 'en-US' });
        } else {
          const legacy = await AsyncStorage.getItem('kb.settings.v3');
          if (legacy) {
            const old = JSON.parse(legacy);
            setSettings({ ...defaultSettings, ...old, uiLanguage: 'en', voiceLanguage: 'en-US', onboardingComplete: false });
          }
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  }, [hydrated, plan]);

  const addExercise = (exerciseId: string) =>
    setPlan((p) => ({ ...p, items: [...p.items, makeItem(exercises, exerciseId)] }));

  const removeItem = (key: string) =>
    setPlan((p) => ({ ...p, items: p.items.filter((x) => x.key !== key) }));

  const reorderItems = (items: ComplexItem[]) =>
    setPlan((p) => ({ ...p, items }));

  const moveItem = (key: string, direction: -1 | 1) =>
    setPlan((p) => {
      const items = [...p.items];
      const from = items.findIndex((x) => x.key === key);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= items.length) return p;
      [items[from], items[to]] = [items[to], items[from]];
      return { ...p, items };
    });

  const updateItem = (key: string, patch: Partial<Pick<ComplexItem, 'mode' | 'value' | 'side'>>) =>
    setPlan((p) => ({ ...p, items: p.items.map((x) => x.key === key ? { ...x, ...patch } : x) }));

  const saveCurrent = async () => {
    if (!plan.items.length) return;
    const entry: SavedComplex = { ...plan, id: makeKey(), savedAt: new Date().toISOString(), favorite: false };
    const next = [entry, ...saved].slice(0, 75);
    setSaved(next);
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
  };

  const loadSaved = (id: string) => {
    const found = saved.find((x) => x.id === id);
    if (!found) return;
    const { id: _id, savedAt: _savedAt, favorite: _favorite, ...rest } = found;
    setPlan(clonePlan(rest));
  };

  const deleteSaved = async (id: string) => {
    const next = saved.filter((x) => x.id !== id);
    setSaved(next);
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
  };

  const toggleSavedFavorite = async (id: string) => {
    const next = saved.map((x) => x.id === id ? { ...x, favorite: !x.favorite } : x);
    setSaved(next);
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
  };

  const profile = () => ({
    weightKg: settings.defaultWeightKg,
    rounds: settings.defaultRounds,
    restSeconds: settings.defaultRestSeconds
  });

  const loadPreset = (preset: PresetId) => {
    const definition = PRESETS.find((x) => x.id === preset);
    if (!definition) return;

    const defaults = profile();
    setPlan({
      name: definition.name,
      weightKg: defaults.weightKg,
      rounds: definition.rounds ?? defaults.rounds,
      restSeconds: definition.restSeconds ?? defaults.restSeconds,
      items: definition.items.map((item) =>
        makeItem(exercises, item.exerciseId, item.value, item.mode, item.side)
      )
    });
  };

  const applyProfileDefaults = () =>
    setPlan((p) => ({
      ...p,
      weightKg: settings.defaultWeightKg,
      rounds: settings.defaultRounds,
      restSeconds: settings.defaultRestSeconds
    }));

  const addCustomExercise = async (input: {
    name: string; category: ExerciseCategory; mode: ExerciseMode; value: number; unilateral: boolean;
  }) => {
    const exercise: ExerciseDefinition = {
      id: `custom-${makeKey()}`,
      name: input.name.trim(),
      category: input.category,
      defaultMode: input.mode,
      defaultValue: input.value,
      unilateral: input.unilateral,
      visual: (input.category === 'Legs' ? 'squat' : input.category === 'Ballistic' ? 'swing' : input.category === 'Core' ? 'carry' : 'press') as ExerciseVisual,
      equipment: 'kettlebell',
      custom: true,
      difficulty: 'Intermediate',
      description: 'Custom exercise.',
      technique: ['Use a controlled range of motion and stop if technique breaks down.'],
      focus: [input.category]
    };
    const next = [...customExercises, exercise];
    setCustomExercises(next);
    await AsyncStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
    setPlan((p) => ({ ...p, items: [...p.items, makeItem([...exercises, exercise], exercise.id)] }));
  };

  const toggleExerciseFavorite = async (id: string) => {
    const next = favoriteExerciseIds.includes(id)
      ? favoriteExerciseIds.filter((x) => x !== id)
      : [id, ...favoriteExerciseIds];
    setFavoriteExerciseIds(next);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  };

  const updateSettings = async (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };

  const completeWorkout = async (input: Omit<WorkoutHistoryEntry, 'id' | 'completedAt'>) => {
    const entry: WorkoutHistoryEntry = { ...input, id: makeKey(), completedAt: new Date().toISOString() };
    const next = [entry, ...history].slice(0, 300);
    setHistory(next);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const loadHistoryPlan = (id: string) => {
    const found = history.find((x) => x.id === id);
    if (!found?.plan) return false;
    setPlan(clonePlan(found.plan));
    return true;
  };

  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  };

  const value = useMemo(() => ({
    hydrated, plan, saved, history, customExercises, exercises, favoriteExerciseIds, settings,
    setPlan, addExercise, removeItem, reorderItems, moveItem, updateItem, saveCurrent,
    loadSaved, deleteSaved, toggleSavedFavorite, loadPreset, applyProfileDefaults,
    addCustomExercise, toggleExerciseFavorite, updateSettings, completeWorkout,
    loadHistoryPlan, clearHistory
  }), [hydrated, plan, saved, history, customExercises, exercises, favoriteExerciseIds, settings]);

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) throw new Error('useWorkout must be used within WorkoutProvider');
  return context;
}
