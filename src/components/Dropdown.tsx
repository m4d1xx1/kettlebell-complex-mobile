import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

export type DropdownOption = { value: string; label: string; color?: string };
export function Dropdown({ label, value, placeholder, options, onChange }: {
  label: string; value?: string; placeholder?: string; options: DropdownOption[]; onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(option => option.value === value);
  return (
    <View>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${selected?.label ?? placeholder ?? 'Choose'}`} accessibilityState={{ expanded: open }} onPress={() => setOpen(v => !v)} style={styles.trigger}>
        <View style={styles.title}><Text style={styles.label}>{label}</Text><Text style={[styles.value, selected?.color ? { color: selected.color } : undefined]}>{selected?.label ?? placeholder ?? 'Choose'}</Text></View>
        <Text style={styles.arrow}>{open ? '▴' : '▾'}</Text>
      </Pressable>
      {open && <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={styles.menu}>
        {options.map(option => <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: option.value === value }} accessibilityLabel={option.label} onPress={() => { onChange(option.value); setOpen(false); }} style={styles.option}>
          <Text style={[styles.optionText, option.color ? { color: option.color } : undefined]}>{option.label}</Text>
          <Text style={styles.check}>{option.value === value ? '✓' : ''}</Text>
        </Pressable>)}
      </ScrollView>}
    </View>
  );
}
const styles = StyleSheet.create({
  trigger: { minHeight: 64, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.panel },
  title: { flex: 1 }, label: { color: colors.muted, fontSize: 11, marginBottom: 4 }, value: { color: colors.text, fontSize: 16, fontWeight: '800' }, arrow: { color: colors.muted, fontSize: 22 },
  menu: { maxHeight: 264, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, marginTop: 6, backgroundColor: colors.card },
  option: { minHeight: 52, flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 }, optionText: { color: colors.text, flex: 1, fontSize: 15 }, check: { color: colors.text, width: 22, fontSize: 18 }
});
