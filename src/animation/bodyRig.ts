import type { Point, Pose } from './exercisePoses';
export const BONES = { upperArm:16, forearm:15.5, thigh:18, shin:18, torso:24, neck:10 };
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
const add=(a:Point,b:Point):Point=>({x:a.x+b.x,y:a.y+b.y});
const subtract=(a:Point,b:Point):Point=>({x:a.x-b.x,y:a.y-b.y});
function atDistance(root:Point,target:Point,length:number):Point {
  const d=distance(root,target)||1;
  return {x:root.x+(target.x-root.x)*length/d,y:root.y+(target.y-root.y)*length/d};
}
function straight(a:Point,b:Point,c:Point) {
  const ab=subtract(b,a),bc=subtract(c,b);
  return (ab.x*bc.x+ab.y*bc.y)/((Math.hypot(ab.x,ab.y)*Math.hypot(bc.x,bc.y))||1)>0.94;
}
function joint(root:Point,end:Point,hint:Point,a:number,b:number):Point {
  const d=Math.max(0.0001,distance(root,end));
  const x=(a*a-b*b+d*d)/(2*d),h=Math.sqrt(Math.max(0,a*a-x*x));
  const ux=(end.x-root.x)/d,uy=(end.y-root.y)/d;
  const candidates=[-1,1].map(sign=>({x:root.x+ux*x-uy*h*sign,y:root.y+uy*x+ux*h*sign}));
  const above=candidates.filter(p=>p.y<=90.001);
  return (above.length?above:candidates).reduce((best,p)=>distance(p,hint)<distance(best,hint)?p:best);
}
/** Fixed-length planar skeleton; authored poses specify stance, grip paths and bend guides. */
export function rigBody(raw:Pose, stance?: 'wide-straight' | 'squat'):Pose {
  let hip={...raw.hip};
  if(stance === 'squat') hip.x=(raw.leftFoot.x+raw.rightFoot.x)/2;
  const reach=BONES.thigh+BONES.shin;
  // In a straight two-leg stance, solve the shared hip from both fixed foot contacts.
  if (stance === 'wide-straight' || (raw.shoulder.y < 45 && Math.abs(raw.hip.x-(raw.leftFoot.x+raw.rightFoot.x)/2)<8 && straight(raw.hip,raw.leftKnee,raw.leftFoot)&&straight(raw.hip,raw.rightKnee,raw.rightFoot))) {
    const d=distance(raw.leftFoot,raw.rightFoot);
    if(d>0.01&&d<2*reach) hip=joint(raw.leftFoot,raw.rightFoot,raw.hip,reach,reach);
  }
  // Keep both feet anchored; project unreachable authored hip targets into leg reach.
  for(let i=0;i<16;i++) for(const foot of [raw.leftFoot,raw.rightFoot]) if(distance(hip,foot)>reach) hip=atDistance(foot,hip,reach);
  let shoulder=atDistance(hip,add(hip,subtract(raw.shoulder,raw.hip)),BONES.torso);
  const support = raw.leftElbow.y >= 89 && raw.leftHand.y >= 89 && raw.shoulder.y > 50 && raw.shoulder.y < 80;
  const floorLine = raw.head.y < 80 && raw.shoulder.x < raw.hip.x - 12 && straight(raw.hip,raw.leftKnee,raw.leftFoot) && straight(raw.hip,raw.rightKnee,raw.rightFoot);
  const feet:Point={x:(raw.leftFoot.x+raw.rightFoot.x)/2,y:(raw.leftFoot.y+raw.rightFoot.y)/2};
  if (floorLine) {
    const bodyLength=BONES.torso+reach;
    shoulder=atDistance(feet,raw.shoulder,bodyLength);
    const anchor=support ? raw.leftElbow : {x:(raw.leftHand.x+raw.rightHand.x)/2,y:90};
    const armReach=support ? BONES.upperArm : BONES.upperArm+BONES.forearm;
    if(support || distance(shoulder,anchor)>armReach) shoulder=joint(anchor,feet,raw.shoulder,armReach,bodyLength);
    hip=atDistance(shoulder,feet,BONES.torso);
  }
  const shift=subtract(shoulder,raw.shoulder);
  const out:Pose={...raw,hip,shoulder,head:atDistance(shoulder,add(shoulder,subtract(raw.head,raw.shoulder)),BONES.neck)};
  for(const side of ['left','right'] as const) {
    const foot=floorLine ? feet : raw[`${side}Foot`];
    out[`${side}Foot`]=foot;
    out[`${side}Knee`]=joint(hip,foot,raw[`${side}Knee`],BONES.thigh,BONES.shin);
    let hand=raw[`${side}Hand`].y >= 89 ? {...raw[`${side}Hand`]} : add(raw[`${side}Hand`],shift);
    if(floorLine && support && side === 'left') {
      out.leftElbow={...raw.leftElbow};
      out.leftHand=atDistance(out.leftElbow,raw.leftHand,BONES.forearm);
      continue;
    }
    const elbowHint=add(raw[`${side}Elbow`],shift);
    const max=BONES.upperArm+BONES.forearm,min=Math.abs(BONES.upperArm-BONES.forearm)+0.001;
    const d=distance(shoulder,hand);
    if(d>max||straight(raw.shoulder,raw[`${side}Elbow`],raw[`${side}Hand`])) {
      if(raw[`${side}Hand`].y>=89 && Math.abs(90-shoulder.y)<=max) hand={x:shoulder.x+(hand.x<shoulder.x?-1:1)*Math.sqrt(Math.max(0,max*max-(90-shoulder.y)**2)),y:90};
      else hand=atDistance(shoulder,hand,max);
    }
    else if(d<min)hand=atDistance(shoulder,add(hand,{x:0.001,y:0}),min);
    out[`${side}Hand`]=hand;
    out[`${side}Elbow`]=joint(shoulder,hand,elbowHint,BONES.upperArm,BONES.forearm);
  }
  return out;
}

