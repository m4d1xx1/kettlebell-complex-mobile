import { rigArms } from './armRig';
import { ExerciseVisual } from '../types';

export type Point = { x: number; y: number };
export type Joint = 'head' | 'shoulder' | 'hip' | 'leftElbow' | 'rightElbow' | 'leftHand' | 'rightHand' | 'leftKnee' | 'rightKnee' | 'leftFoot' | 'rightFoot';
export type Pose = Record<Joint, Point> & { bellAngle: number; bellDepth: number };
export type Muscle = 'Glutes' | 'Hamstrings' | 'Quads' | 'Calves' | 'Core' | 'Obliques' | 'Chest' | 'Upper back' | 'Lats' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Forearms' | 'Hip flexors';
export type Frame = { at: number; pose: Pose };
export type Motion = { frames: Frame[]; duration: number; muscles: Muscle[]; equipment: 'kettlebell' | 'bodyweight'; hold?: boolean };
const pt = (x: number, y: number): Point => ({ x, y });
const stand: Pose = {
  head: pt(46, 25), shoulder: pt(46, 35), hip: pt(46, 59),
  leftElbow: pt(35, 48), rightElbow: pt(59, 48), leftHand: pt(33, 62), rightHand: pt(62, 63),
  leftKnee: pt(40, 74), rightKnee: pt(54, 74), leftFoot: pt(37, 90), rightFoot: pt(59, 90),
  bellAngle: 0, bellDepth: 1
};
const pose = (base: Pose, change: Partial<Pose>): Pose => ({ ...base, ...change });
const move = (base: Pose, dx: number, dy: number): Pose => {
  const next = { ...base };
  for (const key of Object.keys(base) as (keyof Pose)[]) {
    if (key === 'bellAngle' || key === 'bellDepth') continue;
    next[key] = pt(base[key].x + dx, base[key].y + dy);
  }
  return next;
};
const gripBoth = (base: Pose, hand: Point): Pose => pose(base, { rightHand: hand, leftHand: pt(hand.x - 2, hand.y) });
const rack = pose(stand, { rightElbow: pt(54, 54), rightHand: pt(55, 39), bellAngle: -85 });
const goblet = pose(rack, { leftElbow: pt(43, 52), leftHand: pt(54, 40), rightHand: pt(56, 40), bellAngle: 0 });
const overhead = pose(rack, { rightElbow: pt(53, 22), rightHand: pt(54, 7), bellAngle: -20 });
const hinge = pose(stand, {
  head: pt(62, 39), shoulder: pt(55, 47), hip: pt(33, 65),
  leftElbow: pt(39, 60), rightElbow: pt(42, 61), leftHand: pt(26, 70), rightHand: pt(28, 70),
  leftKnee: pt(38, 77), rightKnee: pt(57, 77)
});
const drive = gripBoth(pose(stand, { leftElbow: pt(54, 49), rightElbow: pt(56, 48) }), pt(64, 60));
const float = gripBoth(pose(stand, { leftElbow: pt(61, 37), rightElbow: pt(63, 36) }), pt(79, 37));
const freeArm = (p: Pose): Pose => pose(p, { leftElbow: pt(p.shoulder.x - 12, p.shoulder.y + 9), leftHand: pt(p.shoulder.x - 18, p.shoulder.y + 22) });
const cleanPull = pose(stand, { rightElbow: pt(63, 44), rightHand: pt(56, 50), bellAngle: -10 });
const turnover = pose(rack, { rightElbow: pt(58, 46), rightHand: pt(54, 38), bellAngle: -55 });
const highPull = pose(stand, { rightElbow: pt(69, 35), rightHand: pt(62, 41) });
const snatchPull = pose(highPull, { rightElbow: pt(66, 28), rightHand: pt(59, 24), bellAngle: -60 });
const squat = (base: Pose): Pose => pose(move(base, 0, 17), {
  hip: pt(44, 79), leftKnee: pt(26, 77), rightKnee: pt(65, 77), leftFoot: stand.leftFoot, rightFoot: stand.rightFoot
});
const dip = pose(move(rack, 0, 5), { leftKnee: pt(36, 78), rightKnee: pt(59, 78), leftFoot: stand.leftFoot, rightFoot: stand.rightFoot });
const lunge = (base: Pose): Pose => pose(move(base, -7, 10), {
  hip: pt(39, 69), leftKnee: pt(26, 72), rightKnee: pt(58, 88), leftFoot: pt(27, 90), rightFoot: pt(76, 90)
});
const lungeStart = pose(rack, { leftFoot: pt(27, 90), leftKnee: pt(33, 75) });
const deadliftBottom = gripBoth(pose(hinge, { leftElbow: pt(51, 61), rightElbow: pt(54, 61) }), pt(51, 76));
const deadliftTop = gripBoth(pose(stand, { leftElbow: pt(46, 50), rightElbow: pt(50, 50) }), pt(49, 64));
const rdlBottom = gripBoth(pose(deadliftBottom, { hip: pt(31, 62), leftKnee: pt(37, 75), rightKnee: pt(56, 75) }), pt(49, 71));
const rowBottom = pose(hinge, { leftElbow: pt(42, 61), leftHand: pt(39, 73), rightElbow: pt(58, 61), rightHand: pt(60, 76) });
const rowTop = pose(rowBottom, { rightElbow: pt(34, 57), rightHand: pt(48, 61) });
const march = (base: Pose, right: boolean): Pose => right
  ? pose(base, { rightKnee: pt(66, 61), rightFoot: pt(68, 78) })
  : pose(base, { leftKnee: pt(28, 61), leftFoot: pt(27, 78) });
