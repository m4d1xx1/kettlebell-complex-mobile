import { Alert } from 'react-native';
import { archiveAndReset, readStored, writeStored, updateStored } from '../storage/store';
import { validPlan, validSaved, validHistory, validExercises, validSettings, strings } from '../storage/validation';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BASE_EXERCISES } from '../data/exercises';
import { PRESETS, PresetId, createPresetPlan } from '../data/presets';
import {
  AppSettings, ComplexItem, ExerciseCategory, ExerciseDefinition, ExerciseMode,
  ExerciseVisual, SavedComplex, SideMode, WorkoutHistoryEntry, WorkoutPlan
} from '../types';

const PLAN_KEY = 'kb.currentPlan.v2';
const SAVED_KEY = 'kb.savedComplexes.v2';
const PENDING_KEY = 'kb.pendingHistory.v1';
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
  autoAdvanceExercises: true,
  secondsPerRep: 3,
  transitionSeconds: 5,
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
  toggleExerciseSelection: (exerciseId: string) => void;
  removeItem: (key: string) => void;
  undoRemoval: () => void;
  undoCount: number;
  dismissUndo: () => void;
  reorderItems: (items: ComplexItem[]) => void;
  moveItem: (key: string, direction: -1 | 1) => void;
  updateItem: (key: string, patch: Partial<Pick<ComplexItem, 'mode' | 'value' | 'side'>>) => void;
  saveCurrent: () => Promise<boolean>;
  loadSaved: (id: string) => void;
  deleteSaved: (id: string) => Promise<void>;
  toggleSavedFavorite: (id: string) => Promise<void>;
  loadPreset: (preset: PresetId) => void;
  applyProfileDefaults: () => void;
  addCustomExercise: (input: { name: string; category: ExerciseCategory; mode: ExerciseMode; value: number; unilateral: boolean; equipment?: 'kettlebell' | 'bodyweight' }) => Promise<boolean>;
  toggleExerciseFavorite: (id: string) => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  pendingHistory: WorkoutHistoryEntry[];
  retryPending: () => Promise<void>;
  recoverHistory: () => Promise<void>;
  completeWorkout: (entry: Omit<WorkoutHistoryEntry, 'id' | 'completedAt'> & { completedAt?: string }) => Promise<'history' | 'pending'>;
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

  const removed = useRef<{ name: string; entries: Array<{ item: ComplexItem; index: number }> } | null>(null);

  const exercises = useMemo(() => [...BASE_EXERCISES, ...customExercises], [customExercises]);

  const [pendingHistory, setPendingHistory] = useState<WorkoutHistoryEntry[]>([]);
  const historyRef = useRef(history);
  const historyQueue = useRef<Promise<void>>(Promise.resolve());
  const storageNotice = useRef(false);
  const notifyStorage = (error: unknown) => {
    if (!storageNotice.current) {
      storageNotice.current = true;
      Alert.alert('Storage needs attention', error instanceof Error ? error.message : 'Changes could not be saved. Keep the app open and retry.');
    }
  };
  const persist = async (key: string, value: unknown) => {
    try { await writeStored(key, value); storageNotice.current = false; return true; }
    catch (error) { notifyStorage(error); return false; }
  };
  useEffect(() => {
    let alive = true;
    (async () => {
      const tasks = [
        async () => { const value = await readStored(PENDING_KEY, validHistory); if (alive && value) setPendingHistory(value); },
        async () => { const value = await readStored(PLAN_KEY, validPlan); if (alive && value) setPlan(value); },
        async () => { const value = await readStored(SAVED_KEY, validSaved); if (alive && value) setSaved(value); },
        async () => { const value = await readStored(HISTORY_KEY, validHistory); if (alive && value) { historyRef.current = value; setHistory(value); } },
        async () => { const value = await readStored(CUSTOM_KEY, validExercises); if (alive && value) setCustomExercises(value); },
        async () => { const value = await readStored(FAVORITES_KEY, strings); if (alive && value) setFavoriteExerciseIds(value); },
        async () => {
          const value = await readStored(SETTINGS_KEY, validSettings);
          const legacy = value ? null : await readStored('kb.settings.v3', validSettings);
          if (alive && (value || legacy)) setSettings({ ...defaultSettings, ...(value ?? legacy), uiLanguage: 'en', voiceLanguage: 'en-US' });
        }
      ];
      const results = await Promise.allSettled(tasks.map(run => run()));
      if (!alive) return;
      for (const result of results) if (result.status === 'rejected') notifyStorage(result.reason);
      setHydrated(true);
    })();
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    if (hydrated && validPlan(plan)) void persist(PLAN_KEY, plan);
  }, [hydrated, plan]);

  const appendExercise = (p: WorkoutPlan, exerciseId: string, catalog = exercises): WorkoutPlan => {
    const exercise = catalog.find(entry => entry.id === exerciseId);
    // Bodyweight templates have no load. Restore the profile load only as the
    // first kettlebell enters; an existing kettlebell plan may intentionally use 0.
    const firstKettlebell = p.weightKg === 0 && exercise?.equipment !== 'bodyweight'
      && p.items.every(item => catalog.find(entry => entry.id === item.exerciseId)?.equipment === 'bodyweight');
    return {
      ...p,
      weightKg: firstKettlebell ? settings.defaultWeightKg : p.weightKg,
      items: [...p.items, makeItem(catalog, exerciseId)]
    };
  };

  const addExercise = (exerciseId: string) =>
    setPlan((p) => appendExercise(p, exerciseId));

  const rememberRemoval = (p: WorkoutPlan, matches: (item: ComplexItem) => boolean) => {
    removed.current = { name: p.name, entries: p.items.flatMap((item, index) => matches(item) ? [{ item, index }] : []) };
    return { ...p, items: p.items.filter(item => !matches(item)) };
  };
  const toggleExerciseSelection = (exerciseId: string) => {
    if (!exercises.some(exercise => exercise.id === exerciseId)) return;
    setPlan(p => p.items.some(item => item.exerciseId === exerciseId)
      ? rememberRemoval(p, item => item.exerciseId === exerciseId)
      : appendExercise(p, exerciseId));
  };
  const removeItem = (key: string) => setPlan(p => rememberRemoval(p, item => item.key === key));
  const dismissUndo = () => { removed.current = null; setPlan(p => ({ ...p })); };
  const undoRemoval = () => {
    const undo = removed.current; removed.current = null;
    setPlan(p => {
    if (!undo || undo.name !== p.name) return { ...p };
    const items = [...p.items];
    for (const entry of undo.entries) if (!items.some(item => item.key === entry.item.key)) items.splice(Math.min(entry.index, items.length), 0, entry.item);
    return { ...p, items };
    });
  };

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
    if (!plan.items.length || !validPlan(plan)) return false;
    const entry: SavedComplex = { ...plan, id: makeKey(), savedAt: new Date().toISOString(), favorite: false };
    try { setSaved(await updateStored(SAVED_KEY, [], validSaved, current => [entry, ...current])); }
    catch (error) { notifyStorage(error); return false; }
    return true;
  };

  const loadSaved = (id: string) => {
    const found = saved.find((x) => x.id === id);
    if (!found) return;
    const { id: _id, savedAt: _savedAt, favorite: _favorite, ...rest } = found;
    removed.current = null;
    setPlan(clonePlan(rest));
  };

  const deleteSaved = async (id: string) => {
    try { setSaved(await updateStored(SAVED_KEY, [], validSaved, current => current.filter(x => x.id !== id))); } catch (error) { notifyStorage(error); }
  };

  const toggleSavedFavorite = async (id: string) => {
    try { setSaved(await updateStored(SAVED_KEY, [], validSaved, current => current.map(x => x.id === id ? { ...x, favorite: !x.favorite } : x))); } catch (error) { notifyStorage(error); }
  };

  const loadPreset = (preset: PresetId) => {
    const definition = PRESETS.find((x) => x.id === preset);
    if (!definition) return;

    removed.current = null;
    setPlan(createPresetPlan(definition, settings.defaultWeightKg, makeKey));
  };

  const applyProfileDefaults = () =>
    setPlan((p) => ({
      ...p,
      weightKg: settings.defaultWeightKg,
      rounds: settings.defaultRounds,
      restSeconds: settings.defaultRestSeconds
    }));

  const addCustomExercise = async (input: {
    name: string; category: ExerciseCategory; mode: ExerciseMode; value: number; unilateral: boolean; equipment?: 'kettlebell' | 'bodyweight';
  }) => {
    const exercise: ExerciseDefinition = {
      id: `custom-${makeKey()}`,
      name: input.name.trim(),
      category: input.category,
      defaultMode: input.mode,
      defaultValue: input.value,
      unilateral: input.unilateral,
      visual: (input.category === 'Legs' ? 'squat' : input.category === 'Ballistic' ? 'swing' : input.category === 'Core' ? 'carry' : 'press') as ExerciseVisual,
      equipment: input.equipment ?? 'kettlebell',
      custom: true,
      difficulty: 'Intermediate',
      description: 'Custom exercise.',
      technique: ['Use a controlled range of motion and stop if technique breaks down.'],
      focus: [input.category]
    };
    try { setCustomExercises(await updateStored(CUSTOM_KEY, [], validExercises, current => [...current, exercise])); }
    catch (error) { notifyStorage(error); return false; }
    setPlan((p) => appendExercise(p, exercise.id, [...exercises, exercise]));
    return true;
  };

  const toggleExerciseFavorite = async (id: string) => {
    try { setFavoriteExerciseIds(await updateStored(FAVORITES_KEY, [], strings, current => current.includes(id) ? current.filter(x => x !== id) : [id, ...current])); }
    catch (error) { notifyStorage(error); }
  };

  const updateSettings = async (patch: Partial<AppSettings>) => {
    try { setSettings(await updateStored(SETTINGS_KEY, settings, validSettings, current => ({ ...defaultSettings, ...current, ...patch }))); }
    catch (error) { notifyStorage(error); }
  };

  const completeWorkout = async (input: Omit<WorkoutHistoryEntry, 'id' | 'completedAt'> & { completedAt?: string }): Promise<'history' | 'pending'> => {
    const entry: WorkoutHistoryEntry = { ...input, id: input.sessionId ?? makeKey(), completedAt: input.completedAt ?? new Date().toISOString() };
    const insert = (current: WorkoutHistoryEntry[]) => current.some(x => x.id === entry.id) ? current : [entry, ...current];
    try {
      const next = await updateStored(HISTORY_KEY, [], validHistory, insert);
      historyRef.current = next; setHistory(next);
      return 'history';
    } catch {
      // Clear the active checkpoint only after this independent durable outbox succeeds.
      setPendingHistory(await updateStored(PENDING_KEY, [], validHistory, insert));
      return 'pending';
    }
  };
  const retryPending = async () => {
    try {
      const entries = await readStored(PENDING_KEY, validHistory) ?? [];
      for (const entry of entries) {
        const next = await updateStored(HISTORY_KEY, [], validHistory, current => current.some(x => x.id === entry.id) ? current : [entry, ...current]);
        historyRef.current = next; setHistory(next);
        setPendingHistory(await updateStored(PENDING_KEY, [], validHistory, current => current.filter(x => x.id !== entry.id)));
      }
    } catch (error) { notifyStorage(error); }
  };
  const recoverHistory = async () => {
    try { await archiveAndReset(HISTORY_KEY); historyRef.current = []; setHistory([]); await retryPending(); }
    catch (error) { notifyStorage(error); }
  };

  const loadHistoryPlan = (id: string) => {
    const found = history.find((x) => x.id === id);
    if (!found?.plan) return false;
    removed.current = null;
    setPlan(clonePlan(found.plan));
    return true;
  };

  const clearHistory = async () => {
    const run = historyQueue.current.catch(() => undefined).then(async () => {
      await writeStored(HISTORY_KEY, null);
      historyRef.current = []; setHistory([]);
    });
    historyQueue.current = run;
    try { await run; } catch (error) { notifyStorage(error); }
  };

  const value = useMemo(() => ({
    hydrated, plan, saved, history, pendingHistory, retryPending, recoverHistory, customExercises, exercises, favoriteExerciseIds, settings,
    setPlan, addExercise, toggleExerciseSelection, removeItem, undoRemoval, dismissUndo, undoCount: removed.current?.name === plan.name ? removed.current.entries.length : 0, reorderItems, moveItem, updateItem, saveCurrent,
    loadSaved, deleteSaved, toggleSavedFavorite, loadPreset, applyProfileDefaults,
    addCustomExercise, toggleExerciseFavorite, updateSettings, completeWorkout,
    loadHistoryPlan, clearHistory
  }), [hydrated, plan, saved, history, pendingHistory, customExercises, exercises, favoriteExerciseIds, settings]);

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) throw new Error('useWorkout must be used within WorkoutProvider');
  return context;
}
