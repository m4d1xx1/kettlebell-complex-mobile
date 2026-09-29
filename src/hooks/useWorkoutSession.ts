import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { ExerciseDefinition, WorkoutPlan } from '../types';
import { archiveAndReset, readStored, writeStored } from '../storage/store';
import { actOnSession, createSession, restoreSession, SessionAction, tickSession, validSession, WorkoutSession } from '../workout/session';
import { monotonicNow } from '../workout/clock';
const KEY = 'kb.activeSession.v1';
export function useWorkoutSession(enabled: boolean) {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readFailed, setReadFailed] = useState(false);
  const current = useRef<WorkoutSession | null>(null);
  const mounted = useRef(true);
  const acknowledged = useRef(false);
  const lastSaved = useRef(0);
  const busy = useRef(false);
  const lastAction = useRef(0);
  const report = useCallback((e: unknown) => { if (mounted.current) setError(e instanceof Error ? e.message : 'Could not save this workout. Keep the app open and retry.'); }, []);
  const persist = useCallback((s: WorkoutSession | null) => writeStored(KEY, s).then(() => { if (mounted.current) setError(null); }).catch(e => { report(e); throw e; }), [report]);
  const commit = useCallback((s: WorkoutSession, force = false) => {
    const old = current.current;
    current.current = s;
    if (mounted.current) setSession(s);
    if (acknowledged.current) return;
    const changed = old?.phase !== s.phase || old?.index !== s.index || old?.round !== s.round || old?.paused !== s.paused || old?.waiting !== s.waiting;
    if (force || changed || monotonicNow() - lastSaved.current >= 1000) {
      lastSaved.current = monotonicNow(); void persist(s).catch(() => undefined);
    }
  }, [persist]);
  const load = useCallback(async () => {
    setLoading(true); setReadFailed(false);
    try {
      const stored = await readStored(KEY, validSession);
      if (!mounted.current) return;
      const recovered = stored ? restoreSession(stored, monotonicNow()) : null;
      current.current = recovered; acknowledged.current = false; setSession(recovered); setError(null);
    } catch (e) { report(e); if (mounted.current) setReadFailed(true); }
    finally { if (mounted.current) setLoading(false); }
  }, [report]);
  useEffect(() => { mounted.current = true; if (enabled) void load(); return () => { mounted.current = false; }; }, [enabled, load]);
  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => {
      const s = current.current;
      if (!busy.current && s && s.phase !== 'done') commit(tickSession(s, monotonicNow()));
    }, 200);
    const subscription = AppState.addEventListener('change', state => {
      const s = current.current;
      if (!busy.current && s && s.phase !== 'done' && state !== 'active') commit(actOnSession(s, 'pause', monotonicNow()), true);
    });
    return () => {
      clearInterval(timer); subscription.remove();
      const s = current.current;
      if (s && !busy.current && !acknowledged.current) {
        const frozen = s.phase === 'done' ? s : actOnSession(s, 'pause', monotonicNow());
        current.current = frozen; void persist(frozen).catch(() => undefined);
      }
    };
  }, [enabled, commit, persist]);
  const start = async (plan: WorkoutPlan, catalog: ExerciseDefinition[], manualRest: boolean) => {
    if (loading || readFailed || busy.current || current.current) return;
    const s = createSession(plan, catalog, manualRest, monotonicNow());
    // Set synchronously to prevent rapid Start taps creating multiple sessions.
    current.current = s; acknowledged.current = false; busy.current = true;
    try { await persist(s); commit({ ...s, lastAt: monotonicNow(), paused: !mounted.current || AppState.currentState !== 'active' }, true); }
    catch { current.current = null; }
    finally { busy.current = false; }
  };
  const act = useCallback((action: SessionAction) => {
    if (busy.current) return;
    const s = current.current;
    const advances = ['next','skip','continue','back'].includes(action);
    const now = monotonicNow();
    if (advances && (now - lastAction.current < 500 || s?.index !== session?.index || s?.round !== session?.round || s?.phase !== session?.phase)) return;
    if (advances) lastAction.current = now;
    if (s) commit(actOnSession(s, action, now), true);
  }, [commit, session?.index, session?.round, session?.phase]);
  const discard = async () => {
    if (busy.current) return;
    busy.current = true;
    const s = current.current;
    if (s && s.phase !== 'done') commit(actOnSession(s, 'pause', monotonicNow()), true);
    try {
      await persist(null);
      acknowledged.current = true; current.current = null; setSession(null);
    } finally { busy.current = false; }
  };
  const acknowledge = async () => {
    acknowledged.current = true;
    try { await persist(null); } catch (error) { acknowledged.current = false; throw error; }
  };
  const recover = async () => { await archiveAndReset(KEY); await load(); };
  const retrySave = async () => { if (current.current) await persist(current.current); };
  return { session, loading, error, readFailed, start, act, discard, acknowledge, retrySave, retryLoad: load, recover };
}
