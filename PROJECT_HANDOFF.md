# PROJECT HANDOFF — Fitness App

Last updated: 2026-09-26
Repository: https://github.com/m4d1xx1/kettlebell-complex-mobile
Authoritative branch: `main`

## Current status

The app is a real Expo / React Native mobile app for iOS and Android. It started as a kettlebell complex builder and is now expanding into a broader fitness product combining kettlebell, bodyweight, workout execution, progress, achievements, social sharing and future group training.

Current package version: `0.5.0`
Expo SDK: `57`
React Native: `0.86.3`
React: `19.2.3`

Latest verified GitHub Actions runs are green through run #76. Validation includes:
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

The preset bar is horizontally scrollable.

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

Current:
- native SVG figures
- lightweight animated movement
- fullscreen hero size in workout mode
- larger movement amplitude than original version
- dedicated visuals for several bodyweight movements

Still needs improvement:
- current animations often move the whole glyph rather than individual joints / kettlebell path
- future polish should animate body segments and implement more anatomically precise movement paths

This is one of the highest-value polish areas before public launch.

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
