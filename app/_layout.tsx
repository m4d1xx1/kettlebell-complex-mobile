import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WorkoutProvider } from '../src/context/WorkoutContext';
import { useI18n } from '../src/i18n';
import { colors } from '../src/theme';

function AppStack() {
  const { t } = useI18n();

  return (
    <>
      <StatusBar style="light"/>
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
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <WorkoutProvider>
        <AppStack/>
      </WorkoutProvider>
    </GestureHandlerRootView>
  );
}
