import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORES } from '@/constants/colores';

type Props = {
  texto: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario';
};

// Botón de la guía visual: altura mínima de 56px.
export function Boton({ texto, onPress, variante = 'primario' }: Props) {
  const esPrimario = variante === 'primario';

  return (
    <Pressable
      onPress={onPress}
      style={[styles.boton, esPrimario ? styles.fondoPrimario : styles.fondoSecundario]}>
      <Text style={[styles.texto, esPrimario ? styles.textoPrimario : styles.textoSecundario]}>
        {texto}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    minHeight: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  fondoPrimario: {
    backgroundColor: COLORES.azulPrimario,
  },
  fondoSecundario: {
    backgroundColor: COLORES.azulSuave,
  },
  texto: {
    fontSize: 17,
    fontWeight: '600',
  },
  textoPrimario: {
    color: COLORES.blanco,
  },
  textoSecundario: {
    color: COLORES.azulPrimario,
  },
});
