import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AtencionActual } from '@/components/atencion-actual';
import { Boton } from '@/components/boton';
import { Encabezado } from '@/components/encabezado';
import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';
import { useSesion } from '@/context/sesion';
import { leerCodigoQr } from '@/services/api';

// Lo que viene antes del código en el QR del paciente (así se ignoran otros QR)
const PREFIJO_QR = 'kidose:';

// Pestaña izquierda del médico: lector de QR, o la atención actual si ya hay un paciente escaneado.
export default function EscanearScreen() {
  const { pacienteEscaneado, escanearPaciente } = useSesion();
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [atencionEnviada, setAtencionEnviada] = useState(false);
  const [error, setError] = useState('');
  const [consultando, setConsultando] = useState(false);
  // La cámara solo se enciende con la pestaña a la vista (solo puede haber una cámara activa)
  const [camaraActiva, setCamaraActiva] = useState(false);
  // La cámara avisa muchas veces por el mismo QR: con esto se procesa uno a la vez
  const leyendo = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setCamaraActiva(true);
      return () => setCamaraActiva(false);
    }, [])
  );

  if (pacienteEscaneado) {
    return <AtencionActual onEnviada={() => setAtencionEnviada(true)} />;
  }

  async function alLeerQr(contenido: string) {
    if (leyendo.current) return;
    leyendo.current = true;
    setConsultando(true);
    setAtencionEnviada(false);
    setError('');

    try {
      if (!contenido.startsWith(PREFIJO_QR)) {
        throw new Error('Este QR no es de un paciente de Kidose.');
      }
      const paciente = await leerCodigoQr(contenido.slice(PREFIJO_QR.length));
      escanearPaciente(paciente);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo leer el código.');
    } finally {
      setConsultando(false);
      // Se espera un momento antes de aceptar otro QR, para no repetir el mismo error sin parar
      setTimeout(() => {
        leyendo.current = false;
      }, 1500);
    }
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

        <View style={styles.visor}>
          {permiso?.granted && camaraActiva ? (
            <CameraView
              style={styles.camara}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={({ data }) => alLeerQr(data)}
            />
          ) : (
            <Ionicons name="qr-code-outline" size={90} color={COLORES.grisIconoInactivo} />
          )}
          <View style={[styles.esquina, styles.arribaIzquierda]} />
          <View style={[styles.esquina, styles.arribaDerecha]} />
          <View style={[styles.esquina, styles.abajoIzquierda]} />
          <View style={[styles.esquina, styles.abajoDerecha]} />
        </View>

        {permiso !== null && !permiso.granted ? (
          <>
            <Text style={styles.descripcion}>
              Necesitamos permiso para usar la cámara y leer el QR del paciente.
            </Text>
            <View style={styles.contenedorBoton}>
              <Boton texto="Permitir cámara" onPress={pedirPermiso} />
            </View>
          </>
        ) : (
          <Text style={styles.descripcion}>
            {consultando ? 'Buscando al paciente…' : 'Apuntá la cámara al código QR del paciente.'}
          </Text>
        )}

        {error !== '' && <Text style={styles.error}>{error}</Text>}
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
    fontFamily: FUENTES.seminegrita,
    color: COLORES.azulPrimario,
  },
  visor: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    overflow: 'hidden',
  },
  camara: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
    overflow: 'hidden',
  },
  error: {
    fontSize: 14,
    fontFamily: FUENTES.seminegrita,
    lineHeight: 20,
    color: COLORES.rojoAcento,
    textAlign: 'center',
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
    fontFamily: FUENTES.normal,
    lineHeight: 21,
    color: COLORES.gris,
    textAlign: 'center',
  },
  contenedorBoton: {
    alignSelf: 'stretch',
  },
  aclaracion: {
    fontSize: 12,
    fontFamily: FUENTES.normal,
    color: COLORES.gris,
  },
});
