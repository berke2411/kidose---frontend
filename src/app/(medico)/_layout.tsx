import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { BotonCentralTabs, ESTILO_BARRA_TABS } from '@/components/boton-central-tabs';
import { COLORES } from '@/constants/colores';
import { useSesion } from '@/context/sesion';

// Barra inferior del médico: escanear, calculadora (centro) y perfil.
export default function MedicoLayout() {
  const { usuario, pacienteEscaneado } = useSesion();

  if (usuario === null || usuario.rol !== 'medico') {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      initialRouteName="escanear"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORES.azulPrimario,
        tabBarInactiveTintColor: COLORES.grisIconoInactivo,
        tabBarStyle: ESTILO_BARRA_TABS,
      }}>
      <Tabs.Screen
        name="escanear"
        options={{
          title: pacienteEscaneado ? 'Paciente' : 'Escanear',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={pacienteEscaneado ? 'person-outline' : 'qr-code-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="calculadora"
        options={{
          title: 'Calculadora',
          tabBarButton: ({ onPress }) => <BotonCentralTabs onPress={onPress} icono="add" />,
        }}
      />

      <Tabs.Screen
        name="perfil-medico"
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
