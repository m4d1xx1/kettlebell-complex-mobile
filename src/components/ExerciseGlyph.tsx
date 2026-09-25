import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';
import { ExerciseVisual } from '../types';

const stroke = colors.text;
function Figure({ visual, accent }: { visual: ExerciseVisual; accent: string }) {
  if (visual === 'swing') return <><Circle cx="32" cy="11" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M32 16v15M31 21 20 31M33 21l11 10M32 31 23 50M32 31l10 19" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Path d="M17 32c1-6 11-6 13 0" stroke={accent} strokeWidth="2.8" strokeLinecap="round"/><Rect x="17" y="32" width="13" height="10" rx="3" stroke={accent} strokeWidth="2.8"/></>;
  if (visual === 'press' || visual === 'snatch') return <><Circle cx="29" cy="12" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M29 17v18M29 22 20 32M30 21l10-9M29 35l-8 16M29 35l10 16" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Path d="M39 8c0-4 9-4 9 0" stroke={accent} strokeWidth="2.8"/><Rect x="39" y="8" width="9" height="9" rx="2.5" stroke={accent} strokeWidth="2.8"/></>;
  if (visual === 'squat') return <><Circle cx="32" cy="10" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M32 15v17M32 21l-8 7M32 21l8 7M32 32 20 42l5 10M32 32l12 10-4 10" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Rect x="27" y="23" width="10" height="9" rx="2.5" stroke={accent} strokeWidth="2.8"/></>;
  if (visual === 'lunge') return <><Circle cx="31" cy="10" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M31 15v18M31 21l-8 7M31 21l8 7M31 33 18 46M31 33l15 9M18 46h-7M46 42l7 8" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Rect x="26" y="23" width="10" height="9" rx="2.5" stroke={accent} strokeWidth="2.8"/></>;
  if (visual === 'row') return <><Circle cx="22" cy="15" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M26 18 39 30M29 22 18 33M39 30 29 50M39 30l8 18" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Path d="M42 31 52 36" stroke={stroke} strokeWidth="2.4"/><Rect x="49" y="34" width="9" height="10" rx="2.5" stroke={accent} strokeWidth="2.8"/></>;
  if (visual === 'deadlift') return <><Circle cx="31" cy="12" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M30 17 36 30M36 30l-6 18M36 30l10 17M31 22 22 36M36 27 46 37" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Path d="M18 37c0-4 10-4 10 0" stroke={accent} strokeWidth="2.8"/><Rect x="18" y="37" width="10" height="9" rx="2.5" stroke={accent} strokeWidth="2.8"/></>;
  if (visual === 'halo') return <><Circle cx="32" cy="15" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M32 20v17M32 26 20 31M32 26l12 5M32 37l-8 15M32 37l8 15" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Path d="M20 13c3-9 21-9 24 0" stroke={accent} strokeWidth="2.8"/><Rect x="28" y="5" width="8" height="8" rx="2" stroke={accent} strokeWidth="2.4"/></>;
  if (visual === 'carry') return <><Circle cx="30" cy="11" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M30 16v20M30 22 20 32M30 22l10 12M30 36l-8 16M30 36l9 16" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Path d="M40 34v9" stroke={stroke} strokeWidth="2.4"/><Rect x="36" y="42" width="9" height="10" rx="2.5" stroke={accent} strokeWidth="2.8"/></>;
  if (visual === 'pushup') return <><Circle cx="14" cy="30" r="4" stroke={stroke} strokeWidth="2.4"/><Path d="M18 31 34 29 49 35M25 30l-5 10M37 30l6 10M49 35h8" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Path d="M18 39h39" stroke={colors.muted} strokeWidth="1.4" strokeLinecap="round"/></>;
  if (visual === 'plank') return <><Circle cx="14" cy="29" r="4" stroke={stroke} strokeWidth="2.4"/><Path d="M18 30 37 31 54 35M24 31l-5 10M53 35h6" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Path d="M18 41h41" stroke={colors.muted} strokeWidth="1.4" strokeLinecap="round"/></>;
  if (visual === 'burpee') return <><Circle cx="31" cy="13" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M31 18 28 32M28 24 18 36M28 24l11 10M28 32 19 47M28 32l14 14M14 48h34" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/></>;
  if (visual === 'bridge') return <><Circle cx="12" cy="40" r="4" stroke={stroke} strokeWidth="2.4"/><Path d="M16 39 27 35 39 25 50 31M27 35 22 48M50 31l6 16M21 48h37" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/></>;
  if (visual === 'high-knees') return <><Circle cx="31" cy="11" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M31 16v18M31 21 20 29M31 21l10 8M31 34 20 43M31 34l12 2 7 10M20 43l-4 9" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/></>;
  if (visual === 'windmill') return <><Circle cx="31" cy="15" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M31 20 36 34M33 23 19 36M34 23l7-12M36 34 23 50M36 34l14 14" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Path d="M39 7c0-4 9-4 9 0" stroke={accent} strokeWidth="2.8"/><Rect x="39" y="7" width="9" height="9" rx="2.5" stroke={accent} strokeWidth="2.8"/></>;
  if (visual === 'floor-press') return <><Circle cx="12" cy="41" r="4" stroke={stroke} strokeWidth="2.4"/><Path d="M16 40h24M25 40l4-15M40 40l12 8M24 40l-6 8M29 25l8-11" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Path d="M35 10c0-4 9-4 9 0" stroke={accent} strokeWidth="2.8"/><Rect x="35" y="10" width="9" height="9" rx="2.5" stroke={accent} strokeWidth="2.8"/><Path d="M8 49h48" stroke={colors.muted} strokeWidth="1.4" strokeLinecap="round"/></>;
  return <><Circle cx="31" cy="11" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M31 16v19M31 22 21 31M31 22l10 8M31 35l-8 17M31 35l9 17" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Rect x="35" y="25" width="10" height="10" rx="2.5" stroke={accent} strokeWidth="2.8"/></>;
}

