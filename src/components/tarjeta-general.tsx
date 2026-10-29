import { StyleSheet, Text, View } from 'react-native';

import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';
import { ItemGeneral } from '@/data/tipos';
import { formatearNumero } from '@/utils/calcular-dosis';

// Una indicación del libro que no está en las tablas por peso, con las dosis calculadas para el peso elegido.
export function TarjetaGeneral({ item, alergia = null }: { item: ItemGeneral; alergia?: string | null }) {
  return (
    <View style={styles.tarjeta}>
      <Text style={styles.nombre}>{item.nombre}</Text>

      {alergia !== null && (
        <View style={styles.chipAlerta}>
          <Text style={styles.chipAlertaTexto}>ALERGIA DEL PACIENTE: {alergia.toUpperCase()}</Text>
        </View>
      )}

      {item.pasos?.map((paso, i) => (
        <Text key={i} style={styles.linea}>
          • {paso}
        </Text>
      ))}

      {item.calculos.map((calculo, i) => (
        <View key={i} style={styles.calculo}>
          <Text style={styles.etiqueta}>{calculo.etiqueta}</Text>
          <Text style={styles.valor}>
            {formatearNumero(calculo.min)}
            {calculo.max !== null && ` – ${formatearNumero(calculo.max)}`} {calculo.unidad}
            {calculo.por !== null && `/${calculo.por}`}
          </Text>
          {calculo.llegoAlTope && (
            <View style={styles.chipAlerta}>
              <Text style={styles.chipAlertaTexto}>DOSIS MÁXIMA</Text>
            </View>
          )}
        </View>
      ))}

      {item.dosis !== undefined && (
        <Text style={styles.linea}>
          <Text style={styles.etiquetaTexto}>Dosis del libro: </Text>
          {item.dosis}
        </Text>
      )}
      {item.maximo !== undefined && (
        <Text style={styles.linea}>
          <Text style={styles.etiquetaTexto}>Dosis máxima: </Text>
          {item.maximo}
        </Text>
      )}
      {item.info !== undefined && <Text style={styles.linea}>{item.info}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: COLORES.blanco,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORES.azulPrimario,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  nombre: {
    fontSize: 17,
    fontFamily: FUENTES.negrita,
    color: COLORES.texto,
  },
  calculo: {
    gap: 2,
  },
  etiqueta: {
    fontSize: 13,
    fontFamily: FUENTES.media,
    color: COLORES.gris,
  },
  valor: {
    fontSize: 22,
    fontFamily: FUENTES.negrita,
    color: COLORES.azulPrimario,
  },
  linea: {
    fontSize: 13,
    fontFamily: FUENTES.normal,
    lineHeight: 19,
    color: COLORES.texto,
  },
  etiquetaTexto: {
    fontFamily: FUENTES.seminegrita,
    color: COLORES.gris,
  },
  chipAlerta: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: COLORES.alerta,
  },
  chipAlertaTexto: {
    fontSize: 10,
    fontFamily: FUENTES.negrita,
    letterSpacing: 0.8,
    color: COLORES.rojoAcento,
  },
});
