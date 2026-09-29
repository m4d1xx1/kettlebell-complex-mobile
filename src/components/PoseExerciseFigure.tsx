import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { ExerciseVisual, SideMode } from '../types';
import { getMotion, Muscle, Point, samplePose } from '../animation/exercisePoses';

const red = '#E96B73';
const mix = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
// Rounded, tapered segments maintain a recognizable silhouette at small sizes.
function segment(a: Point, b: Point, startWidth: number, endWidth = startWidth): string {
  const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const nx = -(b.y - a.y) / length, ny = (b.x - a.x) / length;
  const ax = nx * startWidth / 2, ay = ny * startWidth / 2;
  const bx = nx * endWidth / 2, by = ny * endWidth / 2;
  return `M${a.x + ax} ${a.y + ay}L${b.x + bx} ${b.y + by}Q${b.x + (b.x - a.x) / length * endWidth / 2} ${b.y + (b.y - a.y) / length * endWidth / 2} ${b.x - bx} ${b.y - by}L${a.x - ax} ${a.y - ay}Q${a.x - (b.x - a.x) / length * startWidth / 2} ${a.y - (b.y - a.y) / length * startWidth / 2} ${a.x + ax} ${a.y + ay}Z`;
}
function MusclePatch({ a, b, width = 3, opacity = 1, side = 0 }: { a: Point; b: Point; width?: number; opacity?: number; side?: number }) {
  const length = Math.hypot(b.x-a.x,b.y-a.y) || 1;
  const shift = (p: Point) => ({x:p.x-(b.y-a.y)/length*side,y:p.y+(b.x-a.x)/length*side});
  return <Path d={segment(shift(mix(a, b, 0.22)), shift(mix(a, b, 0.74)), width, width * 0.65)} fill={red} opacity={opacity}/>;
}

