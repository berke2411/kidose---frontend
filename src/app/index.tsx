import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Boton } from '@/components/boton';
import { CampoTexto } from '@/components/campo-texto';
import { Logo } from '@/components/logo';
import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';
import { useSesion } from '@/context/sesion';
import { iniciarSesionApi } from '@/services/api';
import { validarEmail } from '@/utils/validaciones';

export default function IngresoScreen() {
  const insets = useSafeAreaInsets();
  const { usuario: usuarioActual, iniciarSesion } = useSesion();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [errorContrasena, setErrorContrasena] = useState('');
  const [ingresando, setIngresando] = useState(false);

  async function ingresar() {
    const problemaEmail = validarEmail(email);
    const problemaContrasena = contrasena === '' ? 'Ingresá tu contraseña.' : null;
    setErrorEmail(problemaEmail ?? '');
    setErrorContrasena(problemaContrasena ?? '');
    if (problemaEmail || problemaContrasena) return;

    setIngresando(true);
    try {
      const { token, usuario } = await iniciarSesionApi(email.trim().toLowerCase(), contrasena);
      iniciarSesion(token, usuario);
    } catch (error) {
      setErrorContrasena(error instanceof Error ? error.message : 'No se pudo ingresar.');
    } finally {
      setIngresando(false);
    }
  }

  function irASolicitarCuenta() {
    router.push('/solicitar-cuenta');
  }

  if (usuarioActual !== null) {
    const inicio = { medico: '/escanear', paciente: '/mi-qr', admin: '/solicitudes' } as const;
    return <Redirect href={inicio[usuarioActual.rol]} />;
  }

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior="padding">
      <ScrollView
        style={styles.pantalla}
        contentContainerStyle={[styles.contenido, { paddingTop: insets.top + 48 }]}
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

          <Boton texto={ingresando ? 'Ingresando…' : 'Ingresar'} onPress={ingresar} deshabilitado={ingresando} />

          <View style={styles.divisor} />

          <Text style={styles.pregunta}>¿Todavía no tenés cuenta?</Text>
          <Boton texto="Solicitar apertura de cuenta" variante="secundario" onPress={irASolicitarCuenta} />
          <Text style={styles.aclaracion}>
            Las cuentas nuevas deben ser aprobadas por un administrador.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontFamily: FUENTES.media,
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
    fontFamily: FUENTES.negrita,
    color: COLORES.texto,
  },
  divisor: {
    height: 1,
    backgroundColor: COLORES.divisor,
    marginVertical: 4,
  },
  pregunta: {
    fontSize: 14,
    fontFamily: FUENTES.normal,
    color: COLORES.gris,
    textAlign: 'center',
  },
  aclaracion: {
    fontSize: 12,
    fontFamily: FUENTES.normal,
    lineHeight: 18,
    color: COLORES.gris,
    textAlign: 'center',
  },
});
