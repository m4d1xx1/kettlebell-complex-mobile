import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NumberStepper } from '../src/components/NumberStepper';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { SegmentedControl } from '../src/components/SegmentedControl';
import { useWorkout } from '../src/context/WorkoutContext';
import { translate } from '../src/i18n';
import { UILanguage } from '../src/types';
import { colors, radius } from '../src/theme';

export default function OnboardingScreen() {
  const { settings, updateSettings, setPlan } = useWorkout();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<UILanguage>(settings.uiLanguage);
  const [weight, setWeight] = useState(settings.defaultWeightKg);
  const [rounds, setRounds] = useState(settings.defaultRounds);
  const [rest, setRest] = useState(settings.defaultRestSeconds);
  const [soundCues, setSoundCues] = useState(settings.soundCues);
  const [voiceCues, setVoiceCues] = useState(settings.voiceCues);
  const [haptics, setHaptics] = useState(settings.haptics);

  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const languages = [
    { value: 'en' as const, label: 'English' },
    { value: 'sv' as const, label: 'Svenska' }
  ];

  async function finish() {
    const voiceLanguage = language === 'sv' ? 'sv-SE' as const : 'en-US' as const;
    await updateSettings({
      uiLanguage: language,
      voiceLanguage,
      onboardingComplete: true,
      defaultWeightKg: weight,
      defaultRounds: rounds,
      defaultRestSeconds: rest,
      soundCues,
      voiceCues,
      haptics
    });
    setPlan((p) => ({ ...p, weightKg: weight, rounds, restSeconds: rest }));
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <View style={styles.progress}>
          {[0, 1, 2].map((x) => <View key={x} style={[styles.progressSegment, x <= step && styles.progressActive]}/>)}
        </View>

        <Text style={styles.step}>{t('step')} {step + 1} {t('of')} 3</Text>

        <ScrollView
          style={styles.scroller}
          contentContainerStyle={styles.scrollerContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 0 ? (
            <View style={styles.content}>
              <View style={styles.logo}><Text style={styles.logoText}>KB</Text></View>
              <Text style={styles.title}>{t('welcomeTitle')}</Text>
              <Text style={styles.body}>{t('welcomeBody')}</Text>
              <View style={styles.block}>
                <Text style={styles.label}>{t('chooseLanguage')}</Text>
                <SegmentedControl value={language} options={languages} onChange={setLanguage}/>
              </View>
            </View>
          ) : null}

          {step === 1 ? (
            <View style={styles.content}>
              <Text style={styles.kicker}>{t('trainingDefaults').toUpperCase()}</Text>
              <Text style={styles.title}>{t('defaultsTitle')}</Text>
              <Text style={styles.body}>{t('defaultsBody')}</Text>
              <View style={styles.grid}>
                <NumberStepper label={t('defaultWeight')} value={weight} min={4} max={80} step={2} suffix="kg" haptics={haptics} onChange={setWeight}/>
                <NumberStepper label={t('defaultRounds')} value={rounds} min={1} max={30} haptics={haptics} onChange={setRounds}/>
                <NumberStepper label={t('defaultRest')} value={rest} min={0} max={600} step={15} suffix={t('sec')} haptics={haptics} onChange={setRest}/>
              </View>
            </View>
          ) : null}

          {step === 2 ? (
            <View style={styles.content}>
              <Text style={styles.kicker}>{t('workoutCues')}</Text>
              <Text style={styles.title}>{t('cuesTitle')}</Text>
              <Text style={styles.body}>{t('cuesBody')}</Text>
              <View style={styles.cueCard}>
                <CueRow title={t('soundCues')} body={t('soundCuesHelp')} value={soundCues} onChange={setSoundCues}/>
                <Divider/>
                <CueRow title={t('voiceCues')} body={t('voiceCuesHelp')} value={voiceCues} onChange={setVoiceCues}/>
                <Divider/>
                <CueRow title={t('haptics')} body={t('hapticsHelp')} value={haptics} onChange={setHaptics}/>
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.actions}>
          {step > 0 ? (
            <Pressable style={styles.back} onPress={() => setStep((x) => x - 1)}>
              <Text style={styles.backText}>← {t('back')}</Text>
            </Pressable>
          ) : <View/>}
          <View style={{ flex: 1 }}>
            <PrimaryButton label={step === 2 ? t('finishSetup') : t('continue')} onPress={() => step === 2 ? finish() : setStep((x) => x + 1)}/>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function CueRow({ title, body, value, onChange }: { title: string; body: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <View style={styles.cueRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cueTitle}>{title}</Text>
        <Text style={styles.cueBody}>{body}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.border, true: colors.accentSoft }} thumbColor={value ? colors.accent : colors.muted}/>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider}/>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  page: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  scroller: { flex: 1 },
  scrollerContent: { flexGrow: 1 },
  progress: { flexDirection: 'row', gap: 6 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  progressActive: { backgroundColor: colors.accent },
  step: { color: colors.muted, fontSize: 11, fontWeight: '800', marginTop: 12 },
  content: { flexGrow: 1, justifyContent: 'center', gap: 13, paddingVertical: 18 },
  logo: { width: 78, height: 78, borderRadius: 24, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  logoText: { color: colors.accentText, fontSize: 28, fontWeight: '900' },
  kicker: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 35, lineHeight: 40, fontWeight: '900', maxWidth: 500 },
  body: { color: colors.muted, fontSize: 15, lineHeight: 23, maxWidth: 520 },
  block: { marginTop: 12, gap: 8 },
  label: { color: colors.text, fontSize: 15, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  cueCard: { backgroundColor: colors.card, borderRadius: radius.xl, paddingHorizontal: 16, marginTop: 8 },
  cueRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 },
  cueTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  cueBody: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: { minHeight: 54, paddingHorizontal: 8, justifyContent: 'center' },
  backText: { color: colors.muted, fontWeight: '800' }
});
