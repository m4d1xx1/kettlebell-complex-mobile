import * as Haptics from 'expo-haptics';
import { Asset, requestPermissionsAsync } from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { ExerciseGlyph } from '../src/components/ExerciseGlyph';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { WorkoutShareCard } from '../src/components/WorkoutShareCard';
import { useWorkout } from '../src/context/WorkoutContext';
import { useWorkoutCues } from '../src/hooks/useWorkoutCues';
import { useI18n } from '../src/i18n';
import { WorkoutHistoryEntry } from '../src/types';
import { colors, radius } from '../src/theme';
import { buildRoundSteps, calculateBodyweightSummary, calculatePlanStats, WorkoutStep } from '../src/workout/steps';
import { formatDuration } from '../src/utils/format';

type Phase = 'ready' | 'countdown' | 'exercise' | 'rest' | 'done';

export default function WorkoutScreen() {
  useKeepAwake();

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const heroSize = Math.min(width * 0.94, height * 0.50, 430);
  const readyHeroSize = Math.min(width * 0.72, 290);

  const { plan, exercises, completeWorkout, settings, history } = useWorkout();
  const { t } = useI18n();
  const cues = useWorkoutCues(settings);
  const roundSteps = useMemo(() => buildRoundSteps(plan, exercises), [plan, exercises]);
  const stats = useMemo(() => calculatePlanStats(plan, exercises), [plan, exercises]);
  const bodyweightSummary = useMemo(() => calculateBodyweightSummary(plan, exercises), [plan, exercises]);
  const hasKettlebell = useMemo(
    () => plan.items.some((item) => exercises.find((exercise) => exercise.id === item.exerciseId)?.equipment !== 'bodyweight'),
    [plan.items, exercises]
  );

  const hasBodyweight = bodyweightSummary.items.length > 0;
  const bodyweightOnly = hasBodyweight && !hasKettlebell;

  const [round, setRound] = useState(1);
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('ready');
  const [remaining, setRemaining] = useState(3);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [completedDuration, setCompletedDuration] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef<number | null>(null);
  const logged = useRef(false);
  const previousRef = useRef<WorkoutHistoryEntry | undefined>(undefined);
  const shareCardRef = useRef<View | null>(null);

  const step = roundSteps[stepIndex];
  const isBodyweightStep = step?.exercise.equipment === 'bodyweight';
  const totalSteps = Math.max(1, roundSteps.length * plan.rounds);
  const completed = Math.min(totalSteps, (round - 1) * roundSteps.length + stepIndex);
  const progress = phase === 'done' ? 1 : completed / totalSteps;

  const clearMainTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearElapsed = () => {
    if (elapsedRef.current) {
      clearInterval(elapsedRef.current);
      elapsedRef.current = null;
    }
  };

  const hapticImpact = (style: Haptics.ImpactFeedbackStyle) => {
    if (settings.haptics) Haptics.impactAsync(style);
  };

  const hapticSuccess = () => {
    if (settings.haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const sideLabel = (candidate?: WorkoutStep) => {
    if (!candidate || candidate.side === 'none') return '';
    if (candidate.side === 'left') return t('left').toUpperCase();
    if (candidate.side === 'right') return t('right').toUpperCase();
    return t('alternate').toUpperCase();
  };

  useEffect(() => () => {
    clearMainTimer();
    clearElapsed();
  }, []);

  useEffect(() => {
    const timedPhase =
      phase === 'countdown' ||
      phase === 'rest' ||
      (phase === 'exercise' && step?.mode === 'time');

    if (!timedPhase || paused || remaining <= 0) {
      clearMainTimer();
      return;
    }

    clearMainTimer();
    timerRef.current = setTimeout(() => {
      if (remaining > 1) {
        const next = remaining - 1;
        setRemaining(next);
        if (next <= 3) cues.cueCountdown(next);
        return;
      }

      setRemaining(0);
      cues.cueCountdown(0);

      if (phase === 'countdown') {
        hapticImpact(Haptics.ImpactFeedbackStyle.Heavy);
        enterStep(0, 1);
      } else if (phase === 'rest') {
        hapticSuccess();
        if (settings.manualContinueAfterRest) {
          setRemaining(0);
          setPaused(false);
        } else {
          enterStep(0, round + 1);
        }
      } else if (phase === 'exercise' && step?.mode === 'time') {
        hapticSuccess();
        advance();
      }
    }, 1000);

    return clearMainTimer;
  }, [phase, paused, remaining, step?.stepKey, round, settings.manualContinueAfterRest]);

  useEffect(() => {
    if (phase === 'exercise' && step) cues.announceStep(step);
  }, [phase, step?.stepKey]);

  useEffect(() => {
    if (phase === 'done' && !logged.current) {
      logged.current = true;
      clearElapsed();
      cues.announceComplete();
      completeWorkout({
        planName: plan.name,
        durationSeconds: completedDuration,
        weightKg: plan.weightKg,
        rounds: plan.rounds,
        exerciseCount: plan.items.length,
        totalReps: stats.totalReps,
        volumeKg: stats.volumeKg,
        plan: { ...plan, items: plan.items.map((x) => ({ ...x })) }
      });
    }
  }, [phase, completedDuration]);

  if (!step || !roundSteps.length) {
    return (
      <View style={[styles.centerPage, { paddingTop: Math.max(insets.top, 18), paddingBottom: Math.max(insets.bottom, 18) }]}>
        <Text style={styles.doneTitle}>{t('noWorkoutLoaded')}</Text>
        <PrimaryButton label={t('backBuilder')} onPress={() => router.replace('/')}/>
      </View>
    );
  }

  function startWorkout() {
    previousRef.current = history.find((x) =>
      x.planName === plan.name &&
      x.rounds === plan.rounds &&
      x.exerciseCount === plan.items.length
    );
    logged.current = false;
    startedAt.current = Date.now();
    setCompletedDuration(0);
    setElapsed(0);
    clearElapsed();
    elapsedRef.current = setInterval(() => setElapsed((x) => x + 1), 1000);
    setRound(1);
    setStepIndex(0);
    setPaused(false);
    setRemaining(3);
    setPhase('countdown');
    cues.cueCountdown(3);
  }

  function enterStep(targetIndex: number, targetRound: number) {
    const target = roundSteps[targetIndex];
    if (!target) return;
    clearMainTimer();
    setRound(targetRound);
    setStepIndex(targetIndex);
    setPaused(false);
    setRemaining(target.mode === 'time' ? target.value : 0);
    setPhase('exercise');
  }

  function beginRest() {
    clearMainTimer();
    setPaused(false);
    setRemaining(plan.restSeconds);
    setPhase('rest');
    cues.announceRest(plan.restSeconds, roundSteps[0]);
  }

  function finishWorkout() {
    const duration = Math.max(1, startedAt.current ? Math.round((Date.now() - startedAt.current) / 1000) : elapsed);
    setCompletedDuration(duration);
    setElapsed(duration);
    setPhase('done');
    hapticSuccess();
  }

  function advance() {
    clearMainTimer();
    setPaused(false);

    if (stepIndex < roundSteps.length - 1) {
      enterStep(stepIndex + 1, round);
      return;
    }

    if (round < plan.rounds) {
      if (plan.restSeconds > 0) beginRest();
      else enterStep(0, round + 1);
      return;
    }

    finishWorkout();
  }

  function goBack() {
    clearMainTimer();
    setPaused(false);

    if (phase === 'rest') {
      enterStep(roundSteps.length - 1, round);
      return;
    }

    if (stepIndex > 0) enterStep(stepIndex - 1, round);
    else if (round > 1) enterStep(roundSteps.length - 1, round - 1);
  }

  function resetWorkout() {
    clearMainTimer();
    clearElapsed();
    startedAt.current = null;
    setRound(1);
    setStepIndex(0);
    setRemaining(3);
    setPaused(false);
    setElapsed(0);
    setCompletedDuration(0);
    setPhase('ready');
    logged.current = false;
  }

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
        Alert.alert('Photo access needed', 'Allow MOVEWRK to save workout images to Photos.');
        return;
      }
      const uri = await captureSummaryImage();
      await Asset.create(uri);
      hapticSuccess();
      Alert.alert('Saved', 'Your MOVEWRK workout image was saved to Photos.');
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
        dialogTitle: 'Share your MOVEWRK workout'
      });
    } catch {
      Alert.alert('Could not share', 'Please try again.');
    }
  }

  if (phase === 'ready') {
    return (
      <View style={[styles.readyPage, { paddingTop: Math.max(insets.top, 18), paddingBottom: Math.max(insets.bottom, 18) }]}>
        <View style={styles.readyTop}>
          <Text style={[styles.kicker, bodyweightOnly && styles.bodyweightAccent]}>{t('ready')}</Text>
          <Text style={styles.readyTitle}>{plan.name}</Text>
          <Text style={styles.readyMeta}>
            {plan.rounds} {t('rounds').toLowerCase()} · {hasKettlebell ? `${plan.weightKg} kg · ` : ''}{roundSteps.length} {t('step').toLowerCase()} / {t('round').toLowerCase()}
          </Text>
        </View>

        <View style={styles.preview}>
          <ExerciseGlyph visual={step.exercise.visual} size={readyHeroSize} animated hero equipment={step.exercise.equipment ?? 'kettlebell'}/>
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

        <View style={styles.bottom}>
          <PrimaryButton label={t('startCountdown')} onPress={startWorkout}/>
          <Pressable onPress={() => router.replace('/')} style={styles.textButton}><Text style={styles.textButtonText}>{t('backBuilder')}</Text></Pressable>
        </View>
      </View>
    );
  }

  if (phase === 'countdown') {
    return (
      <View style={[styles.centerPage, { paddingTop: Math.max(insets.top, 18), paddingBottom: Math.max(insets.bottom, 18) }]}>
        <Text style={[styles.kicker, bodyweightOnly && styles.bodyweightAccent]}>{t('getReady')}</Text>
        <Text style={styles.countdown}>{remaining || 'GO'}</Text>
        <Text style={styles.doneMeta}>{step.exercise.name}{sideLabel(step) ? ` · ${sideLabel(step)}` : ''}</Text>
      </View>
    );
  }

  if (phase === 'done') {
    const previous = previousRef.current;
    const delta = previous ? completedDuration - previous.durationSeconds : null;
    const comparison = delta === null
      ? t('firstSession')
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
          planName={plan.name}
          completedDuration={completedDuration}
          rounds={plan.rounds}
          totalReps={stats.totalReps}
          weightKg={plan.weightKg}
          volumeKg={stats.volumeKg}
          hasKettlebell={hasKettlebell}
          bodyweightReps={bodyweightSummary.totalReps}
          bodyweightSeconds={bodyweightSummary.totalSeconds}
          bodyweightItems={bodyweightSummary.items}
        />

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
          <Text style={styles.compareLabel}>{t('vsLast')}</Text>
          <Text style={styles.compareValue}>{comparison}</Text>
        </View>

        <PrimaryButton label={t('runAgain')} onPress={resetWorkout}/>
        <Pressable onPress={() => router.replace('/history')} style={styles.outlineWide}><Text style={styles.outlineText}>{t('viewHistory')}</Text></Pressable>
        <Pressable onPress={() => router.replace('/')} style={styles.textButton}><Text style={styles.textButtonText}>{t('backBuilder')}</Text></Pressable>
      </ScrollView>
    );
  }

  if (phase === 'rest') {
    return (
      <View style={[styles.workoutPage, { paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Progress value={progress} color={bodyweightOnly ? colors.bodyweight : colors.accent}/>
        <View style={styles.statusRow}>
          <Text style={styles.status}>{t('round')} {round} / {plan.rounds}</Text>
          <Text style={styles.elapsed}>{formatDuration(elapsed)}</Text>
        </View>
        <View style={styles.main}>
          <Text style={styles.kicker}>{remaining === 0 && settings.manualContinueAfterRest ? t('restComplete') : t('roundComplete')}</Text>
          <Text style={styles.restLabel}>{t('rest')}</Text>
          <Text style={styles.timer}>{remaining}</Text>
          <Text style={styles.unit}>{t('seconds')}</Text>
          <Text style={styles.next}>{t('next')}: {roundSteps[0].exercise.name}{sideLabel(roundSteps[0]) ? ` · ${sideLabel(roundSteps[0])}` : ''}</Text>
        </View>
        <View style={styles.bottom}>
          {remaining > 0 ? (
            <Pressable onPress={() => setPaused((x) => !x)} style={styles.outlineWide}>
              <Text style={styles.outlineText}>{paused ? t('resume') : t('pause')}</Text>
            </Pressable>
          ) : null}
          <PrimaryButton
            label={remaining === 0 && settings.manualContinueAfterRest ? t('continue') : t('skipRest')}
            onPress={() => enterStep(0, round + 1)}
          />
        </View>
      </View>
    );
  }

  const displayedValue = step.mode === 'time' ? remaining : step.value;

  return (
    <View style={[styles.workoutPage, { paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 12) }]}>
      <Progress value={progress} color={isBodyweightStep ? colors.bodyweight : colors.accent}/>
      <View style={styles.statusRow}>
        <Text style={styles.status}>{t('round')} {round} / {plan.rounds}</Text>
        <Text style={styles.elapsed}>{formatDuration(elapsed)}</Text>
        <Text style={styles.status}>{stepIndex + 1} / {roundSteps.length}</Text>
      </View>

      <View style={styles.main}>
        <ExerciseGlyph visual={step.exercise.visual} size={heroSize} animated hero equipment={step.exercise.equipment ?? 'kettlebell'}/>
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
        <View style={styles.split}>
          <Pressable onPress={goBack} style={styles.outlineHalf}><Text style={styles.outlineText}>← {t('back')}</Text></Pressable>
          {step.mode === 'time' ? (
            <Pressable onPress={() => setPaused((x) => !x)} style={styles.outlineHalf}><Text style={styles.outlineText}>{paused ? t('resume') : t('pause')}</Text></Pressable>
          ) : <View style={{ flex: 1 }}/>}
        </View>
        <PrimaryButton label={stepIndex === roundSteps.length - 1 && round === plan.rounds ? t('finishWorkout') : t('doneNext')} onPress={advance}/>
        <Pressable onPress={() => router.replace('/')} style={styles.textButton}><Text style={styles.textButtonText}>{t('endWorkout')}</Text></Pressable>
      </View>
    </View>
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
  workoutPage: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  readyPage: { flex: 1, backgroundColor: colors.bg, padding: 20 },
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
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  status: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  elapsed: { color: colors.text, fontSize: 13, fontWeight: '900' },
  main: { flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center', gap: 4 },
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
  split: { flexDirection: 'row', gap: 10 },
  outlineWide: { minHeight: 52, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  outlineHalf: { flex: 1, minHeight: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
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
  compare: { backgroundColor: colors.panel, borderRadius: radius.lg, padding: 14, alignItems: 'center', gap: 4 },
  compareLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  compareValue: { color: colors.text, fontSize: 18, fontWeight: '900' }
});
