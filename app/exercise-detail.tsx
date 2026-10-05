import { UndoNotice } from '../src/components/UndoNotice';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExerciseGlyph } from '../src/components/ExerciseGlyph';
import { getExercisePairings } from '../src/data/exercisePairings';
import { getMotion } from '../src/animation/exercisePoses';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { useWorkout } from '../src/context/WorkoutContext';
import { localizedExerciseCopy } from '../src/data/exerciseCopy';
import { categoryLabel, difficultyLabel, useI18n } from '../src/i18n';
import { useThemeStyles, ThemeColors, radius } from '../src/theme';

export default function ExerciseDetailScreen() {
  const { colors, styles } = useThemeStyles(createStyles);
  const params = useLocalSearchParams<{ id?: string }>();
  const { plan, exercises, toggleExerciseSelection, favoriteExerciseIds, toggleExerciseFavorite } = useWorkout();
  const { t, language } = useI18n();
  const exercise = exercises.find((x) => x.id === params.id);

  if (!exercise) {
    return (
      <View style={styles.missing}>
        <Text style={styles.title}>{t('exerciseNotFound')}</Text>
        <PrimaryButton label={t('back')} onPress={() => router.back()}/>
      </View>
    );
  }

  const favorite = favoriteExerciseIds.includes(exercise.id);
  const selectedIds = new Set(plan.items.map(item => item.exerciseId));
  const pairings = getExercisePairings(exercise, exercises, plan);
  const local = localizedExerciseCopy(exercise, language);
  const highlightedMuscles = getMotion(exercise.id, exercise.visual, exercise.equipment ?? 'kettlebell').muscles;

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <UndoNotice/>
      <View style={styles.hero}>
        <ExerciseGlyph exerciseId={exercise.id} visual={exercise.visual} size={240} animated hero equipment={exercise.equipment ?? 'kettlebell'}/>
        {highlightedMuscles.length > 0 && (
          <View style={styles.muscleLegend}>
            <Text style={styles.muscleLegendTitle}>CONTRAST AREAS · MUSCLE FOCUS</Text>
            <Text style={styles.muscleLegendText}>{highlightedMuscles.join(' · ')}</Text>
          </View>
        )}
        <View style={styles.heroText}>
          <View style={styles.badges}>
            <Text style={styles.badge}>{categoryLabel(language, exercise.category).toUpperCase()}</Text>
            <Text style={styles.badge}>{difficultyLabel(language, exercise.difficulty ?? 'Intermediate').toUpperCase()}</Text>
          </View>
          <Text style={styles.title}>{exercise.name}</Text>
          <Text style={styles.description}>{local.description}</Text>
        </View>
      </View>

      <View style={styles.meta}>
        <Meta label={t('defaultTarget')} value={exercise.defaultMode === 'reps' ? `${exercise.defaultValue} ${t('reps').toLowerCase()}` : `${exercise.defaultValue} ${t('sec')}`}/>
        <Meta label={t('sides')} value={exercise.unilateral ? 'L / R' : t('bilateral')}/>
      </View>

      {local.focus.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('primaryFocus')}</Text>
          <View style={styles.chips}>
            {local.focus.map((focus) => <Text key={focus} style={styles.chip}>{focus}</Text>)}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('techniqueCues')}</Text>
        <View style={styles.technique}>
          {local.technique.map((cue, index) => (
            <View key={`${cue}-${index}`} style={styles.cueRow}>
              <View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View>
              <Text style={styles.cue}>{cue}</Text>
            </View>
          ))}
        </View>
      </View>

      {pairings.length > 0 && <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pairs well with</Text>
        <Text style={styles.description}>Ideas for building a varied workout. Tap to explore or check to add.</Text>
        {pairings.map(({ exercise: partner, reason }) => {
          const selected = selectedIds.has(partner.id);
          const tone = partner.equipment === 'bodyweight' ? colors.bodyweight : colors.accent;
          return <View key={partner.id} style={styles.pairing}>
            <Pressable accessibilityRole="button" accessibilityLabel={`View ${partner.name}`} onPress={() => router.push({ pathname: '/exercise-detail', params: { id: partner.id } })} style={styles.pairingLink}>
              <Text style={[styles.pairingName, { color: tone }]}>{partner.name} ›</Text>
              <Text style={styles.pairingReason}>{reason}</Text>
            </Pressable>
            <Pressable accessibilityRole="checkbox" accessibilityLabel={`${selected ? 'Remove' : 'Select'} ${partner.name}`} accessibilityState={{ checked: selected }} onPress={() => toggleExerciseSelection(partner.id)} style={styles.pairingCheck}>
              <View style={[styles.checkBox, { borderColor: tone }, selected && { backgroundColor: tone }]}><Text style={styles.checkText}>{selected ? '✓' : ''}</Text></View>
            </Pressable>
          </View>;
        })}
      </View>}
      <PrimaryButton label={selectedIds.has(exercise.id) ? 'Remove from workout' : 'Add to workout'} onPress={() => toggleExerciseSelection(exercise.id)}/>
      <Text style={styles.pairingReason}>{selectedIds.has(exercise.id) ? 'Selected in your workout. Changes are saved automatically.' : 'Not selected in your workout.'}</Text>
      <Pressable style={styles.favorite} onPress={() => toggleExerciseFavorite(exercise.id)}>
        <Text style={styles.favoriteText}>{favorite ? t('removeFavorite') : t('addFavorite')}</Text>
      </Pressable>
      <Text style={styles.safety}>{t('techniqueDisclaimer')}</Text>
    </ScrollView>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  const { colors, styles } = useThemeStyles(createStyles);
  return <View style={styles.metaItem}><Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue}>{value}</Text></View>;
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { padding: 18, paddingBottom: 40, backgroundColor: colors.bg, gap: 20 },
  missing: { flex: 1, padding: 20, justifyContent: 'center', gap: 20, backgroundColor: colors.bg },
  hero: { alignItems: 'center', gap: 16 },
  muscleLegend: { alignItems: 'center', gap: 4, paddingHorizontal: 12 },
  muscleLegendTitle: { color: colors.text, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  muscleLegendText: { color: colors.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  heroText: { alignItems: 'center', gap: 7 },
  badges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { color: colors.accent, backgroundColor: colors.accentSoft, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12, fontSize: 9, fontWeight: '900', letterSpacing: 0.8, overflow: 'hidden' },
  title: { color: colors.text, fontSize: 31, fontWeight: '900', textAlign: 'center' },
  description: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 440 },
  meta: { flexDirection: 'row', gap: 10 },
  metaItem: { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: 14 },
  metaLabel: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  metaValue: { color: colors.text, fontWeight: '900', fontSize: 17, marginTop: 4 },
  section: { gap: 11 },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '900' },
  chips: { flexDirection: 'row', gap: 7, flexWrap: 'wrap' },
  chip: { color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingHorizontal: 11, paddingVertical: 7, fontSize: 12, fontWeight: '800', overflow: 'hidden' },
  technique: { gap: 9 },
  cueRow: { flexDirection: 'row', gap: 11, alignItems: 'flex-start', backgroundColor: colors.card, borderRadius: radius.lg, padding: 13 },
  number: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  numberText: { color: colors.accent, fontSize: 11, fontWeight: '900' },
  cue: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 20 },
  favorite: { minHeight: 50, alignItems: 'center', justifyContent: 'center' },
  favoriteText: { color: colors.text, fontWeight: '800' },
  pairing: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: 14, gap: 10 },
  pairingLink: { flex: 1, minHeight: 48, justifyContent: 'center' },
  pairingName: { fontSize: 15, fontWeight: '800' },
  pairingReason: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  pairingCheck: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  checkBox: { width: 26, height: 26, borderWidth: 1.5, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  checkText: { color: colors.bg, fontSize: 18, fontWeight: '900' },
  safety: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: 'center' }
});
