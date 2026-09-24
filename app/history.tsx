import { router } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo } from 'react';
import { useWorkout } from '../src/context/WorkoutContext';
import { useI18n } from '../src/i18n';
import { colors, radius } from '../src/theme';
import { formatDuration } from '../src/utils/format';

function startOfLocalDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default function HistoryScreen() {
  const { history, clearHistory, loadHistoryPlan } = useWorkout();
  const { t, locale } = useI18n();

  const summary = useMemo(() => {
    const totalWorkouts = history.length;
    const totalReps = history.reduce((sum, x) => sum + x.totalReps, 0);
    const totalVolume = history.reduce((sum, x) => sum + x.volumeKg, 0);
    const totalSeconds = history.reduce((sum, x) => sum + x.durationSeconds, 0);
    const today = startOfLocalDay(new Date());
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const next = new Date(date);
      next.setDate(date.getDate() + 1);
      const entries = history.filter((x) => {
        const completed = new Date(x.completedAt).getTime();
        return completed >= date.getTime() && completed < next.getTime();
      });
      return {
        key: date.toISOString(),
        label: date.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2),
        workouts: entries.length,
        seconds: entries.reduce((sum, x) => sum + x.durationSeconds, 0)
      };
    });
    const weekWorkouts = days.reduce((sum, x) => sum + x.workouts, 0);
    const weekSeconds = days.reduce((sum, x) => sum + x.seconds, 0);
    const maxDay = Math.max(1, ...days.map((x) => x.seconds));
    return { totalWorkouts, totalReps, totalVolume, totalSeconds, weekWorkouts, weekSeconds, days, maxDay };
  }, [history, locale]);

  return (
    <View style={styles.page}>
      <FlatList
        data={history}
        keyExtractor={(x) => x.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>{t('trainingHistory')}</Text>
              <Text style={styles.headerTitle}>{t('consistency')}</Text>
            </View>

            <View style={styles.stats}>
              <Stat label={t('workouts')} value={String(summary.totalWorkouts)}/>
              <Stat label={t('totalTime')} value={formatDuration(summary.totalSeconds)}/>
              <Stat label={t('reps').toUpperCase()} value={String(summary.totalReps)}/>
              <Stat label={t('load')} value={`${Math.round(summary.totalVolume / 100) / 10}t`}/>
            </View>

            <View style={styles.weekCard}>
              <View>
                <Text style={styles.weekTitle}>{t('last7')}</Text>
                <Text style={styles.weekMeta}>{summary.weekWorkouts} {t('workouts').toLowerCase()} · {formatDuration(summary.weekSeconds)}</Text>
              </View>
              <View style={styles.chart}>
                {summary.days.map((day) => {
                  const height = day.seconds ? Math.max(12, (day.seconds / summary.maxDay) * 78) : 4;
                  return <View key={day.key} style={styles.day}><View style={styles.barTrack}><View style={[styles.bar, { height }]}/></View><Text style={styles.dayLabel}>{day.label}</Text></View>;
                })}
              </View>
            </View>

            {history.length ? (
              <Pressable
                style={styles.clear}
                onPress={() => Alert.alert(t('clearHistoryTitle'), t('cannotUndo'), [
                  { text: t('cancel'), style: 'cancel' },
                  { text: t('clear'), style: 'destructive', onPress: clearHistory }
                ])}
              >
                <Text style={styles.clearText}>{t('clearHistory')}</Text>
              </Pressable>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t('noWorkouts')}</Text>
            <Text style={styles.muted}>{t('historyHelp')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.planName}</Text>
              <Text style={styles.muted}>{new Date(item.completedAt).toLocaleString(locale)}</Text>
              <Text style={styles.small}>{item.rounds} {t('rounds').toLowerCase()} · {item.exerciseCount} {t('exercises').toLowerCase()} · {item.weightKg} kg</Text>
            </View>
            <View style={styles.metrics}>
              <Text style={styles.metric}>{formatDuration(item.durationSeconds)}</Text>
              <Text style={styles.small}>{item.totalReps} {t('reps').toLowerCase()} · {Math.round(item.volumeKg / 100) / 10}t</Text>
              {item.plan ? (
                <Pressable style={styles.repeat} onPress={() => { if (loadHistoryPlan(item.id)) router.replace('/'); }}>
                  <Text style={styles.repeatText}>{t('repeat')}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        )}
      />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  header: { gap: 14, marginBottom: 4 },
  kicker: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  headerTitle: { color: colors.text, fontSize: 27, fontWeight: '900', marginTop: 3 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: { width: '48%', flexGrow: 1, backgroundColor: colors.panel, borderRadius: radius.lg, padding: 14 },
  statLabel: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  statValue: { color: colors.text, fontSize: 23, fontWeight: '900', marginTop: 4 },
  weekCard: { backgroundColor: colors.card, borderRadius: radius.xl, padding: 16, gap: 12 },
  weekTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  weekMeta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  chart: { height: 112, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  day: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '56%', minWidth: 10, maxWidth: 26, borderRadius: 8, backgroundColor: colors.accent },
  dayLabel: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' },
  title: { color: colors.text, fontSize: 16, fontWeight: '900' },
  muted: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  metrics: { alignItems: 'flex-end', gap: 2 },
  metric: { color: colors.text, fontWeight: '900', fontSize: 17 },
  small: { color: colors.muted, fontSize: 11, marginTop: 3 },
  repeat: { marginTop: 5, minHeight: 34, paddingHorizontal: 11, borderRadius: 17, backgroundColor: colors.accentSoft, justifyContent: 'center' },
  repeatText: { color: colors.accent, fontSize: 11, fontWeight: '900' },
  clear: { minHeight: 40, alignItems: 'flex-end', justifyContent: 'center' },
  clearText: { color: colors.danger, fontWeight: '800', fontSize: 12 },
  empty: { padding: 24, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radius.lg, gap: 5 },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '900' }
});
