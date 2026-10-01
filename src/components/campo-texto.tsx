import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';

import { COLORES } from '@/constants/colores';

type Props = {
  etiqueta: string;
  placeholder: string;
  value: string;
  onChangeText: (texto: string) => void;
  esContrasena?: boolean; // si es true, oculta lo que se escribe
  teclado?: KeyboardTypeOptions; // ej: 'email-address', 'number-pad'
  mayusculas?: boolean; // true para nombres (primera letra de cada palabra en mayúscula)
  error?: string; // mensaje en rojo debajo del campo
  mensaje?: string; // aviso en gris debajo del campo (si no hay error)
};

// Campo de formulario: etiqueta arriba, caja de texto y mensaje opcional abajo.
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
    fontWeight: '600',
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
    color: COLORES.texto,
    backgroundColor: COLORES.blanco,
  },
  inputConError: {
    borderColor: COLORES.rojoAcento,
  },
  error: {
    fontSize: 12,
    color: COLORES.rojoAcento,
  },
  mensaje: {
    fontSize: 12,
    color: COLORES.gris,
  },
});
