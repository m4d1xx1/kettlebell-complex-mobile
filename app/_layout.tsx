import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DefaultTheme, DarkTheme } from 'expo-router/react-navigation';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WorkoutProvider } from '../src/context/WorkoutContext';
import { useI18n } from '../src/i18n';
import { useThemeColors } from '../src/theme';

function AppStack() {
  const colors = useThemeColors();
  const dark = useColorScheme() === 'dark';
  const navigationTheme = { ...(dark ? DarkTheme : DefaultTheme), colors: {
    ...(dark ? DarkTheme.colors : DefaultTheme.colors), primary: colors.accent,
    background: colors.bg, card: colors.panel, text: colors.text, border: colors.border, notification: colors.accent,
  } };
  useEffect(() => { void SystemUI.setBackgroundColorAsync(colors.bg).catch(() => undefined); }, [colors.bg]);
  const { t } = useI18n();

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={dark ? 'light' : 'dark'}/>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false
        }}
      >
        <Stack.Screen name="index" options={{ title: t('appName') }}/>
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }}/>
        <Stack.Screen name="exercises" options={{ title: t('exercises'), presentation: 'modal' }}/>
        <Stack.Screen name="exercise-detail" options={{ title: t('exercise'), presentation: 'modal' }}/>
        <Stack.Screen name="custom-exercise" options={{ title: t('customExercise'), presentation: 'modal' }}/>
        <Stack.Screen name="saved" options={{ title: t('templates') }}/>
        <Stack.Screen name="history" options={{ title: t('history') }}/>
        <Stack.Screen name="settings" options={{ title: t('settings') }}/>
        <Stack.Screen name="workout" options={{ headerShown: false, gestureEnabled: false }}/>
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const colors = useThemeColors();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <WorkoutProvider>
        <AppStack/>
      </WorkoutProvider>
    </GestureHandlerRootView>
  );
}
