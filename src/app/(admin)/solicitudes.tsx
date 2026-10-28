import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Encabezado } from '@/components/encabezado';
import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';
import { Medico } from '@/data/tipos';
import { listarSolicitudes, resolverSolicitud } from '@/services/api';

// Pestaña del administrador: solicitudes de cuenta de médicos pendientes de aprobación.
export default function SolicitudesScreen() {
  // null mientras se cargan
  const [solicitudes, setSolicitudes] = useState<Medico[] | null>(null);
  const [error, setError] = useState('');
  const [resolviendo, setResolviendo] = useState<number | null>(null);

  const cargar = useCallback(() => {
    setError('');
    listarSolicitudes('pendiente')
      .then(setSolicitudes)
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudieron cargar las solicitudes.'));
  }, []);

  // Se vuelve a pedir cada vez que se entra a la pestaña
  useFocusEffect(cargar);

  async function resolver(medico: Medico, estado: 'aprobada' | 'rechazada') {
    setResolviendo(medico.id);
    try {
      await resolverSolicitud(medico.id, estado);
      cargar(); // la lista se recarga: la fuente de verdad es el servidor
    } catch (e) {
      Alert.alert('No se pudo guardar', e instanceof Error ? e.message : 'Intentá de nuevo.');
    } finally {
      setResolviendo(null);
    }
  }

  return (
    <View style={styles.pantalla}>
      <Encabezado etiqueta="SOLICITUDES" />

      <ScrollView contentContainerStyle={styles.contenido}>
        {solicitudes === null && error === '' && <ActivityIndicator color={COLORES.azulPrimario} />}
        {error !== '' && <Text style={styles.vacio}>{error}</Text>}
        {solicitudes?.length === 0 && <Text style={styles.vacio}>No hay solicitudes pendientes.</Text>}

        {solicitudes?.map((medico) => (
          <View key={medico.id} style={styles.tarjeta}>
            <Text style={styles.nombre}>{medico.nombre}</Text>
            <Text style={styles.detalle}>
              Matrícula {medico.matricula} · DNI {medico.dni}
            </Text>
            <Text style={styles.detalle}>{medico.especialidad}</Text>
            <Text style={styles.detalle}>{medico.hospital}</Text>
            <Text style={styles.detalle}>{medico.email}</Text>

            <View style={styles.acciones}>
              <Boton
                texto="Aprobar"
                deshabilitado={resolviendo === medico.id}
                onPress={() => resolver(medico, 'aprobada')}
              />
              <Boton
                texto="Rechazar"
                variante="secundario"
                deshabilitado={resolviendo === medico.id}
                onPress={() => resolver(medico, 'rechazada')}
              />
            </View>
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
    fontFamily: FUENTES.normal,
    color: COLORES.gris,
    textAlign: 'center',
    marginTop: 40,
  },
  tarjeta: {
    backgroundColor: COLORES.blanco,
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  nombre: {
    fontSize: 18,
    fontFamily: FUENTES.negrita,
    color: COLORES.texto,
    marginBottom: 4,
  },
  detalle: {
    fontSize: 13,
    fontFamily: FUENTES.normal,
    color: COLORES.gris,
  },
  acciones: {
    gap: 8,
    marginTop: 12,
  },
});
