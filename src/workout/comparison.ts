import { WorkoutHistoryEntry } from '../types';
import { WorkoutSession, sessionSummary } from './session';
export function compareWork(session: WorkoutSession, history: WorkoutHistoryEntry[]) {
  if (session.status !== 'completed') return null;
  const previous = history.find(entry => entry.sessionId !== session.id && entry.status === 'completed' && entry.timeBasis === 'monotonic-v2' && entry.fingerprint === session.fingerprint && entry.workSeconds !== undefined);
  if (!previous) return null;
  return { previous, workDelta: sessionSummary(session).workSeconds - previous.workSeconds! };
}
