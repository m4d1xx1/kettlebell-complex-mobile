import type { Point, Pose, Motion } from './exercisePoses';
/** Stabilize the projected forearm, preserving the authored wrist path and bend direction.
 * Upper arms/legs still use authored projection; this is not a complete 3-D anatomical rig.
 */
export function rigArms(_motion: Motion, pose: Pose): Pose {
  const out = { ...pose };
  for (const side of ['left','right'] as const) {
    const elbow = `${side}Elbow` as const, hand = `${side}Hand` as const;
    const target = pose[hand], hint = pose[elbow];
    const d = Math.hypot(hint.x-target.x,hint.y-target.y);
    if (d < 0.001) continue;
    const length = 15.5;
    const candidate: Point = {x:target.x+(hint.x-target.x)/d*length,y:target.y+(hint.y-target.y)/d*length};
    // Preserve floor contact without allowing the elbow to penetrate the floor plane.
    if (candidate.y > 90) {
      candidate.y = 90;
      candidate.x = target.x + (hint.x < target.x ? -1 : 1) * Math.sqrt(Math.max(0,length*length-(90-target.y)**2));
    }
    out[elbow] = candidate;
  }
  return out;
}
