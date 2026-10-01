import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { SesionProvider } from '@/context/sesion';

// Layout raíz: define la navegación "en pila" (Stack) de toda la app.
// Cada archivo dentro de src/app/ es una pantalla:
//   index.tsx              → Ingreso (lo primero que se ve)
//   solicitar-cuenta.tsx   → Registro de médico o paciente
//   solicitud-enviada.tsx  → Confirmación del registro
//   (medico)/              → App del médico: escanear QR · calculadora · perfil
//   (paciente)/            → App del paciente: historial · mi QR · perfil
export default function RootLayout() {
  return (
    // SesionProvider: comparte quién ingresó, el paciente escaneado y las dosis
    <SesionProvider>
      {/* Íconos de la barra de estado en blanco, porque los encabezados son azules */}
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </SesionProvider>
  );
}
