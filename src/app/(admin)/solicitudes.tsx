import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Encabezado } from '@/components/encabezado';
import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';
import { Medico } from '@/data/tipos';
import { cambiarEstadoMedico, listarMedicos } from '@/services/api';

type Vista = 'pendiente' | 'aprobada' | 'baja';

const VISTAS: { estado: Vista; titulo: string; vacio: string }[] = [
  { estado: 'pendiente', titulo: 'Solicitudes', vacio: 'No hay solicitudes pendientes.' },
  { estado: 'aprobada', titulo: 'Activos', vacio: 'No hay médicos activos.' },
  { estado: 'baja', titulo: 'De baja', vacio: 'No hay médicos dados de baja.' },
];

// Pestaña del administrador: aprueba solicitudes de médicos, y da de baja o vuelve a habilitar a los que ya tienen cuenta.
// Nunca se borra un médico: la baja solo cambia su estado y sus atenciones quedan en el historial.
export default function MedicosScreen() {
  const [vista, setVista] = useState<Vista>('pendiente');
  const [medicos, setMedicos] = useState<Medico[] | null>(null);
  const [error, setError] = useState('');
  const [resolviendo, setResolviendo] = useState<number | null>(null);
  // La confirmación va en pantalla porque Alert con botones no funciona en la versión web
  const [confirmandoBaja, setConfirmandoBaja] = useState<number | null>(null);

  const cargar = useCallback(() => {
    setError('');
    listarMedicos(vista)
      .then(setMedicos)
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudieron cargar los médicos.'));
  }, [vista]);

  useFocusEffect(cargar);

  async function cambiarEstado(medico: Medico, estado: 'aprobada' | 'rechazada' | 'baja') {
    setResolviendo(medico.id);
    try {
      await cambiarEstadoMedico(medico.id, estado);
      cargar();
    } catch (e) {
      Alert.alert('No se pudo guardar', e instanceof Error ? e.message : 'Intentá de nuevo.');
    } finally {
      setResolviendo(null);
    }
  }

  function elegirVista(nueva: Vista) {
    setConfirmandoBaja(null);
    setMedicos(null);
    setVista(nueva);
  }

  const vistaActual = VISTAS.find((otra) => otra.estado === vista) ?? VISTAS[0];

  return (
    <View style={styles.pantalla}>
      <Encabezado etiqueta="MÉDICOS" />

      <View style={styles.selector}>
        {VISTAS.map((opcion) => (
          <Pressable
            key={opcion.estado}
            style={[styles.opcion, vista === opcion.estado && styles.opcionActiva]}
            onPress={() => elegirVista(opcion.estado)}>
            <Text style={[styles.textoOpcion, vista === opcion.estado && styles.textoOpcionActivo]}>{opcion.titulo}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.contenido}>
        {medicos === null && error === '' && <ActivityIndicator color={COLORES.azulPrimario} />}
        {error !== '' && <Text style={styles.vacio}>{error}</Text>}
        {medicos?.length === 0 && <Text style={styles.vacio}>{vistaActual.vacio}</Text>}

        {medicos?.map((medico) => (
          <View key={medico.id} style={styles.tarjeta}>
            <Text style={styles.nombre}>{medico.nombre}</Text>
            <Text style={styles.detalle}>
              Matrícula {medico.matricula} · DNI {medico.dni}
            </Text>
            <Text style={styles.detalle}>{medico.especialidad}</Text>
            <Text style={styles.detalle}>{medico.hospital}</Text>
            <Text style={styles.detalle}>{medico.email}</Text>

            <View style={styles.acciones}>
              {vista === 'pendiente' && (
                <>
                  <Boton texto="Aprobar" deshabilitado={resolviendo === medico.id} onPress={() => cambiarEstado(medico, 'aprobada')} />
                  <Boton
                    texto="Rechazar"
                    variante="secundario"
                    deshabilitado={resolviendo === medico.id}
                    onPress={() => cambiarEstado(medico, 'rechazada')}
                  />
                </>
              )}
              {vista === 'aprobada' && confirmandoBaja !== medico.id && (
                <Boton texto="Dar de baja" variante="secundario" onPress={() => setConfirmandoBaja(medico.id)} />
              )}
              {vista === 'aprobada' && confirmandoBaja === medico.id && (
                <>
                  <Text style={styles.aviso}>No va a poder ingresar a la app. Sus atenciones quedan en el historial y se lo puede volver a habilitar.</Text>
                  <Boton
                    texto="Confirmar baja"
                    deshabilitado={resolviendo === medico.id}
                    onPress={() => {
                      setConfirmandoBaja(null);
                      cambiarEstado(medico, 'baja');
                    }}
                  />
                  <Boton texto="Cancelar" variante="secundario" onPress={() => setConfirmandoBaja(null)} />
                </>
              )}
              {vista === 'baja' && (
                <Boton texto="Volver a habilitar" deshabilitado={resolviendo === medico.id} onPress={() => cambiarEstado(medico, 'aprobada')} />
              )}
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
  selector: {
    flexDirection: 'row',
    backgroundColor: COLORES.divisor,
    borderRadius: 11,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 12,
  },
  opcion: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcionActiva: {
    backgroundColor: COLORES.blanco,
  },
  textoOpcion: {
    fontSize: 14,
    fontFamily: FUENTES.seminegrita,
    color: COLORES.gris,
  },
  textoOpcionActivo: {
    color: COLORES.azulPrimario,
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
  aviso: {
    fontSize: 13,
    fontFamily: FUENTES.normal,
    color: COLORES.texto,
  },
  acciones: {
    gap: 8,
    marginTop: 12,
  },
});
