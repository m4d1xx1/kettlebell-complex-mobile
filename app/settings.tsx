import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { NumberStepper } from '../src/components/NumberStepper';
import { useWorkout } from '../src/context/WorkoutContext';
import { useWorkoutCues } from '../src/hooks/useWorkoutCues';
import { useI18n } from '../src/i18n';
import { colors, radius } from '../src/theme';

export default function SettingsScreen() {
  const { settings, updateSettings } = useWorkout();
  const { t } = useI18n();
  const cues = useWorkoutCues(settings);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.intro}>
        <Text style={styles.kicker}>{t('settings').toUpperCase()}</Text>
        <Text style={styles.title}>{t('eyesOnBell')}</Text>
        <Text style={styles.muted}>{t('configureSignals')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('trainingDefaults')}</Text>
        <Text style={styles.note}>{t('trainingDefaultsHelp')}</Text>
        <View style={styles.grid}>
          <NumberStepper label={t('defaultWeight')} value={settings.defaultWeightKg} min={4} max={80} step={2} suffix="kg" haptics={settings.haptics} onChange={(defaultWeightKg) => updateSettings({ defaultWeightKg })}/>
          <NumberStepper label={t('defaultRounds')} value={settings.defaultRounds} min={1} max={30} haptics={settings.haptics} onChange={(defaultRounds) => updateSettings({ defaultRounds })}/>
          <NumberStepper label={t('defaultRest')} value={settings.defaultRestSeconds} min={0} max={600} step={15} suffix={t('sec')} haptics={settings.haptics} onChange={(defaultRestSeconds) => updateSettings({ defaultRestSeconds })}/>
        </View>
      </View>

      <View style={styles.card}>
        <SettingRow title={t('soundCues')} description={t('soundCuesHelp')} value={settings.soundCues} onValueChange={(soundCues) => updateSettings({ soundCues })}/>
        <Divider/>
        <SettingRow title={t('voiceCues')} description={t('voiceCuesHelp')} value={settings.voiceCues} onValueChange={(voiceCues) => updateSettings({ voiceCues })}/>
        <Divider/>
        <SettingRow title={t('spokenCountdown')} description={t('spokenCountdownHelp')} value={settings.countdownVoice} disabled={!settings.voiceCues} onValueChange={(countdownVoice) => updateSettings({ countdownVoice })}/>
        <Divider/>
        <SettingRow title={t('haptics')} description={t('hapticsHelp')} value={settings.haptics} onValueChange={(haptics) => updateSettings({ haptics })}/>
        <Divider/>
        <CheckboxSettingRow
          title={t('manualContinueAfterRest')}
          description={t('manualContinueAfterRestHelp')}
          value={settings.manualContinueAfterRest}
          onValueChange={(manualContinueAfterRest) => updateSettings({ manualContinueAfterRest })}
        />
      </View>

      <Pressable style={styles.test} onPress={() => { cues.cueCountdown(0); cues.announceComplete(); }}>
        <Text style={styles.testText}>{t('testCues')}</Text>
      </Pressable>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>{t('audioBehavior')}</Text>
        <Text style={styles.muted}>{t('audioBehaviorHelp')}</Text>
      </View>
    </ScrollView>
  );
}

function SettingRow({ title, description, value, onValueChange, disabled = false }: {
  title: string; description: string; value: boolean; onValueChange: (value: boolean) => void; disabled?: boolean;
}) {
  return (
    <View style={[styles.row, disabled && { opacity: 0.45 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch accessibilityLabel={title} disabled={disabled} value={value} onValueChange={onValueChange} trackColor={{ false: colors.border, true: colors.accentSoft }} thumbColor={value ? colors.accent : colors.muted}/>
    </View>
  );
}

function CheckboxSettingRow({ title, description, value, onValueChange }: {
  title: string; description: string; value: boolean; onValueChange: (value: boolean) => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={styles.row}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
        {value ? <Text style={styles.checkboxMark}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

function Divider() { return <View style={styles.divider}/>; }

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 40, backgroundColor: colors.bg, gap: 18 },
  intro: { gap: 5, paddingVertical: 4 },
  kicker: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 29, fontWeight: '900' },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  section: { gap: 10 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  note: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  rowDescription: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  checkbox: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.panel },
  checkboxChecked: { borderColor: colors.accent, backgroundColor: colors.accent },
  checkboxMark: { color: colors.accentText, fontSize: 18, fontWeight: '900', lineHeight: 20 },
  test: { minHeight: 54, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  testText: { color: colors.accent, fontWeight: '900' },
  info: { padding: 16, borderRadius: radius.lg, backgroundColor: colors.panel, gap: 5 },
  infoTitle: { color: colors.text, fontWeight: '900', fontSize: 14 }
});
