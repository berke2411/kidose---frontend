import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORES } from '@/constants/colores';

type Props = {
  onPress: () => void;
};

// Botón "Más info" de un medicamento. Lo usan la calculadora y el historial.
export function BotonInfo({ onPress }: Props) {
  return (
    <Pressable style={styles.boton} onPress={onPress}>
      <Ionicons name="information-circle-outline" size={18} color={COLORES.azulPrimario} />
      <Text style={styles.texto}>Más info</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
  },
  texto: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.azulPrimario,
  },
});
