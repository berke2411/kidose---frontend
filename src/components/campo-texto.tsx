import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';

import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';

type Props = {
  etiqueta: string;
  placeholder: string;
  value: string;
  onChangeText: (texto: string) => void;
  esContrasena?: boolean;
  teclado?: KeyboardTypeOptions;
  mayusculas?: boolean;
  error?: string;
  mensaje?: string;
};

export function CampoTexto({
  etiqueta,
  placeholder,
  value,
  onChangeText,
  esContrasena = false,
  teclado = 'default',
  mayusculas = false,
  error,
  mensaje,
}: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputConError : null]}
        placeholder={placeholder}
        placeholderTextColor={COLORES.grisIconoInactivo}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={esContrasena}
        keyboardType={teclado}
        autoCapitalize={mayusculas ? 'words' : 'none'}
        autoCorrect={false}
      />
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : mensaje ? (
        <Text style={styles.mensaje}>{mensaje}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: 6,
  },
  etiqueta: {
    fontSize: 11,
    fontFamily: FUENTES.seminegrita,
    letterSpacing: 1.3,
    color: COLORES.gris,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORES.borde,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: FUENTES.normal,
    color: COLORES.texto,
    backgroundColor: COLORES.blanco,
  },
  inputConError: {
    borderColor: COLORES.rojoAcento,
  },
  error: {
    fontSize: 12,
    fontFamily: FUENTES.normal,
    color: COLORES.rojoAcento,
  },
  mensaje: {
    fontSize: 12,
    fontFamily: FUENTES.normal,
    color: COLORES.gris,
  },
});
