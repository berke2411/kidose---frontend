import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { BotonInfo } from '@/components/boton-info';
import { COLORES } from '@/constants/colores';
import { Medicamento } from '@/data/medicamentos-ejemplo';
import { calcularDosis, formatearNumero } from '@/utils/calcular-dosis';

type Props = {
  medicamento: Medicamento;
  peso: number;
  onMasInfo: () => void; // la pantalla abre la ventana con la información del medicamento
  onSuministrar?: (cantidad: number) => void; // si se pasa, aparece el botón "Suministrar"
  vecesSuministrada?: number; // cuántas veces ya se suministró en esta atención
};

// Tarjeta con el resultado de un medicamento en la calculadora.
export function TarjetaDosis({ medicamento, peso, onMasInfo, onSuministrar, vecesSuministrada = 0 }: Props) {
  const { dosis, llegoAlMaximo } = calcularDosis(medicamento, peso);

  const colorResaltado = medicamento.esCritico ? COLORES.rojoAcento : COLORES.azulPrimario;

  return (
    <View style={[styles.tarjeta, { borderLeftColor: colorResaltado }]}>
      <View style={styles.filaSuperior}>
        <Text style={styles.nombre}>{medicamento.nombre}</Text>
        <View style={styles.chipVia}>
          <Text style={styles.chipViaTexto}>{medicamento.via}</Text>
        </View>
      </View>

      <Text style={[styles.valor, { color: colorResaltado }]}>
        {formatearNumero(dosis)} {medicamento.unidad}
      </Text>

      <View style={styles.filaInferior}>
        <Text style={styles.nota}>{medicamento.nota}</Text>
        {llegoAlMaximo && (
          <View style={styles.chipMaximo}>
            <Text style={styles.chipMaximoTexto}>DOSIS MÁXIMA</Text>
          </View>
        )}
      </View>

      <BotonInfo onPress={onMasInfo} />

      {onSuministrar && (
        <View style={styles.filaSuministrar}>
          {vecesSuministrada > 0 && (
            <View style={[styles.chipVia, styles.chipSuministrada]}>
              <Text style={styles.chipViaTexto}>SUMINISTRADA ×{vecesSuministrada}</Text>
            </View>
          )}
          <Boton texto="Suministrar" variante="secundario" onPress={() => onSuministrar(dosis)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: COLORES.blanco,
    borderRadius: 14,
    borderLeftWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 9,
  },
  filaSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  nombre: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORES.texto,
  },
  chipVia: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: COLORES.azulSuave,
  },
  chipViaTexto: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORES.azulPrimario,
  },
  valor: {
    fontSize: 30,
    fontWeight: '700',
  },
  filaInferior: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nota: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: COLORES.gris,
  },
  filaSuministrar: {
    gap: 8,
  },
  chipSuministrada: {
    alignSelf: 'flex-start',
  },
  chipMaximo: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: COLORES.alerta,
  },
  chipMaximoTexto: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: COLORES.rojoAcento,
  },
});
