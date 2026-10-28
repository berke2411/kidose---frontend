import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Boton } from '@/components/boton';
import { CampoTexto } from '@/components/campo-texto';
import { CamposDireccion } from '@/components/campos-direccion';
import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';
import { DireccionVerificada, ProfesionalRegistrado } from '@/data/tipos';
import { buscarMatricula, registrarCuenta } from '@/services/api';
import { fechaDesdeTexto } from '@/utils/fechas';
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
// La cuenta se crea en el servidor, que vuelve a validar todo.
export default function SolicitarCuentaScreen() {
  const insets = useSafeAreaInsets();
  const [rol, setRol] = useState<'medico' | 'paciente'>('medico');
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [matricula, setMatricula] = useState('');
  const [hospital, setHospital] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [peso, setPeso] = useState('');
  const [alergias, setAlergias] = useState('');
  const [enviando, setEnviando] = useState(false);
  // Dirección confirmada por Georef (solo pacientes); null mientras no esté confirmada
  const [direccion, setDireccion] = useState<DireccionVerificada | null>(null);
  const [intentoEnviar, setIntentoEnviar] = useState(false);

  const esMedico = rol === 'medico';

  // "consulta" guarda la última respuesta del registro y de qué matrícula era
  const [consulta, setConsulta] = useState<{
    matricula: string;
    profesional: ProfesionalRegistrado | null;
  } | null>(null);

  // Matrícula cuya verificación falló por un problema de conexión (null = ninguna)
  const [matriculaSinConexion, setMatriculaSinConexion] = useState<string | null>(null);

  const matriculaConFormatoValido = validarMatricula(matricula) === null;

  // "cancelado" evita usar una respuesta vieja si el usuario siguió escribiendo
  useEffect(() => {
    if (!matriculaConFormatoValido) return;

    let cancelado = false;
    buscarMatricula(matricula)
      .then((profesional) => {
        if (!cancelado) setConsulta({ matricula, profesional });
      })
      .catch(() => {
        if (!cancelado) setMatriculaSinConexion(matricula);
      });
    return () => {
      cancelado = true;
    };
  }, [matricula, matriculaConFormatoValido]);

  const respuestaEsActual = matriculaConFormatoValido && consulta?.matricula === matricula;
  const fallo = matriculaSinConexion === matricula;
  const buscando = matriculaConFormatoValido && !respuestaEsActual && !fallo;
  // profesional: datos del registro; null = no existe; undefined = todavía sin respuesta
  const profesional = respuestaEsActual ? consulta.profesional : undefined;

  // El peso se escribe con coma o punto (ej: 14,5)
  const pesoNumerico = Number(peso.trim().replace(',', '.'));

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
    email: validarEmail(email),
    fechaNacimiento:
      !esMedico && fechaDesdeTexto(fechaNacimiento) === null
        ? 'Ingresá una fecha válida. Ej: 15/07/2023'
        : null,
    peso: !esMedico && !(pesoNumerico >= 2 && pesoNumerico <= 80) ? 'Ingresá un peso entre 2 y 80 kg.' : null,
    hospital: esMedico && hospital.trim() === '' ? 'Ingresá tu hospital o institución.' : null,
    matricula: esMedico
      ? (validarMatricula(matricula) ??
        (fallo
          ? 'No se pudo verificar la matrícula. Revisá tu conexión.'
          : buscando
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
    : fallo
      ? 'No se pudo verificar la matrícula. Revisá tu conexión.'
      : profesional === null
        ? 'Esta matrícula no figura en el registro.'
        : undefined;

  let mensajeMatricula: string | undefined;
  if (buscando) mensajeMatricula = 'Verificando matrícula…';
  else if (profesional) mensajeMatricula = `Matrícula verificada · ${profesional.especialidad}`;

  async function enviarSolicitud() {
    setIntentoEnviar(true);
    if (hayErrores) return;

    setEnviando(true);
    try {
      if (esMedico) {
        await registrarCuenta({
          rol,
          nombre: nombre.trim(),
          dni: dni.trim(),
          email: email.trim().toLowerCase(),
          contrasena,
          matricula: matricula.trim(),
          hospital: hospital.trim(),
        });
      } else {
        await registrarCuenta({
          rol,
          nombre: nombre.trim(),
          dni: dni.trim(),
          email: email.trim().toLowerCase(),
          contrasena,
          fechaNacimiento: fechaDesdeTexto(fechaNacimiento) ?? undefined,
          pesoKg: pesoNumerico,
          // Las alergias se escriben separadas por comas
          alergias: alergias.split(',').map((alergia) => alergia.trim()).filter((alergia) => alergia !== ''),
          direccion: direccion?.direccion,
          latitud: direccion?.latitud,
          longitud: direccion?.longitud,
        });
      }
      router.replace({ pathname: '/solicitud-enviada', params: { rol } });
    } catch (error) {
      // Por ejemplo: ya existe una cuenta con ese email o DNI
      Alert.alert('No se pudo crear la cuenta', error instanceof Error ? error.message : 'Intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
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
          {!esMedico && (
            <>
              <CampoTexto
                etiqueta="FECHA DE NACIMIENTO"
                placeholder="dd/mm/aaaa"
                value={fechaNacimiento}
                onChangeText={setFechaNacimiento}
                teclado="numbers-and-punctuation"
                error={verError(errores.fechaNacimiento)}
              />
              <CampoTexto
                etiqueta="PESO (KG)"
                placeholder="Ej: 14,5"
                value={peso}
                onChangeText={setPeso}
                teclado="decimal-pad"
                error={verError(errores.peso)}
                mensaje="El médico lo puede corregir al atenderte."
              />
              <CampoTexto
                etiqueta="ALERGIAS (OPCIONAL)"
                placeholder="Ej: Penicilina, Látex"
                value={alergias}
                onChangeText={setAlergias}
                mensaje="Separalas con comas."
              />
              <CamposDireccion mostrarErrores={intentoEnviar} onCambio={setDireccion} />
            </>
          )}
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

        <Boton
          texto={enviando ? 'Enviando…' : esMedico ? 'Enviar solicitud' : 'Crear cuenta'}
          onPress={enviarSolicitud}
          deshabilitado={enviando}
        />

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
    fontFamily: FUENTES.negrita,
    color: COLORES.blanco,
  },
  contenido: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  intro: {
    fontSize: 14,
    fontFamily: FUENTES.normal,
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
    fontFamily: FUENTES.seminegrita,
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
    fontFamily: FUENTES.seminegrita,
    color: COLORES.gris,
  },
  opcionTextoActivo: {
    color: COLORES.azulPrimario,
  },
  aclaracion: {
    fontSize: 12,
    fontFamily: FUENTES.normal,
    lineHeight: 18,
    color: COLORES.gris,
    textAlign: 'center',
  },
});
