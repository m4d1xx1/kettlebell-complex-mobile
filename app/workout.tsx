import { APP_NAME } from '../src/brand';
import * as Haptics from 'expo-haptics';
import { Asset, requestPermissionsAsync } from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { WorkoutOverview } from '../src/components/WorkoutOverview';
import { RepResultSheet } from '../src/components/RepResultSheet';
import { ExerciseGlyph } from '../src/components/ExerciseGlyph';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { WorkoutShareCard } from '../src/components/WorkoutShareCard';
import { useWorkout } from '../src/context/WorkoutContext';
import { useWorkoutCues } from '../src/hooks/useWorkoutCues';
import { useWorkoutSession } from '../src/hooks/useWorkoutSession';
import { useI18n } from '../src/i18n';
import { colors, radius } from '../src/theme';
import { buildRoundSteps, calculateBodyweightSummary, calculatePlanStats, WorkoutStep } from '../src/workout/steps';
import { compareWork } from '../src/workout/comparison';
import { remainingSeconds, sessionSummary } from '../src/workout/session';
import { formatDuration } from '../src/utils/format';

export default function WorkoutScreen() {
  useKeepAwake();
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const heroSize = Math.max(100, Math.min(width * 0.7, (height - insets.top - insets.bottom - 580) / Math.max(1,fontScale), 280));
  const readyHeroSize = Math.min(width * 0.45, height * 0.2, 170);
  const { plan: draft, exercises, completeWorkout, settings, history, hydrated } = useWorkout();
  const { t } = useI18n();
  const cues = useWorkoutCues(settings);
  const engine = useWorkoutSession(hydrated);
  const { session } = engine;
  const plan = session?.plan ?? draft;
  const roundSteps = useMemo(() => session?.steps ?? buildRoundSteps(draft, exercises), [session?.steps, draft, exercises]);
  const actual = session ? sessionSummary(session) : null;
  const stats = actual ?? calculatePlanStats(plan, exercises);
  const bodyweightSummary = actual?.bodyweight ?? calculateBodyweightSummary(plan, exercises);
  const hasKettlebell = roundSteps.some(item => item.exercise.equipment !== 'bodyweight');
  const bodyweightOnly = roundSteps.length > 0 && !hasKettlebell;
  const round = session?.round ?? 1;
  const stepIndex = session?.index ?? 0;
  const phase = session?.phase ?? 'ready';
  const remaining = session ? remainingSeconds(session) : 3;
  const paused = session?.paused ?? false;
  const elapsed = actual?.durationSeconds ?? 0;
  const completedDuration = elapsed;
  const step = roundSteps[stepIndex];
  const isBodyweightStep = step?.exercise.equipment === 'bodyweight';
  const progress = (session?.results.filter(r => r.completed).length ?? 0) / Math.max(1, roundSteps.length * plan.rounds);
  const shareCardRef = useRef<View | null>(null);
  const logging = useRef<string | null>(null);
  const [repEntry, setRepEntry] = useState<{stepKey:string;round:number;name:string;target:number;ending:boolean} | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [pendingSave, setPendingSave] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saved = savedId === session?.id;
  const comparisonResult = session ? compareWork(session, history) : null;
  const previous = comparisonResult?.previous;

  const hapticSuccess = () => { if (settings.haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined); };
  const sideLabel = (candidate?: WorkoutStep) => !candidate || candidate.side === 'none' ? '' : candidate.side === 'left' ? t('left').toUpperCase() : candidate.side === 'right' ? t('right').toUpperCase() : t('alternate').toUpperCase();
  const previousCount = useRef(-1);
  useEffect(() => {
    if (paused || phase === 'ready' || phase === 'done') { cues.stop(); previousCount.current = -1; return; }
    if (remaining > 0 && remaining <= 3 && previousCount.current !== remaining) cues.cueCountdown(remaining);
    previousCount.current = remaining;
  }, [remaining, paused, phase]);
  useEffect(() => {
    if (paused) return;
    if (phase === 'exercise' && step) cues.announceStep(step);
    if (phase === 'rest') cues.announceRest(plan.restSeconds, roundSteps[0]);
    if (phase === 'done') { cues.announceComplete(); hapticSuccess(); }
  }, [phase, stepIndex, round, paused]);
  async function saveResult() {
    if (!session || session.phase !== 'done' || logging.current === session.id || saved) return;
    logging.current = session.id; setSaveError(null);
    const result = sessionSummary(session);
    try {
      const destination = await completeWorkout({ sessionId: session.id, status: session.status, timeBasis: 'monotonic-v2', fingerprint: session.fingerprint, completedAt: session.finishedAt,
        results: session.results.map(r => { const step = session.steps[r.index]; return { ...r, exerciseId: step.exercise.id, name: step.exercise.name, equipment: step.exercise.equipment ?? 'kettlebell', side: step.side, mode: step.mode, target: step.value }; }),
        planName: plan.name, durationSeconds: result.durationSeconds, weightKg: hasKettlebell ? plan.weightKg : 0, rounds: result.rounds,
        exerciseCount: new Set(session.results.filter(r => r.reps > 0 || r.seconds > 0 || r.completed).map(r => session.steps[r.index].exercise.id)).size,
        totalReps: result.totalReps, volumeKg: result.volumeKg, plan, workSeconds: result.workSeconds, restSeconds: result.restSeconds,
        pauseSeconds: result.pauseSeconds, wallSeconds: result.wallSeconds });
      await engine.acknowledge(); setPendingSave(destination === 'pending'); setSavedId(session.id);
    } catch (error) { setSaveError(error instanceof Error ? error.message : 'Could not save. Keep this screen open and retry.'); }
    finally { logging.current = null; }
  }
  useEffect(() => { if (phase === 'done') void saveResult(); }, [phase, session?.id]);
  async function startWorkout() {
    try { await engine.start(draft, exercises, settings.manualContinueAfterRest); }
    catch (error) { Alert.alert('Cannot start workout', error instanceof Error ? error.message : 'Review your workout and try again.'); }
  }
  function enterReps(ending = false) {
    if (!session || phase !== 'exercise' || step.mode !== 'reps') return;
    engine.act('pause');
    setRepEntry({stepKey:step.stepKey,round:session.round,name:`${step.exercise.name}${sideLabel(step) ? ` · ${sideLabel(step)}` : ''}`,target:step.value,ending});
  }
  function advance() { engine.act('next'); }
  function goBack() {
    engine.act('pause');
    Alert.alert('Restart previous exercise?', 'Its previous result will be replaced when you complete it again. Time already spent remains included.', [
      { text: 'Cancel', style: 'cancel' }, { text: 'Restart', onPress: () => engine.act('back') }
    ]);
  }
  async function resetWorkout() { if (!saved) return; try { await engine.discard(); setSavedId(null); setSaveError(null); } catch {} }
  function endWorkout() {
    if (!session) { router.replace('/'); return; }
    if (phase === 'done') { router.replace('/'); return; }
    engine.act('pause');
    Alert.alert('End workout?', 'Save recorded work or discard this session. For a rep exercise you can enter the reps completed before saving.', [
      { text: 'Continue', style: 'cancel', onPress: () => engine.act('resume') },
      { text: 'Save partial', onPress: () => phase === 'exercise' && step.mode === 'reps' ? enterReps(true) : engine.act('finish-partial') },
      { text: 'Discard', style: 'destructive', onPress: () => { void engine.discard().then(() => router.replace('/')).catch(() => undefined); } }
    ]);
  }
  useEffect(() => { const sub = BackHandler.addEventListener('hardwareBackPress', () => { endWorkout(); return true; }); return () => sub.remove(); });
  const togglePause = () => engine.act(paused ? 'resume' : 'pause');
  const saveNotice = engine.error || saveError ? <View style={styles.compare}><Text style={styles.safety}>{saveError ?? engine.error}</Text><PrimaryButton compact label="Retry saving" onPress={() => { if (phase === 'done') void saveResult(); else void engine.retrySave().catch(() => undefined); }}/></View> : null;

  if (engine.loading) return <View style={styles.centerPage}><ActivityIndicator color={colors.accent}/><Text style={styles.doneMeta}>Restoring workout…</Text></View>;
  if (engine.readFailed) return <View style={styles.centerPage}><Text style={styles.doneMeta}>{engine.error}</Text><PrimaryButton label="Retry recovery" onPress={() => { void engine.retryLoad(); }}/><PrimaryButton label="Archive damaged copy and start fresh" onPress={() => Alert.alert('Preserve and reset this workout?', 'The original will remain available through Export data and recovery copies in History.', [{text:'Cancel',style:'cancel'},{text:'Archive and reset',onPress:()=> { void engine.recover().catch(() => Alert.alert('Recovery failed', 'The original has not been discarded.')); }}])}/><PrimaryButton label="Back" onPress={() => router.replace('/')}/></View>;
  if (!step || !roundSteps.length) return <View style={styles.centerPage}><Text style={styles.doneTitle}>{t('noWorkoutLoaded')}</Text><PrimaryButton label={t('backBuilder')} onPress={() => router.replace('/')}/></View>;

  async function captureSummaryImage() {
    if (!shareCardRef.current) throw new Error('Workout summary is not ready.');
    return captureRef(shareCardRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile'
    });
  }

  async function saveSummaryImage() {
    try {
      const permission = await requestPermissionsAsync(true, ['photo']);
      if (!permission.granted) {
        Alert.alert('Photo access needed', `Allow ${APP_NAME} to save workout images to Photos.`);
        return;
      }
      const uri = await captureSummaryImage();
      await Asset.create(uri);
      hapticSuccess();
      Alert.alert('Saved', `Your ${APP_NAME} workout image was saved to Photos.`);
    } catch {
      Alert.alert('Could not save image', 'Please try again.');
    }
  }

  async function shareSummaryImage() {
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
        return;
      }
      const uri = await captureSummaryImage();
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        UTI: 'public.png',
        dialogTitle: `Share your ${APP_NAME} workout`
      });
    } catch {
      Alert.alert('Could not share', 'Please try again.');
    }
  }

  if (phase === 'ready') {
    return (
      <ScrollView style={styles.readyPage} contentContainerStyle={{ padding:20, paddingTop: Math.max(insets.top, 18), paddingBottom: Math.max(insets.bottom, 18), gap:20 }} showsVerticalScrollIndicator>
        <View style={styles.readyTop}>
          <Text style={[styles.kicker, bodyweightOnly && styles.bodyweightAccent]}>{t('ready')}</Text>
          <Text style={styles.readyTitle}>{plan.name}</Text>
          <Text style={styles.readyMeta}>
            {plan.rounds} {t('rounds').toLowerCase()} · {hasKettlebell ? `${plan.weightKg} kg · ` : ''}{roundSteps.length} {t('step').toLowerCase()} / {t('round').toLowerCase()}
          </Text>
        </View>

        <View style={styles.preview}>
          <ExerciseGlyph exerciseId={step.exercise.id} visual={step.exercise.visual} size={readyHeroSize} animated side={step.side} hero equipment={step.exercise.equipment ?? 'kettlebell'}/>
          <Text style={styles.previewLabel}>{t('firstUp')}</Text>
          <Text style={styles.previewName}>{step.exercise.name}</Text>
          {sideLabel(step) ? <Text style={[styles.sideBadge, isBodyweightStep && styles.bodyweightBadge]}>{sideLabel(step)}</Text> : null}
          <Text style={styles.previewTarget}>{step.value} {step.mode === 'reps' ? t('reps').toLowerCase() : t('sec')}</Text>
          <View style={styles.cueStatus}>
            <Text style={styles.cueStatusText}>
              {settings.soundCues ? '●' : '○'} {t('soundCues')}   {settings.voiceCues ? '●' : '○'} {t('voiceCues')}   {settings.haptics ? '●' : '○'} {t('haptics')}
            </Text>
          </View>
        </View>

        <WorkoutOverview plan={plan} steps={roundSteps} manualRest={settings.manualContinueAfterRest}/>
        <View style={styles.bottom}>
          {saveNotice}
          <PrimaryButton label={t('startCountdown')} onPress={startWorkout}/>
          <Pressable onPress={endWorkout} style={styles.textButton}><Text style={styles.textButtonText}>{t('backBuilder')}</Text></Pressable>
        </View>
      </ScrollView>
    );
  }

  if (phase === 'countdown') {
    return (
      <View style={[styles.centerPage, { paddingTop: Math.max(insets.top, 18), paddingBottom: Math.max(insets.bottom, 18) }]}>
        <Text style={[styles.kicker, bodyweightOnly && styles.bodyweightAccent]}>{t('getReady')}</Text>
        <Text style={styles.countdown}>{remaining || 'GO'}</Text>
        {saveNotice}
        <PrimaryButton label={paused ? 'Resume countdown' : 'Pause countdown'} onPress={togglePause}/>
        <Pressable onPress={endWorkout} style={styles.textButton}><Text style={styles.textButtonText}>End workout</Text></Pressable>
        <Text style={styles.doneMeta}>{step.exercise.name}{sideLabel(step) ? ` · ${sideLabel(step)}` : ''}</Text>
      </View>
    );
  }

  if (phase === 'done') {
    const delta = comparisonResult?.workDelta ?? null;
    const comparison = delta === null
      ? 'No comparable completed session yet'
      : Math.abs(delta) < 2
        ? '±0:00'
        : `${formatDuration(Math.abs(delta))} ${delta < 0 ? t('faster') : t('slower')}`;

    return (
      <ScrollView
        style={styles.doneScroll}
        contentContainerStyle={[
          styles.doneContent,
          { paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 24) }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <WorkoutShareCard
          ref={shareCardRef}
          completedAt={session?.finishedAt}
          planName={plan.name}
          completedDuration={completedDuration}
          rounds={actual?.rounds ?? 0}
          partial={session?.status === 'partial'}
          totalReps={stats.totalReps}
          weightKg={plan.weightKg}
          volumeKg={stats.volumeKg}
          hasKettlebell={hasKettlebell}
          bodyweightReps={bodyweightSummary.totalReps}
          bodyweightSeconds={bodyweightSummary.totalSeconds}
          bodyweightItems={bodyweightSummary.items}
        />

        <View style={styles.bodyweightSummary}>
          <Text style={styles.bodyweightSummaryTitle}>COMPLETE EXERCISE RESULTS</Text>
          {session?.results.map(result => { const item = session.steps[result.index]; return <View key={`${result.round}:${result.index}`} style={styles.bodyweightSummaryRow}>
            <Text style={styles.bodyweightSummaryName}>R{result.round} · {item.exercise.name}{item.side !== 'none' ? ` · ${item.side}` : ''}</Text>
            <Text style={styles.bodyweightSummaryValue}>{item.mode === 'reps' ? `${result.reps}/${item.value} reps` : `${formatDuration(Math.floor(result.seconds))}/${formatDuration(item.value)}`}{result.completed ? '' : ' · Partial / skipped'}</Text>
          </View>; })}
        </View>
        <View style={styles.shareActions}>
          <Pressable onPress={saveSummaryImage} style={styles.shareButton}>
            <Text style={styles.shareButtonIcon}>↓</Text>
            <Text style={styles.shareButtonText}>Save image</Text>
          </Pressable>
          <Pressable onPress={shareSummaryImage} style={[styles.shareButton, styles.shareButtonPrimary]}>
            <Text style={[styles.shareButtonIcon, styles.shareButtonPrimaryText]}>↗</Text>
            <Text style={[styles.shareButtonText, styles.shareButtonPrimaryText]}>Share</Text>
          </Pressable>
        </View>
        <Text style={styles.shareTargets}>Instagram · Facebook · TikTok · X · Messages · More</Text>

        <View style={styles.compare}>
          <Text style={styles.compareLabel}>WORK TIME VS LAST MATCHING WORKOUT</Text>
          <Text style={styles.compareValue}>{comparison}</Text>
          <Text style={styles.doneMeta}>Faster is not always better. Prioritize controlled technique.</Text>
          {previous && <Text style={styles.doneMeta}>Rest {formatDuration(actual?.restSeconds ?? 0)} vs {formatDuration(previous.restSeconds ?? 0)} · Pauses {formatDuration(actual?.pauseSeconds ?? 0)} vs {formatDuration(previous.pauseSeconds ?? 0)}</Text>}
        </View>

        <Text style={styles.doneMeta}>{saved ? pendingSave ? 'Saved locally · waiting for history recovery' : 'Saved to history' : 'Saving workout…'}</Text>
        {saveNotice}
        <Text style={styles.doneMeta}>Work {formatDuration(actual?.workSeconds ?? 0)} · Rest {formatDuration(actual?.restSeconds ?? 0)} · Paused {formatDuration(actual?.pauseSeconds ?? 0)}</Text>
        <PrimaryButton label={t('runAgain')} disabled={!saved} onPress={resetWorkout}/>
        <Pressable disabled={!saved} onPress={() => router.replace('/history')} style={styles.outlineWide}><Text style={styles.outlineText}>{t('viewHistory')}</Text></Pressable>
        <Pressable onPress={endWorkout} style={styles.textButton}><Text style={styles.textButtonText}>{t('backBuilder')}</Text></Pressable>
      </ScrollView>
    );
  }

  if (phase === 'rest') {
    return (
      <ScrollView style={styles.workoutPage} contentContainerStyle={{flexGrow:1,padding:16,paddingTop:Math.max(insets.top,12),paddingBottom:Math.max(insets.bottom,12),gap:12}} showsVerticalScrollIndicator>
        <Progress value={progress} color={bodyweightOnly ? colors.bodyweight : colors.accent}/>
        <View style={styles.statusRow}>
          <Text style={styles.status}>{t('round')} {round} / {plan.rounds}</Text>
          <Text style={styles.elapsed}>{formatDuration(elapsed)}</Text>
        </View>
        <View style={styles.main}>
          <Text style={styles.kicker}>{remaining === 0 && session?.manualRest ? t('restComplete') : t('roundComplete')}</Text>
          <Text style={styles.restLabel}>{t('rest')}</Text>
          <Text style={styles.timer}>{remaining}</Text>
          <Text style={styles.unit}>{t('seconds')}</Text>
          <Text style={styles.next}>{t('next')}: {roundSteps[0].exercise.name}{sideLabel(roundSteps[0]) ? ` · ${sideLabel(roundSteps[0])}` : ''}</Text>
        </View>
        <View style={styles.bottom}>
          {saveNotice}
          {remaining > 0 ? (
            <Pressable onPress={togglePause} style={styles.outlineWide}>
              <Text style={styles.outlineText}>{paused ? t('resume') : t('pause')}</Text>
            </Pressable>
          ) : null}
          <PrimaryButton
            label={remaining === 0 && session?.manualRest ? t('continue') : t('skipRest')}
            onPress={() => engine.act('continue')}
          />
          <Pressable onPress={endWorkout} style={styles.textButton}><Text style={styles.textButtonText}>End workout</Text></Pressable>
        </View>
      </ScrollView>
    );
  }

  const displayedValue = step.mode === 'time' ? remaining : step.value;

  return (
    <ScrollView style={styles.workoutPage} contentContainerStyle={{flexGrow:1,padding:16,paddingTop:Math.max(insets.top,12),paddingBottom:Math.max(insets.bottom,12),gap:12}} showsVerticalScrollIndicator>
      {repEntry && <RepResultSheet name={repEntry.name} target={repEntry.target} ending={repEntry.ending} onCancel={()=>setRepEntry(null)} onSave={reps=>{if(engine.act({type:'record-reps',reps,stepKey:repEntry.stepKey,round:repEntry.round,endWorkout:repEntry.ending}))setRepEntry(null);}}/>}
      <Progress value={progress} color={isBodyweightStep ? colors.bodyweight : colors.accent}/>
      <View style={styles.statusRow}>
        <Text style={styles.status}>{t('round')} {round} / {plan.rounds}</Text>
        <Text style={styles.elapsed}>{formatDuration(elapsed)}</Text>
        <Text style={styles.status}>{paused ? 'PAUSED · ' : ''}{stepIndex + 1} / {roundSteps.length}</Text>
      </View>

      <View style={styles.main}>
        <ExerciseGlyph exerciseId={step.exercise.id} visual={step.exercise.visual} size={fontScale > 1.3 || height < 700 ? Math.min(heroSize,150) : heroSize} animated={!paused} side={step.side} hero equipment={step.exercise.equipment ?? 'kettlebell'}/>
        {sideLabel(step) ? <Text style={[styles.sideBadge, isBodyweightStep && styles.bodyweightBadge]}>{sideLabel(step)}</Text> : null}
        <Text style={styles.exerciseName}>{step.exercise.name}</Text>
        <Text style={styles.target}>{displayedValue}</Text>
        <Text style={styles.unit}>{step.mode === 'reps' ? t('reps').toLowerCase() : t('seconds')}</Text>
        {step.exercise.equipment !== 'bodyweight' ? (
          <View style={styles.weightPill}><Text style={styles.weightText}>{plan.weightKg} kg</Text></View>
        ) : null}
        {nextStepText(stepIndex, roundSteps, round, plan.rounds, t('next'), t('roundRest'), sideLabel) ? (
          <Text style={styles.nextExercise}>{nextStepText(stepIndex, roundSteps, round, plan.rounds, t('next'), t('roundRest'), sideLabel)}</Text>
        ) : null}
      </View>

      <View style={styles.bottom}>
        {saveNotice}
        <View style={styles.split}>
          <Pressable onPress={goBack} style={styles.outlineHalf}><Text style={styles.outlineText}>← {t('back')}</Text></Pressable>
          {(
            <Pressable onPress={togglePause} style={styles.outlineHalf}><Text style={styles.outlineText}>{paused ? t('resume') : t('pause')}</Text></Pressable>
          )}
        </View>
        <PrimaryButton disabled={paused} label={step.mode === 'time' && remaining > 0 ? 'Finish step early' : stepIndex === roundSteps.length - 1 && round === plan.rounds ? t('finishWorkout') : t('doneNext')} onPress={advance}/>
        {step.mode === 'reps' && <Pressable accessibilityRole="button" onPress={() => enterReps()} style={styles.textButton}><Text style={styles.textButtonText}>Record a different rep count</Text></Pressable>}
        <Pressable disabled={paused} onPress={() => engine.act('skip')} style={styles.textButton}><Text style={styles.textButtonText}>Skip exercise</Text></Pressable>
        <Pressable onPress={endWorkout} style={styles.textButton}><Text style={styles.textButtonText}>{t('endWorkout')}</Text></Pressable>
      </View>
    </ScrollView>
  );
}

