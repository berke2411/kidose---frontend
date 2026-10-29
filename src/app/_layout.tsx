import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { SesionProvider } from '@/context/sesion';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fuentesListas, errorFuentes] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fuentesListas || errorFuentes) SplashScreen.hideAsync();
  }, [fuentesListas, errorFuentes]);

  if (!fuentesListas && !errorFuentes) return null;

  return (
    <SesionProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </SesionProvider>
  );
}
