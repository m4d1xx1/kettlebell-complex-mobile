const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(file) {
  file = path.resolve(root, file);
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  vm.runInNewContext(code, { exports, require: id => load(path.resolve(path.dirname(file), id) + '.ts') });
  return exports;
}
const { EXERCISE_MOTIONS, samplePose } = load('src/animation/exercisePoses.ts');
const { rigBody } = load('src/animation/bodyRig.ts');
const joints = ['head', 'shoulder', 'hip', 'leftElbow', 'rightElbow', 'leftHand', 'rightHand', 'leftKnee', 'rightKnee', 'leftFoot', 'rightFoot'];
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const maxDistance = (a, b) => Math.max(...joints.map(joint => distance(a[joint], b[joint])));
const bones = [['hip', 'shoulder', 24], ['shoulder', 'head', 10], ['hip', 'leftKnee', 18], ['hip', 'rightKnee', 18], ['leftKnee', 'leftFoot', 18], ['rightKnee', 'rightFoot', 18], ['shoulder', 'leftElbow', 16], ['shoulder', 'rightElbow', 16], ['leftElbow', 'leftHand', 15.5], ['rightElbow', 'rightHand', 15.5]];
const epsilon = 1e-6;
let samples = 0, maxJoinError = 0;
for (const [id, motion] of Object.entries(EXERCISE_MOTIONS)) {
  assert.equal(motion.frames[0].at, 0, `${id}: start time`);
  assert.equal(motion.frames.at(-1).at, 1, `${id}: end time`);
  motion.frames.forEach((frame, index) => {
    if (index) assert.ok(frame.at > motion.frames[index - 1].at, `${id}: ordered phase times`);
    assert.ok(maxDistance(samplePose(motion, frame.at), rigBody(frame.pose, motion.stance)) < 1e-6, `${id}: preserved authored keyframe`);
  });
  const start = samplePose(motion, 0), end = samplePose(motion, 1);
  assert.ok(maxDistance(start, end) < 1e-6, `${id}: seamless pose loop`);
  for (const at of [0, ...motion.frames.slice(1, -1).map(frame => frame.at)]) {
    const center = samplePose(motion, at);
    const before = samplePose(motion, at === 0 ? 1 - epsilon : at - epsilon);
    const after = samplePose(motion, at + epsilon);
    for (const joint of joints) {
      const error = Math.hypot((center[joint].x - before[joint].x) - (after[joint].x - center[joint].x), (center[joint].y - before[joint].y) - (after[joint].y - center[joint].y)) / epsilon;
      maxJoinError = Math.max(maxJoinError, error);
      assert.ok(error < 0.12, `${id}: ${joint} velocity discontinuity ${error} at ${at}`);
    }
  }
  for (let i = 0; i <= 1000; i++) {
    const pose = samplePose(motion, i / 1000);
    for (const [a, b, length] of bones) assert.ok(Math.abs(distance(pose[a], pose[b]) - length) < 1e-6, `${id}: fixed ${a}-${b}`);
    for (const joint of joints) assert.ok(Number.isFinite(pose[joint].x) && Number.isFinite(pose[joint].y) && pose[joint].x >= 0 && pose[joint].x <= 100 && pose[joint].y >= 0 && pose[joint].y <= 100, `${id}: safe canvas`);
    // Existing planar burpee contacts are imperfect (main peaks at 93.389/91.519).
    // Smoothing must not deepen those contacts; device/technique review is separate.
    if (id === 'burpee') {
      assert.ok(pose.leftHand.y <= 93.390 && pose.rightHand.y <= 91.520, 'burpee: worsened floor contact');
    }
    const floor = Math.max(pose.leftFoot.y, pose.rightFoot.y);
    assert.ok(floor <= 90 + 1e-6 && floor >= 85 - 1e-6, `${id}: authored floor/jump height`);
    if (id !== 'burpee') assert.ok(Math.abs(floor - Math.max(start.leftFoot.y, start.rightFoot.y)) < 1e-6, `${id}: support height retained`);
    if (motion.hold) assert.ok(maxDistance(start, pose) < 1e-9, `${id}: static hold`);
    samples++;
  }
  // Authored duplicated poses are deliberate holds, with zero equipment motion too.
  for (let i = 0; i < motion.frames.length - 1; i++) {
    const a = motion.frames[i], b = motion.frames[i + 1];
    if (JSON.stringify(a.pose) !== JSON.stringify(b.pose)) continue;
    const first = samplePose(motion, a.at), middle = samplePose(motion, (a.at + b.at) / 2);
    assert.ok(maxDistance(first, middle) < 1e-6, `${id}: stable technique hold`);
    assert.ok(Math.abs(first.bellAngle - middle.bellAngle) < 1e-6, `${id}: stable bell hold`);
  }
}
// Regression: moving through the drive/pull/rack checkpoints must not stop the whole
// figure, while the top/turnaround checkpoint remains a deliberate short hold.
for (const [id, phase] of [['swing', 1], ['clean', 1], ['snatch', 2], ['thruster', 2], ['halo', 2], ['around-the-world', 2]]) {
  const motion = EXERCISE_MOTIONS[id], at = motion.frames[phase].at;
  const speed = maxDistance(samplePose(motion, at - epsilon), samplePose(motion, at + epsilon)) / (2 * epsilon);
  assert.ok(speed > 5, `${id}: transit freeze (${speed})`);
}
// Measure the rendered bone angles, rather than duplicating the interpolation,
// to ensure uneven phase timings never swing a limb beyond its adjacent poses.
const turn = radians => Math.atan2(Math.sin(radians), Math.cos(radians));
const boneAngle = (pose, root, tip) => Math.atan2(pose[tip].y - pose[root].y, pose[tip].x - pose[root].x);
for (const [id, motion] of Object.entries(EXERCISE_MOTIONS)) {
  for (let index = 0; index < motion.frames.length - 1; index++) {
    const a = motion.frames[index], b = motion.frames[index + 1];
    const before = samplePose(motion, a.at), after = samplePose(motion, b.at);
    for (let step = 0; step <= 20; step++) {
      const actual = samplePose(motion, a.at + (b.at - a.at) * step / 20);
      for (const [root, tip] of bones) {
        const first = boneAngle(before, root, tip);
        const delta = turn(boneAngle(after, root, tip) - first);
        const travelled = turn(boneAngle(actual, root, tip) - first);
        assert.ok(travelled >= Math.min(0, delta) - 1e-7 && travelled <= Math.max(0, delta) + 1e-7, `${id}: ${root}-${tip} angular overshoot`);
      }
      for (const key of ['bellAngle', 'bellDepth']) assert.ok(actual[key] >= Math.min(before[key], after[key]) - 1e-7 && actual[key] <= Math.max(before[key], after[key]) + 1e-7, `${id}: equipment overshoot`);
    }
  }
}
assert.equal(Object.keys(EXERCISE_MOTIONS).length, 32);
console.log(`PASS: ${samples} motion samples; authored poses, static holds, grounded support, fixed bones, canvas bounds, looping velocities and flowing transit poses (max join error ${maxJoinError.toFixed(4)}).`);
