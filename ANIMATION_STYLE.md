# DAYBRAVE exercise animation style

The filled silhouette and flow were developed on 2026-09-29. On 2026-10-05 the
user replaced equipment colours and coral muscle zones with system-driven
monochrome. This document describes the current implementation; earlier colour
rules and forearm-only rig notes are superseded.

## Visual rules

- Filled, tapered silhouettes with a connected neck and recognizable limbs.
- Both equipment types use grayscale, with dark silhouettes in light mode and
  light silhouettes in dark mode. Equipment is identified by text and bell presence.
- Contrasting light/dark patches mark schematic muscle focus, never measured
  activation. The detail legend names the muscles without relying on colour.
- Large figures use soft surface gradients, restrained rim highlights and a subtle
  accent backdrop. Small figures keep simpler flat body fills for readability.
- Far-side limbs are dimmer to communicate depth. Contrasting patches mean focus.
- Kettlebells have a rounded body, shaped handle, highlight and darker underside.
  The handle follows the hand; front/back transitions cross-fade through depth.
- Feet have a defined shape; the floor has a soft, height-sensitive contact shadow.
- The SVG viewport has two units of padding so overhead bell handles are not clipped.
- Avoid decorative particles, motion blur and trails that obscure movement technique.
- Preserve the fullscreen runner, English labels, bodyweight summaries and share cards.

## Motion rules

- All 32 exercises resolve by exercise ID to their own authored sequence.
- Fixed planar bone lengths: upper arm 16, forearm 15.5, thigh/shin 18, torso 24,
  neck 10, in viewBox units. IK converts authored poses into cached rig tracks.
- Monotone cubic interpolation of root position and joint angles carries velocity
  through transit poses without overshooting the authored scalar endpoints.
- Effort, controlled return and brief checkpoints have exercise-specific timings.
  Static holds remain static; a deliberate repeated pose creates a true hold.
- Preserve continuous loop endpoints and floor/jump height. This remains a stylized
  2-D demonstration; physical contacts and technique need qualified human review.
- Large animated figures target up to 60 updates/second using requestAnimationFrame;
  small previews target 30. Actual phone frame rate has not been measured.
- Pause retains the current pose; resume continues it. Changing exercise/side resets
  the cycle. Left is mirrored; alternating sides switch per completed cycle.
- Respect the operating system Reduce Motion setting and cancel frames on unmount.
- Custom exercises use a generic visual with no unverified muscle highlights.

## Implementation

- `src/animation/exercisePoses.ts`: authored poses, timing, equipment and muscle focus.
- `src/animation/bodyRig.ts`: fixed-length IK and cached continuous interpolation.
- `src/components/PoseExerciseFigure.tsx`: playback, figure surfaces, bell and shadow.
- `src/components/ExerciseGlyph.tsx`: theme-aware fills and shared wrapper.
- Builder, library, detail and fullscreen workout all pass the exercise ID.

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

## Verification

- Existing core checks sample 1,001 frames per exercise for bone lengths, bounds
  and positional continuity.
- `scripts/test-motion-flow.cjs` checks keyframe/loop velocities, transit movement,
  holds, scalar bounds and compatibility with the fixed-length rig.
- Rendered SVG contact sheets cover every built-in movement; these are code renders,
  not native-phone recordings or proof of medical/technique accuracy.
- Physical iPhone performance, large-font layouts and qualified movement review
  remain open before release. See PROJECT_HANDOFF.md for published validation status.
