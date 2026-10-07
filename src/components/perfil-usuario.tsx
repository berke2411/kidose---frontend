import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Encabezado } from '@/components/encabezado';
import { COLORES } from '@/constants/colores';
import { useSesion } from '@/context/sesion';

// Pantalla de perfil: la usan médico y paciente (cambian los datos que se muestran).
export function PerfilUsuario() {
  const { usuario, cerrarSesion } = useSesion();

  if (usuario === null) return null;

  const datos =
    usuario.rol === 'medico'
      ? [
          ['EMAIL', usuario.email],
          ['DNI', usuario.dni],
          ['MATRÍCULA', usuario.matricula],
          ['ESPECIALIDAD', usuario.especialidad],
          ['HOSPITAL', usuario.hospital],
        ]
      : [
          ['EMAIL', usuario.email],
          ['DNI', usuario.dni],
          ['EDAD', usuario.edad],
          ['DIRECCIÓN', usuario.direccion],
          ['ALERGIAS', usuario.alergias.length > 0 ? usuario.alergias.join(', ') : 'Ninguna conocida'],
        ];

  // Iniciales para la "foto" (todavía no se puede subir una foto real)
  const iniciales = usuario.nombre
    .split(' ')
    .filter((palabra) => palabra !== '')
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('')
    .toUpperCase();

  function salir() {
    cerrarSesion();
    router.replace('/');
  }

  return (
    <View style={styles.pantalla}>
      <Encabezado etiqueta="PERFIL" />

      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.cabecera}>
          <View style={styles.foto}>
            <Text style={styles.iniciales}>{iniciales}</Text>
          </View>
          <Text style={styles.nombre}>{usuario.nombre}</Text>
          <View style={styles.chipRol}>
            <Text style={styles.chipRolTexto}>{usuario.rol === 'medico' ? 'MÉDICO/A' : 'PACIENTE'}</Text>
          </View>
        </View>

        <View style={styles.tarjeta}>
          {datos.map(([etiqueta, valor]) => (
            <View key={etiqueta} style={styles.dato}>
              <Text style={styles.etiqueta}>{etiqueta}</Text>
              <Text style={styles.valor}>{valor}</Text>
            </View>
          ))}
        </View>

        <Boton texto="Cerrar sesión" variante="secundario" onPress={salir} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  contenido: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  cabecera: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  foto: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORES.azulPrimario,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciales: {
    fontSize: 34,
    fontWeight: '700',
    color: COLORES.blanco,
  },
  nombre: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORES.texto,
  },
  chipRol: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 7,
    backgroundColor: COLORES.azulSuave,
  },
  chipRolTexto: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: COLORES.azulPrimario,
  },
  tarjeta: {
    backgroundColor: COLORES.blanco,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  dato: {
    gap: 4,
  },
  etiqueta: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.3,
    color: COLORES.gris,
  },
  valor: {
    fontSize: 16,
    color: COLORES.texto,
  },
});
