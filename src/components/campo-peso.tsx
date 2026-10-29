import { useState } from 'react';
import { StyleProp, StyleSheet, TextInput, TextStyle } from 'react-native';

import { formatearNumero } from '@/utils/calcular-dosis';
import { leerPeso } from '@/utils/peso';

type Props = {
  valor: number;
  pesos: number[];
  onCambiar: (peso: number) => void;
  estilo: StyleProp<TextStyle>;
};

// Peso que se puede escribir a mano, con coma o punto. Al terminar de escribir se pasa al peso de la tabla
// del libro que corresponde (hacia abajo); si lo escrito no sirve, vuelve al último peso bueno.
export function CampoPeso({ valor, pesos, onCambiar, estilo }: Props) {
  // null cuando no se está escribiendo: ahí se muestra el peso de la tabla
  const [texto, setTexto] = useState<string | null>(null);

  function terminar() {
    const peso = leerPeso(texto ?? '', pesos);
    if (peso !== null) onCambiar(peso);
    setTexto(null);
  }

  return (
    <TextInput
      style={[styles.campo, estilo]}
      value={texto ?? formatearNumero(valor)}
      onChangeText={setTexto}
      onFocus={() => setTexto(formatearNumero(valor))}
      onBlur={terminar}
      onSubmitEditing={terminar}
      keyboardType="decimal-pad"
      selectTextOnFocus
      maxLength={5}
    />
  );
}

const styles = StyleSheet.create({
  campo: {
    padding: 0,
    textAlign: 'center',
  },
});
