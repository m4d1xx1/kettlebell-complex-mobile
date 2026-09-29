# PROJECT HANDOFF — Fitness App

Last updated: 2026-09-29
Repository: https://github.com/m4d1xx1/kettlebell-complex-mobile
Authoritative branch: `main`

## Publication snapshot — 2026-09-29

This snapshot includes all development through local commit `bf425bb`, including
animations, vertical exercise selection and both reliability/audit updates. It is
prepared for publication to GitHub `main` as one consolidated commit via the GitHub
connector. Earlier statements that changes are local describe the pre-publication
state; when this snapshot is present on GitHub main, those pending-upload notes are
superseded. The GitHub publication SHA differs from the local development SHA.
Read the audit-fixes section for remaining animation and physical-device validation.

## Priority-list implementation — 2026-09-29

Base on GitHub main: `f335ab98859444ed3fac858d1a8fa334b5b240aa`.
Verified its GitHub Actions run #80 succeeded, including both regression suites.
This section supersedes the earlier remaining-forearm-only rig description.

- Actual repetition entry: the workout pauses and opens a numeric editor from 0 to
  the step target. Save-and-continue and save-and-end record the exact count, per side.
  Cancel leaves the session paused. Partial reps affect volume/bodyweight summaries,
  history and recovery. Invalid/stale/duplicate submissions are rejected.
- Full planar body rig: `bodyRig.ts` uses fixed upper/lower arm and leg lengths plus
  fixed torso and neck lengths. Authored poses guide IK keyframes; joint angles are
  interpolated continuously to avoid branch flips and collapsing limbs. Keyframes are
  cached. Wide windmill and squat stances have explicit rig settings. The lowest foot
  tracks floor/jump height. The old forearm-only module is removed.
  This is a stylized 2-D skeleton, not clinical anatomical or technique certification.
  Some projected contact/stance details still need qualified human/device review.
- Responsive execution: workout/rest screens scroll when content exceeds the viewport;
  hero size adapts to available height and font scale, status/buttons wrap, primary
  buttons support multiline text. Keep fullscreen route, cyan/lime accents and no arrows.
- Ready screen shows the full expanded exercise order, side targets, equipment/load,
  rounds, rest behavior and estimated duration before the start button.
- Tests now cover partial rep totals/recovery/stale sides, 32,032 sampled poses with
  constant segment lengths, canvas bounds and continuous motion, unmount during initial
  checkpoint saving and failed checkpoint acknowledgement. These are automated adapter
  tests, not device E2E tests. TypeScript, both suites and iOS export are the local gates.
- Physical phone validation remains required: small screens, accessibility font sizes,
  rep modal/keyboard, lifecycle interruption, audio and native sharing.

## Current status

The app is a real Expo / React Native mobile app for iOS and Android. It started as a kettlebell complex builder and is now expanding into a broader fitness product combining kettlebell, bodyweight, workout execution, progress, achievements, social sharing and future group training.

Current package version: `0.5.0`
Expo SDK: `57`
React Native: `0.86.3`
React: `19.2.3`

Latest verified GitHub Actions run is green: #80 for `f335ab9`. Validation includes:
- npm install
- Expo package alignment
- Expo Doctor
- TypeScript

## Current working name

The app is currently branded in code as **MOVEWRK**, but this is NOT considered final.

Important naming findings:
- MOVEWRK is too close to existing MOVEWORK software/trademark usage and should probably be replaced before launch.
- KETTLEFLOW is already used by a fitness app and should not be used.
- User wants a short, simple, globally usable brand — not Sweden-specific.
- Name directions the user has liked or explicitly raised:
  - **GRYND** (user chose this direction from a previous top-10)
  - similar names to GRYND
  - **DRVN**
  - **FORGD** — user asked for availability checking
- Next naming task: perform a real global clearance-style search across web, App Store, Google Play, trademark databases and domains before committing to a new name.
- Do not assume any candidate is clear until checked.

## Product direction

Core product loop:
**Open → Train → Complete → Progress → Achievement → Share → Return**

The product should be social without becoming a social network.

Focus new features on:
- training execution
- progression
- retention
- achievements
- lightweight social motivation
- sharing / organic distribution

Do not turn the product into a generic gym tracker or full social feed.

