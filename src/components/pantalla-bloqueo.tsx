import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Logo } from '@/components/logo';
import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';

type Props = {
  alReintentar: () => void;
  alUsarContrasena: () => void;
};

export function PantallaBloqueo({ alReintentar, alUsarContrasena }: Props) {
  return (
    <View style={styles.pantalla}>
      <Logo tamano="grande" />
      <Text style={styles.titulo}>Kidose está bloqueada</Text>
      <Text style={styles.texto}>
        Confirmá tu identidad para proteger los datos de salud de los pacientes.
      </Text>

      <View style={styles.botones}>
        <Boton texto="Desbloquear" onPress={alReintentar} />
        <Boton texto="Ingresar con contraseña" variante="secundario" onPress={alUsarContrasena} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.azulPrimario,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  titulo: {
    fontSize: 22,
    fontFamily: FUENTES.negrita,
    color: COLORES.blanco,
  },
  texto: {
    fontSize: 14,
    fontFamily: FUENTES.normal,
    lineHeight: 20,
    color: COLORES.azulTextoSobreAzul,
    textAlign: 'center',
  },
  botones: {
    alignSelf: 'stretch',
    gap: 12,
    marginTop: 16,
  },
});
