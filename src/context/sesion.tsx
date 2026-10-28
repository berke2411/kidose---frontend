import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DosisSuministrada, Medicamento, Paciente, Usuario } from '@/data/tipos';
import { alVencerSesion, fijarToken, obtenerPaciente, obtenerUsuarioActual } from '@/services/api';

// Estado compartido de la app: quién inició sesión, qué paciente escaneó el
// médico y qué dosis se suministraron en la atención actual.
type Sesion = {
  usuario: Usuario | null;
  pacienteEscaneado: Paciente | null;
  dosisSuministradas: DosisSuministrada[];
  iniciarSesion: (token: string, usuario: Usuario) => void;
  cerrarSesion: () => void;
  actualizarUsuario: (usuario: Usuario) => void; // reemplaza los datos del usuario (ej: tras editar alergias)
  escanearPaciente: (paciente: Paciente) => void;
  actualizarPeso: (pesoKg: number) => void; // corrige el peso del paciente escaneado (se guarda al enviar la atención)
  suministrarDosis: (medicamento: Medicamento, cantidad: number) => void;
  quitarDosis: (id: number) => void;
  terminarAtencion: () => void; // limpia el paciente y las dosis (al enviar o cancelar)
};

const SesionContext = createContext<Sesion | null>(null);

const CLAVE_SESION = 'sesion';

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pacienteEscaneado, setPacienteEscaneado] = useState<Paciente | null>(null);
  const [dosisSuministradas, setDosisSuministradas] = useState<DosisSuministrada[]>([]);
  const [token, setToken] = useState<string | null>(null);
  // Hasta terminar de recuperar la sesión no se renderiza nada, para que no parpadee el login
  const [listo, setListo] = useState(false);

  // Al abrir la app: con el token guardado se le pide el usuario al servidor.
  // En el teléfono se guarda el token, el paciente que se estaba atendiendo y las dosis pendientes.
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

      if (usuarioActual.rol === 'medico' && guardada.pacienteId) {
        const paciente = await obtenerPaciente(guardada.pacienteId);
        // El peso se guarda aparte porque el médico puede haberlo corregido
        setPacienteEscaneado({ ...paciente, pesoKg: guardada.pesoPaciente ?? paciente.pesoKg });
        setDosisSuministradas(guardada.dosisSuministradas ?? []);
      }
    }

    recuperarSesion()
      .catch(() => {
        // Sin conexión, sesión vencida o datos dañados: se empieza sin sesión
        fijarToken(null);
        setToken(null);
        setUsuario(null);
      })
      .finally(() => setListo(true));
  }, []);

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
    setDosisSuministradas([]);
  }, []);

  const iniciarSesion = useCallback((nuevoToken: string, nuevoUsuario: Usuario) => {
    fijarToken(nuevoToken);
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  }, []);

  const cerrarSesion = useCallback(() => {
    fijarToken(null);
    setToken(null);
    setUsuario(null);
    terminarAtencion();
  }, [terminarAtencion]);

  // Si el servidor dice que el token ya no sirve, se cierra la sesión (y el layout vuelve al login)
  useEffect(() => {
    alVencerSesion(cerrarSesion);
    return () => alVencerSesion(null);
  }, [cerrarSesion]);

  const suministrarDosis = useCallback((medicamento: Medicamento, cantidad: number) => {
    const nueva: DosisSuministrada = {
      id: Date.now(),
      medicamentoId: medicamento.id,
      nombre: medicamento.nombre,
      via: medicamento.via,
      cantidad,
      unidad: medicamento.unidad,
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

  // Sin useMemo, cada render del Provider crea un objeto nuevo y re-renderiza a todos los consumidores
  const value = useMemo<Sesion>(
    () => ({
      usuario,
      pacienteEscaneado,
      dosisSuministradas,
      iniciarSesion,
      cerrarSesion,
      actualizarUsuario: setUsuario,
      escanearPaciente: setPacienteEscaneado,
      actualizarPeso,
      suministrarDosis,
      quitarDosis,
      terminarAtencion,
    }),
    [
      usuario,
      pacienteEscaneado,
      dosisSuministradas,
      iniciarSesion,
      cerrarSesion,
      actualizarPeso,
      suministrarDosis,
      quitarDosis,
      terminarAtencion,
    ]
  );

  if (!listo) return null;

  return <SesionContext.Provider value={value}>{children}</SesionContext.Provider>;
}

export function useSesion() {
  const sesion = useContext(SesionContext);
  if (sesion === null) {
    throw new Error('useSesion se tiene que usar dentro de SesionProvider');
  }
  return sesion;
}