## Social / community decisions

Planned direction:
- Accounts eventually via Apple / Google / email
- Guest mode can exist initially
- Default identity can be an automatically generated anonymous alias
- User can optionally choose a display name
- No profile picture needed
- No location information needed
- Training performance and achievements should form the user's identity
- Scheduled group workouts
- Group workout screen should show number of participants
- Quick messages / reactions before and after group workouts
- No live chat during the workout itself
- No general DM system in MVP
- Potential future DMs only between mutually accepted "Training Partners"
- Achievements / milestones are an important retention mechanic

## Monetization direction

Preferred model:
- Free + PRO
- No ads initially
- Earlier working price idea: roughly 59 SEK/month or 499 SEK/year (not final)

Free should keep:
- core workout builder
- timers
- basic training execution
- simple history / logging

PRO should add recurring value such as:
- advanced programs
- progression
- richer statistics
- larger template/program library
- scheduling
- recommendations
- later social/group features where appropriate

Development order:
**MVP → public release → PRO/social expansion**

## Current app capabilities

### Workout builder
- Create custom workouts / complexes
- Drag-and-drop reorder
- No positional up/down arrows
- Reps or timed exercises
- Side modes:
  - Left
  - Right
  - Alternate
  - L + R
- Weight
- Rounds
- Rest between rounds
- Responsive controls on small iPhone screens
- Saved workouts / templates
- Pinned favorites
- Custom exercises
- Exercise favorites
- Search and category filtering

### Exercise selection update — 2026-09-29

- `app/exercises.tsx` uses vertical Equipment and Movement category dropdowns,
  search and a favorites switch. There are no horizontal filter lists.
- Equipment options: Kettlebell + Bodyweight, Kettlebell, Bodyweight.
- Each exercise has a real checked state derived from the current workout.
  Selection adds once; unchecking removes all occurrences of that exercise.
  Existing duplicate entries are counted and the removal behavior is labeled.
- Selection remains current across filters and detail navigation; the fixed Done
  button shows the total selected across all equipment, with bottom safe-area padding.
- Names/illustrations open technique, muscle focus and difficulty information.
  Builder exercise names also open the same detail route.
- `src/data/exercisePairings.ts` provides three explained, clickable suggestions
  for every built-in exercise (96 links). Bodyweight suggestions need no equipment.
  Suggestions have checkboxes synchronized with the workout.
- `src/components/Dropdown.tsx` is reused for equipment, categories and templates.
  Template selection is vertical; saved workouts remain accessible separately.
- `toggleExerciseSelection` in WorkoutContext atomically adds/removes selection;
  other entries, weights, rounds and rep settings are preserved.
- TypeScript, iOS export and pairing/selection checks pass. Physical-phone interaction and
  keyboard/layout validation remain pending; changes are local until GitHub push.

### Audit fixes — 2026-09-29 (local, after 91f13b0)

Remote main was rechecked before editing and remains `a5087f5f6fcd8e38bb671425e773ec4d88abe138`.
This section supersedes affected implementation details in the earlier reliability update.

1. **Concurrent edits:** `updateStored` serializes the complete validated read/modify/write
   operation. Custom exercises, saved plans, favorites, settings and history use it.
   Custom creation has an immediate in-flight guard. Saved plans no longer silently cap at 75.
2. **Recovery:** failed history writes go to a separately persisted, deduplicated pending queue.
   The active checkpoint is removed only after history or pending storage succeeds. The result
   page allows returning to the builder even if saving fails; an unsaved checkpoint still takes
   priority on reopening. History offers retry, archive-before-reset and native text export of
   all original/backup values. Damaged active checkpoints also have archive/reset recovery.
   If storage itself refuses every write, a new session cannot safely replace the active one.
3. **Timing:** the live clock is `performance.now()`. Calendar changes cannot progress or
   freeze a workout. Restored sessions rebase the monotonic timestamp and remain paused.
   IDs and `finishedAt` use calendar time separately. New history uses `monotonic-v2`.
4. **Detailed results:** history stores round, index, exercise ID/name, equipment, side, mode,
   target, confirmed reps, timed seconds, step work time and completion state. Actual finish
   time is retained through retries. History details are scrollable; legacy results are retained.
