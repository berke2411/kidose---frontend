import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { ESTILO_BARRA_TABS } from '@/components/boton-central-tabs';
import { COLORES } from '@/constants/colores';
import { useSesion } from '@/context/sesion';

// Pestaña inicial del grupo
export const unstable_settings = { anchor: 'solicitudes' };

// Barra inferior del administrador: solicitudes de cuenta y perfil.
export default function AdminLayout() {
  const { usuario } = useSesion();

  if (usuario === null || usuario.rol !== 'admin') {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORES.azulPrimario,
        tabBarInactiveTintColor: COLORES.grisIconoInactivo,
        tabBarStyle: ESTILO_BARRA_TABS,
      }}>
      <Tabs.Screen
        name="solicitudes"
        options={{
          title: 'Solicitudes',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="perfil-admin"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}
