import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Boton } from '@/components/boton';
import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';
import { useAlergenos } from '@/services/alergenos';
import { normalizarNombre } from '@/utils/validaciones';

type Props = {
  alergias: string[];
  onCambiar: (alergias: string[]) => void;
  deshabilitado?: boolean;
};

// Alergias del paciente: solo se pueden elegir las sustancias que menciona el libro.
export function SelectorAlergias({ alergias, onCambiar, deshabilitado = false }: Props) {
  const { alergenos, error, reintentar } = useAlergenos();
  const [abierto, setAbierto] = useState(false);
  const [filtro, setFiltro] = useState('');

  const buscado = normalizarNombre(filtro);
  const disponibles = (alergenos ?? []).filter(
    (alergeno) => !alergias.includes(alergeno.nombre) && normalizarNombre(alergeno.nombre).includes(buscado)
  );

  function elegir(nombre: string) {
    onCambiar([...alergias, nombre]);
    setAbierto(false);
    setFiltro('');
  }

  return (
    <View style={styles.contenedor}>
      {alergias.length === 0 ? (
        <Text style={styles.vacio}>Ninguna cargada</Text>
      ) : (
        <View style={styles.fila}>
          {alergias.map((alergia) => (
            <View key={alergia} style={styles.chip}>
              <Text style={styles.chipTexto}>{alergia}</Text>
              <Pressable onPress={() => onCambiar(alergias.filter((otra) => otra !== alergia))} disabled={deshabilitado} hitSlop={8}>
                <Ionicons name="close" size={18} color={COLORES.gris} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Boton texto="Agregar alergia" variante="secundario" onPress={() => setAbierto(true)} deshabilitado={deshabilitado} />
      <Text style={styles.aclaracion}>
        Solo figuran las sustancias que aparecen en el libro. Si la alergia no está en la lista, no afecta a la dosis, así
        que no hace falta cargarla en la app.
      </Text>

      <Modal visible={abierto} animationType="slide" transparent onRequestClose={() => setAbierto(false)}>
        <View style={styles.fondo}>
          <View style={styles.hoja}>
            <Text style={styles.titulo}>Elegí la alergia</Text>
            <TextInput
              style={styles.buscador}
              placeholder="Buscar en la lista"
              placeholderTextColor={COLORES.grisIconoInactivo}
              value={filtro}
              onChangeText={setFiltro}
              autoCorrect={false}
            />

            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.lista}>
              {alergenos === null && (
                <Text style={styles.vacio}>{error === '' ? 'Cargando…' : error}</Text>
              )}
              {alergenos === null && error !== '' && <Boton texto="Reintentar" variante="secundario" onPress={reintentar} />}
              {alergenos !== null && disponibles.length === 0 && (
                <Text style={styles.vacio}>No hay sustancias del libro que coincidan. Si no está en la lista, no afecta a la dosis.</Text>
              )}
              {disponibles.map((alergeno) => (
                <Pressable key={alergeno.nombre} style={styles.opcion} onPress={() => elegir(alergeno.nombre)}>
                  <Text style={styles.opcionTexto}>{alergeno.nombre}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Boton texto="Cancelar" variante="secundario" onPress={() => setAbierto(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: 12,
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
  aclaracion: {
    fontSize: 12,
    fontFamily: FUENTES.normal,
    lineHeight: 18,
    color: COLORES.gris,
  },
  fondo: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  hoja: {
    maxHeight: '85%',
    backgroundColor: COLORES.blanco,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    gap: 12,
  },
  titulo: {
    fontSize: 20,
    fontFamily: FUENTES.negrita,
    color: COLORES.texto,
  },
  buscador: {
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORES.borde,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: FUENTES.normal,
    color: COLORES.texto,
  },
  lista: {
    gap: 4,
  },
  opcion: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.divisor,
  },
  opcionTexto: {
    fontSize: 16,
    fontFamily: FUENTES.media,
    color: COLORES.texto,
  },
});
