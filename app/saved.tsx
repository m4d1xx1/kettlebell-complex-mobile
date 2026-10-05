import { router } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useWorkout } from '../src/context/WorkoutContext';
import { useI18n } from '../src/i18n';
import { useThemeStyles, ThemeColors, radius } from '../src/theme';

export default function SavedScreen() {
  const { colors, styles } = useThemeStyles(createStyles);
  const { saved, plan, exercises, loadSaved, deleteSaved, toggleSavedFavorite } = useWorkout();
  const { t, locale } = useI18n();
  const data = [...saved].sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)) || b.savedAt.localeCompare(a.savedAt));

  return (
    <View style={styles.page}>
      {!data.length ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{t('noTemplates')}</Text>
          <Text style={styles.muted}>{t('templateHelp')}</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(x) => x.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.kicker}>{t('myTemplates')}</Text>
              <Text style={styles.headerTitle}>{t('repeatWorks')}</Text>
              <Text style={styles.muted}>{t('pinHelp')}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, item.favorite && styles.favoriteCard]}>
              <Pressable accessibilityRole="button" accessibilityLabel={`Load ${item.name}`} style={styles.cardMain} onPress={() => {
                const apply = () => { loadSaved(item.id); router.replace('/'); };
                if (plan.items.length) Alert.alert('Replace current plan?', `Load ${item.name}? Your current unsaved builder plan will be replaced. Saved workouts will be kept.`, [{text:'Cancel',style:'cancel'},{text:'Replace',onPress:apply}]);
                else apply();
              }}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{item.name}</Text>
                  {item.favorite ? <Text style={styles.pinned}>{t('pinned')}</Text> : null}
                </View>
                <Text style={styles.muted}>{item.items.length} {t('exercises').toLowerCase()} · {item.rounds} {t('rounds').toLowerCase()} · {item.items.some(entry => exercises.find(exercise => exercise.id === entry.exerciseId)?.equipment !== 'bodyweight') ? `${item.weightKg} kg` : 'Bodyweight'}</Text>
                <Text style={styles.date}>{new Date(item.savedAt).toLocaleDateString(locale)}</Text>
              </Pressable>
              <View style={styles.actions}>
                <Pressable accessibilityRole="button" accessibilityLabel={`${item.favorite ? 'Unpin' : 'Pin'} ${item.name}`} accessibilityState={{selected:!!item.favorite}} onPress={() => toggleSavedFavorite(item.id)} style={styles.iconButton}><Text style={[styles.star, item.favorite && { color: colors.warning }]}>{item.favorite ? '★' : '☆'}</Text></Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${item.name}`} onPress={() => Alert.alert('Delete saved workout?', `Delete ${item.name}? Completed workout history will be kept.`, [{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>{void deleteSaved(item.id);}}])} style={styles.delete}><Text style={styles.deleteText}>{t('delete')}</Text></Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  header: { gap: 4, marginBottom: 10 },
  kicker: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  headerTitle: { color: colors.text, fontSize: 26, fontWeight: '900' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  favoriteCard: { borderColor: colors.accentSoft },
  cardMain: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  title: { color: colors.text, fontSize: 17, fontWeight: '900' },
  pinned: { color: colors.accent, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  date: { color: colors.muted, fontSize: 11, marginTop: 2 },
  actions: { alignItems: 'center', gap: 4 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  star: { color: colors.muted, fontSize: 22 },
  delete: { minHeight: 44, minWidth: 44, paddingHorizontal: 8, justifyContent: 'center' },
  deleteText: { color: colors.danger, fontWeight: '800', fontSize: 11 },
  empty: { margin: 16, padding: 24, borderRadius: radius.lg, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, gap: 5 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '900' }
});