const airStand = pose(stand, { leftElbow: pt(37, 47), leftHand: pt(36, 59), rightElbow: pt(59, 44), rightHand: pt(70, 41) });
const airSquat = pose(squat(airStand), { leftElbow: pt(55, 58), leftHand: pt(69, 58), rightElbow: pt(58, 55), rightHand: pt(73, 55) });
const pushUp = pose(stand, {
  head: pt(16, 51), shoulder: pt(25, 56), hip: pt(54, 68),
  leftElbow: pt(25, 72), rightElbow: pt(31, 72), leftHand: pt(23, 90), rightHand: pt(30, 90),
  leftKnee: pt(69, 79), rightKnee: pt(72, 79), leftFoot: pt(84, 90), rightFoot: pt(88, 90)
});
const pushDown = pose(pushUp, { head: pt(16, 71), shoulder: pt(26, 75), hip: pt(55, 81), leftElbow: pt(39, 82), rightElbow: pt(43, 82), leftKnee: pt(70, 85), rightKnee: pt(73, 85) });
const plank = pose(pushUp, { head: pt(17, 61), shoulder: pt(27, 66), hip: pt(56, 77), leftElbow: pt(27, 90), rightElbow: pt(32, 90), leftHand: pt(14, 90), rightHand: pt(19, 90), leftKnee: pt(70, 84), rightKnee: pt(73, 84) });
const sidePlank = pose(plank, { head: pt(22, 51), shoulder: pt(29, 61), hip: pt(54, 74), leftElbow: pt(29, 90), leftHand: pt(17, 90), rightElbow: pt(48, 62), rightHand: pt(54, 74), leftKnee: pt(70, 82), rightKnee: pt(70, 81), leftFoot: pt(87, 90), rightFoot: pt(87, 88) });
const bridgeDown = pose(stand, { head: pt(15, 84), shoulder: pt(25, 87), hip: pt(49, 88), leftElbow: pt(36, 90), leftHand: pt(45, 90), rightElbow: pt(37, 89), rightHand: pt(47, 89), leftKnee: pt(61, 70), rightKnee: pt(65, 68), leftFoot: pt(77, 90), rightFoot: pt(82, 90) });
const bridgeUp = pose(bridgeDown, { hip: pt(48, 69), leftKnee: pt(65, 68), rightKnee: pt(69, 67) });
const floorPress = pose(bridgeDown, { rightElbow: pt(37, 89), rightHand: pt(38, 72), bellAngle: -20 });
const floorPressTop = pose(floorPress, { rightElbow: pt(28, 70), rightHand: pt(28, 54) });
const climberLeft = pose(pushUp, { leftKnee: pt(38, 81), leftFoot: pt(56, 88) });
const climberRight = pose(pushUp, { rightKnee: pt(37, 81), rightFoot: pt(55, 88) });
const crouch = pose(airSquat, { head: pt(34, 52), shoulder: pt(42, 61), hip: pt(58, 75), leftElbow: pt(34, 74), rightElbow: pt(37, 75), leftHand: pt(26, 90), rightHand: pt(31, 90), leftKnee: pt(43, 82), rightKnee: pt(46, 80), leftFoot: pt(55, 90), rightFoot: pt(60, 90) });
const jump = move(pose(stand, { leftElbow: pt(34, 22), rightElbow: pt(58, 22), leftHand: pt(34, 12), rightHand: pt(59, 12) }), 0, -5);
const highKneeLeft = pose(march(stand, false), { rightElbow: pt(61, 41), rightHand: pt(62, 29), leftElbow: pt(31, 46), leftHand: pt(24, 53) });
const highKneeRight = pose(march(stand, true), { leftElbow: pt(31, 41), leftHand: pt(30, 29), rightElbow: pt(62, 46), rightHand: pt(69, 53) });
const haloFront = gripBoth(pose(stand, { leftElbow: pt(31, 35), rightElbow: pt(62, 35) }), pt(47, 30));
const haloLeft = gripBoth(pose(stand, { leftElbow: pt(25, 31), rightElbow: pt(58, 27) }), pt(30, 20));
const haloBack = gripBoth(pose(stand, { leftElbow: pt(29, 23), rightElbow: pt(63, 23), bellDepth: -1 }), pt(47, 18));
const haloRight = gripBoth(pose(stand, { leftElbow: pt(34, 27), rightElbow: pt(70, 31) }), pt(64, 20));
const aroundFront = gripBoth(pose(stand, { leftElbow: pt(35, 50), rightElbow: pt(58, 50) }), pt(47, 64));
const aroundRight = pose(stand, { rightElbow: pt(64, 45), rightHand: pt(72, 59) });
const aroundBack = gripBoth(pose(stand, { leftElbow: pt(31, 52), rightElbow: pt(62, 52), bellDepth: -1 }), pt(47, 64));
const aroundLeft = gripBoth(pose(stand, { leftElbow: pt(27, 45), rightElbow: pt(38, 53) }), pt(23, 60));
const windmill = pose(overhead, { head: pt(34, 48), shoulder: pt(42, 55), hip: pt(61, 66), leftElbow: pt(32, 70), leftHand: pt(28, 84), rightElbow: pt(49, 36), rightHand: pt(54, 17), leftKnee: pt(32, 78), rightKnee: pt(67, 78), leftFoot: pt(25, 90), rightFoot: pt(73, 90) });
const windmillTop = pose(overhead, { leftFoot: pt(25, 90), rightFoot: pt(73, 90), leftKnee: pt(34, 76), rightKnee: pt(62, 76) });