function motionFor(visual: ExerciseVisual, value: Animated.Value): any {
  if (visual === 'swing') {
    return {
      transform: [
        { rotate: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-10deg', '11deg', '-10deg'] }) },
        { translateY: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [9, -10, 9] }) },
        { scale: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.96, 1.04, 0.96] }) }
      ]
    };
  }
  if (visual === 'clean') {
    return {
      transform: [
        { translateY: value.interpolate({ inputRange: [0, 0.48, 1], outputRange: [9, -9, 9] }) },
        { rotate: value.interpolate({ inputRange: [0, 0.48, 1], outputRange: ['-7deg', '5deg', '-7deg'] }) }
      ]
    };
  }
  if (visual === 'press' || visual === 'snatch') {
    return {
      transform: [
        { translateY: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [8, -13, 8] }) },
        { scale: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.98, 1.035, 0.98] }) }
      ]
    };
  }
  if (visual === 'squat') {
    return {
      transform: [
        { translateY: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-3, 14, -3] }) },
        { scaleY: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.91, 1] }) }
      ]
    };
  }
  if (visual === 'deadlift') {
    return {
      transform: [
        { translateY: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-2, 13, -2] }) },
        { rotate: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '6deg', '0deg'] }) }
      ]
    };
  }
  if (visual === 'lunge') {
    return {
      transform: [
        { translateX: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-2, 8, -2] }) },
        { translateY: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-1, 10, -1] }) }
      ]
    };
  }
  if (visual === 'row') {
    return {
      transform: [
        { translateX: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-4, 7, -4] }) },
        { translateY: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [2, -4, 2] }) }
      ]
    };
  }
  if (visual === 'halo') {
    return {
      transform: [
        { rotate: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-11deg', '11deg', '-11deg'] }) },
        { scale: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.98, 1.02, 0.98] }) }
      ]
    };
  }
  if (visual === 'pushup') {
    return {
      transform: [
        { translateY: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-4, 5, -4] }) }
      ]
    };
  }
  if (visual === 'plank') {
    return {
      transform: [
        { translateY: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -1.5, 0] }) },
        { scale: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.01, 1] }) }
      ]
    };
  }
  if (visual === 'burpee') {
    return {
      transform: [
        { translateY: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [8, -13, 8] }) },
        { scale: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.94, 1.04, 0.94] }) }
      ]
    };
  }
  if (visual === 'bridge') {
    return {
      transform: [
        { translateY: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [4, -5, 4] }) },
        { rotate: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['2deg', '-2deg', '2deg'] }) }
      ]
    };
  }
  if (visual === 'high-knees') {
    return {
      transform: [
        { translateY: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [3, -8, 3] }) },
        { rotate: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-3deg', '3deg', '-3deg'] }) }
      ]
    };
  }
  if (visual === 'windmill') {
    return {
      transform: [
        { rotate: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['5deg', '-6deg', '5deg'] }) },
        { translateX: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [4, -4, 4] }) }
      ]
    };
  }
  if (visual === 'floor-press') {
    return {
      transform: [
        { translateY: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [4, -7, 4] }) }
      ]
    };
  }
  return {
    transform: [
      { translateY: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, -3, 1] }) }
    ]
  };
}

export function ExerciseGlyph({
  visual,
  size = 62,
  animated = false,
  hero = false,
  equipment = 'kettlebell'
}: {
  visual: ExerciseVisual;
  size?: number;
  animated?: boolean;
  hero?: boolean;
  equipment?: 'kettlebell' | 'bodyweight';
}) {
  const motion = useRef(new Animated.Value(0)).current;
  const isBodyweight = equipment === 'bodyweight';
  const accent = isBodyweight ? colors.bodyweight : colors.accent;

  useEffect(() => {
    if (!animated) {
      motion.stopAnimation();
      motion.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(motion, { toValue: 1, duration: 980, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(motion, { toValue: 0, duration: 980, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animated, motion]);

  return (
    <View
      style={[
        styles.wrap,
        isBodyweight && styles.bodyweightWrap,
        hero && styles.heroWrap,
        { width: size, height: size, borderRadius: hero ? 28 : size / 2 }
      ]}
    >
      <Animated.View style={animated ? motionFor(visual, motion) : undefined}>
        <Svg width={size * (hero ? 0.96 : 0.82)} height={size * (hero ? 0.96 : 0.82)} viewBox="0 0 64 64">
          <Figure visual={visual} accent={accent}/>
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden'
  },
  bodyweightWrap: {
    backgroundColor: colors.bodyweightSoft,
    borderColor: colors.bodyweight
  },
  heroWrap: {
    backgroundColor: 'transparent',
    borderWidth: 0
  }
});
