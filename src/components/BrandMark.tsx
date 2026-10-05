import { StyleSheet, Text, View } from 'react-native';
import { useThemeStyles, ThemeColors } from '../theme';
import { APP_NAME } from '../brand';
import Svg, { Path } from 'react-native-svg';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const { colors, styles } = useThemeStyles(createStyles);
  const size = compact ? 34 : 46;
  return (
    <View style={styles.row}>
      <View style={[styles.mark, { width: size, height: size, borderRadius: compact ? 10 : 14 }]}>
        <Svg width={size * 0.8} height={size * 0.8} viewBox="0 0 100 100" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Path d="M5 4H54C81 4 96 22 96 49V55C96 81 80 96 55 96H42L84 29L5 76V65L49 43C60 37 59 30 45 30H5Q3 30 3 27V7Q3 4 5 4Z" fill={colors.text}/>
          <Path d="M3 86L53 60L30 96H6Q3 96 3 93Z" fill={colors.text}/>
        </Svg>
      </View>
      <Text style={[styles.wordmark, compact && styles.wordmarkCompact]}>{APP_NAME}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  mark: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  wordmark: { color: colors.text, fontSize: 22, fontWeight: '900', letterSpacing: 1.7 },
  wordmarkCompact: { fontSize: 17, letterSpacing: 1.2 }
});