const angle = (a: Point, b: Point) => Math.atan2(b.y - a.y, b.x - a.x);
const shortestAngle = (radians: number) => Math.atan2(Math.sin(radians), Math.cos(radians));
const jointBones = [
  ['hip', 'shoulder', BONES.torso], ['shoulder', 'head', BONES.neck],
  ['hip', 'leftKnee', BONES.thigh], ['leftKnee', 'leftFoot', BONES.shin],
  ['hip', 'rightKnee', BONES.thigh], ['rightKnee', 'rightFoot', BONES.shin],
  ['shoulder', 'leftElbow', BONES.upperArm], ['leftElbow', 'leftHand', BONES.forearm],
  ['shoulder', 'rightElbow', BONES.upperArm], ['rightElbow', 'rightHand', BONES.forearm]
] as const;
const joints = ['hip', 'shoulder', 'head', 'leftKnee', 'rightKnee', 'leftFoot', 'rightFoot', 'leftElbow', 'rightElbow', 'leftHand', 'rightHand'] as const;
// Hip x/y, floor height, equipment rotation/depth, then each fixed-length bone angle.
type RigFrame = { at: number; values: number[]; velocity: number[] };
export type RigTrack = { frames: RigFrame[]; start: Pose };
const valuesOf = (p: Pose): number[] => [
  p.hip.x, p.hip.y, Math.max(p.leftFoot.y, p.rightFoot.y), p.bellAngle, p.bellDepth,
  ...jointBones.map(([root, end]) => angle(p[root], p[end]))
];

/** A monotone cubic tangent: flowing transit, zero velocity at reversals and holds.
 * Weighted harmonic means keep every scalar between its authored endpoints. Unlike
 * an unconstrained Catmull-Rom spline, this cannot overshoot an elbow/leg angle.
 */
function tangent(before: number, after: number, beforeTime: number, afterTime: number): number {
  if (before * after <= 0) return 0;
  const a = 2 * afterTime + beforeTime, b = afterTime + 2 * beforeTime;
  return (a + b) / (a / before + b / after);
}

