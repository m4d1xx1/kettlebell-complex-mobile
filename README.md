# Kettlebell Complex Mobile — v0.4 Beta Candidate

A focused mobile-native kettlebell complex builder and workout runner for iOS and Android.

## Product principle

**Build → configure → train → review → repeat.**

The app is intentionally narrower than a generic gym tracker. It is designed around kettlebell complexes, clear sequencing, side handling, timers and fast repeatable workouts.

## v0.4 highlights

### First-run onboarding
- Three-step onboarding
- Swedish or English UI
- Personal default kettlebell weight
- Personal default number of rounds
- Personal default round rest
- Sound / voice / haptic preference setup
- Existing v0.3 cue preferences migrate forward

### Complete UI localization
- Swedish and English app interface
- Localized navigation and controls
- Localized history dates
- Localized exercise categories and difficulty
- Swedish exercise descriptions and technique cues
- Voice cues can independently use Swedish or English

Exercise names remain standard kettlebell terminology (Swing, Clean, Snatch, etc.) so the library maps cleanly to common training terminology.

### Personal training defaults
- Presets inherit the user's default weight, rounds and rest
- Builder can reapply personal defaults with one tap
- Defaults remain editable in Settings

### Movement presentation
- Native SVG exercise illustrations
- Lightweight movement animation in exercise detail, workout preview and active workout
- No downloaded video assets or network dependency

### Workout mode
- Three-second start countdown
- Reps and timed exercises
- Left / right / alternating / L+R execution
- Automatic round rest
- Audio cues
- Optional voice coaching
- Haptics
- Screen stays awake
- Animated current exercise
- Next-step preview

### Improved workout summary
- Total time
- Average time per round
- Total reps
- Load volume
- Comparison with the most recent matching logged workout
- Completed workout automatically saved to history

### Library and templates
- Search
- Categories
- Favorite exercises
- Technique details
- Custom exercises
- Saved complexes
- Pinned favorite templates

### History
- Duration, reps and load volume
- Seven-day activity graph
- Repeat previous v0.3/v0.4 workouts when a plan snapshot exists

## Offline-first

Core use is local and offline:
- current complex
- saved templates
- exercise favorites
- custom exercises
- settings
- history

No account or backend is required for the beta candidate.

## Run locally

Use a current Node.js 22 release compatible with Expo SDK 57.

```bash
npm install
npx expo install --fix
npm run typecheck
npx expo-doctor
npx expo start
```

Test on:
- Expo Go where supported
- iOS Simulator
- Android Emulator
- preferably a real iPhone and Android device before public beta

## Remaining release work

Before TestFlight / Play Store internal testing:
- replace example bundle identifiers
- device-test audio behavior and silent-mode behavior
- test drag-and-drop on small Android devices
- review Swedish copy on-device
- add privacy policy and store metadata
- add crash reporting / analytics only if wanted
- produce store screenshots
- run EAS preview builds

## GitHub CI

The repository includes `.github/workflows/validate.yml`.

Every push / pull request runs:
- `npm install`
- `npx expo install --check`
- `npx expo-doctor@latest`
- `npm run typecheck`

This is the authoritative dependency/type validation when the local environment is unavailable.

## iPhone development build

A real-device iOS development build is configured in `eas.json`.

```bash
npm install
npx expo login
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile development
```

After EAS finishes, open the provided install link/QR code on the registered iPhone.
An Apple Developer Program membership is required for signing a custom iOS build.


## Free iPhone testing with Xcode Personal Team

You can install and test the app on your own iPhone without a paid Apple Developer Program membership by building locally on a Mac with Xcode.

Requirements:
- Mac with a current Xcode version
- Apple Account signed into Xcode
- iPhone connected to the Mac
- Node.js 22.13 or newer
- Developer Mode enabled on the iPhone

Setup:

```bash
git clone https://github.com/m4d1xx1/kettlebell-complex-mobile.git
cd kettlebell-complex-mobile
npm install
npm run ios:prebuild
open ios/*.xcworkspace
```

In Xcode:
1. Open **Xcode > Settings > Accounts** and sign in with your Apple Account.
2. Select the app project and the main app target.
3. Open **Signing & Capabilities**.
4. Enable **Automatically manage signing**.
5. Select your **Personal Team**.
6. If Xcode reports that the bundle identifier is unavailable, replace it with a unique reverse-DNS identifier.
7. Connect the iPhone, select it as the run destination, and press **Run**.

On iOS 16 or later, enable **Settings > Privacy & Security > Developer Mode** if prompted.

After the first native build, normal JavaScript/TypeScript changes usually do not require recompiling the native app. Start the development server with:

```bash
npm run ios:start
```

Then open Kettlebell Complex on the iPhone.

Free Personal Team provisioning is temporary. Apple currently limits free provisioning profiles to 7 days, after which the app must be rebuilt and reinstalled.
