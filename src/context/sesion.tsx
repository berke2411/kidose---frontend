import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { PantallaBloqueo } from '@/components/pantalla-bloqueo';
import { DosisSuministrada, ItemLibro, Paciente, Usuario } from '@/data/tipos';
import {
  actualizarPesoPaciente,
  alVencerSesion,
  fijarToken,
  obtenerPaciente,
  obtenerUsuarioActual,
} from '@/services/api';
import { confirmarIdentidad } from '@/services/biometria';

type DosisDeLibro = Pick<ItemLibro, 'medicamentoId' | 'nombre' | 'via' | 'unidad'>;

type Sesion = {
  usuario: Usuario | null;
  pacienteEscaneado: Paciente | null;
  pesoGuardado: number | null;
  dosisSuministradas: DosisSuministrada[];
  iniciarSesion: (token: string, usuario: Usuario) => void;
  cerrarSesion: () => void;
  actualizarUsuario: (usuario: Usuario) => void;
  escanearPaciente: (paciente: Paciente) => void;
  actualizarPeso: (pesoKg: number) => void;
  guardarPeso: () => Promise<void>;
  suministrarDosis: (item: DosisDeLibro, cantidad: number) => void;
  quitarDosis: (id: number) => void;
  terminarAtencion: () => void;
};

const SesionContext = createContext<Sesion | null>(null);

const CLAVE_SESION = 'sesion';

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pacienteEscaneado, setPacienteEscaneado] = useState<Paciente | null>(null);
  const [pesoGuardado, setPesoGuardado] = useState<number | null>(null);
  const [dosisSuministradas, setDosisSuministradas] = useState<DosisSuministrada[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [listo, setListo] = useState(false);
  const [bloqueada, setBloqueada] = useState(false);

  const desbloquear = useCallback(async () => {
    if (await confirmarIdentidad()) setBloqueada(false);
  }, []);

  useEffect(() => {
    async function recuperarSesion() {
      const json = await AsyncStorage.getItem(CLAVE_SESION);
      if (json === null) return;

      const guardada = JSON.parse(json);
      if (!guardada.token) return;

      fijarToken(guardada.token);
      const usuarioActual = await obtenerUsuarioActual();
      setToken(guardada.token);
      setUsuario(usuarioActual);
      setBloqueada(true);

      if (usuarioActual.rol === 'medico' && guardada.pacienteId) {
        const paciente = await obtenerPaciente(guardada.pacienteId);
        setPesoGuardado(paciente.pesoKg);
        setPacienteEscaneado({ ...paciente, pesoKg: guardada.pesoPaciente ?? paciente.pesoKg });
        setDosisSuministradas(guardada.dosisSuministradas ?? []);
      }

      desbloquear();
    }

    recuperarSesion()
      .catch(() => {
        // Sin conexión, sesión vencida o datos dañados: se empieza sin sesión
        fijarToken(null);
        setToken(null);
        setUsuario(null);
        setBloqueada(false);
      })
      .finally(() => setListo(true));
  }, [desbloquear]);

  useEffect(() => {
    if (!listo) return;
    const sesionGuardada = {
      token,
      pacienteId: pacienteEscaneado?.id ?? null,
      pesoPaciente: pacienteEscaneado?.pesoKg ?? null,
      dosisSuministradas,
    };
    AsyncStorage.setItem(CLAVE_SESION, JSON.stringify(sesionGuardada));
  }, [token, pacienteEscaneado, dosisSuministradas, listo]);

  const terminarAtencion = useCallback(() => {
    setPacienteEscaneado(null);
    setPesoGuardado(null);
    setDosisSuministradas([]);
  }, []);

  const escanearPaciente = useCallback((paciente: Paciente) => {
    setPacienteEscaneado(paciente);
    setPesoGuardado(paciente.pesoKg);
  }, []);

  const guardarPeso = useCallback(async () => {
    if (pacienteEscaneado === null) return;
    const actualizado = await actualizarPesoPaciente(pacienteEscaneado.id, pacienteEscaneado.pesoKg);
    setPesoGuardado(actualizado.pesoKg);
  }, [pacienteEscaneado]);

  const iniciarSesion = useCallback((nuevoToken: string, nuevoUsuario: Usuario) => {
    fijarToken(nuevoToken);
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  }, []);

  const cerrarSesion = useCallback(() => {
    fijarToken(null);
    setToken(null);
    setUsuario(null);
    setBloqueada(false);
    terminarAtencion();
  }, [terminarAtencion]);

  useEffect(() => {
    alVencerSesion(cerrarSesion);
    return () => alVencerSesion(null);
  }, [cerrarSesion]);

  const suministrarDosis = useCallback((item: DosisDeLibro, cantidad: number) => {
    const nueva: DosisSuministrada = {
      id: Date.now(),
      medicamentoId: item.medicamentoId,
      nombre: item.nombre,
      via: item.via,
      cantidad,
      unidad: item.unidad,
      hora: new Date().toISOString(),
    };
    setDosisSuministradas((actuales) => [...actuales, nueva]);
  }, []);

  const actualizarPeso = useCallback((pesoKg: number) => {
    setPacienteEscaneado((actual) => (actual === null ? null : { ...actual, pesoKg }));
  }, []);

  const quitarDosis = useCallback((id: number) => {
    setDosisSuministradas((actuales) => actuales.filter((dosis) => dosis.id !== id));
  }, []);

  const value = useMemo<Sesion>(
    () => ({
      usuario,
      pacienteEscaneado,
      pesoGuardado,
      dosisSuministradas,
      iniciarSesion,
      cerrarSesion,
      actualizarUsuario: setUsuario,
      escanearPaciente,
      actualizarPeso,
      guardarPeso,
      suministrarDosis,
      quitarDosis,
      terminarAtencion,
    }),
    [
      usuario,
      pacienteEscaneado,
      pesoGuardado,
      dosisSuministradas,
      iniciarSesion,
      cerrarSesion,
      escanearPaciente,
      actualizarPeso,
      guardarPeso,
      suministrarDosis,
      quitarDosis,
      terminarAtencion,
    ]
  );

  if (!listo) return null;

  if (bloqueada) {
    return <PantallaBloqueo alReintentar={desbloquear} alUsarContrasena={cerrarSesion} />;
  }

  return <SesionContext.Provider value={value}>{children}</SesionContext.Provider>;
}

export function useSesion() {
  const sesion = useContext(SesionContext);
  if (sesion === null) {
    throw new Error('useSesion se tiene que usar dentro de SesionProvider');
  }
  return sesion;
}