const seq = (poses: Pose[]): Frame[] => poses.map((p, i) => ({ at: i / (poses.length - 1), pose: p }));
const kb = (poses: Pose[], muscles: Muscle[], duration = 3200, hold = false): Motion => ({ frames: seq(poses), muscles, duration, equipment: 'kettlebell', hold });
const bw = (poses: Pose[], muscles: Muscle[], duration = 3200, hold = false): Motion => ({ ...kb(poses, muscles, duration, hold), equipment: 'bodyweight' });
const hingeMuscles: Muscle[] = ['Glutes', 'Hamstrings', 'Core'];
const squatMuscles: Muscle[] = ['Quads', 'Glutes', 'Core'];
const pressMuscles: Muscle[] = ['Shoulders', 'Triceps', 'Core'];
const swingPoses = [hinge, drive, float, float, drive, hinge];
const cleanPoses = [freeArm(hinge), cleanPull, turnover, rack, rack, cleanPull, freeArm(hinge)];

/** Curated schematic focus areas. Color is not an activation measurement. */
export const EXERCISE_MOTIONS: Record<string, Motion> = {
  'swing': kb(swingPoses, hingeMuscles, 2400),
  'single-arm-swing': kb(swingPoses.map(freeArm), [...hingeMuscles, 'Forearms'], 2400),
  'clean': kb(cleanPoses, [...hingeMuscles, 'Forearms'], 2800),
  'snatch': kb([freeArm(hinge), cleanPull, snatchPull, overhead, overhead, snatchPull, cleanPull, freeArm(hinge)], ['Glutes', 'Hamstrings', 'Shoulders', 'Core', 'Forearms'], 3200),
  'high-pull': kb([freeArm(hinge), cleanPull, highPull, cleanPull, freeArm(hinge)], ['Glutes', 'Hamstrings', 'Upper back', 'Shoulders'], 2600),
  'strict-press': kb([rack, overhead, overhead, rack], pressMuscles),
  'push-press': kb([rack, dip, overhead, overhead, rack], [...pressMuscles, 'Quads', 'Glutes']),
  'clean-and-press': kb([freeArm(hinge), cleanPull, turnover, rack, rack, overhead, overhead, rack, cleanPull, freeArm(hinge)], [...hingeMuscles, 'Shoulders', 'Triceps'], 5000),
  'row': kb([rowBottom, rowTop, rowTop, rowBottom], ['Lats', 'Upper back', 'Biceps', 'Forearms']),
  'deadlift': kb([deadliftBottom, deadliftTop, deadliftTop, deadliftBottom], hingeMuscles),
  'romanian-deadlift': kb([deadliftTop, rdlBottom, rdlBottom, deadliftTop], ['Hamstrings', 'Glutes', 'Core'], 3600),
  'goblet-squat': kb([goblet, squat(goblet), squat(goblet), goblet], squatMuscles, 3600),
  'front-squat': kb([rack, squat(rack), squat(rack), rack], squatMuscles, 3600),
  'reverse-lunge': kb([lungeStart, lunge(lungeStart), lunge(lungeStart), lungeStart], squatMuscles, 3600),
  'thruster': kb([rack, squat(rack), rack, overhead, overhead, rack], [...squatMuscles, 'Shoulders', 'Triceps'], 3600),
  'halo': kb([haloFront, haloLeft, haloBack, haloRight, haloFront], ['Shoulders', 'Upper back', 'Core'], 4200),
  'around-the-world': kb([aroundFront, aroundRight, aroundBack, aroundLeft, aroundFront], ['Core', 'Forearms', 'Shoulders'], 4200),
  'suitcase-hold': kb([stand, stand], ['Obliques', 'Forearms'], 2400, true),
  'rack-hold': kb([rack, rack], ['Core', 'Upper back', 'Forearms'], 2400, true),
  'farmer-march': kb([stand, march(stand, true), stand, march(stand, false), stand], ['Core', 'Obliques', 'Hip flexors', 'Forearms'], 4000),
  'front-rack-march': kb([rack, march(rack, true), rack, march(rack, false), rack], ['Core', 'Hip flexors', 'Upper back'], 4000),
  'floor-press': kb([floorPress, floorPressTop, floorPressTop, floorPress], ['Chest', 'Triceps', 'Shoulders']),
  'windmill': kb([windmillTop, windmill, windmill, windmillTop], ['Obliques', 'Hamstrings', 'Shoulders'], 4400),
  'air-squat': bw([airStand, airSquat, airSquat, airStand], squatMuscles, 3600),
  'push-up': bw([pushUp, pushDown, pushDown, pushUp], ['Chest', 'Triceps', 'Core'], 3200),
  'plank': bw([plank, plank], ['Core', 'Shoulders', 'Glutes'], 2400, true),
  'side-plank': bw([sidePlank, sidePlank], ['Obliques', 'Shoulders', 'Glutes'], 2400, true),
  'glute-bridge': bw([bridgeDown, bridgeUp, bridgeUp, bridgeDown], ['Glutes', 'Hamstrings', 'Core'], 3200),
  'mountain-climber': bw([pushUp, climberLeft, pushUp, climberRight, pushUp], ['Core', 'Hip flexors', 'Shoulders'], 2200),
  'burpee': bw([airStand, crouch, pushUp, pushDown, pushUp, crouch, airStand, jump, airStand], ['Quads', 'Glutes', 'Chest', 'Triceps', 'Core'], 4800),
  'high-knees': bw([stand, highKneeLeft, stand, highKneeRight, stand], ['Hip flexors', 'Quads', 'Calves', 'Core'], 1600),
  'bodyweight-reverse-lunge': bw([pose(lungeStart, { rightHand: pt(62, 63), rightElbow: pt(59, 48), bellAngle: 0 }), lunge(airStand), pose(lungeStart, { rightHand: pt(62, 63), rightElbow: pt(59, 48), bellAngle: 0 }), pose(lunge(airStand), { leftKnee: pt(58, 88), rightKnee: pt(26, 72), leftFoot: pt(76, 90), rightFoot: pt(27, 90) }), pose(lungeStart, { rightHand: pt(62, 63), rightElbow: pt(59, 48), bellAngle: 0 })], squatMuscles, 5200)
};

