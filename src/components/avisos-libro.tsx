import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';

// Advertencias del libro, plegadas para no tapar las dosis
export function AvisosLibro({ avisos }: { avisos: string[] }) {
  const [abierto, setAbierto] = useState(false);
  if (avisos.length === 0) return null;

  return (
    <View style={styles.caja}>
      <Pressable style={styles.cabecera} onPress={() => setAbierto(!abierto)}>
        <Text style={styles.titulo}>Avisos del libro</Text>
        <Ionicons name={abierto ? 'chevron-up' : 'chevron-down'} size={18} color={COLORES.azulPrimario} />
      </Pressable>
      {abierto && avisos.map((aviso, i) => (
        <Text key={i} style={styles.texto}>
          {aviso}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: {
    backgroundColor: COLORES.azulSuave,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 15,
    gap: 8,
  },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 13,
    fontFamily: FUENTES.seminegrita,
    color: COLORES.azulPrimario,
  },
  texto: {
    fontSize: 12,
    fontFamily: FUENTES.normal,
    lineHeight: 18,
    color: COLORES.azulPrimario,
  },
});
