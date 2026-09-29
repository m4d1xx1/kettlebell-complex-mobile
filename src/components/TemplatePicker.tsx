import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useWorkout } from '../context/WorkoutContext';
import { PRESETS, PresetId, createPresetPlan } from '../data/presets';
import { colors, radius } from '../theme';
import { Difficulty } from '../types';
import { calculatePlanStats } from '../workout/steps';
import { Dropdown } from './Dropdown';

const estimateLabel = (seconds: number) => `About ${Math.max(1, Math.round(seconds / 60))} min`;

export function TemplatePicker() {
  const { exercises, settings, plan, loadPreset } = useWorkout();
  const [open, setOpen] = useState(false);
  const [equipment, setEquipment] = useState<'kettlebell' | 'bodyweight'>('kettlebell');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedId, setSelectedId] = useState<PresetId>();
  const accent = equipment === 'bodyweight' ? colors.bodyweight : colors.accent;
  const available = useMemo(() => PRESETS.filter(preset => preset.equipment === equipment && (difficulty === 'all' || preset.difficulty === difficulty)), [equipment, difficulty]);
  const selected = available.find(preset => preset.id === selectedId);
  const preview = useMemo(() => selected ? createPresetPlan(selected, settings.defaultWeightKg) : undefined, [selected, settings.defaultWeightKg]);
  const stats = useMemo(() => preview ? calculatePlanStats(preview, exercises) : undefined, [preview, exercises]);
  const loadSelected = () => {
    if (!selected) return;
    const apply = () => { loadPreset(selected.id); setOpen(false); setSelectedId(undefined); };
    if (plan.items.length) {
      Alert.alert('Replace current plan?', `Load ${selected.name}? Your current unsaved builder plan will be replaced. Saved workouts stay in your library.`, [
        { text: 'Cancel', style: 'cancel' }, { text: 'Replace', onPress: apply }
      ]);
    } else apply();
  };

  return <View style={styles.container}>
    <Pressable accessibilityRole="button" accessibilityLabel="Workout templates" accessibilityState={{ expanded: open }} onPress={() => setOpen(value => !value)} style={styles.header}>
      <View style={styles.heading}>
        <Text style={styles.title}>Workout templates</Text>
        <Text style={styles.caption}>Kettlebell or bodyweight · Preview before loading</Text>
      </View>
      <Text style={styles.arrow}>{open ? '▴' : '▾'}</Text>
    </Pressable>
    {open && <View style={styles.content}>
      <Dropdown label="Equipment" value={equipment} options={[
        { value: 'kettlebell', label: 'Kettlebell', color: colors.accent },
        { value: 'bodyweight', label: 'Bodyweight · No equipment', color: colors.bodyweight }
      ]} onChange={value => { setEquipment(value as typeof equipment); if (value === 'bodyweight' && difficulty === 'Advanced') setDifficulty('all'); setSelectedId(undefined); }}/>
      <Dropdown label="Experience" value={difficulty} options={[
        { value: 'all', label: 'All levels' }, { value: 'Beginner', label: 'Beginner' },
        { value: 'Intermediate', label: 'Intermediate' },
        ...(equipment === 'kettlebell' ? [{ value: 'Advanced', label: 'Advanced' }] : [])
      ]} onChange={value => { setDifficulty(value as typeof difficulty); setSelectedId(undefined); }}/>
      {!available.length ? <View style={styles.empty}>
        <Text style={styles.caption}>No templates match this level.</Text>
        <Pressable accessibilityRole="button" onPress={() => setDifficulty('all')} style={styles.reset}><Text style={[styles.resetText, { color: accent }]}>Show all levels</Text></Pressable>
      </View> : <Dropdown label={`${available.length} templates`} placeholder="Choose a workout to preview" value={selectedId} options={available.map(preset => ({
        value: preset.id,
        label: `${preset.name} · ${estimateLabel(calculatePlanStats(createPresetPlan(preset, settings.defaultWeightKg), exercises).estimatedSeconds)}`,
        color: accent
      }))} onChange={value => setSelectedId(value as PresetId)}/>}
      {selected && preview && stats && <View style={[styles.preview, { borderColor: accent }]}>
        <Text style={[styles.eyebrow, { color: accent }]}>{selected.difficulty} · {selected.focus}</Text>
        <Text accessibilityRole="header" style={styles.previewTitle}>{selected.name}</Text>
        <Text style={styles.description}>{selected.description}</Text>
        <View style={styles.metrics}>
          <Text style={[styles.duration, { color: accent }]}>{estimateLabel(stats.estimatedSeconds)}</Text>
          <Text style={styles.description}>{selected.rounds} rounds · {selected.restSeconds}s rest between rounds</Text>
        </View>
        <Text style={styles.caption}>Estimate includes both sides and round rests. Your rep pace, transitions and extra pauses change the duration.</Text>
        <Text style={styles.listHeading}>Each round</Text>
        {preview.items.map((item, index) => {
          const exercise = exercises.find(entry => entry.id === item.exerciseId);
          if (!exercise) return null;
          const target = `${item.value} ${item.mode === 'time' ? 'sec' : 'reps'}`;
          const side = exercise.unilateral && item.side === 'both' ? ' per side · left, then right'
            : item.exerciseId === 'bodyweight-reverse-lunge' ? item.mode === 'reps' ? ' total · alternate legs' : ' · alternate legs' : '';
          return <Pressable key={item.key} accessibilityRole="button" accessibilityLabel={`${exercise.name}, ${target}${side}. View exercise details.`} onPress={() => router.push({ pathname: '/exercise-detail', params: { id: exercise.id } })} style={styles.exercise}>
            <Text style={[styles.index, { color: accent }]}>{index + 1}</Text>
            <View style={styles.exerciseText}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.caption}>{target}{side}</Text>
            </View>
            <Text style={styles.info}>ⓘ</Text>
          </Pressable>;
        })}
        <Text style={styles.coaching}>{selected.coaching}</Text>
        <Text style={styles.caption}>{selected.equipment === 'kettlebell' ? `One kettlebell · Current profile load: ${preview.weightKg} kg. Review the weight in the builder.` : 'No equipment needed · Use a comfortable floor surface.'} You can edit all targets before starting.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`Use ${selected.name}`} onPress={loadSelected} style={({ pressed }) => [styles.useButton, { backgroundColor: accent }, pressed && styles.pressed]}>
          <Text style={[styles.useText, { color: equipment === 'bodyweight' ? colors.bodyweightText : colors.accentText }]}>Use this template</Text>
        </Pressable>
      </View>}
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  header: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel },
  heading: { flex: 1, gap: 4 }, title: { color: colors.text, fontSize: 17, fontWeight: '900' },
  caption: { color: colors.muted, fontSize: 12, lineHeight: 18 }, arrow: { color: colors.muted, fontSize: 22 },
  content: { gap: 10 }, preview: { borderWidth: 1, borderRadius: radius.lg, padding: 16, gap: 12, backgroundColor: colors.card },
  eyebrow: { fontSize: 12, fontWeight: '800', lineHeight: 18 }, previewTitle: { color: colors.text, fontSize: 23, fontWeight: '900' },
  description: { color: colors.text, fontSize: 14, lineHeight: 21 }, metrics: { gap: 4 }, duration: { fontSize: 23, fontWeight: '900' },
  listHeading: { color: colors.text, fontSize: 14, fontWeight: '800', marginTop: 4 },
  exercise: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border },
  index: { fontSize: 15, fontWeight: '900', width: 18 }, exerciseText: { flex: 1, gap: 3 }, exerciseName: { color: colors.text, fontSize: 15, fontWeight: '700' }, info: { color: colors.muted, fontSize: 18 },
  coaching: { color: colors.text, fontSize: 13, lineHeight: 20, padding: 12, backgroundColor: colors.panel, borderRadius: radius.sm },
  useButton: { minHeight: 54, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', padding: 14 }, useText: { fontSize: 16, fontWeight: '900', textAlign: 'center' }, pressed: { opacity: 0.8 },
  empty: { gap: 4, paddingHorizontal: 12 }, reset: { minHeight: 44, justifyContent: 'center' }, resetText: { fontSize: 14, fontWeight: '800' }
});
