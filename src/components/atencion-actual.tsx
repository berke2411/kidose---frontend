import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { BotonExportar } from '@/components/boton-exportar';
import { Encabezado } from '@/components/encabezado';
import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';
import { useSesion } from '@/context/sesion';
import { enviarAtencion as enviarAtencionApi } from '@/services/api';
import { formatearNumero } from '@/utils/calcular-dosis';
import { calcularEdad, formatearHora } from '@/utils/fechas';
import { restarPeso, sumarPeso } from '@/utils/peso';

type Props = {
  onEnviada: () => void; // se llama después de enviar la atención
};

// Pantalla del médico con un paciente escaneado: sus datos y las dosis
// suministradas en esta atención, con el botón para enviarlas.
export function AtencionActual({ onEnviada }: Props) {
  const { pacienteEscaneado, dosisSuministradas, actualizarPeso, quitarDosis, terminarAtencion } =
    useSesion();

  const [enviando, setEnviando] = useState(false);

  if (pacienteEscaneado === null) return null;

  // Guarda la atención en el servidor; recién cuando responde bien se cierra la pantalla
  async function enviarAtencion() {
    if (pacienteEscaneado === null) return;
    setEnviando(true);
    try {
      await enviarAtencionApi(pacienteEscaneado.id, pacienteEscaneado.pesoKg, dosisSuministradas);
      terminarAtencion();
      onEnviada();
    } catch (error) {
      Alert.alert('No se pudo enviar la atención', error instanceof Error ? error.message : 'Intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.pantalla}>
      <Encabezado etiqueta="ATENCIÓN ACTUAL" />

      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.tarjeta}>
          <Text style={styles.nombre}>{pacienteEscaneado.nombre}</Text>
          <Text style={styles.detalle}>
            {calcularEdad(pacienteEscaneado.fechaNacimiento)} · DNI {pacienteEscaneado.dni}
          </Text>

          <View style={styles.filaPeso}>
            <Pressable
              style={styles.botonPeso}
              onPress={() => actualizarPeso(restarPeso(pacienteEscaneado.pesoKg))}>
              <Ionicons name="remove" size={22} color={COLORES.azulPrimario} />
            </Pressable>
            <View style={styles.valorPeso}>
              <Text style={styles.numeroPeso}>{formatearNumero(pacienteEscaneado.pesoKg)} kg</Text>
              <Text style={styles.detalle}>Corregí el peso si cambió</Text>
            </View>
            <Pressable
              style={styles.botonPeso}
              onPress={() => actualizarPeso(sumarPeso(pacienteEscaneado.pesoKg))}>
              <Ionicons name="add" size={22} color={COLORES.azulPrimario} />
            </Pressable>
          </View>

          <View style={styles.filaAlergias}>
            {pacienteEscaneado.alergias.length === 0 && (
              <Text style={styles.detalle}>Sin alergias conocidas</Text>
            )}
            {pacienteEscaneado.alergias.map((alergia) => (
              <View key={alergia} style={styles.chipAlergia}>
                <Text style={styles.chipAlergiaTexto}>ALERGIA: {alergia.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>

        <BotonExportar paciente={pacienteEscaneado} />

        <Text style={styles.subtitulo}>DOSIS SUMINISTRADAS</Text>

        {dosisSuministradas.length === 0 && (
          <Text style={styles.vacio}>
            Todavía no suministraste ninguna dosis. Usá la calculadora para agregarlas.
          </Text>
        )}

        {dosisSuministradas.map((dosis) => (
          <View key={dosis.id} style={styles.tarjetaDosis}>
            <View style={styles.textoDosis}>
              <Text style={styles.nombreDosis}>{dosis.nombre}</Text>
              <Text style={styles.detalle}>
                {dosis.via} · {formatearHora(dosis.hora)}
              </Text>
            </View>
            <Text style={styles.cantidad}>
              {formatearNumero(dosis.cantidad)} {dosis.unidad}
            </Text>
            <Pressable onPress={() => quitarDosis(dosis.id)} style={styles.botonQuitar}>
              <Ionicons name="close" size={22} color={COLORES.gris} />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <View style={styles.pie}>
        {dosisSuministradas.length > 0 && <Boton texto={enviando ? 'Enviando…' : 'Enviar atención'} onPress={enviarAtencion} deshabilitado={enviando} />}
        <Boton texto="Cancelar atención" variante="secundario" onPress={terminarAtencion} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  contenido: {
    padding: 16,
    paddingBottom: 24,
    gap: 10,
  },
  tarjeta: {
    backgroundColor: COLORES.blanco,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  nombre: {
    fontSize: 22,
    fontFamily: FUENTES.negrita,
    color: COLORES.texto,
  },
  detalle: {
    fontSize: 13,
    fontFamily: FUENTES.normal,
    color: COLORES.gris,
  },
  filaPeso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botonPeso: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: COLORES.azulSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valorPeso: {
    flex: 1,
    alignItems: 'center',
  },
  numeroPeso: {
    fontSize: 28,
    fontFamily: FUENTES.negrita,
    color: COLORES.texto,
  },
  filaAlergias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipAlergia: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: COLORES.alerta,
  },
  chipAlergiaTexto: {
    fontSize: 10,
    fontFamily: FUENTES.negrita,
    letterSpacing: 0.8,
    color: COLORES.rojoAcento,
  },
  subtitulo: {
    marginTop: 8,
    fontSize: 11,
    fontFamily: FUENTES.seminegrita,
    letterSpacing: 1.3,
    color: COLORES.gris,
  },
  vacio: {
    fontSize: 14,
    fontFamily: FUENTES.normal,
    lineHeight: 21,
    color: COLORES.gris,
  },
  tarjetaDosis: {
    backgroundColor: COLORES.blanco,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORES.azulPrimario,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textoDosis: {
    flex: 1,
    gap: 3,
  },
  nombreDosis: {
    fontSize: 16,
    fontFamily: FUENTES.negrita,
    color: COLORES.texto,
  },
  cantidad: {
    fontSize: 18,
    fontFamily: FUENTES.negrita,
    color: COLORES.azulPrimario,
  },
  botonQuitar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pie: {
    backgroundColor: COLORES.blanco,
    borderTopWidth: 1,
    borderTopColor: COLORES.divisor,
    padding: 16,
    gap: 10,
  },
});