function nextStepText(
  index: number,
  steps: WorkoutStep[],
  round: number,
  rounds: number,
  nextLabel: string,
  restLabel: string,
  sideLabel: (step?: WorkoutStep) => string
) {
  if (index < steps.length - 1) {
    const next = steps[index + 1];
    return `${nextLabel} · ${next.exercise.name}${sideLabel(next) ? ` · ${sideLabel(next)}` : ''}`;
  }
  if (round < rounds) return `${nextLabel} · ${restLabel.toLowerCase()}`;
  return '';
}

function Progress({ value, color = colors.accent }: { value: number; color?: string }) {
  return <View style={styles.progressTrack}><View style={[styles.progressBar, { width: `${Math.max(0, Math.min(1, value)) * 100}%`, backgroundColor: color }]}/></View>;
}

function DoneStat({ label, value, tone = 'kettlebell' }: { label: string; value: string; tone?: 'kettlebell' | 'bodyweight' }) {
  return (
    <View style={[styles.doneStat, tone === 'bodyweight' && styles.doneStatBodyweight]}>
      <Text style={[styles.doneStatLabel, tone === 'bodyweight' && styles.bodyweightAccent]}>{label}</Text>
      <Text style={styles.doneStatValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  workoutPage: { flex: 1, backgroundColor: colors.bg },
  readyPage: { flex: 1, backgroundColor: colors.bg },
  readyTop: { gap: 5 },
  readyTitle: { color: colors.text, fontSize: 31, fontWeight: '900' },
  readyMeta: { color: colors.muted, fontSize: 14 },
  preview: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  previewLabel: { color: colors.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1.3, marginTop: 12 },
  previewName: { color: colors.text, fontSize: 30, fontWeight: '900', textAlign: 'center' },
  previewTarget: { color: colors.muted, fontSize: 16, fontWeight: '800', marginTop: 3 },
  cueStatus: { marginTop: 12, backgroundColor: colors.panel, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  cueStatusText: { color: colors.muted, fontSize: 9, fontWeight: '800', textAlign: 'center' },
  progressTrack: { height: 7, borderRadius: 5, backgroundColor: colors.card, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: colors.accent },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  status: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  elapsed: { color: colors.text, fontSize: 13, fontWeight: '900' },
  main: { flexGrow: 1, flexShrink: 0, alignItems: 'center', justifyContent: 'center', gap: 4 },
  kicker: { color: colors.accent, fontSize: 12, fontWeight: '900', letterSpacing: 1.7, textAlign: 'center' },
  exerciseName: { color: colors.text, fontSize: 30, textAlign: 'center', fontWeight: '900', marginTop: 2 },
  sideBadge: { color: colors.accentText, backgroundColor: colors.accent, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, fontSize: 11, fontWeight: '900', letterSpacing: 1.2, overflow: 'hidden' },
  bodyweightBadge: { color: colors.bodyweightText, backgroundColor: colors.bodyweight },
  bodyweightAccent: { color: colors.bodyweight },
  target: { color: colors.text, fontSize: 88, lineHeight: 92, fontWeight: '900', marginTop: 2 },
  timer: { color: colors.text, fontSize: 92, lineHeight: 100, fontWeight: '900', marginTop: 6 },
  countdown: { color: colors.text, fontSize: 120, lineHeight: 130, fontWeight: '900', textAlign: 'center' },
  restLabel: { color: colors.text, fontSize: 30, fontWeight: '900', marginTop: 6 },
  unit: { color: colors.muted, fontSize: 15, fontWeight: '800' },
  weightPill: { marginTop: 12, paddingHorizontal: 18, minHeight: 42, borderRadius: 22, backgroundColor: colors.card, justifyContent: 'center' },
  weightText: { color: colors.text, fontWeight: '900' },
  next: { color: colors.muted, marginTop: 20, fontSize: 14, textAlign: 'center' },
  nextExercise: { color: colors.muted, marginTop: 12, fontSize: 12, fontWeight: '700' },
  bottom: { gap: 8 },
  split: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  outlineWide: { minHeight: 52, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  outlineHalf: { flex: 1, minWidth: 120, padding:12, minHeight: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  outlineText: { color: colors.text, fontWeight: '900' },
  textButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  textButtonText: { color: colors.muted, fontWeight: '800' },
  centerPage: { flex: 1, backgroundColor: colors.bg, alignItems: 'stretch', justifyContent: 'center', padding: 22, gap: 16 },
  doneScroll: { flex: 1, backgroundColor: colors.bg },
  doneContent: { paddingHorizontal: 14, gap: 14, flexGrow: 1 },
  doneTitle: { color: colors.text, fontSize: 34, textAlign: 'center', fontWeight: '900' },
  doneMeta: { color: colors.muted, fontSize: 15, textAlign: 'center' },
  savedNotice: { color: colors.accent, textAlign: 'center', fontSize: 12, fontWeight: '800' },
  doneStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 6 },
  doneStat: { width: '48%', flexGrow: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  doneStatBodyweight: { backgroundColor: colors.bodyweightSoft, borderColor: colors.bodyweight },
  doneStatLabel: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  doneStatValue: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 4 },
  bodyweightSummary: { backgroundColor: colors.bodyweightSoft, borderWidth: 1, borderColor: colors.bodyweight, borderRadius: radius.lg, padding: 14, gap: 10 },
  bodyweightSummaryHeader: { gap: 3, marginBottom: 2 },
  bodyweightSummaryTitle: { color: colors.bodyweight, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  bodyweightSummaryMeta: { color: colors.text, fontSize: 18, fontWeight: '900' },
  bodyweightSummaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 10 },
  bodyweightSummaryName: { color: colors.text, fontSize: 14, fontWeight: '800', flex: 1 },
  bodyweightSummaryValue: { color: colors.bodyweight, fontSize: 13, fontWeight: '900' },
  shareActions: { flexDirection: 'row', gap: 10 },
  shareButton: { flex: 1, minHeight: 54, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  shareButtonPrimary: { backgroundColor: colors.accent, borderColor: colors.accent },
  shareButtonIcon: { color: colors.text, fontSize: 19, fontWeight: '900' },
  shareButtonText: { color: colors.text, fontSize: 14, fontWeight: '900' },
  shareButtonPrimaryText: { color: colors.accentText },
  shareTargets: { color: colors.muted, fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: -5 },
  safety: { color: colors.danger, fontSize: 12, textAlign: 'center' },
  compare: { backgroundColor: colors.panel, borderRadius: radius.lg, padding: 14, alignItems: 'center', gap: 4 },
  compareLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  compareValue: { color: colors.text, fontSize: 18, fontWeight: '900' }
});
