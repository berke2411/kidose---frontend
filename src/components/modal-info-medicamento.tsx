import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { COLORES } from '@/constants/colores';
import { Medicamento } from '@/data/medicamentos-ejemplo';
import { Contraindicaciones } from '@/data/tipos';
import { buscarContraindicaciones } from '@/services/cima';

type Props = {
  medicamento: Medicamento | null; // si es null el modal está cerrado
  onCerrar: () => void;
};

// Contenido del modal: se monta cada vez que se abre, por eso arranca "cargando"
function InfoMedicamento({ medicamento }: { medicamento: Medicamento }) {
  const [info, setInfo] = useState<Contraindicaciones | null>(null);
  const [cargando, setCargando] = useState(true);
  const [hayError, setHayError] = useState(false);

  useEffect(() => {
    let cancelado = false;
    buscarContraindicaciones(medicamento.principioActivo, medicamento.viaCima)
      .then((resultado) => {
        if (!cancelado) setInfo(resultado);
      })
      .catch(() => {
        if (!cancelado) setHayError(true);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    // Si se cierra antes de que llegue la respuesta, la ignoramos
    return () => {
      cancelado = true;
    };
  }, [medicamento]);

  if (cargando) {
    return <ActivityIndicator color={COLORES.azulPrimario} style={styles.cargando} />;
  }
  if (hayError) {
    return <Text style={styles.mensaje}>No se pudo consultar la información. Revisá tu conexión.</Text>;
  }
  if (info === null) {
    return <Text style={styles.mensaje}>No hay información disponible para este medicamento.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.lista}>
      <Text style={styles.seccion}>CONTRAINDICACIONES</Text>
      <View style={styles.tarjeta}>
        <Text style={styles.texto}>{info.texto}</Text>
      </View>
      <Text style={styles.fuente}>
        Ficha técnica de {info.producto} ({info.laboratorio}). Fuente: CIMA, agencia de medicamentos de
        España.
      </Text>
    </ScrollView>
  );
}

// Ventana con las contraindicaciones del medicamento.
// La usan el médico (desde la calculadora) y el paciente (desde su historial).
export function ModalInfoMedicamento({ medicamento, onCerrar }: Props) {
  return (
    <Modal visible={medicamento !== null} animationType="slide" transparent onRequestClose={onCerrar}>
      <View style={styles.fondo}>
        <View style={styles.hoja}>
          <Text style={styles.titulo}>{medicamento?.nombre}</Text>

          {medicamento !== null && <InfoMedicamento medicamento={medicamento} />}

          <Boton texto="Cerrar" variante="secundario" onPress={onCerrar} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  hoja: {
    maxHeight: '85%',
    backgroundColor: COLORES.fondo,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 12,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORES.texto,
  },
  seccion: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: COLORES.gris,
  },
  cargando: {
    marginVertical: 20,
  },
  mensaje: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORES.gris,
  },
  lista: {
    gap: 10,
  },
  tarjeta: {
    backgroundColor: COLORES.blanco,
    borderRadius: 12,
    padding: 14,
  },
  texto: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORES.texto,
  },
  fuente: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORES.gris,
  },
});