export function PoseExerciseFigure({ visual, exerciseId, size, animated, accent, bodyStroke, equipment = 'kettlebell', side = 'none' }: {
  side?: SideMode | 'none'; visual: ExerciseVisual; exerciseId?: string; size: number; animated: boolean; accent: string; bodyStroke: string; equipment?: 'kettlebell' | 'bodyweight';
}) {
  const progressRef = useRef(0);
  const cycles = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [progress, setProgress] = useState(0);
  const motion = useMemo(() => getMotion(exerciseId, visual, equipment), [exerciseId, visual, equipment]);
  const gradientId = `bell${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (alive) setReducedMotion(value); }).catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { alive = false; sub.remove(); };
  }, []);
  useEffect(() => { progressRef.current = 0; cycles.current = 0; setProgress(0); }, [motion, side]);
  useEffect(() => {
    if (!animated || motion.hold || reducedMotion) return;
    const origin = performance.now() - progressRef.current * motion.duration;
    let frame = 0, lastDraw = 0, lastCycle = 0;
    const draw = () => {
      const now = performance.now();
      if (now - lastDraw >= 32) {
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
  }, [animated, motion, side, reducedMotion]);
  const p = samplePose(motion, progress);
  const has = (...names: Muscle[]) => names.some(name => motion.muscles.includes(name));
  const torsoLength = Math.hypot(p.hip.x - p.shoulder.x, p.hip.y - p.shoulder.y) || 1;
  const normal = { x: -(p.hip.y - p.shoulder.y) / torsoLength, y: (p.hip.x - p.shoulder.x) / torsoLength };
  const offset = (point: Point, amount: number): Point => ({ x: point.x + normal.x * amount, y: point.y + normal.y * amount });
  const isFloor = p.head.y > 45 && p.hip.x > p.shoulder.x + 12;
  const bell = equipment !== 'bodyweight' && motion.equipment !== 'bodyweight' ? (
    <G transform={`translate(${p.rightHand.x} ${p.rightHand.y}) rotate(${p.bellAngle})`}>
      <Path d="M-3.5 4C-7-5 7-5 3.5 4" stroke={accent} strokeWidth="2.1" fill="none"/>
      <Rect x={-5} y={3} width={10} height={10} rx={3.4} fill={`url(#${gradientId})`} stroke={accent} strokeWidth={0.65}/>
      <Path d="M-2.8 6v3" stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={0.9} strokeLinecap="round"/>
    </G>
  ) : null;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs><LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%"><Stop offset="0%" stopColor={accent}/><Stop offset="100%" stopColor="#5F8219"/></LinearGradient></Defs>
      <G transform={side === 'left' || (side === 'alternate' && cycles.current % 2 === 1) ? 'translate(100 0) scale(-1 1)' : undefined}>
      <Ellipse cx={50} cy={94} rx={isFloor ? 39 : 28} ry={2.2} fill={accent} opacity={0.08}/>
      <Path d="M14 94H86" stroke={bodyStroke} strokeOpacity={0.08} strokeWidth={0.5}/>
      {p.bellDepth < 0 && <G opacity={0.5}>{bell}</G>}
      {/* Far-side limbs: lower opacity communicates depth, never muscle effort. */}
      <G opacity={0.48}>
        <Path d={segment(p.hip, p.leftKnee, 8, 5) + segment(p.leftKnee, p.leftFoot, 5, 3) + segment(p.shoulder, p.leftElbow, 5.5, 3.8) + segment(p.leftElbow, p.leftHand, 3.8, 2.5)} fill={bodyStroke}/>
        {has('Quads') && <MusclePatch a={p.hip} b={p.leftKnee} width={2.6} side={1.8}/>}
        {has('Hamstrings') && <MusclePatch a={p.hip} b={p.leftKnee} width={2.6} side={-1.8}/>}
        {has('Hip flexors') && <MusclePatch a={p.hip} b={mix(p.hip,p.leftKnee,0.4)} width={2.8} side={1.5}/>}
        {has('Calves') && <MusclePatch a={p.leftKnee} b={p.leftFoot} width={3.5}/>}
        {has('Biceps') && <MusclePatch a={p.shoulder} b={p.leftElbow} width={2} side={1.25}/>}
        {has('Triceps') && <MusclePatch a={p.shoulder} b={p.leftElbow} width={2} side={-1.25}/>}
        {has('Forearms') && <MusclePatch a={p.leftElbow} b={p.leftHand} width={2.6}/>}
        <Path d={`M${p.leftFoot.x - 2} ${p.leftFoot.y}h6`} stroke={bodyStroke} strokeWidth={3.4} strokeLinecap="round"/>
      </G>
      <Path d={segment(p.head, p.shoulder, 3, 5)} fill={bodyStroke}/>
      <Path d={segment(p.shoulder, p.hip, 12, 8)} fill={bodyStroke}/>
      {has('Core') && <MusclePatch a={p.shoulder} b={p.hip} width={5.5}/>}
      {has('Obliques') && <MusclePatch a={offset(mix(p.shoulder, p.hip, 0.3), 3)} b={offset(p.hip, 2.5)} width={3.4}/>}
      {has('Chest') && <Path d={segment(offset(mix(p.shoulder,p.hip,0.15),-3),offset(mix(p.shoulder,p.hip,0.36),-3),3.2)} fill={red}/>}
      {has('Upper back') && <Path d={segment(offset(mix(p.shoulder,p.hip,0.12),3),offset(mix(p.shoulder,p.hip,0.34),3),3.2)} fill={red}/>}
      {has('Lats') && <Path d={segment(offset(mix(p.shoulder,p.hip,0.35),3),offset(mix(p.shoulder,p.hip,0.65),2.4),3)} fill={red}/>}
      <Path d={segment(p.hip, p.rightKnee, 8.5, 5) + segment(p.rightKnee, p.rightFoot, 5, 3)} fill={bodyStroke}/>
      {has('Quads') && <MusclePatch a={p.hip} b={p.rightKnee} width={2.6} side={1.8}/>}
        {has('Hamstrings') && <MusclePatch a={p.hip} b={p.rightKnee} width={2.6} side={-1.8}/>}
        {has('Hip flexors') && <MusclePatch a={p.hip} b={mix(p.hip,p.rightKnee,0.4)} width={2.8} side={1.5}/>}
      {has('Calves') && <MusclePatch a={p.rightKnee} b={p.rightFoot} width={3.5}/>}
      <Ellipse cx={p.hip.x} cy={p.hip.y} rx={4.4} ry={3.6} fill={has('Glutes') ? red : bodyStroke}/>
      <Path d={segment(p.shoulder, p.rightElbow, 5.5, 3.8) + segment(p.rightElbow, p.rightHand, 3.8, 2.5)} fill={bodyStroke}/>
      {has('Biceps') && <MusclePatch a={p.shoulder} b={p.rightElbow} width={2} side={1.25}/>}
        {has('Triceps') && <MusclePatch a={p.shoulder} b={p.rightElbow} width={2} side={-1.25}/>}
      {has('Forearms') && <MusclePatch a={p.rightElbow} b={p.rightHand} width={2.6}/>}
      {has('Shoulders') && <Circle cx={p.shoulder.x} cy={p.shoulder.y} r={3.5} fill={red}/>}
      <Path d={`M${p.rightFoot.x - 2} ${p.rightFoot.y}h6`} stroke={bodyStroke} strokeWidth={3.4} strokeLinecap="round"/>
      <Circle cx={p.head.x} cy={p.head.y} r={5.8} fill={bodyStroke}/>
      <Path d={`M${p.head.x + 1.8} ${p.head.y - 2.5}v2.8`} stroke="#090B0E" strokeOpacity={0.18} strokeWidth={1.2} strokeLinecap="round"/>
      {p.bellDepth >= 0 && bell}
      <Circle cx={p.rightHand.x} cy={p.rightHand.y} r={1.6} fill={bodyStroke}/>
      </G>
    </Svg>
  );
}
