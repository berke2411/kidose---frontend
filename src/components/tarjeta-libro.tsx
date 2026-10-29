import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { BotonInfo } from '@/components/boton-info';
import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';
import { ItemLibro } from '@/data/tipos';
import { formatearNumero } from '@/utils/calcular-dosis';

const VIAS_QUE_NO_SON_DOSIS = ['INFUSIÓN', 'CORRECCIÓN', 'DISPOSITIVOS', 'DESFIBRILADOR'];

type Props = {
  item: ItemLibro;
  onMasInfo: () => void;
  onSuministrar?: (cantidad: number) => void;
  vecesSuministrada?: number;
  alergia?: string | null;
};

// Una indicación de la tabla del libro para el peso elegido, con los textos tal cual los imprime el libro.
export function TarjetaLibro({ item, onMasInfo, onSuministrar, vecesSuministrada = 0, alergia = null }: Props) {
  // Con alergia, el primer toque pide confirmar y recién el segundo suministra
  const [confirmando, setConfirmando] = useState<number | null>(null);

  function suministrar(cantidad: number) {
    if (alergia !== null && confirmando !== cantidad) {
      setConfirmando(cantidad);
      return;
    }
    setConfirmando(null);
    onSuministrar?.(cantidad);
  }

  const colorResaltado = item.esCritico ? COLORES.rojoAcento : COLORES.azulPrimario;
  const valor = item.indicar !== '' ? item.indicar : item.administrar;
  const esRango = item.cantidadMin !== item.cantidadMax;
  const cantidades = esRango ? [item.cantidadMin, item.cantidadMax] : [item.cantidadMax];
  // Lo que no es un medicamento (infusiones, electrolitos, descarga, tubo) se registra, no se suministra
  const verbo = VIAS_QUE_NO_SON_DOSIS.includes(item.via) ? 'Registrar' : 'Suministrar';
  const rotulos = item.via === 'DESFIBRILADOR' ? ['la 1.ª dosis', 'la 2.ª dosis'] : ['el mínimo', 'el máximo'];
  const esMaxima = /dosis m[aá]xima/i.test(item.dosisKg);

  return (
    <View style={[styles.tarjeta, { borderLeftColor: colorResaltado }]}>
      <View style={styles.filaSuperior}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        {item.via !== '' && (
          <View style={styles.chipVia}>
            <Text style={styles.chipViaTexto}>{item.via}</Text>
          </View>
        )}
      </View>

      {item.dosisKg !== '' && <Text style={styles.dosisKg}>{item.dosisKg}</Text>}

      {valor !== '' && <Text style={[styles.valor, { color: colorResaltado }]}>{valor}</Text>}

      {(esMaxima || item.alerta !== '') && (
        <View style={styles.filaChips}>
          {esMaxima && (
            <View style={styles.chipAlerta}>
              <Text style={styles.chipAlertaTexto}>DOSIS MÁXIMA</Text>
            </View>
          )}
          {item.alerta !== '' && (
            <View style={styles.chipAlerta}>
              <Text style={styles.chipAlertaTexto}>{item.alerta.toUpperCase()}</Text>
            </View>
          )}
        </View>
      )}

      {item.indicar !== '' && item.administrar !== '' && (
        <Text style={styles.linea}>
          <Text style={styles.etiqueta}>Administrar: </Text>
          {item.administrar}
        </Text>
      )}
      {item.preparar !== '' && (
        <Text style={styles.linea}>
          <Text style={styles.etiqueta}>Preparar: </Text>
          {item.preparar}
        </Text>
      )}
      {item.detalle.map((linea, i) => (
        <Text key={i} style={styles.linea}>
          {linea}
        </Text>
      ))}
      {item.correccion !== '' && <Text style={styles.correccion}>Corregido: {item.correccion}</Text>}

      {alergia !== null && (
        <View style={styles.chipAlerta}>
          <Text style={styles.chipAlertaTexto}>ALERGIA DEL PACIENTE: {alergia.toUpperCase()}</Text>
        </View>
      )}

      {item.principioActivo !== '' && <BotonInfo onPress={onMasInfo} />}

      {onSuministrar && (
        <View style={styles.filaSuministrar}>
          {vecesSuministrada > 0 && (
            <View style={[styles.chipVia, styles.chipSuministrada]}>
              <Text style={styles.chipViaTexto}>SUMINISTRADA ×{vecesSuministrada}</Text>
            </View>
          )}
          {cantidades.map((cantidad, i) => (
            <Boton
              key={cantidad}
              texto={
                confirmando === cantidad
                  ? 'Confirmar: el paciente es alérgico'
                  : `${verbo}${esRango ? ` ${rotulos[i]}` : ''}: ${formatearNumero(cantidad)} ${item.unidad}`
              }
              variante="secundario"
              onPress={() => suministrar(cantidad)}
            />
          ))}
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
    gap: 8,
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
  dosisKg: {
    fontSize: 13,
    fontFamily: FUENTES.media,
    color: COLORES.gris,
  },
  valor: {
    fontSize: 28,
    fontFamily: FUENTES.negrita,
  },
  filaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  linea: {
    fontSize: 13,
    fontFamily: FUENTES.normal,
    lineHeight: 19,
    color: COLORES.texto,
  },
  etiqueta: {
    fontFamily: FUENTES.seminegrita,
    color: COLORES.gris,
  },
  correccion: {
    fontSize: 12,
    fontFamily: FUENTES.normal,
    lineHeight: 17,
    color: COLORES.gris,
  },
  filaSuministrar: {
    gap: 8,
  },
  chipSuministrada: {
    alignSelf: 'flex-start',
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
