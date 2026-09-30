import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { ExerciseVisual, SideMode } from '../types';
import { PoseExerciseFigure } from './PoseExerciseFigure';

export function ExerciseGlyph({ visual, exerciseId, size = 62, animated = false, hero = false, equipment = 'kettlebell', side = 'none', playback }: {
  playback?: { elapsedMs: number; secondsPerRep: number };
  visual: ExerciseVisual;
  exerciseId?: string;
  side?: SideMode | 'none';
  size?: number;
  animated?: boolean;
  hero?: boolean;
  equipment?: 'kettlebell' | 'bodyweight';
}) {
  const isBodyweight = equipment === 'bodyweight';
  const accent = isBodyweight ? colors.bodyweight : colors.accent;
  return (
    <View style={[styles.wrap, isBodyweight && styles.bodyweightWrap, hero && styles.heroWrap, { width: size, height: size, borderRadius: hero ? 28 : size / 2 }]}>
      <PoseExerciseFigure playback={playback} visual={visual} side={side} exerciseId={exerciseId} size={size * (hero ? 0.98 : 0.9)} animated={animated} accent={accent} bodyStroke={isBodyweight ? colors.bodyweight : colors.text} equipment={equipment}/>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  bodyweightWrap: { backgroundColor: colors.bodyweightSoft, borderColor: colors.bodyweight },
  heroWrap: { backgroundColor: 'transparent', borderWidth: 0 }
});
