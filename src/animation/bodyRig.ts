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

const angle=(a:Point,b:Point)=>Math.atan2(b.y-a.y,b.x-a.x);
const blendAngle=(a:number,b:number,t:number)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
const blendPoint=(a:Point,b:Point,t:number):Point=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
function bone(root:Point,a:number,b:number,t:number,length:number):Point {
  const theta=blendAngle(a,b,t);
  return {x:root.x+Math.cos(theta)*length,y:root.y+Math.sin(theta)*length};
}
/** Interpolate joint angles, never shrink bones or flip IK branches between frames. */
export function blendRig(a:Pose,b:Pose,t:number):Pose {
  const out:Pose={...a,hip:blendPoint(a.hip,b.hip,t),bellAngle:a.bellAngle+(b.bellAngle-a.bellAngle)*t,bellDepth:a.bellDepth+(b.bellDepth-a.bellDepth)*t};
  out.shoulder=bone(out.hip,angle(a.hip,a.shoulder),angle(b.hip,b.shoulder),t,BONES.torso);
  out.head=bone(out.shoulder,angle(a.shoulder,a.head),angle(b.shoulder,b.head),t,BONES.neck);
  for(const side of ['left','right'] as const){
    const knee=`${side}Knee` as const,foot=`${side}Foot` as const,elbow=`${side}Elbow` as const,hand=`${side}Hand` as const;
    out[knee]=bone(out.hip,angle(a.hip,a[knee]),angle(b.hip,b[knee]),t,BONES.thigh);
    out[foot]=bone(out[knee],angle(a[knee],a[foot]),angle(b[knee],b[foot]),t,BONES.shin);
    out[elbow]=bone(out.shoulder,angle(a.shoulder,a[elbow]),angle(b.shoulder,b[elbow]),t,BONES.upperArm);
    out[hand]=bone(out[elbow],angle(a[elbow],a[hand]),angle(b[elbow],b[hand]),t,BONES.forearm);
  }
  // Keep the lowest foot at the authored floor/jump height across the entire cycle.
  const floor=Math.max(a.leftFoot.y,a.rightFoot.y)+(Math.max(b.leftFoot.y,b.rightFoot.y)-Math.max(a.leftFoot.y,a.rightFoot.y))*t;
  const dy=floor-Math.max(out.leftFoot.y,out.rightFoot.y);
  for(const key of ['hip','shoulder','head','leftKnee','rightKnee','leftFoot','rightFoot','leftElbow','rightElbow','leftHand','rightHand'] as const) out[key]={x:out[key].x,y:out[key].y+dy};
  return out;
}
