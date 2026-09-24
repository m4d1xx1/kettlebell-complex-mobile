import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { ExerciseGlyph } from '../src/components/ExerciseGlyph';
import { NumberStepper } from '../src/components/NumberStepper';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { SegmentedControl } from '../src/components/SegmentedControl';
import { useWorkout } from '../src/context/WorkoutContext';
import { categoryLabel, useI18n } from '../src/i18n';
import { ComplexItem, ExerciseMode, SideMode } from '../src/types';
import { colors, radius } from '../src/theme';
import { calculatePlanStats } from '../src/workout/steps';
import { formatDuration } from '../src/utils/format';

export default function BuilderScreen() {
  const {
    hydrated, plan, setPlan, exercises, reorderItems, removeItem, moveItem, updateItem,
    loadPreset, saveCurrent, settings, applyProfileDefaults
  } = useWorkout();
  const { t, language } = useI18n();
  const stats = useMemo(() => calculatePlanStats(plan, exercises), [plan, exercises]);

  useEffect(() => {
    if (hydrated && !settings.onboardingComplete) router.replace('/onboarding');
  }, [hydrated, settings.onboardingComplete]);

  if (!hydrated || !settings.onboardingComplete) {
    return <View style={styles.loading}><ActivityIndicator color={colors.accent}/></View>;
  }

  const sideOptions: Array<{ value: SideMode; label: string }> = [
    { value: 'both', label: 'L + R' },
    { value: 'alternate', label: t('alternate') },
    { value: 'left', label: t('left') },
    { value: 'right', label: t('right') }
  ];
  const modeOptions: Array<{ value: ExerciseMode; label: string }> = [
    { value: 'reps', label: t('reps') },
    { value: 'time', label: t('time') }
  ];

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<ComplexItem>) => {
    const index = getIndex() ?? 0;
    const exercise = exercises.find((x) => x.id === item.exerciseId);
    if (!exercise) return null;

    return (
      <ScaleDecorator activeScale={1.02}>
        <View style={[styles.item, isActive && styles.itemActive]}>
          <Pressable onLongPress={drag} delayLongPress={120} accessibilityLabel={exercise.name} style={styles.dragArea}>
            <Text style={styles.drag}>≡</Text>
            <ExerciseGlyph visual={exercise.visual} size={58}/>
          </Pressable>

          <View style={styles.itemCenter}>
            <View style={styles.itemTitleRow}>
              <Text style={styles.itemName}>{index + 1}. {exercise.name}</Text>
              <Text style={styles.itemCategory}>{categoryLabel(language, exercise.category)}</Text>
            </View>

            <View style={styles.settingRow}>
              <SegmentedControl value={item.mode} options={modeOptions} onChange={(mode) => updateItem(item.key, { mode })}/>
              <View style={styles.valuePill}>
                <Pressable onPress={() => updateItem(item.key, { value: Math.max(1, item.value - (item.mode === 'time' ? 5 : 1)) })} style={styles.mini}><Text style={styles.miniText}>−</Text></Pressable>
                <Text style={styles.valueText}>{item.value}</Text>
                <Text style={styles.valueUnit}>{item.mode === 'reps' ? t('reps').toLowerCase() : t('sec')}</Text>
                <Pressable onPress={() => updateItem(item.key, { value: Math.min(300, item.value + (item.mode === 'time' ? 5 : 1)) })} style={styles.mini}><Text style={styles.miniText}>+</Text></Pressable>
              </View>
            </View>

            {exercise.unilateral ? (
              <View style={{ marginTop: 8 }}>
                <SegmentedControl value={item.side} options={sideOptions} onChange={(side) => updateItem(item.key, { side })}/>
              </View>
            ) : null}
          </View>

          <View style={styles.rowActions}>
            <Pressable disabled={index === 0} onPress={() => moveItem(item.key, -1)} style={[styles.action, index === 0 && styles.actionDisabled]}><Text style={styles.actionText}>↑</Text></Pressable>
            <Pressable disabled={index === plan.items.length - 1} onPress={() => moveItem(item.key, 1)} style={[styles.action, index === plan.items.length - 1 && styles.actionDisabled]}><Text style={styles.actionText}>↓</Text></Pressable>
            <Pressable onPress={() => removeItem(item.key)} style={styles.action}><Text style={[styles.actionText, { color: colors.danger }]}>×</Text></Pressable>
          </View>
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <DraggableFlatList
      data={plan.items}
      keyExtractor={(x) => x.key}
      renderItem={renderItem}
      onDragBegin={() => { if (settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
      onDragEnd={({ data }) => { reorderItems(data); if (settings.haptics) Haptics.selectionAsync(); }}
      activationDistance={8}
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        <View style={styles.headerBlock}>
          <View style={styles.hero}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>KETTLEBELL COMPLEX</Text>
              <TextInput value={plan.name} onChangeText={(name) => setPlan((p) => ({ ...p, name }))} maxLength={40} style={styles.nameInput}/>
            </View>
            <View style={styles.topActions}>
              <Pressable onPress={() => router.push('/history')} style={styles.topButton}><Text style={styles.topButtonText}>{t('history')}</Text></Pressable>
              <Pressable accessibilityLabel={t('settings')} onPress={() => router.push('/settings')} style={styles.iconTopButton}><Text style={styles.iconTopText}>⚙</Text></Pressable>
            </View>
          </View>

          <View style={styles.presetRow}>
            <Pressable style={styles.preset} onPress={() => loadPreset('cps')}><Text style={styles.presetText}>C·P·S</Text></Pressable>
            <Pressable style={styles.preset} onPress={() => loadPreset('simple5')}><Text style={styles.presetText}>Simple 5</Text></Pressable>
            <Pressable style={styles.preset} onPress={() => loadPreset('swing')}><Text style={styles.presetText}>Swing 20</Text></Pressable>
            <Pressable style={styles.preset} onPress={() => router.push('/saved')}><Text style={styles.presetText}>{t('saved')}</Text></Pressable>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{t('yourComplex')}</Text>
              <Text style={styles.muted}>{plan.items.length} {t('exercises').toLowerCase()} · {t('holdToReorder')}</Text>
            </View>
            <PrimaryButton compact label={t('add')} onPress={() => router.push('/exercises')}/>
          </View>

          {!plan.items.length ? (
            <Pressable style={styles.empty} onPress={() => router.push('/exercises')}>
              <Text style={styles.emptyTitle}>{t('buildFirst')}</Text>
              <Text style={styles.muted}>{t('buildFirstHelp')}</Text>
            </Pressable>
          ) : null}
        </View>
      }
      ListFooterComponent={
        <View style={styles.footer}>
          <View style={styles.setupHeader}>
            <Text style={styles.sectionTitle}>{t('workoutSetup')}</Text>
            <Pressable onPress={applyProfileDefaults} style={styles.defaultsButton}>
              <Text style={styles.defaultsText}>{t('useDefaults')}</Text>
            </Pressable>
          </View>

          <View style={styles.stepperGrid}>
            <NumberStepper label={t('weight')} value={plan.weightKg} min={4} max={80} step={2} suffix="kg" haptics={settings.haptics} onChange={(weightKg) => setPlan((p) => ({ ...p, weightKg }))}/>
            <NumberStepper label={t('rounds')} value={plan.rounds} min={1} max={30} haptics={settings.haptics} onChange={(rounds) => setPlan((p) => ({ ...p, rounds }))}/>
            <NumberStepper label={t('roundRest')} value={plan.restSeconds} min={0} max={600} step={15} suffix={t('sec')} haptics={settings.haptics} onChange={(restSeconds) => setPlan((p) => ({ ...p, restSeconds }))}/>
          </View>

          <View style={styles.summary}>
            <View><Text style={styles.summaryLabel}>{t('estimated')}</Text><Text style={styles.summaryBig}>{formatDuration(stats.estimatedSeconds)}</Text></View>
            <View style={styles.summaryRight}><Text style={styles.summaryMetric}>{stats.totalReps}</Text><Text style={styles.summarySmall}>{t('reps').toLowerCase()}</Text></View>
            <View style={styles.summaryRight}><Text style={styles.summaryMetric}>{Math.round(stats.volumeKg / 100) / 10}t</Text><Text style={styles.summarySmall}>{t('loadVolume')}</Text></View>
          </View>

          <PrimaryButton label={t('startWorkout')} disabled={!plan.items.length} onPress={() => router.push('/workout')}/>
          <Pressable
            disabled={!plan.items.length}
            onPress={async () => {
              await saveCurrent();
              if (settings.haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }}
            style={styles.save}
          >
            <Text style={styles.saveText}>{t('saveComplex')}</Text>
          </Pressable>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  container: { padding: 16, backgroundColor: colors.bg, gap: 10, paddingBottom: 30 },
  headerBlock: { gap: 16, marginBottom: 10 },
  hero: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  eyebrow: { color: colors.accent, fontWeight: '900', letterSpacing: 1.4, fontSize: 11 },
  nameInput: { color: colors.text, fontSize: 29, fontWeight: '900', padding: 0, marginTop: 3 },
  topActions: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  topButton: { minHeight: 44, paddingHorizontal: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, justifyContent: 'center' },
  iconTopButton: { width: 44, height: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  iconTopText: { color: colors.text, fontSize: 18, fontWeight: '800' },
  topButtonText: { color: colors.text, fontWeight: '800' },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preset: { paddingHorizontal: 13, minHeight: 40, borderRadius: 20, backgroundColor: colors.panel, justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  presetText: { color: colors.text, fontSize: 13, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '900' },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radius.lg, padding: 22, gap: 6 },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  item: { flexDirection: 'row', gap: 10, backgroundColor: colors.card, borderRadius: radius.lg, padding: 11, marginVertical: 5, borderWidth: 1, borderColor: 'transparent' },
  itemActive: { borderColor: colors.accent, backgroundColor: colors.elevated },
  dragArea: { width: 66, alignItems: 'center', gap: 3 },
  drag: { color: colors.muted, fontSize: 20, fontWeight: '900', lineHeight: 18 },
  itemCenter: { flex: 1, minWidth: 0 },
  itemTitleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 6 },
  itemName: { color: colors.text, fontSize: 15, fontWeight: '900', flexShrink: 1 },
  itemCategory: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  settingRow: { marginTop: 9, flexDirection: 'row', gap: 8, alignItems: 'center' },
  valuePill: { flexDirection: 'row', alignItems: 'center', minHeight: 41, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel, paddingHorizontal: 3 },
  mini: { width: 30, height: 34, alignItems: 'center', justifyContent: 'center' },
  miniText: { color: colors.text, fontSize: 19, fontWeight: '800' },
  valueText: { color: colors.text, fontSize: 16, fontWeight: '900', minWidth: 24, textAlign: 'center' },
  valueUnit: { color: colors.muted, fontSize: 10, fontWeight: '700', marginHorizontal: 3 },
  rowActions: { gap: 4, justifyContent: 'center' },
  action: { width: 32, height: 30, borderRadius: 9, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  actionDisabled: { opacity: 0.25 },
  actionText: { color: colors.text, fontWeight: '900', fontSize: 15 },
  footer: { marginTop: 16, gap: 14 },
  setupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  defaultsButton: { minHeight: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', paddingHorizontal: 11 },
  defaultsText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  stepperGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, padding: 16, borderRadius: radius.lg },
  summaryLabel: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  summaryBig: { color: colors.text, fontSize: 28, fontWeight: '900' },
  summaryRight: { marginLeft: 'auto', alignItems: 'flex-end' },
  summaryMetric: { color: colors.text, fontSize: 17, fontWeight: '900' },
  summarySmall: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  save: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: colors.muted, fontWeight: '800' }
});
