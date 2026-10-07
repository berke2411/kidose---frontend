import { StyleSheet, View } from 'react-native';

import { COLORES } from '@/constants/colores';

const CELDAS = 25; // el QR es una grilla de 25 × 25 cuadraditos
const TAMANO_CELDA = 8;

type Props = {
  semilla: number; // número que cambia el dibujo (ej: el DNI del paciente)
};

// QR de mentira: parece un código QR pero no se puede leer.
// Cuando haya backend se reemplaza por un QR real con el identificador del paciente.
export function QrFalso({ semilla }: Props) {
  const filas = [];

  for (let fila = 0; fila < CELDAS; fila++) {
    const celdas = [];
    for (let columna = 0; columna < CELDAS; columna++) {
      celdas.push(
        <View
          key={columna}
          style={[styles.celda, celdaEncendida(fila, columna, semilla) && styles.celdaNegra]}
        />
      );
    }
    filas.push(
      <View key={fila} style={styles.fila}>
        {celdas}
      </View>
    );
  }

  return <View style={styles.qr}>{filas}</View>;
}

// Decide si una celda va negra. Las 3 esquinas llevan el cuadrado característico
// de los QR; el resto se llena con un patrón que depende de la semilla.
function celdaEncendida(fila: number, columna: number, semilla: number) {
  const ultima = CELDAS - 7;

  const enEsquinaSuperior = fila < 7 && (columna < 7 || columna >= ultima);
  const enEsquinaInferior = fila >= ultima && columna < 7;
  if (enEsquinaSuperior || enEsquinaInferior) {
    const filaLocal = fila % ultima;
    const columnaLocal = columna % ultima;
    const enBorde = filaLocal === 0 || filaLocal === 6 || columnaLocal === 0 || columnaLocal === 6;
    const enCentro = filaLocal >= 2 && filaLocal <= 4 && columnaLocal >= 2 && columnaLocal <= 4;
    return enBorde || enCentro;
  }

  const cercaDeEsquina =
    (fila < 8 && (columna < 8 || columna >= ultima - 1)) || (fila >= ultima - 1 && columna < 8);
  if (cercaDeEsquina) return false;

  return (fila * 7 + columna * 13 + fila * columna + semilla) % 3 === 0;
}

const styles = StyleSheet.create({
  qr: {
    padding: 12,
    backgroundColor: COLORES.blanco,
  },
  fila: {
    flexDirection: 'row',
  },
  celda: {
    width: TAMANO_CELDA,
    height: TAMANO_CELDA,
  },
  celdaNegra: {
    backgroundColor: COLORES.texto,
  },
});
