# DAYBRAVE — v0.5.0

A workout companion for getting back into training, even when life is busy.
Build short kettlebell or bodyweight workouts, train at home or at the gym,
and track completed sessions. The app is English-only, built with Expo SDK 57
and React Native for iOS and Android.

DAYBRAVE is the provisional name selected on 2026-09-29. Trademark review is
incomplete. `main` and `PROJECT_HANDOFF.md` are the source of truth for project status.

## Current app

- Quick workouts, custom plans, saved workouts and 22 built-in templates (11 kettlebell and 11 bodyweight).
- Vertical equipment/category dropdowns, exercise checkboxes, technique details
  and explained exercise pairings. Drag to reorder; no reorder arrows.
- Joint-based SVG animations for all 32 movements, with continuous motion, shaded
  figures/equipment and coral muscle zones.
- Cyan bodyweight and lime kettlebell styling in the existing dark layout.
- Fullscreen execution with reps/timers, side handling, countdowns, optional manual
  continuation after rest, sound, voice cues and haptics.
- Actual rep entry, partial results, pause/resume and interrupted-workout recovery.
- Workout history, repeat sessions, bodyweight-specific totals and 9:16 share cards.
- Save summary images to Photos or share them through the native share sheet.
- Offline-first storage. No account or backend is required. Group workouts,
  achievements and longer-term progression remain roadmap items.

## Run on iPhone from Windows

Use a current Node.js 22 release compatible with Expo SDK 57 and Expo Go with
support for this SDK. From the existing checkout:

```powershell
cd C:\Users\Christopher\kettlebell-complex-mobile
git switch main
git pull origin main
npm install
npx expo start --tunnel --go
```

Scan the QR code with the iPhone camera and open it in Expo Go. Keep the terminal
and PC running during the session. If Metro has a stale cache, retry with `-c`.
The Expo tunnel attempted from the assistant environment did not connect;
there is no active hosted demo link.

### Short functional demo

1. Finish onboarding if prompted.
2. Open **Workout templates**, set **Equipment** to **Bodyweight**, and preview
   **Bodyweight Basics**. Tap **Use this template**. Save any current draft first
   if you want to keep it; replacing the builder plan requires confirmation.
3. Set **Rounds** to **1** and review the workout before starting.
4. Run Air Squat (8), Bodyweight Reverse Lunge (8 total, alternating legs), Push-Up (4),
   Glute Bridge (10), and Plank (20 seconds).
5. Check animations, pause/resume, actual rep entry, summary and history.
6. Try **Save image** and **Share image** from the completed workout.

This is a test setup using the existing preset. The full phone workflow still
needs user validation; local checks and rendered previews are not device tests.

## Validation

```bash
npm run typecheck
npm run test:core
npm run test:integration
npm run test:templates
npm run test:motion
npx expo install --check
npx expo-doctor@latest
```

GitHub Actions runs these checks on pushes and pull requests. Local release checks
also include an iOS export. Expo Go cannot validate every native permission or
production-build behavior; test a signed build before release.

## Identity and stored data

The displayed name is DAYBRAVE. During the provisional rename, the repository,
Expo slug/scheme, native application IDs, npm package name and `kb.*` storage keys
retain their existing values. This preserves the existing project and local data.
Choose final release IDs and any migration deliberately before publishing.

## Native development builds

`eas.json` includes development, preview and production profiles. A signed physical
iPhone development build needs the appropriate Apple signing setup. Once installed,
start its JavaScript server with `npm run ios:start`.

## Before launch

- Complete physical-device testing: small screens, large text, keyboard, interruption,
  recovery, audio, photo saving and sharing.
- Review movement technique and contact alignment with qualified human input.
- Finish trademark checks and final branding/release identifiers.
- Prepare privacy policy, store metadata and screenshots.
- Keep account/group features and monetization separate from the current offline MVP.
