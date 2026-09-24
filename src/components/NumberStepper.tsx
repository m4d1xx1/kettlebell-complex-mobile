import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius } from '../theme';
import { clamp } from '../utils/format';

export function NumberStepper({ label, value, min, max, step = 1, suffix, onChange, haptics = true }: { label: string; value: number; min: number; max: number; step?: number; suffix?: string; onChange: (value: number) => void; haptics?: boolean }) {
  const adjust = (delta: number) => {
    if (haptics) Haptics.selectionAsync();
    onChange(clamp(value + delta, min, max));
  };
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable accessibilityLabel={`Decrease ${label}`} onPress={() => adjust(-step)} style={styles.button}><Text style={styles.buttonText}>−</Text></Pressable>
        <View style={styles.valueWrap}><Text style={styles.value}>{value}</Text>{suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}</View>
        <Pressable accessibilityLabel={`Increase ${label}`} onPress={() => adjust(step)} style={styles.button}><Text style={styles.buttonText}>+</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 150, backgroundColor: colors.panel, padding: 14, borderRadius: radius.lg },
  label: { color: colors.muted, fontSize: 12, fontWeight: '800', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  button: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: colors.text, fontSize: 23, lineHeight: 25, fontWeight: '700' },
  valueWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  value: { color: colors.text, fontSize: 24, fontWeight: '900' },
  suffix: { color: colors.muted, fontSize: 12, fontWeight: '700' }
});
