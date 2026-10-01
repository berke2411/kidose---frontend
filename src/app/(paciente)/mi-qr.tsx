import { StyleSheet, Text, View } from 'react-native';

import { Encabezado } from '@/components/encabezado';
import { QrFalso } from '@/components/qr-falso';
import { COLORES } from '@/constants/colores';
import { useSesion } from '@/context/sesion';

// Pestaña central del paciente: su QR para que el médico lo escanee.
export default function MiQrScreen() {
  const { usuario } = useSesion();

  if (usuario === null) return null;

  return (
    <View style={styles.pantalla}>
      <Encabezado etiqueta="MI QR" />

      <View style={styles.centro}>
        <View style={styles.tarjeta}>
          <QrFalso semilla={Number(usuario.dni)} />
          <Text style={styles.nombre}>{usuario.nombre}</Text>
          <Text style={styles.dni}>DNI {usuario.dni}</Text>
        </View>

        <Text style={styles.descripcion}>
          Mostrale este código al médico para que pueda iniciar tu atención.
        </Text>
        <Text style={styles.aclaracion}>QR de ejemplo: todavía no se puede leer.</Text>
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
  nombre: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORES.texto,
  },
  dni: {
    fontSize: 14,
    color: COLORES.gris,
  },
  descripcion: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORES.gris,
    textAlign: 'center',
  },
  aclaracion: {
    fontSize: 12,
    color: COLORES.gris,
  },
});
