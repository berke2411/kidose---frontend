import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Encabezado } from '@/components/encabezado';
import { COLORES } from '@/constants/colores';
import { useSesion } from '@/context/sesion';
import { formatearNumero } from '@/utils/calcular-dosis';

// Pestaña izquierda del paciente: historial de atenciones (fecha, médico y dosis).
export default function HistorialScreen() {
  const { usuario } = useSesion();

  if (usuario === null || usuario.rol !== 'paciente') return null;

  return (
    <View style={styles.pantalla}>
      <Encabezado etiqueta="HISTORIAL" />

      <ScrollView contentContainerStyle={styles.contenido}>
        {usuario.historial.length === 0 && (
          <Text style={styles.vacio}>Todavía no tenés atenciones registradas.</Text>
        )}

        {usuario.historial.map((atencion) => (
          <View key={atencion.id} style={styles.tarjeta}>
            <Text style={styles.fecha}>{atencion.fecha}</Text>
            <Text style={styles.detalle}>
              Dr/a. {atencion.medico} · {atencion.lugar}
            </Text>

            <View style={styles.divisor} />

            {atencion.dosis.map((dosis) => (
              <View key={dosis.id} style={styles.filaDosis}>
                <View style={styles.textoDosis}>
                  <Text style={styles.nombreDosis}>{dosis.medicamento}</Text>
                  <Text style={styles.detalle}>
                    {dosis.via} · {dosis.hora}
                  </Text>
                </View>
                <Text style={styles.cantidad}>
                  {formatearNumero(dosis.cantidad)} {dosis.unidad}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
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
    fontWeight: '700',
    color: COLORES.texto,
  },
  detalle: {
    fontSize: 13,
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
    fontWeight: '700',
    color: COLORES.texto,
  },
  cantidad: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORES.azulPrimario,
  },
});
