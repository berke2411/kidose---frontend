import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { Boton } from '@/components/boton';
import { Encabezado } from '@/components/encabezado';
import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';
import { useSesion } from '@/context/sesion';
import { pedirCodigoQr } from '@/services/api';

const RENOVAR_CADA_MS = 4 * 60 * 1000;

export default function MiQrScreen() {
  const { usuario } = useSesion();
  const [codigo, setCodigo] = useState<string | null>(null);
  const [error, setError] = useState('');

  const pedirCodigo = useCallback(() => {
    setError('');
    pedirCodigoQr()
      .then((respuesta) => setCodigo(respuesta.codigo))
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo generar el QR.'));
  }, []);

  useFocusEffect(
    useCallback(() => {
      pedirCodigo();
      const intervalo = setInterval(pedirCodigo, RENOVAR_CADA_MS);
      return () => clearInterval(intervalo);
    }, [pedirCodigo])
  );

  if (usuario === null) return null;

  return (
    <View style={styles.pantalla}>
      <Encabezado etiqueta="MI QR" />

      <View style={styles.centro}>
        <View style={styles.tarjeta}>
          <View style={styles.contenedorQr}>
            {codigo !== null && <QRCode value={`kidose:${codigo}`} size={200} />}
            {codigo === null && error === '' && <ActivityIndicator color={COLORES.azulPrimario} />}
            {codigo === null && error !== '' && <Text style={styles.error}>{error}</Text>}
          </View>
          <Text style={styles.nombre}>{usuario.nombre}</Text>
          <Text style={styles.dni}>DNI {usuario.dni}</Text>
        </View>

        {error !== '' && <Boton texto="Reintentar" variante="secundario" onPress={pedirCodigo} />}

        <Text style={styles.descripcion}>
          Mostrale este código al médico para que pueda iniciar tu atención.
        </Text>
        <Text style={styles.aclaracion}>El código se renueva solo cada pocos minutos.</Text>
      </View>
    </View>
  );
}

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
  tarjeta: {
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  contenedorQr: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    fontSize: 13,
    fontFamily: FUENTES.normal,
    color: COLORES.gris,
    textAlign: 'center',
  },
  nombre: {
    fontSize: 20,
    fontFamily: FUENTES.negrita,
    color: COLORES.texto,
  },
  dni: {
    fontSize: 14,
    fontFamily: FUENTES.normal,
    color: COLORES.gris,
  },
  descripcion: {
    fontSize: 14,
    fontFamily: FUENTES.normal,
    lineHeight: 21,
    color: COLORES.gris,
    textAlign: 'center',
  },
  aclaracion: {
    fontSize: 12,
    fontFamily: FUENTES.normal,
    color: COLORES.gris,
  },
});
