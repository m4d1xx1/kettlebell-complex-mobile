import { AppSettings } from '../types';
import type { AutoTiming } from './session';

/** Resolve legacy settings exactly as the workout runner does. */
export function timingFromSettings(settings: Pick<AppSettings, 'autoAdvanceExercises' | 'secondsPerRep' | 'transitionSeconds'>): AutoTiming | undefined {
  return (settings.autoAdvanceExercises ?? true)
    ? { secondsPerRep: settings.secondsPerRep ?? 3, transitionSeconds: settings.transitionSeconds ?? 5 }
    : undefined;
}
