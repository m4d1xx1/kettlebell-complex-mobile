import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, RadialGradient, Path, Stop } from 'react-native-svg';
import { ExerciseVisual, SideMode } from '../types';
import { repPlayback } from '../workout/repTiming';
import { getMotion, Muscle, Point, samplePose } from '../animation/exercisePoses';
import { useThemeColors } from '../theme';

const mix = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
// Rounded, tapered segments maintain a recognizable silhouette at small sizes.
function segment(a: Point, b: Point, startWidth: number, endWidth = startWidth): string {
  const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const nx = -(b.y - a.y) / length, ny = (b.x - a.x) / length;
  const ax = nx * startWidth / 2, ay = ny * startWidth / 2;
  const bx = nx * endWidth / 2, by = ny * endWidth / 2;
  return `M${a.x + ax} ${a.y + ay}L${b.x + bx} ${b.y + by}Q${b.x + (b.x - a.x) / length * endWidth / 2} ${b.y + (b.y - a.y) / length * endWidth / 2} ${b.x - bx} ${b.y - by}L${a.x - ax} ${a.y - ay}Q${a.x - (b.x - a.x) / length * startWidth / 2} ${a.y - (b.y - a.y) / length * startWidth / 2} ${a.x + ax} ${a.y + ay}Z`;
}
// A narrow rim keeps the filled form readable without turning joints into dots.
function Limb({ a, b, startWidth, endWidth, fill, detailed }: {
  a: Point; b: Point; startWidth: number; endWidth: number; fill: string; detailed: boolean;
}) {
  return <G>
    <Path d={segment(a, b, startWidth, endWidth)} fill={fill}/>
    {detailed && <Path d={segment(mix(a, b, 0.14), mix(a, b, 0.85), startWidth * 0.21, endWidth * 0.16)} fill="#FFFFFF" opacity={0.13}/>}
  </G>;
}
function Foot({ at, fill }: { at: Point; fill: string }) {
  return <Path d={`M${at.x - 2.3} ${at.y - 1.5}Q${at.x} ${at.y - 2.8} ${at.x + 2.3} ${at.y - 0.9}L${at.x + 4.2} ${at.y}Q${at.x + 5.1} ${at.y + 1.9} ${at.x + 2} ${at.y + 1.9}H${at.x - 2.3}Z`} fill={fill}/>;
}
function MusclePatch({ a, b, width = 3, opacity = 1, side = 0 }: { a: Point; b: Point; width?: number; opacity?: number; side?: number }) {
  const colors = useThemeColors();
  const length = Math.hypot(b.x-a.x,b.y-a.y) || 1;
  const shift = (p: Point) => ({x:p.x-(b.y-a.y)/length*side,y:p.y+(b.x-a.x)/length*side});
  return <Path d={segment(shift(mix(a, b, 0.22)), shift(mix(a, b, 0.74)), width, width * 0.65)} fill={colors.muscle} opacity={opacity}/>;
}