5. **Comparisons:** compare only work time for matching completed v2 sessions; show rest and
   pause values separately and explain that faster is not inherently better technique.
6. **Animation — partially addressed:** all 32 movements now stabilize projected forearm
   lengths while retaining authored grip paths and limiting elbows to the floor plane. Biceps,
   triceps, quads, hamstrings, hip flexors, chest, upper back and lats use distinct drawn zones.
   Fixed two-bone arm IK was tried and rejected because it bent swing/overhead lockouts.
   Upper arms, legs and trunk still use authored projection. **A full anatomical rig and
   qualified movement review are NOT complete.** Do not represent these as verified teaching
   animations. The red zones are schematic, not a physiological activation measurement.
7. **Quick workouts:** all equipment/experience/focus combinations now alter actual exercise
   selection and/or reps, holds and rest. Estimates still depend on rep pace, and weight is
   reviewed by the user before starting.
8. **Complete results/sharing:** the app displays every recorded step; the 9:16 share card
   is intentionally condensed to four bodyweight rows with an explicit remaining count and
   full totals. Card typography/spacing scales down on narrower screens.

Validation: TypeScript, `test:core`, deterministic provider/lifecycle integration tests,
32 × 101 animation samples, four rendered poses per exercise, and Expo iOS export pass.
Integration tests execute real provider/hook modules with mocked React/native adapters:
concurrent creates/deletes, retention beyond 75 plans, pending results, preserved archives,
archive-write failure, idempotent retries, wall-clock jumps, background pause, remount and
checkpoint acknowledgement. Both suites are added to `.github/workflows/validate.yml`.
These are not device E2E tests. Still verify iPhone/Android UI, VoiceOver/font scaling, audio,
background/kill timing and share-sheet behavior. Text-export size limits depend on receiver.
No GitHub push has succeeded; all new changes remain local.

### Reliability and usability update — 2026-09-29 (local)

Remote `main` rechecked: `a5087f5f6fcd8e38bb671425e773ec4d88abe138`.
The animation/picker commits and this update remain local; do not assume GitHub contains them.

- `src/workout/session.ts` is the pure timestamp-based workout engine. It snapshots
  the plan/catalog, records confirmed reps and actual timed work, and separates work,
  rest and paused time. Countdown is excluded. Skips/early finishes produce partial results.
- `src/hooks/useWorkoutSession.ts` checkpoints once per second and on transitions,
  pauses on background/unmount, restores paused, and serializes checkpoint writes.
  Sudden process termination can lose up to the latest checkpoint interval. Recovery
  does not count unobserved offline time as exercise.
- Completion history is written before removing the checkpoint. Session IDs prevent
  duplicate entries after retries/recovery; failures remain visible with retry controls.
- `src/storage/store.ts` and `validation.ts` validate saved data, isolate failed keys,
  serialize writes and protect unreadable originals from default-state overwrites.
  Recovery of genuinely corrupt data still requires a dedicated repair/export UI.
- Results/share cards show actual completed rounds, reps and bodyweight seconds.
  Partial sessions are labeled. Comparable history requires the same expanded plan,
  load, rest settings and new time basis; legacy entries are preserved but excluded.
- Pause works for timed and rep exercises; animations/audio stop while paused.
  End-workout confirmation offers continue, save partial, or discard. Backtracking
  replaces the previous result while retaining time actually spent.
- Builder offers a saved-session entry point, undo removal, and reviewed quick-workout
  plans by equipment/time/experience/focus. Estimates depend on rep pace.
- Custom exercises support Bodyweight. Exercise pairings rank missing movement
  categories ahead of already selected exercises and explain the current-plan context.
- Approved figure styling and authored poses remain. Left/right presentation, alternating
  cycles and reduced-motion support are added. A fixed-bone IK trial was rejected after
  visual inspection because it degraded several poses. A consistent anatomical rig and
  qualified movement-technique review remain separate follow-up work.
- Verification: `npm run typecheck`, `npm run test:core`, and Expo iOS export.
  Core tests cover delays, pauses, manual rest, partial/skip/back results, recovery,
  real epoch timestamps, quick-plan variants, fingerprints, validators and storage failures.
  This is not a physical-device test: validate background/kill/reopen, audio, small-screen
  layouts, swipe/back behavior, undo, and sharing on iOS/Android before release.

