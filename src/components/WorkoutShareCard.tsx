import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';
import { BodyweightSummaryItem } from '../workout/steps';
import { formatDuration } from '../utils/format';
import { BrandMark } from './BrandMark';

type Props = {
  planName: string;
  completedDuration: number;
  rounds: number;
  totalReps: number;
  weightKg: number;
  volumeKg: number;
  hasKettlebell: boolean;
  bodyweightReps: number;
  bodyweightSeconds: number;
  bodyweightItems: BodyweightSummaryItem[];
};

export const WorkoutShareCard = forwardRef<View, Props>(function WorkoutShareCard({
  planName,
  completedDuration,
  rounds,
  totalReps,
  weightKg,
  volumeKg,
  hasKettlebell,
  bodyweightReps,
  bodyweightSeconds,
  bodyweightItems
}, ref) {
  const hasBodyweight = bodyweightItems.length > 0;
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <View style={styles.header}>
        <BrandMark compact/>
        <Text style={styles.date}>{date.toUpperCase()}</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>WORKOUT COMPLETE</Text>
        <Text style={styles.planName} numberOfLines={2}>{planName}</Text>
        <Text style={styles.duration}>{formatDuration(completedDuration)}</Text>
        <Text style={styles.durationLabel}>TOTAL TIME</Text>
      </View>

      <View style={styles.stats}>
        <ShareStat label="ROUNDS" value={String(rounds)}/>
        <ShareStat label="REPS" value={String(totalReps)}/>
        {hasKettlebell ? <ShareStat label="WEIGHT" value={`${weightKg} kg`}/> : null}
        {hasKettlebell ? <ShareStat label="VOLUME" value={`${Math.round(volumeKg / 100) / 10}t`}/> : null}
        {bodyweightReps > 0 ? <ShareStat label="BW REPS" value={String(bodyweightReps)} bodyweight/> : null}
        {bodyweightSeconds > 0 ? <ShareStat label="BW TIME" value={formatDuration(bodyweightSeconds)} bodyweight/> : null}
      </View>

      {hasBodyweight ? (
        <View style={styles.bodyweightBlock}>
          <Text style={styles.bodyweightTitle}>BODYWEIGHT WORK</Text>
          {bodyweightItems.slice(0, 6).map((item) => (
            <View key={item.exerciseId} style={styles.bodyweightRow}>
              <Text style={styles.bodyweightName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.bodyweightValue}>
                {item.reps > 0 ? `${item.reps} reps` : ''}
                {item.reps > 0 && item.seconds > 0 ? ' · ' : ''}
                {item.seconds > 0 ? formatDuration(item.seconds) : ''}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.statement}>
          <Text style={styles.statementStrong}>SHOW UP. DO THE WORK.</Text>
          <Text style={styles.statementMuted}>Built with MOVEWRK</Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.footerLine}/>
        <Text style={styles.footerText}>MOVEWRK</Text>
        <Text style={styles.hashtag}>#MOVEWRK</Text>
      </View>
    </View>
  );
});

function ShareStat({ label, value, bodyweight = false }: { label: string; value: string; bodyweight?: boolean }) {
  return (
    <View style={[styles.stat, bodyweight && styles.statBodyweight]}>
      <Text style={[styles.statLabel, bodyweight && styles.bodyweightAccent]}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: colors.bg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    overflow: 'hidden',
    justifyContent: 'space-between'
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  hero: { alignItems: 'center', gap: 5, marginTop: 12 },
  eyebrow: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.8 },
  planName: { color: colors.text, fontSize: 27, lineHeight: 31, fontWeight: '900', textAlign: 'center', maxWidth: '94%' },
  duration: { color: colors.text, fontSize: 64, lineHeight: 70, fontWeight: '900', marginTop: 8 },
  durationLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center' },
  stat: {
    minWidth: '30%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  statBodyweight: { backgroundColor: colors.bodyweightSoft, borderColor: colors.bodyweight },
  statLabel: { color: colors.accent, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  statValue: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: 3 },
  bodyweightAccent: { color: colors.bodyweight },
  bodyweightBlock: {
    backgroundColor: colors.bodyweightSoft,
    borderWidth: 1,
    borderColor: colors.bodyweight,
    borderRadius: 16,
    padding: 12,
    gap: 7
  },
  bodyweightTitle: { color: colors.bodyweight, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  bodyweightRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  bodyweightName: { color: colors.text, fontSize: 11, fontWeight: '800', flex: 1 },
  bodyweightValue: { color: colors.bodyweight, fontSize: 10, fontWeight: '900' },
  statement: { alignItems: 'center', gap: 4, paddingVertical: 16 },
  statementStrong: { color: colors.text, fontSize: 15, fontWeight: '900', letterSpacing: 1.2 },
  statementMuted: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  footer: { alignItems: 'center', gap: 3 },
  footerLine: { width: 44, height: 3, borderRadius: 2, backgroundColor: colors.accent, marginBottom: 4 },
  footerText: { color: colors.text, fontSize: 15, fontWeight: '900', letterSpacing: 2 },
  hashtag: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1 }
});
