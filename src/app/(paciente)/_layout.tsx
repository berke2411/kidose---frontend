import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { BotonCentralTabs, ESTILO_BARRA_TABS } from '@/components/boton-central-tabs';
import { COLORES } from '@/constants/colores';
import { useSesion } from '@/context/sesion';

// Barra inferior del paciente: historial, mi QR (centro) y perfil.
export default function PacienteLayout() {
  const { usuario } = useSesion();

  if (usuario === null || usuario.rol !== 'paciente') {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      initialRouteName="mi-qr"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORES.azulPrimario,
        tabBarInactiveTintColor: COLORES.grisIconoInactivo,
        tabBarStyle: ESTILO_BARRA_TABS,
      }}>
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="mi-qr"
        options={{
          title: 'Mi QR',
          tabBarButton: ({ onPress }) => (
            <BotonCentralTabs onPress={onPress} icono="qr-code-outline" />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil-paciente"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
