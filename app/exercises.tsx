import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ExerciseGlyph } from '../src/components/ExerciseGlyph';
import { useWorkout } from '../src/context/WorkoutContext';
import { categoryLabel, difficultyLabel, useI18n } from '../src/i18n';
import { ExerciseCategory } from '../src/types';
import { colors, radius } from '../src/theme';

type Filter = 'Favorites' | 'All' | ExerciseCategory;
const filters: Filter[] = ['Favorites', 'All', 'Ballistic', 'Strength', 'Legs', 'Core'];

export default function ExercisesScreen() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const { addExercise, exercises, favoriteExerciseIds, toggleExerciseFavorite, settings } = useWorkout();
  const { t, language } = useI18n();

  const data = useMemo(() => {
    const favoriteSet = new Set(favoriteExerciseIds);
    return exercises
      .filter((x) => {
        const categoryMatch = filter === 'All' || (filter === 'Favorites' ? favoriteSet.has(x.id) : x.category === filter);
        const queryMatch = !query.trim() || x.name.toLowerCase().includes(query.trim().toLowerCase());
        return categoryMatch && queryMatch;
      })
      .sort((a, b) => Number(favoriteSet.has(b.id)) - Number(favoriteSet.has(a.id)) || a.name.localeCompare(b.name));
  }, [query, filter, exercises, favoriteExerciseIds]);

  const filterLabel = (item: Filter) => {
    if (item === 'Favorites') return t('favorites');
    if (item === 'All') return t('all');
    return categoryLabel(language, item);
  };

  return (
    <View style={styles.page}>
      <View style={styles.topRow}>
        <TextInput value={query} onChangeText={setQuery} placeholder={t('searchExercise')} placeholderTextColor={colors.muted} style={styles.search} autoCorrect={false}/>
        <Pressable onPress={() => router.push('/custom-exercise')} style={styles.custom}><Text style={styles.customText}>+ {t('customExercise')}</Text></Pressable>
      </View>

      <FlatList
        horizontal
        data={filters}
        keyExtractor={(x) => x}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filterList}
        renderItem={({ item }) => (
          <Pressable onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}>
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{filterLabel(item)}</Text>
          </Pressable>
        )}
      />

      <FlatList
        data={data}
        keyExtractor={(x) => x.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{filter === 'Favorites' ? t('noFavorites') : t('noExercises')}</Text>
            <Text style={styles.meta}>{t('favoriteHelp')}</Text>
          </View>
        }
        ListFooterComponent={<Pressable onPress={() => router.back()} style={styles.done}><Text style={styles.doneText}>{t('doneAdding')}</Text></Pressable>}
        renderItem={({ item }) => {
          const favorite = favoriteExerciseIds.includes(item.id);
          return (
            <View style={styles.row}>
              <Pressable onPress={() => router.push({ pathname: '/exercise-detail', params: { id: item.id } })}>
                <ExerciseGlyph visual={item.visual} size={76}/>
              </Pressable>
              <Pressable style={styles.center} onPress={() => router.push({ pathname: '/exercise-detail', params: { id: item.id } })}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.name}</Text>
                  {item.custom ? <Text style={styles.customBadge}>{t('customBadge')}</Text> : null}
                </View>
                <Text style={styles.meta}>
                  {categoryLabel(language, item.category)} · {difficultyLabel(language, item.difficulty ?? 'Intermediate')}
                  {item.unilateral ? ' · L/R' : ''} · {item.defaultMode === 'reps' ? `${item.defaultValue} ${t('reps').toLowerCase()}` : `${item.defaultValue} ${t('sec')}`}
                </Text>
              </Pressable>
              <View style={styles.actions}>
                <Pressable accessibilityLabel={item.name} onPress={() => toggleExerciseFavorite(item.id)} style={styles.star}>
                  <Text style={[styles.starText, favorite && { color: colors.warning }]}>{favorite ? '★' : '☆'}</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel={item.name}
                  onPress={() => {
                    addExercise(item.id);
                    setLastAdded(item.id);
                    if (settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[styles.add, lastAdded === item.id && styles.added]}
                >
                  <Text style={styles.addText}>{lastAdded === item.id ? '✓' : '+'}</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg, paddingTop: 10 },
  topRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  search: { flex: 1, minHeight: 50, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: 16, fontSize: 16 },
  custom: { minHeight: 50, borderRadius: radius.md, paddingHorizontal: 12, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, justifyContent: 'center' },
  customText: { color: colors.text, fontWeight: '800', fontSize: 12 },
  filterList: { flexGrow: 0, marginTop: 12 },
  filters: { paddingHorizontal: 16, gap: 8 },
  filter: { minHeight: 40, borderRadius: 20, paddingHorizontal: 14, justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText: { color: colors.text, fontWeight: '800' },
  filterTextActive: { color: colors.accentText },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  row: { minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, borderRadius: radius.lg, backgroundColor: colors.card },
  center: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', gap: 7, alignItems: 'center', flexWrap: 'wrap' },
  name: { color: colors.text, fontWeight: '900', fontSize: 16 },
  customBadge: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  meta: { color: colors.muted, marginTop: 4, fontSize: 11, lineHeight: 17 },
  actions: { alignItems: 'center', gap: 5 },
  star: { width: 40, height: 32, alignItems: 'center', justifyContent: 'center' },
  starText: { color: colors.muted, fontSize: 22 },
  add: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  added: { backgroundColor: colors.accentSoft },
  addText: { color: colors.accentText, fontSize: 26, fontWeight: '800' },
  done: { minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginTop: 8 },
  doneText: { color: colors.text, fontWeight: '800' },
  empty: { padding: 22, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radius.lg },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '900' }
});
