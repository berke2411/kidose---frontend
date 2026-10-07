import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { SesionProvider } from '@/context/sesion';

// Layout raíz: navegación en pila de toda la app.
export default function RootLayout() {
  return (
    <SesionProvider>
      {/* Íconos blancos porque los encabezados son azules */}
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </SesionProvider>
  );
}
