# Approved exercise animation style

Approved by the user: 2026-09-29.

Use this style for every built-in exercise and every future exercise added to
this project. The user approved the filled, tapered SVG figures shown in the
four-exercise preview, including the coral muscle highlights.

## Visual rules

- Filled athletic silhouettes with tapered limbs, a connected neck and a solid head.
- Lower-opacity far-side limbs indicate depth only.
- Coral red `#E96B73` marks schematic muscle focus; it is not a measurement of activation.
- Bodyweight figures remain cyan `#55C7FF`; no kettlebell is drawn.
- Loaded exercises use light body silhouettes and a lime `#B8F23B` kettlebell.
- Keep the shaded kettlebell, visible handle, hand connection and subtle floor shadow.
- Preserve readability at icon size and in the fullscreen workout view.
- Keep English-only labels, the muscle-focus legend and the existing workout/share flow.

## Movement rules

- Resolve movements by exercise ID, including variants that previously shared a glyph.
- Use joint-based poses with smooth transitions and continuous loop endpoints.
- Keep static holds static. Reset the motion when changing exercises.
- Preserve exercise-specific sequencing, such as clean, rack, press and return.
- Give every new built-in exercise its own entry in `EXERCISE_MOTIONS`.
- Custom exercises need an explicit movement/muscle mapping before receiving specific highlights.

## Implementation

- `src/animation/exercisePoses.ts`: movement profiles, timing and muscle focus.
- `src/components/PoseExerciseFigure.tsx`: shared figure, colors and muscle rendering.
- `src/components/ExerciseGlyph.tsx`: shared wrapper for all app views.
- Builder, library, exercise detail and fullscreen workout all pass the exercise ID.

## Coverage

All 32 built-in exercises are mapped: 23 loaded and 9 bodyweight.

- Kettlebell Swing (`swing`)
- Clean (`clean`)
- Snatch (`snatch`)
- High Pull (`high-pull`)
- Strict Press (`strict-press`)
- Push Press (`push-press`)
- Bent Over Row (`row`)
- Deadlift (`deadlift`)
- Goblet Squat (`goblet-squat`)
- Front Squat (`front-squat`)
- Reverse Lunge (`reverse-lunge`)
- Thruster (`thruster`)
- Halo (`halo`)
- Suitcase Hold (`suitcase-hold`)
- Rack Hold (`rack-hold`)
- Single-Arm Swing (`single-arm-swing`)
- Romanian Deadlift (`romanian-deadlift`)
- Floor Press (`floor-press`)
- Farmer March (`farmer-march`)
- Front Rack March (`front-rack-march`)
- Windmill (`windmill`)
- Around the World (`around-the-world`)
- Clean & Press (`clean-and-press`)
- Air Squat (`air-squat`)
- Push-Up (`push-up`)
- Plank (`plank`)
- Side Plank (`side-plank`)
- Glute Bridge (`glute-bridge`)
- Mountain Climber (`mountain-climber`)
- Burpee (`burpee`)
- High Knees (`high-knees`)
- Bodyweight Reverse Lunge (`bodyweight-reverse-lunge`)

## Verification and pending work

TypeScript and Expo iOS export passed for the implementation. Four poses per
exercise were visually reviewed, with loop/equipment/coordinate checks across
3,232 samples. Physical-device appearance and performance still need review.
These changes and this approval record are committed locally. GitHub upload
remains pending authenticated write access; do not assume main contains them.

## Runtime behavior (2026-09-29)

- Pausing retains the current animation pose; resuming continues it.
- Workout side is passed to the figure; left is mirrored, alternating sides switch per cycle.
- Respect the operating system Reduce Motion setting.
- Keep the approved authored keyframes. A global fixed-length IK projection was tested
  and rejected because it bent lockouts and distorted floor exercises. A future rig
  must be reviewed exercise by exercise before replacing these poses.

## Audit corrections (2026-09-29)

`armRig.ts` stabilizes the projected forearms at 15.5 viewBox units and preserves
wrist targets. It is applied to all built-in and fallback motions. It is a limited
projection correction, not a full anatomical skeleton; upper arms, legs and trunk
still depend on authored keyframes. A two-bone fixed arm solver was visually rejected
because it bent ballistic/overhead lockouts. A full rig remains outstanding.

Muscle patches now separate opposing groups using distinct narrow regions rather
than sharing one patch for biceps/triceps or quads/hamstrings. Hip flexors have a
short proximal zone; chest, upper back and lats are separate. Keep the approved red
shade, filled silhouettes, equipment colors and floor shadow. These zones remain
schematic. Do not claim medically accurate activation or verified exercise coaching.

QA: 3,232 sampled poses passed constant-forearm/floor checks; four rendered poses
per built-in exercise were inspected. Physical-phone and qualified technique reviews
remain outstanding.
