import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { COLORES } from '@/constants/colores';

type Props = {
  onPress: ComponentProps<typeof Pressable>['onPress'];
  icono: ComponentProps<typeof Ionicons>['name'];
};

// Botón central de la barra inferior (estilo Instagram):
// un cuadrado azul que sobresale de la barra. Lo usan médico y paciente.
export function BotonCentralTabs({ onPress, icono }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.contenedor}>
      <View style={styles.boton}>
        <Ionicons name={icono} size={34} color={COLORES.blanco} />
      </View>
    </Pressable>
  );
}

// Estilo de la barra inferior, igual para los dos tipos de usuario
export const ESTILO_BARRA_TABS = {
  backgroundColor: COLORES.blanco,
  borderTopColor: COLORES.divisor,
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
  },
  boton: {
    width: 62,
    height: 62,
    marginTop: -22, // negativo: lo "levanta" por encima de la barra
    borderRadius: 20,
    backgroundColor: COLORES.azulPrimario,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
