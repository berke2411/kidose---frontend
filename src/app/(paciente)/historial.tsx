import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BotonExportar } from '@/components/boton-exportar';
import { BotonInfo } from '@/components/boton-info';
import { Encabezado } from '@/components/encabezado';
import { ModalInfoMedicamento } from '@/components/modal-info-medicamento';
import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';
import { useSesion } from '@/context/sesion';
import { Atencion, Medicamento } from '@/data/tipos';
import { listarAtenciones } from '@/services/api';
import { formatearNumero } from '@/utils/calcular-dosis';
import { formatearFecha, formatearHora } from '@/utils/fechas';

// Pestaña izquierda del paciente: historial de atenciones (fecha, médico y dosis).
export default function HistorialScreen() {
  const { usuario } = useSesion();
  const [medicamentoInfo, setMedicamentoInfo] = useState<Medicamento | null>(null);
  // Las atenciones vienen del servidor; null mientras se cargan
  const [atenciones, setAtenciones] = useState<Atencion[] | null>(null);
  const [error, setError] = useState('');
  const idPaciente = usuario?.rol === 'paciente' ? usuario.id : null;

  // Se vuelve a pedir cada vez que se entra a la pestaña, así aparece lo último que se atendió
  useFocusEffect(
    useCallback(() => {
      if (idPaciente === null) return;
      setError('');
      listarAtenciones(idPaciente)
        .then(setAtenciones)
        .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar el historial.'));
    }, [idPaciente])
  );

  if (usuario === null || usuario.rol !== 'paciente') return null;

  return (
    <View style={styles.pantalla}>
      <Encabezado etiqueta="HISTORIAL" />

      <ScrollView contentContainerStyle={styles.contenido}>
        <BotonExportar paciente={usuario} />

        {atenciones === null && error === '' && (
          <ActivityIndicator color={COLORES.azulPrimario} style={styles.vacio} />
        )}
        {error !== '' && <Text style={styles.vacio}>{error}</Text>}
        {atenciones?.length === 0 && (
          <Text style={styles.vacio}>Todavía no tenés atenciones registradas.</Text>
        )}

        {atenciones?.map((atencion) => (
          <View key={atencion.id} style={styles.tarjeta}>
            <Text style={styles.fecha}>{formatearFecha(atencion.fecha)}</Text>
            <Text style={styles.detalle}>
              Dr/a. {atencion.medico.nombre} · {atencion.lugar}
            </Text>

            <View style={styles.divisor} />

            {atencion.dosis.map((dosis) => {
              // La API manda el medicamento completo para poder ver sus contraindicaciones
              const medicamento = dosis.medicamento;
              return (
                <View key={dosis.id} style={styles.filaDosis}>
                  <View style={styles.textoDosis}>
                    <Text style={styles.nombreDosis}>{dosis.nombre}</Text>
                    <Text style={styles.detalle}>
                      {dosis.via} · {formatearHora(dosis.hora)}
                    </Text>
                    {medicamento && <BotonInfo onPress={() => setMedicamentoInfo(medicamento)} />}
                  </View>
                  <Text style={styles.cantidad}>
                    {formatearNumero(dosis.cantidad)} {dosis.unidad}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <ModalInfoMedicamento medicamento={medicamentoInfo} onCerrar={() => setMedicamentoInfo(null)} />
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
    paddingBottom: 32,
    gap: 12,
  },
  vacio: {
    fontSize: 14,
    fontFamily: FUENTES.normal,
    color: COLORES.gris,
    textAlign: 'center',
    marginTop: 40,
  },
  tarjeta: {
    backgroundColor: COLORES.blanco,
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  fecha: {
    fontSize: 18,
    fontFamily: FUENTES.negrita,
    color: COLORES.texto,
  },
  detalle: {
    fontSize: 13,
    fontFamily: FUENTES.normal,
    color: COLORES.gris,
  },
  divisor: {
    height: 1,
    backgroundColor: COLORES.divisor,
  },
  filaDosis: {
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
});
