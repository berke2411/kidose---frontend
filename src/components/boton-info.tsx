import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';

type Props = {
  onPress: () => void;
};

export function BotonInfo({ onPress }: Props) {
  return (
    <Pressable style={styles.boton} onPress={onPress}>
      <Ionicons name="information-circle-outline" size={18} color={COLORES.azulPrimario} />
      <Text style={styles.texto}>Contraindicaciones (fuente externa)</Text>
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
    fontFamily: FUENTES.seminegrita,
    color: COLORES.azulPrimario,
  },
});
