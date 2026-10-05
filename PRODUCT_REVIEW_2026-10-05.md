# DAYBRAVE — product review and validation direction

Date: 2026-10-05. Review baseline: draft timer PR #1 (`be1d891`) on main
`b2e2cca`. No Higgsfield generation, dependency changes, account system, analytics,
payments, main merge or production deployment in this change.

## Product hypothesis (not established market fit)

Help time-constrained people returning to training complete a short, understandable
session with one kettlebell, with bodyweight as a fallback. Existing English UI and
lime/cyan identity stay. The promise to test is less setup and less interaction
during a workout, not AI coaching, detected reps, rehabilitation or a unique timer.

Official public evidence checked 2026-10-05:
- Nike Training Club: 200+ free workouts/programs, guided 5–50 minute classes.
  https://www.nike.com/se/ntc-app
- Freeletics: adapts sessions for time, equipment/space and difficulty.
  https://help.freeletics.com/hc/en-us/articles/360003933780-Adapt-your-Bodyweight-training-session
- Seconds: customizable intervals, voice cues, offline timers, one-time Pro unlock.
  https://www.intervaltimer.com/app

These are published product claims, not hands-on competitor tests or proof of
DAYBRAVE demand. No pricing or subscriber forecasts should be inferred.

## Implemented first slice

1. Shared `timingFromSettings` and `calculatePlanStats` now apply rep pace, side
   splits, exercise switches, round rest and the initial three-second countdown.
   Manual estimates retain an assumed 2.6 seconds/rep. Pauses/manual waits are extra.
2. Quick workouts choose the nearest whole-round duration with the same estimator.
   The requested “about 10 min” is a target, not a guaranteed duration cap.
3. Home puts “Review & start” above the catalogue/editor for a nonempty draft.
   The runner review remains mandatory; no automatic workout start is introduced.
4. Builder rep/remove controls, shared steppers and segmented options have at least
   44-point targets. Increment/decrement buttons have names/roles/disabled bounds;
   segments expose selected state and can wrap. Full accessibility is NOT certified.
5. Successful workout saving has visual confirmation (not only optional haptics).
6. Settings update returns a success flag. Failed onboarding save does not navigate
   away or mutate the draft as if setup succeeded; duplicate finish taps are guarded.
7. History aggregate totals disclose guided/estimated reps if present.

## Remaining backlog, ordered by risk and learning value

| Priority | Finding / evidence | Next action / acceptance |
| --- | --- | --- |
| Before beta | Native hands-free loop not physically verified; 30Hz screen updates and 1s persistence | Test a 15–20min pass on physical older and current phones; check heat, lag, background pause, recovery, audio, save, guided counters. Profile before performance redesign. |
| Before beta | One global seconds/rep governs all movements; 5s switch is universal | Observe floor/standing and left/right transitions. Let users choose comfortable pace; test per-movement tempo only if needed. Do not market the pace as technique coaching. |
| Before beta | Pose rig has known foot/hand contact limitations; training content not independently validated | Have a qualified trainer review the limited beta catalogue and side counts. No paid high-fidelity animation yet. |
| High | Onboarding asks weight (default24), rounds5, rest60 before equipment choice | Prototype equipment-first with explicit user-selected load; defer advanced defaults. Do not quietly change existing users' stored settings. |
| High | Empty home still needs four quick-workout choices after three onboarding screens | Observe first-run completion; simplify to equipment+time with visible sensible level/focus defaults if users stall. |
| High | Habit support is history-heavy: totals and bars but no clear next session | Test a simple repeat-last-session card + optional easy/right/hard feedback before a generated progression programme. |
| High | Static 2D poses may not explain unfamiliar movement to a returning beginner | Test comprehension with 3–5 trainer-reviewed movements, text cues and existing figures. Fix content before cosmetic video production. |
| Medium | Small 10–13px secondary labels remain in cards/history; drag-only reorder | Native large text/VoiceOver/TalkBack audit and accessible reorder alternative without resurrecting rejected arrow controls. |
| Medium | Recovery tools appear above the history value proposition | Keep recovery visible on error; move normal maintenance lower after beta failure-path tests. |
| Medium | Fullscreen runner has no confirmed screen-lock/background continuation | Current behavior auto-pauses when backgrounded. State this in beta instructions; do not claim screen-off hands-free. |
| Medium | Save creates a new copy; no explicit replace/name distinction | Test repeat/save behavior with an existing user before changing storage semantics. |
| Later | Local-only data; no validated cross-device restore UX | Explain beta data limitations. Do not rush accounts, cloud sync or social features ahead of retained use. |

## Two-week directional pilot

Recruit 10 people matching the narrow target, not only friends who like the idea.
Obtain consent for observation; no hidden tracking. Begin with observed onboarding,
then independent home use. Include a no-equipment day to test the fallback.

Predeclare these as decision heuristics, NOT industry benchmarks or proof of PMF:
- 8/10 reach the workout review unaided within 60 seconds of opening a fresh app.
- 8/10 finish a short observed workout without an unintended tap or lost result.
- 6/10 voluntarily complete at least three sessions in week one.
- 5/10 return in week two without personal prompting to open the app.
- All observed saved results survive background/relaunch; any data-loss blocker
  stops expansion regardless of positive feedback.

Ask what they used before, what they would choose tomorrow, what they would miss,
where they stopped and why. Record start/review/completion/abort/pause/repeat manually
for the pilot. Do not count guided targets as measured physical reps. A later
explicit, real paid offer can test willingness to pay; no price is validated now.

Investment gate: after the behavior gates and interviews point to a repeatable use
case, commission ONLY 3–5 comparable animations. Test comprehension, confidence and
distraction against existing figures; scale the spend only if the new assets help.
If activation fails, simplify setup. If activation works but return use fails,
investigate usefulness/progression before visual polish.

## Verification scope

- TypeScript, core timing/storage, provider/lifecycle integration, 22 templates and
  32,032 motion samples; additional estimate/runner boundary, nearest-round and
  failed-settings-save regression cases.
- Actual screens with web/native adapters rendered at 390×844 and 320×844: home,
  onboarding welcome, catalogue, empty history; review CTA visible and increment
  targets >=44px. Workout active/pause/transition checks retained.
- Expo iOS export. This is packaging, NOT a native build, device performance test,
  screen-reader certification, exercise-technique approval or customer research.
- Draft code remains separate from main and the unfinished video-integration tree.
