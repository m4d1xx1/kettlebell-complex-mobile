import * as Speech from 'expo-speech';
import { useEffect } from 'react';
import { AppSettings } from '../types';
import { WorkoutStep } from '../workout/steps';

function sideText(sideLabel: string | undefined, language: AppSettings['voiceLanguage']) {
  if (!sideLabel) return '';
  if (language === 'sv-SE') {
    if (sideLabel === 'LEFT') return 'vänster';
    if (sideLabel === 'RIGHT') return 'höger';
    if (sideLabel === 'ALTERNATE') return 'alternerande';
  }
  return sideLabel.toLowerCase();
}

export function useWorkoutCues(settings: AppSettings) {
  useEffect(() => () => { Speech.stop(); }, []);

  const speak = (text: string) => {
    if (!settings.voiceCues) return;
    Speech.stop();
    Speech.speak(text, {
      language: settings.voiceLanguage,
      rate: 0.96,
      pitch: 1.0,
      volume: 1.0
    });
  };

  const cueCountdown = (value: number) => {
    if (settings.voiceCues && settings.countdownVoice && value > 0) speak(String(value));
  };

  const announceStep = (step: WorkoutStep) => {
    if (!settings.voiceCues) return;
    const side = sideText(step.sideLabel, settings.voiceLanguage);
    const target = settings.voiceLanguage === 'sv-SE'
      ? `${step.value} ${step.mode === 'reps' ? 'repetitioner' : 'sekunder'}`
      : `${step.value} ${step.mode === 'reps' ? 'reps' : 'seconds'}`;
    speak([step.exercise.name, side, target].filter(Boolean).join('. '));
  };

  const announceRest = (seconds: number, next?: WorkoutStep) => {
    if (!settings.voiceCues) return;
    const nextName = next ? `${next.exercise.name}${next.sideLabel ? `, ${sideText(next.sideLabel, settings.voiceLanguage)}` : ''}` : '';
    const text = settings.voiceLanguage === 'sv-SE'
      ? `Vila. ${seconds} sekunder.${nextName ? ` Nästa: ${nextName}.` : ''}`
      : `Rest. ${seconds} seconds.${nextName ? ` Next: ${nextName}.` : ''}`;
    speak(text);
  };

  const announceComplete = () => {
    if (settings.voiceCues) speak(settings.voiceLanguage === 'sv-SE' ? 'Passet är klart.' : 'Workout complete.');
  };

  return { cueCountdown, announceStep, announceRest, announceComplete };
}
