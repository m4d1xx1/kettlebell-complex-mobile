import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExerciseGlyph } from '../src/components/ExerciseGlyph';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { useWorkout } from '../src/context/WorkoutContext';
import { localizedExerciseCopy } from '../src/data/exerciseCopy';
import { categoryLabel, difficultyLabel, useI18n } from '../src/i18n';
import { colors, radius } from '../src/theme';

export default function ExerciseDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { exercises, addExercise, favoriteExerciseIds, toggleExerciseFavorite } = useWorkout();
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
  const local = localizedExerciseCopy(exercise, language);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.hero}>
        <ExerciseGlyph visual={exercise.visual} size={190} animated hero/>
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

      <PrimaryButton label={t('addToComplex')} onPress={() => { addExercise(exercise.id); router.back(); }}/>
      <Pressable style={styles.favorite} onPress={() => toggleExerciseFavorite(exercise.id)}>
        <Text style={styles.favoriteText}>{favorite ? t('removeFavorite') : t('addFavorite')}</Text>
      </Pressable>
      <Text style={styles.safety}>{t('techniqueDisclaimer')}</Text>
    </ScrollView>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <View style={styles.metaItem}><Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  page: { padding: 18, paddingBottom: 40, backgroundColor: colors.bg, gap: 20 },
  missing: { flex: 1, padding: 20, justifyContent: 'center', gap: 20, backgroundColor: colors.bg },
  hero: { alignItems: 'center', gap: 16 },
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
  safety: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: 'center' }
});
