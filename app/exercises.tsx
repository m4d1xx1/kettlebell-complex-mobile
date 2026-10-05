import { AppSwitch } from '../src/components/AppSwitch';
import { UndoNotice } from '../src/components/UndoNotice';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dropdown } from '../src/components/Dropdown';
import { ExerciseGlyph } from '../src/components/ExerciseGlyph';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { useWorkout } from '../src/context/WorkoutContext';
import { categoryLabel, difficultyLabel, useI18n } from '../src/i18n';
import { useThemeStyles, ThemeColors, radius } from '../src/theme';

export default function ExercisesScreen() {
  const { colors, styles } = useThemeStyles(createStyles);
  const [query, setQuery] = useState('');
  const [equipment, setEquipment] = useState('all');
  const [category, setCategory] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { plan, toggleExerciseSelection, exercises, favoriteExerciseIds, toggleExerciseFavorite, settings } = useWorkout();
  const { t, language } = useI18n();
  const insets = useSafeAreaInsets();
  const selectedIds = useMemo(() => new Set(plan.items.map(item => item.exerciseId)), [plan.items]);
  const data = useMemo(() => exercises.filter(exercise =>
    (equipment === 'all' || (exercise.equipment ?? 'kettlebell') === equipment) &&
    (category === 'all' || exercise.category === category) &&
    (!favoritesOnly || favoriteExerciseIds.includes(exercise.id)) &&
    exercise.name.toLowerCase().includes(query.trim().toLowerCase())
  ).sort((a, b) => Number(favoriteExerciseIds.includes(b.id)) - Number(favoriteExerciseIds.includes(a.id)) || a.name.localeCompare(b.name)), [exercises, equipment, category, favoritesOnly, favoriteExerciseIds, query]);
  return (
    <View style={styles.page}>
      <FlatList data={data} keyExtractor={item => item.id} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={styles.list}
        ListHeaderComponent={<View style={styles.header}>
          <Text style={styles.heading}>Choose exercises</Text>
          <UndoNotice/>
          <Text style={styles.help}>Check to select. Tap an exercise for technique and combinations.</Text>
          <Dropdown label="Equipment" value={equipment} options={[{ value: 'all', label: 'Kettlebell + Bodyweight' }, { value: 'kettlebell', label: 'Kettlebell', color: colors.accent }, { value: 'bodyweight', label: 'Bodyweight', color: colors.bodyweight }]} onChange={setEquipment}/>
          <Dropdown label="Movement category" value={category} options={['all', 'Ballistic', 'Strength', 'Legs', 'Core'].map(value => ({ value, label: value === 'all' ? 'All categories' : value }))} onChange={setCategory}/>
          <TextInput selectionColor={colors.muted} cursorColor={colors.text} accessibilityLabel="Search exercises" value={query} onChangeText={setQuery} placeholder={t('searchExercise')} placeholderTextColor={colors.muted} style={styles.search} autoCorrect={false}/>
          <View style={styles.tools}><Text style={styles.help}>Favorites only</Text><AppSwitch accessibilityLabel="Favorites only" value={favoritesOnly} onValueChange={setFavoritesOnly}/></View>
          <Pressable accessibilityRole="button" onPress={() => router.push('/custom-exercise')} style={styles.custom}><Text style={styles.link}>+ {t('customExercise')}</Text></Pressable>
          <Text style={styles.help}>{data.length} exercises · {selectedIds.size} selected across all equipment</Text>
        </View>}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.name}>No matching exercises</Text><Text style={styles.help}>Try another search or equipment filter.</Text></View>}
        renderItem={({ item }) => {
          const selected = selectedIds.has(item.id);
          const tone = item.equipment === 'bodyweight' ? colors.bodyweight : colors.accent;
          const count = plan.items.filter(entry => entry.exerciseId === item.id).length;
          const favorite = favoriteExerciseIds.includes(item.id);
          return <View style={[styles.row, selected && { borderColor: tone }]}>
            <Pressable accessibilityRole="checkbox" accessibilityLabel={`${selected ? 'Remove' : 'Select'} ${item.name}${count > 1 ? `, all ${count} entries` : ''}`} accessibilityState={{ checked: selected }} onPress={() => { toggleExerciseSelection(item.id); if (settings.haptics) void Haptics.selectionAsync(); }} style={styles.checkTarget}>
              <View style={[styles.checkbox, { borderColor: tone }, selected && { backgroundColor: tone }]}><Text style={styles.checkmark}>{selected ? '✓' : ''}</Text></View>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`View ${item.name}: technique and combinations`} style={styles.details} onPress={() => router.push({ pathname: '/exercise-detail', params: { id: item.id } })}>
              <ExerciseGlyph exerciseId={item.id} visual={item.visual} size={52} equipment={item.equipment ?? 'kettlebell'}/>
              <View style={styles.copy}><Text style={styles.name}>{item.name}</Text><Text style={[styles.kind, { color: tone }]}>{item.equipment === 'bodyweight' ? 'Bodyweight' : 'Kettlebell'}</Text><Text style={styles.meta}>{categoryLabel(language, item.category)} · {difficultyLabel(language, item.difficulty ?? 'Intermediate')}</Text>{count > 1 && <Text style={styles.meta}>{count} entries · uncheck removes all</Text>}<Text style={styles.meta}>Details ›</Text></View>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`${favorite ? 'Unfavorite' : 'Favorite'} ${item.name}`} accessibilityState={{ selected: favorite }} onPress={() => toggleExerciseFavorite(item.id)} style={styles.checkTarget}><Text style={[styles.star, favorite && { color: colors.warning }]}>{favorite ? '★' : '☆'}</Text></Pressable>
          </View>;
        }}/>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}><PrimaryButton label={`Done · ${selectedIds.size} selected`} onPress={() => router.back()}/></View>
    </View>
  );
}
const createStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg }, list: { padding: 16, gap: 10 }, header: { gap: 12, marginBottom: 8 }, heading: { color: colors.text, fontSize: 24, fontWeight: '900' }, help: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  search: { minHeight: 50, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: 14, fontSize: 16 }, tools: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, custom: { minHeight: 44, justifyContent: 'center' }, link: { color: colors.text, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }, checkTarget: { width: 44, minHeight: 48, justifyContent: 'center', alignItems: 'center' }, checkbox: { width: 25, height: 25, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' }, checkmark: { color: colors.bg, fontWeight: '900', fontSize: 18 }, details: { flex: 1, minWidth: 0, flexDirection: 'row', gap: 9, alignItems: 'center', minHeight: 64 }, copy: { flex: 1, minWidth: 0 }, name: { color: colors.text, fontWeight: '800', fontSize: 15 }, kind: { fontSize: 11, marginTop: 4 }, meta: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 }, star: { color: colors.muted, fontSize: 23 }, empty: { padding: 20, gap: 10 }, footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg }
});
