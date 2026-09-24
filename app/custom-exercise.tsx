import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { SegmentedControl } from '../src/components/SegmentedControl';
import { useWorkout } from '../src/context/WorkoutContext';
import { categoryLabel, useI18n } from '../src/i18n';
import { ExerciseCategory, ExerciseMode } from '../src/types';
import { colors, radius } from '../src/theme';

export default function CustomExerciseScreen() {
  const { addCustomExercise } = useWorkout();
  const { t, language } = useI18n();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('Strength');
  const [mode, setMode] = useState<ExerciseMode>('reps');
  const [value, setValue] = useState('10');
  const [unilateral, setUnilateral] = useState(false);
  const valid = name.trim().length >= 2 && Number(value) > 0;

  const categories: Array<{ value: ExerciseCategory; label: string }> =
    (['Ballistic', 'Strength', 'Legs', 'Core'] as ExerciseCategory[]).map((value) => ({ value, label: categoryLabel(language, value) }));
  const modes: Array<{ value: ExerciseMode; label: string }> = [
    { value: 'reps', label: t('reps') },
    { value: 'time', label: t('time') }
  ];

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>{t('exerciseName')}</Text>
      <TextInput value={name} onChangeText={setName} maxLength={40} placeholder="Bottom-up Press" placeholderTextColor={colors.muted} style={styles.input}/>

      <Text style={styles.label}>{t('category')}</Text>
      <SegmentedControl value={category} options={categories} onChange={setCategory}/>

      <Text style={styles.label}>{t('defaultTargetLabel')}</Text>
      <SegmentedControl value={mode} options={modes} onChange={setMode}/>

      <View style={styles.targetRow}>
        <TextInput value={value} onChangeText={setValue} keyboardType="number-pad" style={styles.numberInput}/>
        <Text style={styles.targetUnit}>{mode === 'reps' ? t('reps').toLowerCase() : t('seconds')}</Text>
      </View>

      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchTitle}>{t('unilateralMovement')}</Text>
          <Text style={styles.help}>{t('unilateralHelp')}</Text>
        </View>
        <Switch value={unilateral} onValueChange={setUnilateral} trackColor={{ false: colors.border, true: colors.accentSoft }} thumbColor={unilateral ? colors.accent : colors.muted}/>
      </View>

      <PrimaryButton
        label={t('createAdd')}
        disabled={!valid}
        onPress={async () => {
          await addCustomExercise({ name, category, mode, value: Math.min(300, Math.max(1, Number(value))), unilateral });
          router.back();
        }}
      />
      <Pressable onPress={() => router.back()} style={styles.cancel}><Text style={styles.cancelText}>{t('cancel')}</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 12, backgroundColor: colors.bg },
  label: { color: colors.muted, fontSize: 12, fontWeight: '900', marginTop: 6 },
  input: { minHeight: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: 15, fontSize: 16 },
  targetRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  numberInput: { width: 100, minHeight: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.text, textAlign: 'center', fontSize: 21, fontWeight: '900' },
  targetUnit: { color: colors.muted, fontWeight: '800' },
  switchRow: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, marginVertical: 5 },
  switchTitle: { color: colors.text, fontWeight: '900', fontSize: 16 },
  help: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  cancel: { minHeight: 46, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: colors.muted, fontWeight: '800' }
});
