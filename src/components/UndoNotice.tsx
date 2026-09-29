import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useWorkout } from '../context/WorkoutContext';
import { colors, radius } from '../theme';
export function UndoNotice() {
  const { undoCount, undoRemoval } = useWorkout();
  if (!undoCount) return null;
  return <View style={styles.notice}><Text style={styles.text}>{undoCount} {undoCount === 1 ? 'entry' : 'entries'} removed</Text><Pressable accessibilityRole="button" onPress={undoRemoval} style={styles.button}><Text style={styles.undo}>Undo</Text></Pressable></View>;
}
const styles = StyleSheet.create({ notice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, backgroundColor: colors.panel, borderRadius: radius.md }, text: { color: colors.text, flex: 1, fontSize: 13 }, button: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' }, undo: { color: colors.accent, fontWeight: '800' } });
