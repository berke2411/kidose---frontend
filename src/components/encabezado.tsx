import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/logo';
import { COLORES } from '@/constants/colores';

type Props = {
  etiqueta: string; // texto chico a la derecha (ej: "QR")
  children?: ReactNode; // contenido extra debajo del logo (opcional)
};

// Barra azul superior que comparten las pantallas principales.
export function Encabezado({ etiqueta, children }: Props) {
  // "insets" nos dice cuánto espacio ocupa la barra de estado del celular
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top + 16 }]}>
      <View style={styles.fila}>
        <Logo />
        <Text style={styles.etiqueta}>{etiqueta}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: COLORES.azulPrimario,
    paddingHorizontal: 22,
    paddingBottom: 16,
    gap: 16,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etiqueta: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.3,
    color: COLORES.azulTextoSobreAzul,
  },
});
