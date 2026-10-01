import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AtencionActual } from '@/components/atencion-actual';
import { Boton } from '@/components/boton';
import { Encabezado } from '@/components/encabezado';
import { COLORES } from '@/constants/colores';
import { useSesion } from '@/context/sesion';
import { PACIENTE_EJEMPLO } from '@/data/usuarios-ejemplo';

// Pestaña izquierda del médico. Tiene dos estados:
//   - sin paciente escaneado → lector de QR
//   - con paciente escaneado → sus datos y las dosis de la atención actual
export default function EscanearScreen() {
  const { pacienteEscaneado, escanearPaciente } = useSesion();
  const [atencionEnviada, setAtencionEnviada] = useState(false);

  if (pacienteEscaneado) {
    return <AtencionActual onEnviada={() => setAtencionEnviada(true)} />;
  }

  // El escaneo es de mentira: en vez de usar la cámara, "encuentra" al paciente de ejemplo
  function simularEscaneo() {
    setAtencionEnviada(false);
    escanearPaciente(PACIENTE_EJEMPLO);
  }

  return (
    <View style={styles.pantalla}>
      <Encabezado etiqueta="ESCANEAR QR" />

      <View style={styles.centro}>
        {atencionEnviada && (
          <View style={styles.avisoEnviada}>
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORES.azulPrimario} />
            <Text style={styles.avisoEnviadaTexto}>Atención enviada correctamente.</Text>
          </View>
        )}

        {/* Marco del visor con 4 esquinas */}
        <View style={styles.visor}>
          <View style={[styles.esquina, styles.arribaIzquierda]} />
          <View style={[styles.esquina, styles.arribaDerecha]} />
          <View style={[styles.esquina, styles.abajoIzquierda]} />
          <View style={[styles.esquina, styles.abajoDerecha]} />
          <Ionicons name="qr-code-outline" size={90} color={COLORES.grisIconoInactivo} />
        </View>

        <Text style={styles.descripcion}>Apuntá la cámara al código QR del paciente.</Text>

        <View style={styles.contenedorBoton}>
          <Boton texto="Simular escaneo" onPress={simularEscaneo} />
        </View>
        <Text style={styles.aclaracion}>Prototipo: todavía no usa la cámara.</Text>
      </View>
    </View>
  );
}

const LARGO_ESQUINA = 36;

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  avisoEnviada: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORES.azulSuave,
  },
  avisoEnviadaTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORES.azulPrimario,
  },
  visor: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
  },
  esquina: {
    position: 'absolute',
    width: LARGO_ESQUINA,
    height: LARGO_ESQUINA,
    borderColor: COLORES.azulPrimario,
  },
  arribaIzquierda: {
    top: 12,
    left: 12,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  arribaDerecha: {
    top: 12,
    right: 12,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  abajoIzquierda: {
    bottom: 12,
    left: 12,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  abajoDerecha: {
    bottom: 12,
    right: 12,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  descripcion: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORES.gris,
    textAlign: 'center',
  },
  contenedorBoton: {
    alignSelf: 'stretch',
  },
  aclaracion: {
    fontSize: 12,
    color: COLORES.gris,
  },
});