### Workout execution
- Fullscreen workout route
- Designed so the phone can be placed at a distance
- Large exercise illustration / animation
- 3-second start countdown
- Large reps / timer display
- Side indicator
- Next-exercise preview
- Automatic timed-exercise progression
- Automatic round rest
- Optional manual continue after rest
- Audio cues
- Optional voice cues
- Spoken countdown option
- Haptics
- Keep-awake during workout
- Run again
- History logging

### Rest behavior
Setting:
`manualContinueAfterRest`

Default: false

When false:
- next round starts automatically when rest reaches zero

When true:
- rest stops at zero
- user presses Continue

### Language
The product is now intended to be **English-only**.
- Swedish language selector removed from onboarding
- Swedish language selector removed from Settings
- voice language forced to `en-US`
- old saved Swedish settings are migrated to English
- some Swedish copy/types may still remain in source as legacy code and can be cleaned later

## Exercise library

### Kettlebell / loaded
Current library includes at least:
- Kettlebell Swing
- Single-Arm Swing
- Clean
- Snatch
- High Pull
- Strict Press
- Push Press
- Clean & Press
- Bent Over Row
- Deadlift
- Romanian Deadlift
- Goblet Squat
- Front Squat
- Reverse Lunge
- Thruster
- Halo
- Around the World
- Suitcase Hold
- Rack Hold
- Farmer March
- Front Rack March
- Floor Press
- Windmill

### Bodyweight
Current library includes:
- Air Squat
- Push-Up
- Plank
- Side Plank
- Glute Bridge
- Mountain Climber
- Burpee
- High Knees
- Bodyweight Reverse Lunge

Bodyweight and kettlebell exercises can be mixed in the same workout.

## Bodyweight visual identity

Kettlebell / loaded movements use the existing lime-green accent.

Bodyweight uses a separate cyan/blue identity:
- `colors.bodyweight = #55C7FF`
- `colors.bodyweightSoft = #153544`
- bodyweight templates are blue
- bodyweight exercise cards are blue
- bodyweight exercise glyphs / fullscreen body lines are blue
- bodyweight progress indication can use blue

Important logic:
- bodyweight reps count toward total reps
- bodyweight reps do NOT count toward kettlebell load volume
- pure bodyweight workouts hide the kettlebell weight control

## Built-in templates

Current preset system is data-driven via `src/data/presets.ts`.

Current presets:
- C·P·S — Clean · Press · Squat
- Simple 5
- Swing 20
- KB Strength
- KB Engine
- Legs + Core
- BW Basics
- BW HIIT
- BW Core

Workout templates are selected through a vertical dropdown; there is no horizontal preset bar.

Future goal:
- build toward roughly 30–50 quality launch templates
- categories could include:
  - Quick 10
  - Strength
  - Conditioning
  - Bodyweight
  - Kettlebell
  - Core
  - Beginner
  - later EMOM / AMRAP / Tabata style structures if added

## Workout summary / completion screen

When a workout is complete:
- fullscreen / near-fullscreen result experience
- 9:16 branded share card
- total time
- average time per round
- total reps
- kettlebell load volume when relevant
- bodyweight total reps
- bodyweight total timed work
- bodyweight breakdown by exercise, e.g.:
  - Push-Up — 40 reps
  - Air Squat — 60 reps
  - Plank — 2:00
- comparison against previous matching workout

Current share card component:
`src/components/WorkoutShareCard.tsx`

Current brand component:
`src/components/BrandMark.tsx`

## Sharing / organic growth

Implemented:
- render workout result card to PNG using `react-native-view-shot`
- Save image to Photos using `expo-media-library`
- Share image via native share sheet using `expo-sharing`

Share sheet can surface installed apps such as:
- Instagram
- Facebook
- TikTok
- X
- Messages
- others

Important future distinction:
- native share sheet is implemented
- true one-tap direct share to specific targets such as Instagram Story / TikTok with prefilled content may require deeper native/deep-link integrations and likely a custom development/release build rather than Expo Go

The strategic goal is that shared result cards become free brand distribution.

## Current brand visuals