const defaults: Record<ExerciseVisual, string> = {
  swing: 'swing', clean: 'clean', 'high-pull': 'high-pull', press: 'strict-press', snatch: 'snatch', squat: 'goblet-squat', lunge: 'reverse-lunge', row: 'row', deadlift: 'deadlift', halo: 'halo', carry: 'suitcase-hold', pushup: 'push-up', plank: 'plank', burpee: 'burpee', bridge: 'glute-bridge', 'high-knees': 'high-knees', windmill: 'windmill', 'floor-press': 'floor-press'
};
export function getMotion(exerciseId: string | undefined, visual: ExerciseVisual, equipment: 'kettlebell' | 'bodyweight'): Motion {
  const specific = exerciseId ? EXERCISE_MOTIONS[exerciseId] : undefined;
  if (specific) return specific;
  const fallback = equipment === 'bodyweight' && visual === 'squat' ? 'air-squat' : equipment === 'bodyweight' && visual === 'lunge' ? 'bodyweight-reverse-lunge' : defaults[visual];
  const motion = EXERCISE_MOTIONS[fallback];
  // Custom exercises have no verified anatomical mapping.
  return exerciseId ? { ...motion, equipment, muscles: [] } : { ...motion, equipment };
}

export function samplePose(motion: Motion, progress: number): Pose {
  const p = Math.max(0, Math.min(1, progress));
  const next = motion.frames.findIndex(frame => frame.at > p);
  const i = next < 0 ? motion.frames.length - 2 : Math.max(0, next - 1);
  const a = motion.frames[i], b = motion.frames[i + 1];
  const linear = (p - a.at) / (b.at - a.at);
  const t = linear * linear * (3 - 2 * linear);
  const out = { ...a.pose };
  for (const key of Object.keys(a.pose) as (keyof Pose)[]) {
    if (key === 'bellAngle' || key === 'bellDepth') out[key] = a.pose[key] + (b.pose[key] - a.pose[key]) * t;
    else out[key] = pt(a.pose[key].x + (b.pose[key].x - a.pose[key].x) * t, a.pose[key].y + (b.pose[key].y - a.pose[key].y) * t);
  }
  return rigArms(motion, out);
}
