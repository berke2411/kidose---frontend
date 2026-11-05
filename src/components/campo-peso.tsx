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

export function CampoPeso({ valor, pesos, onCambiar, estilo }: Props) {
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
    paddingHorizontal: 0,
    paddingVertical: 8,
    textAlign: 'center',
  },
});
