import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';
import { ExerciseVisual } from '../types';

const stroke = colors.text;
const bell = colors.accent;

function Figure({ visual }: { visual: ExerciseVisual }) {
  if (visual === 'swing') return <><Circle cx="32" cy="11" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M32 16v15M31 21 20 31M33 21l11 10M32 31 23 50M32 31l10 19" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Path d="M17 32c1-6 11-6 13 0" stroke={bell} strokeWidth="2.8" strokeLinecap="round"/><Rect x="17" y="32" width="13" height="10" rx="3" stroke={bell} strokeWidth="2.8"/></>;
  if (visual === 'press' || visual === 'snatch') return <><Circle cx="29" cy="12" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M29 17v18M29 22 20 32M30 21l10-9M29 35l-8 16M29 35l10 16" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Path d="M39 8c0-4 9-4 9 0" stroke={bell} strokeWidth="2.8"/><Rect x="39" y="8" width="9" height="9" rx="2.5" stroke={bell} strokeWidth="2.8"/></>;
  if (visual === 'squat') return <><Circle cx="32" cy="10" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M32 15v17M32 21l-8 7M32 21l8 7M32 32 20 42l5 10M32 32l12 10-4 10" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Rect x="27" y="23" width="10" height="9" rx="2.5" stroke={bell} strokeWidth="2.8"/></>;
  if (visual === 'lunge') return <><Circle cx="31" cy="10" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M31 15v18M31 21l-8 7M31 21l8 7M31 33 18 46M31 33l15 9M18 46h-7M46 42l7 8" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Rect x="26" y="23" width="10" height="9" rx="2.5" stroke={bell} strokeWidth="2.8"/></>;
  if (visual === 'row') return <><Circle cx="22" cy="15" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M26 18 39 30M29 22 18 33M39 30 29 50M39 30l8 18" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Path d="M42 31 52 36" stroke={stroke} strokeWidth="2.4"/><Rect x="49" y="34" width="9" height="10" rx="2.5" stroke={bell} strokeWidth="2.8"/></>;
  if (visual === 'deadlift') return <><Circle cx="31" cy="12" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M30 17 36 30M36 30l-6 18M36 30l10 17M31 22 22 36M36 27 46 37" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Path d="M18 37c0-4 10-4 10 0" stroke={bell} strokeWidth="2.8"/><Rect x="18" y="37" width="10" height="9" rx="2.5" stroke={bell} strokeWidth="2.8"/></>;
  if (visual === 'halo') return <><Circle cx="32" cy="15" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M32 20v17M32 26 20 31M32 26l12 5M32 37l-8 15M32 37l8 15" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Path d="M20 13c3-9 21-9 24 0" stroke={bell} strokeWidth="2.8"/><Rect x="28" y="5" width="8" height="8" rx="2" stroke={bell} strokeWidth="2.4"/></>;
  if (visual === 'carry') return <><Circle cx="30" cy="11" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M30 16v20M30 22 20 32M30 22l10 12M30 36l-8 16M30 36l9 16" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Path d="M40 34v9" stroke={stroke} strokeWidth="2.4"/><Rect x="36" y="42" width="9" height="10" rx="2.5" stroke={bell} strokeWidth="2.8"/></>;
  return <><Circle cx="31" cy="11" r="5" stroke={stroke} strokeWidth="2.4"/><Path d="M31 16v19M31 22 21 31M31 22l10 8M31 35l-8 17M31 35l9 17" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"/><Rect x="35" y="25" width="10" height="10" rx="2.5" stroke={bell} strokeWidth="2.8"/></>;
}

function motionFor(visual: ExerciseVisual, value: Animated.Value): any {
  if (visual === 'swing' || visual === 'clean') {
    return {
      transform: [
        { rotate: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-3deg', '5deg', '-3deg'] }) },
        { translateY: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [2, -2, 2] }) }
      ]
    };
  }
  if (visual === 'press' || visual === 'snatch') {
    return { transform: [{ translateY: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [4, -5, 4] }) }] };
  }
  if (visual === 'squat' || visual === 'deadlift' || visual === 'lunge') {
    return {
      transform: [
        { translateY: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-2, 5, -2] }) },
        { scale: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.97, 1] }) }
      ]
    };
  }
  if (visual === 'halo') {
    return { transform: [{ rotate: value.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] }) }] };
  }
  if (visual === 'row') {
    return { transform: [{ translateX: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-2, 3, -2] }) }] };
  }
  return { transform: [{ translateY: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -2, 0] }) }] };
}

export function ExerciseGlyph({ visual, size = 62, animated = false }: { visual: ExerciseVisual; size?: number; animated?: boolean }) {
  const motion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) {
      motion.stopAnimation();
      motion.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(motion, { toValue: 1, duration: 780, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(motion, { toValue: 0, duration: 780, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animated, motion]);

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Animated.View style={animated ? motionFor(visual, motion) : undefined}>
        <Svg width={size * 0.82} height={size * 0.82} viewBox="0 0 64 64">
          <Figure visual={visual}/>
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
  }
});
