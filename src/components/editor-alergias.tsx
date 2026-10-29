import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { SelectorAlergias } from '@/components/selector-alergias';
import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';
import { useSesion } from '@/context/sesion';
import { Paciente } from '@/data/tipos';
import { actualizarAlergias } from '@/services/api';

// Alergias del paciente. Cada cambio se guarda en el servidor y la lista que se muestra es la que éste devuelve.
export function EditorAlergias({ paciente }: { paciente: Paciente }) {
  const { actualizarUsuario } = useSesion();
  const [guardando, setGuardando] = useState(false);

  async function guardar(alergias: string[]) {
    setGuardando(true);
    try {
      const actualizado = await actualizarAlergias(paciente.id, alergias);
      actualizarUsuario(actualizado);
    } catch (e) {
      Alert.alert('No se pudo guardar', e instanceof Error ? e.message : 'Intentá de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.etiqueta}>ALERGIAS</Text>
      <SelectorAlergias alergias={paciente.alergias} onCambiar={guardar} deshabilitado={guardando} />
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: COLORES.blanco,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  etiqueta: {
    fontSize: 11,
    fontFamily: FUENTES.seminegrita,
    letterSpacing: 1.3,
    color: COLORES.gris,
  },
});
