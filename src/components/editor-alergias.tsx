import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { CampoTexto } from '@/components/campo-texto';
import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';
import { useSesion } from '@/context/sesion';
import { Paciente } from '@/data/tipos';
import { actualizarAlergias } from '@/services/api';

// Lista de alergias del paciente, con opción de agregar y quitar.
// Cada cambio se guarda en el servidor y la lista que se muestra es la que éste devuelve.
export function EditorAlergias({ paciente }: { paciente: Paciente }) {
  const { actualizarUsuario } = useSesion();
  const [nueva, setNueva] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar(alergias: string[]) {
    setGuardando(true);
    try {
      const actualizado = await actualizarAlergias(paciente.id, alergias);
      actualizarUsuario(actualizado);
      return true;
    } catch (e) {
      Alert.alert('No se pudo guardar', e instanceof Error ? e.message : 'Intentá de nuevo.');
      return false;
    } finally {
      setGuardando(false);
    }
  }

  async function agregar() {
    const texto = nueva.trim();
    if (texto === '') {
      setError('Escribí la alergia que querés agregar.');
      return;
    }
    const repetida = paciente.alergias.some((alergia) => alergia.toLowerCase() === texto.toLowerCase());
    if (repetida) {
      setError('Esa alergia ya está en la lista.');
      return;
    }

    setError('');
    const guardada = await guardar([...paciente.alergias, texto]);
    if (guardada) setNueva('');
  }

  function quitar(alergia: string) {
    guardar(paciente.alergias.filter((otra) => otra !== alergia));
  }

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.etiqueta}>ALERGIAS</Text>

      {paciente.alergias.length === 0 && <Text style={styles.vacio}>Ninguna conocida</Text>}

      <View style={styles.fila}>
        {paciente.alergias.map((alergia) => (
          <View key={alergia} style={styles.chip}>
            <Text style={styles.chipTexto}>{alergia}</Text>
            <Pressable onPress={() => quitar(alergia)} disabled={guardando} hitSlop={8}>
              <Ionicons name="close" size={18} color={COLORES.gris} />
            </Pressable>
          </View>
        ))}
      </View>

      <CampoTexto
        etiqueta="AGREGAR ALERGIA"
        placeholder="Ej: Penicilina"
        value={nueva}
        onChangeText={setNueva}
        mayusculas
        error={error}
      />
      <Boton texto="Agregar" variante="secundario" onPress={agregar} deshabilitado={guardando} />
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
  vacio: {
    fontSize: 15,
    fontFamily: FUENTES.normal,
    color: COLORES.texto,
  },
  fila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: COLORES.azulSuave,
  },
  chipTexto: {
    fontSize: 14,
    fontFamily: FUENTES.seminegrita,
    color: COLORES.azulPrimario,
  },
});
