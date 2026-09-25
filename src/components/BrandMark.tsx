import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const size = compact ? 34 : 46;
  return (
    <View style={styles.row}>
      <View style={[styles.mark, { width: size, height: size, borderRadius: compact ? 10 : 14 }]}>
        <View style={[styles.bar, styles.leftBar, { height: size * 0.62 }]}/>
        <View style={[styles.bar, styles.rightBar, { height: size * 0.62 }]}/>
      </View>
      <Text style={[styles.wordmark, compact && styles.wordmarkCompact]}>MOVEWRK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  bar: { position: 'absolute', width: 8, borderRadius: 5 },
  leftBar: { backgroundColor: colors.accent, transform: [{ rotate: '-28deg' }], left: '31%' },
  rightBar: { backgroundColor: colors.bodyweight, transform: [{ rotate: '28deg' }], right: '31%' },
  wordmark: { color: colors.text, fontSize: 22, fontWeight: '900', letterSpacing: 2.1 },
  wordmarkCompact: { fontSize: 17, letterSpacing: 1.7 }
});
