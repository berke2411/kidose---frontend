import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';

type Props = {
  texto: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario';
  deshabilitado?: boolean; // mientras espera una respuesta del servidor
};

// Botón de la guía visual: altura mínima de 56px.
export function Boton({ texto, onPress, variante = 'primario', deshabilitado = false }: Props) {
  const esPrimario = variante === 'primario';

  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      style={[
        styles.boton,
        esPrimario ? styles.fondoPrimario : styles.fondoSecundario,
        deshabilitado && styles.deshabilitado,
      ]}>
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
  deshabilitado: {
    opacity: 0.5,
  },
  fondoPrimario: {
    backgroundColor: COLORES.azulPrimario,
  },
  fondoSecundario: {
    backgroundColor: COLORES.azulSuave,
  },
  texto: {
    fontSize: 17,
    fontFamily: FUENTES.seminegrita,
  },
  textoPrimario: {
    color: COLORES.blanco,
  },
  textoSecundario: {
    color: COLORES.azulPrimario,
  },
});
