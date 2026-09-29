// Catalogue, real session execution, provider loading and picker actions.
// Native alerts/navigation and React lifecycle are deterministic adapters, not a device test.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('node:assert/strict'), ts = require('typescript');
const root = path.resolve(__dirname, '..');
const memory = new Map(), cache = new Map(), alerts = [], routes = [];
let activeHarness, provider;
const changed = (a, b) => !a || !b || a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]));
const react = {
  __esModule: true, createContext: () => ({ Provider: 'Provider' }), useContext: () => provider.value,
  useState: initial => {
    const h = activeHarness, i = h.cursor++;
    if (!(i in h.slots)) h.slots[i] = typeof initial === 'function' ? initial() : initial;
    return [h.slots[i], value => { h.slots[i] = typeof value === 'function' ? value(h.slots[i]) : value; h.dirty = true; }];
  },
  useRef: initial => { const h = activeHarness, i = h.cursor++; return h.slots[i] ?? (h.slots[i] = { current: initial }); },
  useMemo: (fn, deps) => { const h = activeHarness, i = h.cursor++; if (!h.slots[i] || changed(h.slots[i].deps, deps)) h.slots[i] = { deps, value: fn() }; return h.slots[i].value; },
  useEffect: (fn, deps) => { const h = activeHarness, i = h.cursor++; if (!h.slots[i] || changed(h.slots[i].deps, deps)) { const old = h.slots[i]; h.effects.push(() => { old?.cleanup?.(); h.slots[i] = { deps, cleanup: fn() }; }); } },
  createElement: (type, props, ...children) => {
    if (type === 'Provider') { activeHarness.value = props.value; return null; }
    return { type, props: { ...props, children } };
  }
};
react.default = react;
const storage = { getItem: async key => memory.get(key) ?? null, setItem: async (key, value) => { memory.set(key, value); }, removeItem: async key => { memory.delete(key); } };
const native = { Alert: { alert: (...args) => alerts.push(args) }, StyleSheet: { create: value => value }, Pressable: 'Pressable', Text: 'Text', View: 'View', ScrollView: 'ScrollView' };
function load(file) {
  file = path.resolve(root, file);
  if (cache.has(file)) return cache.get(file);
  const exports = {}; cache.set(file, exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  vm.runInNewContext(code, { exports, require: id => {
    if (id === 'react') return react;
    if (id === 'react-native') return native;
    if (id === 'expo-router') return { router: { push: value => routes.push(value) } };
    if (id === '@react-native-async-storage/async-storage') return { __esModule: true, default: storage };
    const next = path.resolve(path.dirname(file), id);
    return load(fs.existsSync(next + '.ts') ? next + '.ts' : next + '.tsx');
  }, React: react, Date, Math, Map, Set, JSON, Promise });
  return exports;
}
function harness(fn) {
  const h = { slots: [], effects: [], cursor: 0, dirty: false, value: null,
    render() { activeHarness = h; h.cursor = 0; h.dirty = false; const out = fn(); if (out) h.value = out; h.effects.splice(0).forEach(run => run()); return h.value; },
    unmount() { for (const slot of h.slots) slot?.cleanup?.(); }
  }; h.render(); return h;
}
async function settle(h) { for (let i = 0; i < 40; i++) { await Promise.resolve(); if (h?.dirty) h.render(); } }
const serial = value => JSON.stringify(value);
function nodes(node) {
  if (Array.isArray(node)) return node.flatMap(nodes);
  if (!node || typeof node !== 'object') return [];
  return [node, ...nodes(node.props?.children)];
}
function find(h, test) { const node = nodes(h.value).find(test); assert.ok(node, 'Expected UI control is present'); return node; }
const { PRESETS, createPresetPlan } = load('src/data/presets.ts');
const { BASE_EXERCISES } = load('src/data/exercises.ts');
const { validPlan } = load('src/storage/validation.ts');
const { buildRoundSteps, calculatePlanStats } = load('src/workout/steps.ts');
const { createSession, tickSession, actOnSession, remainingSeconds, sessionSummary, validSession, planFingerprint } = load('src/workout/session.ts');
const byId = new Map(BASE_EXERCISES.map(exercise => [exercise.id, exercise]));
const priorIds = ['cps', 'simple5', 'swing', 'kb-strength', 'kb-conditioning', 'legs-core', 'bodyweight-basics', 'bodyweight-hiit', 'bodyweight-core'];
assert.ok(PRESETS.length >= 18 && PRESETS.length <= 24);
assert.equal(new Set(PRESETS.map(preset => preset.id)).size, PRESETS.length);
for (const id of priorIds) assert.ok(PRESETS.some(preset => preset.id === id), `Existing ID ${id} retained`);
for (const equipment of ['kettlebell', 'bodyweight']) assert.ok(PRESETS.filter(preset => preset.equipment === equipment).length >= 9);
for (const preset of PRESETS) {
  const before = serial(preset);
  assert.ok(['Beginner', 'Intermediate', 'Advanced'].includes(preset.difficulty));
  assert.ok(preset.description.length > 30 && preset.coaching.length > 30 && preset.focus);
  assert.ok(preset.rounds >= 1 && preset.rounds <= 6 && preset.restSeconds >= 30);
  assert.ok(preset.items.length >= 1 && preset.items.length <= 6);
  for (const item of preset.items) {
    const exercise = byId.get(item.exerciseId);
    assert.ok(exercise, `${preset.id}: known exercise`);
    assert.equal(exercise.equipment ?? 'kettlebell', preset.equipment);
    assert.ok(Number.isInteger(item.value) && item.value > 0 && item.value <= 60);
    assert.equal(item.side, exercise.unilateral ? 'both' : 'alternate', `${preset.id}: both sides receive work`);
    if (preset.difficulty === 'Beginner') assert.equal(exercise.difficulty, 'Beginner', `${preset.id}: no advanced movement in entry template`);
    if (exercise.difficulty === 'Advanced') assert.equal(preset.difficulty, 'Advanced');
  }
  const preview = createPresetPlan(preset, 18);
  const loaded = createPresetPlan(preset, 18, index => `loaded-${index}`);
  assert.ok(validPlan(loaded));
  assert.equal(loaded.weightKg, preset.equipment === 'bodyweight' ? 0 : 18);
  assert.equal(planFingerprint(preview, BASE_EXERCISES, false), planFingerprint(loaded, BASE_EXERCISES, false));
  const steps = buildRoundSteps(loaded, BASE_EXERCISES);
  const expectedSteps = preset.items.reduce((sum, item) => sum + (byId.get(item.exerciseId).unilateral ? 2 : 1), 0);
  assert.equal(steps.length, expectedSteps);
  const expectedReps = preset.items.reduce((sum, item) => sum + (item.mode === 'reps' ? item.value * (byId.get(item.exerciseId).unilateral ? 2 : 1) : 0), 0) * preset.rounds;
  const expectedTime = preset.items.reduce((sum, item) => sum + (item.mode === 'time' ? item.value * (byId.get(item.exerciseId).unilateral ? 2 : 1) : 0), 0) * preset.rounds;
  const stats = calculatePlanStats(preview, BASE_EXERCISES);
  assert.equal(stats.totalReps, expectedReps);
  assert.equal(stats.estimatedSeconds, Math.round(expectedReps * 2.6 + expectedTime + (preset.rounds - 1) * preset.restSeconds));
  assert.equal(stats.volumeKg, preset.equipment === 'bodyweight' ? 0 : expectedReps * 18);
  let run = tickSession(createSession(loaded, BASE_EXERCISES, false, 1000), 4000);
  let guard = 0;
  while (run.phase !== 'done' && guard++ < 500) {
    if (run.phase === 'rest') run = tickSession(run, run.lastAt + remainingSeconds(run) * 1000);
    else if (run.steps[run.index].mode === 'time') run = tickSession(run, run.lastAt + remainingSeconds(run) * 1000);
    else run = actOnSession(run, 'next', run.lastAt + run.steps[run.index].value * 2600);
    assert.ok(validSession(JSON.parse(serial(run))), `${preset.id}: recoverable throughout execution`);
  }
  assert.equal(run.phase, 'done');
  assert.equal(run.status, 'completed');
  const summary = sessionSummary(run);
  assert.equal(summary.totalReps, expectedReps);
  assert.equal(summary.volumeKg, stats.volumeKg);
  if (preset.equipment === 'bodyweight') {
    assert.equal(summary.bodyweight.totalReps, expectedReps);
    assert.equal(summary.bodyweight.totalSeconds, expectedTime);
  }
  loaded.items[0].value = 999;
  assert.equal(serial(preset), before, 'Loaded editing never mutates the catalogue');
}
(async () => {
  const { WorkoutProvider } = load('src/context/WorkoutContext.tsx');
  provider = harness(() => WorkoutProvider({ children: null })); await settle(provider);
  await provider.value.updateSettings({ defaultWeightKg: 22, defaultRounds: 17, defaultRestSeconds: 255 }); await settle(provider);
  for (const preset of PRESETS) {
    provider.value.loadPreset(preset.id); await settle(provider);
    assert.equal(provider.value.plan.rounds, preset.rounds);
    assert.equal(provider.value.plan.restSeconds, preset.restSeconds);
    assert.equal(provider.value.plan.weightKg, preset.equipment === 'bodyweight' ? 0 : 22);
    assert.equal(provider.value.settings.defaultWeightKg, 22);
    assert.equal(provider.value.settings.defaultRounds, 17);
    assert.equal(provider.value.settings.defaultRestSeconds, 255);
    assert.equal(planFingerprint(provider.value.plan, BASE_EXERCISES, false), planFingerprint(createPresetPlan(preset, 22), BASE_EXERCISES, false));
  }
  // Adding the first kettlebell to a zero-load bodyweight template restores the
  // profile load through every selection entry point, without altering defaults.
  for (const route of ['add', 'toggle', 'custom']) {
    const add = async (equipment, serialNumber) => {
      if (route === 'custom') {
        assert.equal(await provider.value.addCustomExercise({ name: `${equipment} ${serialNumber}`, category: 'Strength', mode: 'reps', value: 6, unilateral: false, equipment }), true);
      } else {
        const id = equipment === 'bodyweight' ? 'high-knees' : serialNumber === 1 ? 'deadlift' : 'row';
        if (route === 'toggle') provider.value.toggleExerciseSelection(id);
        else provider.value.addExercise(id);
      }
      await settle(provider);
    };
    provider.value.loadPreset('bodyweight-first-step'); await settle(provider);
    await add('bodyweight', 1);
    assert.equal(provider.value.plan.weightKg, 0, `${route}: more bodyweight keeps zero load`);
    await add('kettlebell', 1);
    assert.equal(provider.value.plan.weightKg, 22, `${route}: first kettlebell restores profile load`);
    assert.ok(calculatePlanStats(provider.value.plan, provider.value.exercises).volumeKg > 0);
    assert.equal(provider.value.settings.defaultWeightKg, 22);
    provider.value.setPlan({ ...provider.value.plan, weightKg: 0 }); await settle(provider);
    await add('kettlebell', 2);
    assert.equal(provider.value.plan.weightKg, 0, `${route}: deliberately unloaded mixed plan is preserved`);
    provider.value.loadPreset('bodyweight-first-step'); await settle(provider);
    provider.value.setPlan({ ...provider.value.plan, weightKg: 14 }); await settle(provider);
    await add('kettlebell', 1);
    assert.equal(provider.value.plan.weightKg, 14, `${route}: an existing chosen load is preserved`);
    provider.value.loadPreset('swing'); await settle(provider);
    provider.value.setPlan({ ...provider.value.plan, weightKg: 0 }); await settle(provider);
    await add('kettlebell', 1);
    assert.equal(provider.value.plan.weightKg, 0, `${route}: deliberately unloaded kettlebell plan is preserved`);
  }
  provider.value.loadPreset('bodyweight-first-step'); await settle(provider);
  const savedDraft = serial(provider.value.plan);
  const { TemplatePicker } = load('src/components/TemplatePicker.tsx');
  const picker = harness(() => TemplatePicker());
  assert.equal(nodes(picker.value).filter(node => node.type?.name === 'Dropdown').length, 0, 'Picker is compact by default');
  find(picker, node => node.props?.accessibilityLabel === 'Workout templates').props.onPress(); picker.render();
  const dropdown = label => find(picker, node => node.type?.name === 'Dropdown' && node.props.label === label);
  dropdown('Experience').props.onChange('Advanced'); picker.render();
  dropdown('Equipment').props.onChange('bodyweight'); picker.render();
  assert.equal(dropdown('Experience').props.value, 'all', 'Equipment change clears an unsupported level');
  find(picker, node => node.type?.name === 'Dropdown' && node.props.label.endsWith('templates')).props.onChange('bodyweight-first-step'); picker.render();
  assert.equal(serial(provider.value.plan), savedDraft, 'Preview and filters leave the existing draft unchanged');
  find(picker, node => node.props?.accessibilityLabel?.startsWith('Air Squat,')).props.onPress();
  assert.equal(routes[0].params.id, 'air-squat');
  const apply = () => find(picker, node => node.props?.accessibilityLabel === 'Use Bodyweight First Step').props.onPress();
  apply();
  assert.equal(alerts.length, 1);
  assert.equal(serial(provider.value.plan), savedDraft, 'Opening the confirmation preserves the draft');
  assert.equal(alerts[0][2].find(button => button.text === 'Cancel').onPress, undefined, 'Cancel cannot load a preset');
  apply(); alerts[1][2].find(button => button.text === 'Replace').onPress(); await settle(provider); picker.render();
  assert.equal(provider.value.plan.name, 'Bodyweight First Step');
  assert.equal(provider.value.plan.weightKg, 0);
  assert.equal(nodes(picker.value).filter(node => node.type?.name === 'Dropdown').length, 0, 'Applied picker collapses');
  provider.value.setPlan({ ...provider.value.plan, items: [] }); await settle(provider);
  find(picker, node => node.props?.accessibilityLabel === 'Workout templates').props.onPress(); picker.render();
  find(picker, node => node.type?.name === 'Dropdown' && node.props.label.endsWith('templates')).props.onChange('bodyweight-basics'); picker.render();
  find(picker, node => node.props?.accessibilityLabel === 'Use Bodyweight Basics').props.onPress(); await settle(provider);
  assert.equal(alerts.length, 2, 'An empty builder loads without unnecessary confirmation');
  assert.equal(provider.value.plan.name, 'Bodyweight Basics');
  picker.unmount(); provider.unmount();
  console.log(`PASS: ${PRESETS.length} template prescriptions, side-aware estimates, complete recoverable sessions, provider defaults/first-kettlebell load transitions, immutable catalogue, draft-safe preview/confirmation and bodyweight summaries.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
