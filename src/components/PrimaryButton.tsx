import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius } from '../theme';

type Props = { label: string; onPress: () => void; disabled?: boolean; compact?: boolean };

export function PrimaryButton({ label, onPress, disabled, compact }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, compact && styles.compact, pressed && !disabled && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={[styles.text, compact && styles.compactText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 58, borderRadius: radius.lg, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  compact: { minHeight: 44, borderRadius: radius.md, paddingHorizontal: 14 },
  text: { color: colors.accentText, fontSize: 17, fontWeight: '900' },
  compactText: { fontSize: 14 },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.35 }
});
