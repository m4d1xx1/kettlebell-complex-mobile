import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

export function SegmentedControl<T extends string>({ value, options, onChange }: { value: T; options: Array<{ value: T; label: string }>; onChange: (value: T) => void }) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable key={option.value} onPress={() => onChange(option.value)} style={[styles.segment, active && styles.active]}>
            <Text numberOfLines={1} style={[styles.label, active && styles.activeLabel]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', padding: 3, backgroundColor: colors.panel, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  segment: { flex: 1, minHeight: 34, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  active: { backgroundColor: colors.elevated },
  label: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  activeLabel: { color: colors.text }
});
