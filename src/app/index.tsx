import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Boton } from '@/components/boton';
import { CampoTexto } from '@/components/campo-texto';
import { Logo } from '@/components/logo';
import { COLORES } from '@/constants/colores';
import { useSesion } from '@/context/sesion';
import { USUARIOS } from '@/data/usuarios-ejemplo';
import { validarEmail } from '@/utils/validaciones';

// Pantalla de ingreso: es lo primero que ve el usuario al abrir la app.
// Sin backend: se ingresa con las cuentas de prueba de USUARIOS.
export default function IngresoScreen() {
  const insets = useSafeAreaInsets();
  const { usuario: usuarioActual, iniciarSesion } = useSesion();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [errorContrasena, setErrorContrasena] = useState('');

  function ingresar() {
    const problemaEmail = validarEmail(email);
    const problemaContrasena = contrasena === '' ? 'Ingresá tu contraseña.' : null;
    setErrorEmail(problemaEmail ?? '');
    setErrorContrasena(problemaContrasena ?? '');
    if (problemaEmail || problemaContrasena) return;

    const usuario = USUARIOS.find(
      (u) => u.email === email.trim().toLowerCase() && u.contrasena === contrasena
    );
    if (usuario === undefined) {
      setErrorContrasena('Email o contraseña incorrectos.');
      return;
    }

    iniciarSesion(usuario);
  }

  function irASolicitarCuenta() {
    router.push('/solicitar-cuenta');
  }

  // Con sesión iniciada (recién ingresada o recuperada) se salta el login
  if (usuarioActual !== null) {
    return <Redirect href={usuarioActual.rol === 'medico' ? '/escanear' : '/mi-qr'} />;
  }

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={[styles.contenido, { paddingTop: insets.top + 48 }]}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled">
      <View style={styles.marca}>
        <Logo tamano="grande" />
        <Text style={styles.lema}>DOSIS PEDIÁTRICAS DE EMERGENCIA</Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.titulo}>Iniciar sesión</Text>

        <CampoTexto
          etiqueta="EMAIL"
          placeholder="nombre@hospital.com"
          value={email}
          onChangeText={setEmail}
          teclado="email-address"
          error={errorEmail}
        />
        <CampoTexto
          etiqueta="CONTRASEÑA"
          placeholder="••••••••"
          value={contrasena}
          onChangeText={setContrasena}
          esContrasena
          error={errorContrasena}
        />

        <Boton texto="Ingresar" onPress={ingresar} />

        <Text style={styles.aclaracion}>
          Cuentas de prueba: medico@kidose.com / Medico123 · paciente@kidose.com / Paciente123
        </Text>

        <View style={styles.divisor} />

        <Text style={styles.pregunta}>¿Todavía no tenés cuenta?</Text>
        <Boton texto="Solicitar apertura de cuenta" variante="secundario" onPress={irASolicitarCuenta} />
        <Text style={styles.aclaracion}>
          Las cuentas nuevas deben ser aprobadas por un administrador.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.azulPrimario,
  },
  contenido: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 36,
  },
  marca: {
    alignItems: 'center',
    gap: 12,
  },
  lema: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 2,
    color: COLORES.azulTextoSobreAzul,
  },
  tarjeta: {
    backgroundColor: COLORES.blanco,
    borderRadius: 18,
    padding: 22,
    gap: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORES.texto,
  },
  divisor: {
    height: 1,
    backgroundColor: COLORES.divisor,
    marginVertical: 4,
  },
  pregunta: {
    fontSize: 14,
    color: COLORES.gris,
    textAlign: 'center',
  },
  aclaracion: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORES.gris,
    textAlign: 'center',
  },
});
