import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { COLORES } from '@/constants/colores';

// Confirmación del registro. El médico queda pendiente hasta que un admin lo apruebe;
// el paciente ya puede ingresar.
export default function SolicitudEnviadaScreen() {
  const { rol } = useLocalSearchParams<{ rol: string }>();
  const esMedico = rol === 'medico';

  function volverAlInicio() {
    router.replace('/');
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.tarjeta}>
        <View style={styles.circuloIcono}>
          <Ionicons
            name={esMedico ? 'hourglass-outline' : 'checkmark-outline'}
            size={40}
            color={COLORES.azulPrimario}
          />
        </View>

        <View style={styles.chip}>
          <Text style={styles.chipTexto}>{esMedico ? 'PENDIENTE DE APROBACIÓN' : 'CUENTA CREADA'}</Text>
        </View>

        <Text style={styles.titulo}>{esMedico ? 'Solicitud enviada' : '¡Listo!'}</Text>
        <Text style={styles.descripcion}>
          {esMedico
            ? 'Verificamos tu matrícula. Un administrador va a revisar tus datos y te avisaremos por email cuando tu cuenta esté habilitada.'
            : 'Tu cuenta fue creada. Ya podés ingresar con tu email y contraseña.'}
        </Text>

        <View style={styles.contenedorBoton}>
          <Boton texto="Volver al inicio" onPress={volverAlInicio} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.azulPrimario,
    justifyContent: 'center',
    padding: 20,
  },
  tarjeta: {
    backgroundColor: COLORES.blanco,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    gap: 14,
  },
  circuloIcono: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORES.azulSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 7,
    backgroundColor: COLORES.azulSuave,
  },
  chipTexto: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: COLORES.azulPrimario,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORES.texto,
  },
  descripcion: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORES.gris,
    textAlign: 'center',
  },
  contenedorBoton: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
});
