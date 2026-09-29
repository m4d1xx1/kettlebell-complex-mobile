import { useCallback, useState } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { readStored } from '../storage/store';
import { validSession, WorkoutSession } from '../workout/session';
import { colors } from '../theme';
export function ResumeWorkoutNotice() {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [failed, setFailed] = useState(false);
  useFocusEffect(useCallback(() => {
    let live = true;
    void readStored('kb.activeSession.v1', validSession).then(value => { if (live) { setSession(value); setFailed(false); } }).catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, []));
  if (!session && !failed) return null;
  return <Pressable accessibilityRole="button" onPress={() => router.push('/workout')} style={{ padding: 16, gap: 6, backgroundColor: colors.accentSoft, borderRadius: 16 }}>
    <Text style={{ color: colors.accent, fontWeight: '900' }}>{failed ? 'Review workout recovery' : session?.phase === 'done' ? 'Finish saving workout' : 'Resume saved workout'}</Text>
    {session && <Text style={{ color: colors.text }}>{session.plan.name} · Round {session.round} of {session.plan.rounds}</Text>}
    <Text style={{ color: colors.muted, fontSize: 12 }}>Your saved workout takes priority over a new session.</Text>
  </Pressable>;
}