The existing temporary MOVEWRK visual system:
- dark background
- lime green for kettlebell / loaded training
- cyan / blue for bodyweight
- geometric two-color mark
- compact wordmark
- premium / performance-focused look
- 9:16 social result cards

A concept image was generated in chat, but it accidentally displayed "KETTLEFLOW". The visual direction was liked; the name was not retained.

## Smartwatch roadmap

Saved future direction:
1. Apple Health
2. Apple Watch companion
3. Health Connect / Wear OS
4. Garmin

Architecture recommendation:
Build workout execution around neutral workout events so wearable clients can subscribe later. Example events:
- `exerciseChanged`
- `timerUpdated`
- `restStarted`
- `workoutFinished`

Desired watch experience:
- current exercise
- side
- reps / timer
- pulse when available
- pause / next
- haptic transitions

Long-term:
- standalone watch workout mode may come later

## Progression / retention ideas

High-priority future features:
- progression recommendations based on previous sessions
- achievements
- milestones
- streaks
- program structure
- workout categories
- more polished exercise animations
- group workouts
- social result sharing

Example future progression:
"Last time: 5×5 Clean & Press @ 20 kg. Today: 5×6 or 22 kg."

## Exercise animation

**User-approved style (2026-09-29):** The filled SVG silhouette, depth shading,
coral muscle markers, cyan bodyweight and lime kettlebell styling are approved
for every exercise. See `ANIMATION_STYLE.md` for the saved specification and
complete 32-exercise coverage list. Use it for all future exercise additions.

Current:
- native SVG figures
- lightweight animated movement
- fullscreen hero size in workout mode
- larger movement amplitude than original version
- dedicated visuals for several bodyweight movements

### Saved animation direction — next implementation priority

Implementation progress (2026-09-29, local commits pending GitHub write access):
- All 32 built-in exercises (23 loaded, 9 bodyweight) now resolve by exercise ID
  to their own pose sequence and curated schematic muscle focus.
- `src/animation/exercisePoses.ts` owns poses, timing, equipment, focus areas,
  static holds and smooth interpolation. `src/components/PoseExerciseFigure.tsx`
  renders tapered limbs, torso, connected neck, foreground/background depth,
  floor shadow and a shaded kettlebell attached to the working hand.
- Muscle areas use the accepted coral red `#E96B73`. The markers are schematic
  regions, not precise anatomy or measured activation. Bodyweight stays cyan;
  loaded equipment stays lime. Bodyweight rendering never includes a bell.
- Former shared visuals now have distinct motion profiles (e.g. side plank,
  mountain climber, push press, thruster, clean & press, single-arm swing).
- Plank, side plank, rack hold and suitcase hold use static poses. Other motions
  reset on exercise changes and stop when unmounted or animation is disabled.
- The exercise detail illustration is larger and has an English muscle legend.
  All builder, library, detail and workout callers pass the exercise ID.
- Unknown custom exercises use a generic visual without unverified muscle
  highlights; they need their own mapping to receive specific muscle focus.
- Verification: TypeScript, 3,232 sampled poses across all 32 exercises, matching
  equipment, muscle coverage, finite coordinates and continuous loop endpoints.
  Four key poses per exercise were rendered and visually inspected. Expo iOS
  production export also passed. Web export cannot run with the existing
  dependency set because react-native-web is absent; no dependencies changed. Device
  performance and physical-iPhone visual validation remain pending.
- Next: review the new animation library on iPhone and refine technique/poses
  based on that review. Do not restore the old whole-glyph transforms.

### Original animation brief (retained for reference)

The current animations are not detailed enough to teach or clearly demonstrate the real movement. In several exercises the whole glyph moves rather than the body performing the movement joint-by-joint.

The next animation system should be pose / joint based:
- animate hips, knees, shoulders, elbows and wrists independently
- animate the kettlebell separately from the body
- use a realistic kettlebell path for each exercise
- clearly show start position, loading phase, drive / working phase, end position and return
- prioritize technical readability over decorative motion
- keep the existing fullscreen workout presentation and lightweight SVG approach where practical

Examples:
- Swing: clear hip hinge → hip drive → bell arc → return into hinge
- Clean: bell travels close to the body and rotates smoothly into rack rather than simply moving upward
- Snatch: visible pull, hand insertion / turnover and overhead lockout
- Squat: visible hip and knee flexion with torso / bell position maintained correctly
- Deadlift: hinge pattern with bell travelling vertically close to the body

