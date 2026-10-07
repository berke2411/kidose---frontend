import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Boton } from '@/components/boton';
import { CampoTexto } from '@/components/campo-texto';
import { CamposDireccion } from '@/components/campos-direccion';
import { COLORES } from '@/constants/colores';
import { DireccionVerificada, ProfesionalRegistrado } from '@/data/tipos';
import { USUARIOS } from '@/data/usuarios-ejemplo';
import { buscarMatricula } from '@/services/registro-matriculas';
import {
  nombresIguales,
  validarContrasena,
  validarDni,
  validarEmail,
  validarMatricula,
  validarNombre,
} from '@/utils/validaciones';

// Registro de una cuenta nueva, de médico o de paciente.
// Al médico se le verifica la matrícula en tiempo real y que coincida con su nombre y DNI.
export default function SolicitarCuentaScreen() {
  const insets = useSafeAreaInsets();
  const [rol, setRol] = useState<'medico' | 'paciente'>('medico');
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [matricula, setMatricula] = useState('');
  const [hospital, setHospital] = useState('');
  const [contrasena, setContrasena] = useState('');
  // Dirección confirmada por Georef (solo pacientes); null mientras no esté confirmada
  const [direccion, setDireccion] = useState<DireccionVerificada | null>(null);
  const [intentoEnviar, setIntentoEnviar] = useState(false);

  const esMedico = rol === 'medico';

  // "consulta" guarda la última respuesta del registro y de qué matrícula era
  const [consulta, setConsulta] = useState<{
    matricula: string;
    profesional: ProfesionalRegistrado | null;
  } | null>(null);

  const matriculaConFormatoValido = validarMatricula(matricula) === null;

  // "cancelado" evita usar una respuesta vieja si el usuario siguió escribiendo
  useEffect(() => {
    if (!matriculaConFormatoValido) return;

    let cancelado = false;
    buscarMatricula(matricula).then((profesional) => {
      if (!cancelado) setConsulta({ matricula, profesional });
    });
    return () => {
      cancelado = true;
    };
  }, [matricula, matriculaConFormatoValido]);

  const respuestaEsActual = matriculaConFormatoValido && consulta?.matricula === matricula;
  const buscando = matriculaConFormatoValido && !respuestaEsActual;
  // profesional: datos del registro; null = no existe; undefined = todavía sin respuesta
  const profesional = respuestaEsActual ? consulta.profesional : undefined;

  // Error de cada campo (null = está bien)
  const errores = {
    nombre:
      validarNombre(nombre) ??
      (esMedico && profesional && !nombresIguales(nombre, profesional.nombre)
        ? 'El nombre no coincide con el de la matrícula.'
        : null),
    dni:
      validarDni(dni) ??
      (esMedico && profesional && dni.trim() !== profesional.dni
        ? 'El DNI no coincide con el de la matrícula.'
        : null),
    email:
      validarEmail(email) ??
      (USUARIOS.some((usuario) => usuario.email === email.trim().toLowerCase())
        ? 'Ya existe una cuenta con este email.'
        : null),
    hospital: esMedico && hospital.trim() === '' ? 'Ingresá tu hospital o institución.' : null,
    matricula: esMedico
      ? (validarMatricula(matricula) ??
        (buscando
          ? 'Esperá a que termine la verificación.'
          : profesional === null
            ? 'Esta matrícula no figura en el registro.'
            : null))
      : null,
    contrasena: validarContrasena(contrasena),
    direccion: !esMedico && direccion === null ? 'Falta verificar la dirección.' : null,
  };
  const hayErrores = Object.values(errores).some((error) => error !== null);

  // Los errores aparecen recién después de apretar el botón de enviar
  function verError(error: string | null) {
    return intentoEnviar && error ? error : undefined;
  }

  // Excepción: que la matrícula no exista se avisa apenas se escribe (tiempo real)
  const errorMatricula = intentoEnviar
    ? (errores.matricula ?? undefined)
    : profesional === null
      ? 'Esta matrícula no figura en el registro.'
      : undefined;

  let mensajeMatricula: string | undefined;
  if (buscando) mensajeMatricula = 'Verificando matrícula…';
  else if (profesional) mensajeMatricula = `Matrícula verificada · ${profesional.especialidad}`;

  function enviarSolicitud() {
    setIntentoEnviar(true);
    if (hayErrores) return;
    router.replace({ pathname: '/solicitud-enviada', params: { rol } });
  }

  return (
    <View style={styles.pantalla}>
      <View style={[styles.encabezado, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.botonVolver}>
          <Ionicons name="arrow-back" size={24} color={COLORES.blanco} />
        </Pressable>
        <Text style={styles.tituloEncabezado}>Crear cuenta</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.contenido}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          {esMedico
            ? 'Completá tus datos profesionales. Verificamos tu matrícula en el registro de médicos y un administrador aprueba la cuenta.'
            : 'Completá tus datos para crear tu cuenta de paciente.'}
        </Text>

        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>TIPO DE CUENTA</Text>
          <View style={styles.selector}>
            <Pressable
              style={[styles.opcion, esMedico && styles.opcionActiva]}
              onPress={() => setRol('medico')}>
              <Text style={[styles.opcionTexto, esMedico && styles.opcionTextoActivo]}>Médico/a</Text>
            </Pressable>
            <Pressable
              style={[styles.opcion, !esMedico && styles.opcionActiva]}
              onPress={() => setRol('paciente')}>
              <Text style={[styles.opcionTexto, !esMedico && styles.opcionTextoActivo]}>Paciente</Text>
            </Pressable>
          </View>

          {esMedico && (
            <CampoTexto
              etiqueta="MATRÍCULA PROFESIONAL"
              placeholder="Ej: 123456"
              value={matricula}
              onChangeText={setMatricula}
              teclado="number-pad"
              error={errorMatricula}
              mensaje={mensajeMatricula}
            />
          )}
          <CampoTexto
            etiqueta="NOMBRE Y APELLIDO"
            placeholder="Ej: María Giménez"
            value={nombre}
            onChangeText={setNombre}
            mayusculas
            error={verError(errores.nombre)}
          />
          <CampoTexto
            etiqueta="DNI"
            placeholder="Sin puntos"
            value={dni}
            onChangeText={setDni}
            teclado="number-pad"
            error={verError(errores.dni)}
          />
          <CampoTexto
            etiqueta="EMAIL"
            placeholder="nombre@hospital.com"
            value={email}
            onChangeText={setEmail}
            teclado="email-address"
            error={verError(errores.email)}
          />
          {!esMedico && <CamposDireccion mostrarErrores={intentoEnviar} onCambio={setDireccion} />}
          {esMedico && (
            <CampoTexto
              etiqueta="HOSPITAL / INSTITUCIÓN"
              placeholder="Ej: Hospital de Niños"
              value={hospital}
              onChangeText={setHospital}
              mayusculas
              error={verError(errores.hospital)}
            />
          )}
          <CampoTexto
            etiqueta="CONTRASEÑA"
            placeholder="••••••••"
            value={contrasena}
            onChangeText={setContrasena}
            esContrasena
            error={verError(errores.contrasena)}
            mensaje="Mínimo 8 caracteres, con letras y números."
          />
        </View>

        <Boton texto={esMedico ? 'Enviar solicitud' : 'Crear cuenta'} onPress={enviarSolicitud} />

        {esMedico && (
          <Text style={styles.aclaracion}>
            Prueba: matrícula 123456 · Laura Fernández · DNI 30123456 (también 234567 y 345678).
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  encabezado: {
    backgroundColor: COLORES.azulPrimario,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botonVolver: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloEncabezado: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORES.blanco,
  },
  contenido: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  intro: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORES.gris,
  },
  tarjeta: {
    backgroundColor: COLORES.blanco,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  etiqueta: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.3,
    color: COLORES.gris,
    marginBottom: -10,
  },
  selector: {
    flexDirection: 'row',
    backgroundColor: COLORES.divisor,
    borderRadius: 11,
    padding: 4,
  },
  opcion: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcionActiva: {
    backgroundColor: COLORES.blanco,
  },
  opcionTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORES.gris,
  },
  opcionTextoActivo: {
    color: COLORES.azulPrimario,
  },
  aclaracion: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORES.gris,
    textAlign: 'center',
  },
});