/** Compile once per motion, including periodic endpoint velocities. */
export function createRigTrack(poses: { at: number; pose: Pose; settle?: boolean }[]): RigTrack {
  const frames: RigFrame[] = poses.map(({ at, pose }) => ({ at, values: valuesOf(pose), velocity: [] }));
  for (let i = 1; i < frames.length; i++) {
    for (let channel = 5; channel < frames[i].values.length; channel++) {
      const previous = frames[i - 1].values[channel];
      frames[i].values[channel] = previous + shortestAngle(frames[i].values[channel] - previous);
    }
  }
  const last = frames.length - 1;
  const closed = joints.every(key => distance(poses[0].pose[key], poses[last].pose[key]) < 1e-6);
  for (let i = 0; i <= last; i++) {
    const before = i === 0 ? last - 1 : i - 1;
    const after = i === last ? 1 : i + 1;
    const beforeTime = i === 0 ? frames[last].at - frames[before].at : frames[i].at - frames[before].at;
    const afterTime = i === last ? frames[after].at - frames[0].at : frames[after].at - frames[i].at;
    frames[i].velocity = frames[i].values.map((value, channel) => {
      if (poses[i].settle) return 0;
      if (!closed && (i === 0 || i === last)) return 0;
      const incoming = ((i === 0 ? frames[last].values[channel] : value) - frames[before].values[channel]) / beforeTime;
      const outgoing = (frames[after].values[channel] - (i === last ? frames[0].values[channel] : value)) / afterTime;
      return tangent(incoming, outgoing, beforeTime, afterTime);
    });
  }
  // Where both feet meet the support plane, match their vertical velocities.
  // Otherwise choosing the lowest foot would introduce a visible whole-body snap
  // when support changes (notably the crouch/plank transitions in a burpee).
  // Only reduce existing monotone tangents; never add an angular overshoot.
  for (let i = 0; i <= last; i++) {
    if (Math.abs(poses[i].pose.leftFoot.y - poses[i].pose.rightFoot.y) > 1e-6) continue;
    const frame = frames[i];
    const left = BONES.thigh * Math.cos(frame.values[7]) * frame.velocity[7]
      + BONES.shin * Math.cos(frame.values[8]) * frame.velocity[8];
    const right = BONES.thigh * Math.cos(frame.values[9]) * frame.velocity[9]
      + BONES.shin * Math.cos(frame.values[10]) * frame.velocity[10];
    if (Math.abs(left - right) < 1e-7) continue;
    const shared = left * right > 0 ? Math.sign(left) * Math.min(Math.abs(left), Math.abs(right)) : 0;
    for (const channel of [7, 8]) frame.velocity[channel] *= Math.abs(left) > 1e-9 ? shared / left : 0;
    for (const channel of [9, 10]) frame.velocity[channel] *= Math.abs(right) > 1e-9 ? shared / right : 0;
  }
  return { frames, start: poses[0].pose };
}

function cubic(a: number, b: number, va: number, vb: number, t: number, duration: number): number {
  const t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * a + (t3 - 2 * t2 + t) * duration * va
    + (-2 * t3 + 3 * t2) * b + (t3 - t2) * duration * vb;
}

/** Shared velocity across transit poses; reconstructing bones retains exact lengths. */
export function sampleRigTrack(track: RigTrack, progress: number): Pose {
  const { frames } = track;
  const next = frames.findIndex(frame => frame.at > progress);
  const index = next < 0 ? frames.length - 2 : Math.max(0, next - 1);
  const a = frames[index], b = frames[index + 1], duration = b.at - a.at;
  const t = (progress - a.at) / duration;
  const values = a.values.map((value, channel) => cubic(value, b.values[channel], a.velocity[channel], b.velocity[channel], t, duration));
  const out: Pose = { ...track.start, hip: { x: values[0], y: values[1] }, bellAngle: values[3], bellDepth: values[4] };
  jointBones.forEach(([root, end, length], i) => {
    out[end] = { x: out[root].x + Math.cos(values[i + 5]) * length, y: out[root].y + Math.sin(values[i + 5]) * length };
  });
  // Retain the authored floor/jump height. This translates the whole rig, preserving
  // bone lengths and preventing the support foot from drifting beneath the floor.
  const dy = values[2] - Math.max(out.leftFoot.y, out.rightFoot.y);
  for (const key of joints) out[key] = { x: out[key].x, y: out[key].y + dy };
  return out;
}