First exercises to rebuild with the improved system:
1. Kettlebell Swing
2. Clean
3. Snatch
4. Clean & Press
5. Goblet Squat
6. Deadlift
7. Bent Over Row
8. Reverse Lunge

Once the pose / joint system works well for these movements, reuse the same architecture across the rest of the exercise library.

This is one of the highest-value polish areas before public launch and is the next major visual implementation task.

## Storage / architecture

Current app is offline-first.

Local storage includes:
- current workout
- saved workouts
- workout history
- custom exercises
- favorite exercises
- settings

AsyncStorage is used.

No backend/account/cloud sync yet.

## History

Current history supports:
- completed workout log
- duration
- reps
- load volume
- plan snapshot where available
- repeat previous plan
- 7-day activity graph

## Local development

User develops from Windows.

Local repo:
`C:\Users\Christopher\kettlebell-complex-mobile`

Current physical-iPhone workflow works with Expo Go SDK 57 through tunnel.

Commands:
```powershell
cd C:\Users\Christopher\kettlebell-complex-mobile
git switch main
git pull origin main
npm install
npx expo start --tunnel --go
```

Use `-c` only if cache problems occur:
```powershell
npx expo start --tunnel --go -c
```

LAN previously failed; tunnel solved it.

User currently has no Mac and no Apple Developer Program membership.

## Current dependencies relevant to recent work

- Expo ~57.0.25
- React 19.2.3
- React Native 0.86.3
- expo-router ~57.0.23
- expo-audio ~57.0.5
- expo-speech ~57.0.3
- expo-haptics ~57.0.3
- expo-keep-awake ~57.0.2
- expo-sharing ~57.0.22
- expo-media-library ~57.0.5
- react-native-view-shot 5.1.0
- AsyncStorage 2.2.0
- react-native-svg 15.15.4
- react-native-draggable-flatlist 4.0.3

## Package identifiers

Current app.json still contains legacy identifiers:
- slug: `kettlebell-complex`
- scheme: `kettlebellcomplex`
- iOS bundle ID: `com.kettlebellcomplex.mobile`
- Android package: `com.kettlebellcomplex.mobile`

These MUST be renamed once the final global brand name is chosen.

## Important source files

- `app/index.tsx` — main builder
- `app/workout.tsx` — workout runner + completion + sharing
- `app/exercises.tsx` — exercise library
- `app/exercise-detail.tsx`
- `app/history.tsx`
- `app/settings.tsx`
- `app/onboarding.tsx`
- `app/saved.tsx`
- `src/context/WorkoutContext.tsx`
- `src/data/exercises.ts`
- `src/data/presets.ts`
- `src/components/ExerciseGlyph.tsx`
- `src/components/WorkoutShareCard.tsx`
- `src/components/BrandMark.tsx`
- `src/workout/steps.ts`
- `src/theme.ts`
- `src/types.ts`

## Next recommended actions

1. Finalize a globally usable brand name.
   - Current promising directions from user: GRYND-like, DRVN, FORGD.
   - Check actual availability before using:
     - exact and similar trademarks
     - EUIPO / WIPO / relevant national databases
     - Apple App Store
     - Google Play
     - .com and relevant domains
     - major social handles
2. Replace temporary MOVEWRK branding once final name is chosen.
3. Replace slug, scheme, bundle identifier and Android package.
4. Refine app icon / logo around final name.
5. Expand templates to 30–50 quality workouts.
6. Improve movement animations.
7. Add achievements / milestones / streaks.
8. Design progression engine.
9. Later add accounts, group workouts and social layer.
10. Keep wearable architecture in mind while refactoring workout engine.

## Continuity instruction for a new chat

When continuing this project in another ChatGPT chat:
- treat this file and GitHub `main` as authoritative
- fetch the latest file before modifying it
- do not use old ZIP artifacts
- do not revert to Expo SDK 54
- do not restore Swedish as a selectable app language
- do not restore reorder arrows
- preserve bodyweight blue vs kettlebell green distinction
- preserve fullscreen workout behavior
- preserve bodyweight-specific summary logic
- preserve share-card functionality
- do not treat MOVEWRK as final naming