export function PoseExerciseFigure({ visual, exerciseId, size, animated, accent, bodyStroke, equipment = 'kettlebell', side = 'none', playback }: {
  playback?: { elapsedMs: number; secondsPerRep: number };
  side?: SideMode | 'none'; visual: ExerciseVisual; exerciseId?: string; size: number; animated: boolean; accent: string; bodyStroke: string; equipment?: 'kettlebell' | 'bodyweight';
}) {
  const colors = useThemeColors();
  const muscleFill = colors.muscle;
  const progressRef = useRef(0);
  const cycles = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [progress, setProgress] = useState(0);
  const motion = useMemo(() => getMotion(exerciseId, visual, equipment), [exerciseId, visual, equipment]);
  const id = `figure${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const gradientId = `${id}bell`;
  const bodyGradient = `${id}body`;
  const stageGradient = `${id}stage`;
  const shadowGradient = `${id}shadow`;
  const detailed = size >= 110;
  const bodyFill = detailed ? `url(#${bodyGradient})` : bodyStroke;
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (alive) setReducedMotion(value); }).catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { alive = false; sub.remove(); };
  }, []);
  useEffect(() => { progressRef.current = 0; cycles.current = 0; setProgress(0); }, [motion, side]);
  useEffect(() => {
    if (playback || !animated || motion.hold || reducedMotion) return;
    const origin = performance.now() - progressRef.current * motion.duration;
    let frame = 0, lastDraw = 0, lastCycle = 0;
    const draw = () => {
      const now = performance.now();
      // Large active figures draw on each display frame; small previews stay cheaper.
      if (now - lastDraw >= (detailed ? 1000 / 60 - 1 : 1000 / 30 - 1)) {
        const position = (now - origin) / motion.duration;
        const cycle = Math.floor(position);
        cycles.current += cycle - lastCycle; lastCycle = cycle;
        progressRef.current = position % 1;
        setProgress(progressRef.current); lastDraw = now;
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [animated, motion, side, reducedMotion, detailed, !!playback]);
  const synced = playback ? repPlayback(exerciseId, playback.elapsedMs, playback.secondsPerRep) : undefined;
  const p = samplePose(motion, reducedMotion || motion.hold ? 0 : synced?.progress ?? progress);
  const cycleIndex = synced?.cycle ?? cycles.current;
  const has = (...names: Muscle[]) => names.some(name => motion.muscles.includes(name));
  const torsoLength = Math.hypot(p.hip.x - p.shoulder.x, p.hip.y - p.shoulder.y) || 1;
  const normal = { x: -(p.hip.y - p.shoulder.y) / torsoLength, y: (p.hip.x - p.shoulder.x) / torsoLength };
  const offset = (point: Point, amount: number): Point => ({ x: point.x + normal.x * amount, y: point.y + normal.y * amount });
  const isFloor = p.head.y > 45 && p.hip.x > p.shoulder.x + 12;
  const feetHeight = Math.max(p.leftFoot.y, p.rightFoot.y);
  const elevation = Math.max(0, 90 - feetHeight);
  const shadowWidth = (isFloor ? 34 : 23) - Math.min(8, elevation * 0.5);
  const bellFront = Math.max(0, Math.min(1, (p.bellDepth + 0.3) / 0.6));
  const bell = equipment !== 'bodyweight' && motion.equipment !== 'bodyweight' ? (
    <G transform={`translate(${p.rightHand.x} ${p.rightHand.y}) rotate(${p.bellAngle})`}>
      <Path d="M-3.6 5C-7.5-5.6 7.5-5.6 3.6 5" stroke={colors.bellShade} strokeWidth={3} fill="none"/>
      <Path d="M-3.6 5C-7.5-5.6 7.5-5.6 3.6 5" stroke={accent} strokeWidth={1.7} fill="none"/>
      <Path d="M-4.6 4.8C-7.8 8.2-6.4 12.8-3.5 13.8Q0 15 3.5 13.8C6.4 12.8 7.8 8.2 4.6 4.8Q0 3.3-4.6 4.8Z" fill={`url(#${gradientId})`} stroke={accent} strokeWidth={0.45}/>
      <Path d="M-3.7 6.3Q-5.2 8.1-3.9 10.5" stroke={colors.highlight} strokeOpacity={0.65} strokeWidth={0.9} strokeLinecap="round" fill="none"/>
      <Path d="M-2.8 13H2.8" stroke={colors.bellShade} strokeOpacity={0.5} strokeWidth={0.7} strokeLinecap="round"/>
    </G>
  ) : null;
  return (
    <Svg width={size} height={size} viewBox="-2 -2 104 104">
      <Defs>
        <LinearGradient id={gradientId} x1="0%" y1="0%" x2="95%" y2="100%">
          <Stop offset="0%" stopColor={colors.figureShade}/><Stop offset="38%" stopColor={accent}/><Stop offset="100%" stopColor={colors.bellShade}/>
        </LinearGradient>
        <LinearGradient id={bodyGradient} x1="15%" y1="0%" x2="85%" y2="100%">
          <Stop offset="0%" stopColor={bodyStroke}/>
          <Stop offset="45%" stopColor={bodyStroke}/>
          <Stop offset="100%" stopColor={colors.figureShade}/>
        </LinearGradient>
        <RadialGradient id={stageGradient} cx="50%" cy="45%" rx="50%" ry="50%">
          <Stop offset="0%" stopColor={accent} stopOpacity={0.09}/><Stop offset="100%" stopColor={accent} stopOpacity={0}/>
        </RadialGradient>
        <RadialGradient id={shadowGradient} cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0%" stopColor={accent} stopOpacity={0.22}/><Stop offset="100%" stopColor={accent} stopOpacity={0}/>
        </RadialGradient>
      </Defs>
      {detailed && <Ellipse cx={50} cy={56} rx={45} ry={42} fill={`url(#${stageGradient})`}/>}
      <G transform={side === 'left' || (side === 'alternate' && !synced?.paired && cycleIndex % 2 === 1) ? 'translate(100 0) scale(-1 1)' : undefined}>
      <Ellipse cx={50} cy={93.4} rx={shadowWidth + 9} ry={3.5} fill={`url(#${shadowGradient})`} opacity={1 - Math.min(0.5, elevation / 20)}/>
      <Ellipse cx={50} cy={93.2} rx={shadowWidth} ry={1} fill={colors.text} opacity={0.2}/>
      <Path d="M14 93.5H86" stroke={bodyStroke} strokeOpacity={0.07} strokeWidth={0.4}/>
      {bellFront < 1 && <G opacity={(1 - bellFront) * 0.6}>{bell}</G>}
      {/* Far-side limbs: lower opacity communicates depth, never muscle effort. */}
      <G opacity={0.46}>
        <Limb a={p.hip} b={p.leftKnee} startWidth={8} endWidth={5} fill={bodyFill} detailed={detailed}/>
        <Limb a={p.leftKnee} b={p.leftFoot} startWidth={5} endWidth={3} fill={bodyFill} detailed={detailed}/>
        <Limb a={p.shoulder} b={p.leftElbow} startWidth={5.5} endWidth={3.8} fill={bodyFill} detailed={detailed}/>
        <Limb a={p.leftElbow} b={p.leftHand} startWidth={3.8} endWidth={2.5} fill={bodyFill} detailed={detailed}/>
        {has('Quads') && <MusclePatch a={p.hip} b={p.leftKnee} width={2.6} side={1.8}/>}
        {has('Hamstrings') && <MusclePatch a={p.hip} b={p.leftKnee} width={2.6} side={-1.8}/>}
        {has('Hip flexors') && <MusclePatch a={p.hip} b={mix(p.hip,p.leftKnee,0.4)} width={2.8} side={1.5}/>}
        {has('Calves') && <MusclePatch a={p.leftKnee} b={p.leftFoot} width={3.5}/>}
        {has('Biceps') && <MusclePatch a={p.shoulder} b={p.leftElbow} width={2} side={1.25}/>}
        {has('Triceps') && <MusclePatch a={p.shoulder} b={p.leftElbow} width={2} side={-1.25}/>}
        {has('Forearms') && <MusclePatch a={p.leftElbow} b={p.leftHand} width={2.6}/>}
        <Foot at={p.leftFoot} fill={bodyFill}/>
      </G>
      <Path d={segment(p.head, p.shoulder, 3.2, 4.6)} fill={bodyFill}/>
      <Path d={segment(p.shoulder, p.hip, 12, 8)} fill={bodyFill}/>
      {detailed && <Path d={segment(offset(mix(p.shoulder, p.hip, 0.08), -3), offset(mix(p.shoulder, p.hip, 0.8), -2), 1.1, 0.6)} fill="#FFFFFF" opacity={0.24}/>}
      {has('Core') && <MusclePatch a={p.shoulder} b={p.hip} width={5.5}/>}
      {has('Obliques') && <MusclePatch a={offset(mix(p.shoulder, p.hip, 0.3), 3)} b={offset(p.hip, 2.5)} width={3.4}/>}
      {has('Chest') && <Path d={segment(offset(mix(p.shoulder,p.hip,0.15),-3),offset(mix(p.shoulder,p.hip,0.36),-3),3.2)} fill={muscleFill}/>}
      {has('Upper back') && <Path d={segment(offset(mix(p.shoulder,p.hip,0.12),3),offset(mix(p.shoulder,p.hip,0.34),3),3.2)} fill={muscleFill}/>}
      {has('Lats') && <Path d={segment(offset(mix(p.shoulder,p.hip,0.35),3),offset(mix(p.shoulder,p.hip,0.65),2.4),3)} fill={muscleFill}/>}
      <Limb a={p.hip} b={p.rightKnee} startWidth={8.5} endWidth={5} fill={bodyFill} detailed={detailed}/>
      <Limb a={p.rightKnee} b={p.rightFoot} startWidth={5} endWidth={3} fill={bodyFill} detailed={detailed}/>
      {has('Quads') && <MusclePatch a={p.hip} b={p.rightKnee} width={2.6} side={1.8}/>}
        {has('Hamstrings') && <MusclePatch a={p.hip} b={p.rightKnee} width={2.6} side={-1.8}/>}
        {has('Hip flexors') && <MusclePatch a={p.hip} b={mix(p.hip,p.rightKnee,0.4)} width={2.8} side={1.5}/>}
      {has('Calves') && <MusclePatch a={p.rightKnee} b={p.rightFoot} width={3.5}/>}
      <Ellipse cx={p.hip.x} cy={p.hip.y} rx={4.4} ry={3.6} fill={has('Glutes') ? muscleFill : bodyFill}/>
      <Limb a={p.shoulder} b={p.rightElbow} startWidth={5.5} endWidth={3.8} fill={bodyFill} detailed={detailed}/>
      <Limb a={p.rightElbow} b={p.rightHand} startWidth={3.8} endWidth={2.5} fill={bodyFill} detailed={detailed}/>
      {has('Biceps') && <MusclePatch a={p.shoulder} b={p.rightElbow} width={2} side={1.25}/>}
        {has('Triceps') && <MusclePatch a={p.shoulder} b={p.rightElbow} width={2} side={-1.25}/>}
      {has('Forearms') && <MusclePatch a={p.rightElbow} b={p.rightHand} width={2.6}/>}
      {has('Shoulders') && <Circle cx={p.shoulder.x} cy={p.shoulder.y} r={3.5} fill={muscleFill}/>}
      <Foot at={p.rightFoot} fill={bodyFill}/>
      <Circle cx={p.head.x} cy={p.head.y} r={5.8} fill={bodyFill}/>
      {detailed && <Path d={`M${p.head.x - 3.6} ${p.head.y - 1.7}Q${p.head.x - 3.2} ${p.head.y - 4} ${p.head.x - 0.5} ${p.head.y - 4.3}`} stroke="#FFFFFF" strokeOpacity={0.32} strokeWidth={0.8} strokeLinecap="round" fill="none"/>}
      <Path d={`M${p.head.x + 2.8} ${p.head.y - 1.9}v2.5`} stroke={colors.muscle} strokeOpacity={0.28} strokeWidth={1} strokeLinecap="round"/>
      {bellFront > 0 && <G opacity={bellFront}>{bell}</G>}
      <Circle cx={p.rightHand.x} cy={p.rightHand.y} r={1.6} fill={bodyStroke}/>
      </G>
    </Svg>
  );
}
