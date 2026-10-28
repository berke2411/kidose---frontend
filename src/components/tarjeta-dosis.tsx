import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { BotonInfo } from '@/components/boton-info';
import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';
import { Medicamento } from '@/data/tipos';
import { calcularDosis, formatearNumero } from '@/utils/calcular-dosis';

type Props = {
  medicamento: Medicamento;
  peso: number;
  onMasInfo: () => void; // la pantalla abre la ventana con la información del medicamento
  onSuministrar?: (cantidad: number) => void; // si se pasa, aparece el botón "Suministrar"
  vecesSuministrada?: number; // cuántas veces ya se suministró en esta atención
  alergia?: string | null; // alergia del paciente que coincide con este medicamento
};

// Tarjeta con el resultado de un medicamento en la calculadora.
export function TarjetaDosis({
  medicamento,
  peso,
  onMasInfo,
  onSuministrar,
  vecesSuministrada = 0,
  alergia = null,
}: Props) {
  const { dosis, llegoAlMaximo } = calcularDosis(medicamento, peso);
  // Con alergia, el primer toque pide confirmar y recién el segundo suministra
  const [confirmando, setConfirmando] = useState(false);

  function tocarSuministrar() {
    if (alergia !== null && !confirmando) {
      setConfirmando(true);
      return;
    }
    setConfirmando(false);
    onSuministrar?.(dosis);
  }

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

      {alergia !== null && (
        <View style={styles.chipMaximo}>
          <Text style={styles.chipMaximoTexto}>ALERGIA DEL PACIENTE: {alergia.toUpperCase()}</Text>
        </View>
      )}

      <BotonInfo onPress={onMasInfo} />

      {onSuministrar && (
        <View style={styles.filaSuministrar}>
          {vecesSuministrada > 0 && (
            <View style={[styles.chipVia, styles.chipSuministrada]}>
              <Text style={styles.chipViaTexto}>SUMINISTRADA ×{vecesSuministrada}</Text>
            </View>
          )}
          <Boton
            texto={confirmando ? 'Confirmar: el paciente es alérgico' : 'Suministrar'}
            variante="secundario"
            onPress={tocarSuministrar}
          />
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
    fontFamily: FUENTES.negrita,
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
    fontFamily: FUENTES.negrita,
    letterSpacing: 1,
    color: COLORES.azulPrimario,
  },
  valor: {
    fontSize: 30,
    fontFamily: FUENTES.negrita,
  },
  filaInferior: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nota: {
    flex: 1,
    fontSize: 13,
    fontFamily: FUENTES.normal,
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
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: COLORES.alerta,
  },
  chipMaximoTexto: {
    fontSize: 10,
    fontFamily: FUENTES.negrita,
    letterSpacing: 0.8,
    color: COLORES.rojoAcento,
  },
});
