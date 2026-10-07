import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DosisSuministrada, Paciente, Usuario } from '@/data/tipos';
import { Medicamento } from '@/data/medicamentos-ejemplo';
import { USUARIOS } from '@/data/usuarios-ejemplo';

// Estado compartido de la app: quién inició sesión, qué paciente escaneó el
// médico y qué dosis se suministraron en la atención actual.
type Sesion = {
  usuario: Usuario | null;
  pacienteEscaneado: Paciente | null;
  dosisSuministradas: DosisSuministrada[];
  iniciarSesion: (usuario: Usuario) => void;
  cerrarSesion: () => void;
  escanearPaciente: (paciente: Paciente) => void;
  actualizarPeso: (pesoKg: number) => void; // corrige el peso del paciente escaneado
  suministrarDosis: (medicamento: Medicamento, cantidad: number) => void;
  quitarDosis: (id: string) => void;
  terminarAtencion: () => void; // limpia el paciente y las dosis (al enviar o cancelar)
};

const SesionContext = createContext<Sesion | null>(null);

const CLAVE_SESION = 'sesion';

// En el teléfono se guardan solo los emails, no los datos ni la contraseña
function buscarPorEmail(email: string | null) {
  return USUARIOS.find((usuario) => usuario.email === email) ?? null;
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pacienteEscaneado, setPacienteEscaneado] = useState<Paciente | null>(null);
  const [dosisSuministradas, setDosisSuministradas] = useState<DosisSuministrada[]>([]);
  // Hasta terminar de leer lo guardado no se renderiza nada, para que no parpadee el login
  const [listo, setListo] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CLAVE_SESION)
      .then((json) => {
        if (json === null) return;
        const guardada = JSON.parse(json);
        const paciente = buscarPorEmail(guardada.emailPaciente);
        setUsuario(buscarPorEmail(guardada.emailUsuario));
        // El peso se guarda aparte porque el médico puede haberlo corregido
        setPacienteEscaneado(
          paciente?.rol === 'paciente' ? { ...paciente, pesoKg: guardada.pesoPaciente ?? paciente.pesoKg } : null
        );
        setDosisSuministradas(guardada.dosisSuministradas ?? []);
      })
      .catch(() => {
        // Si lo guardado está dañado, se empieza sin sesión
      })
      .finally(() => setListo(true));
  }, []);

  useEffect(() => {
    if (!listo) return;
    const sesionGuardada = {
      emailUsuario: usuario?.email ?? null,
      emailPaciente: pacienteEscaneado?.email ?? null,
      pesoPaciente: pacienteEscaneado?.pesoKg ?? null,
      dosisSuministradas,
    };
    AsyncStorage.setItem(CLAVE_SESION, JSON.stringify(sesionGuardada));
  }, [usuario, pacienteEscaneado, dosisSuministradas, listo]);

  const terminarAtencion = useCallback(() => {
    setPacienteEscaneado(null);
    setDosisSuministradas([]);
  }, []);

  const cerrarSesion = useCallback(() => {
    setUsuario(null);
    terminarAtencion();
  }, [terminarAtencion]);

  const suministrarDosis = useCallback((medicamento: Medicamento, cantidad: number) => {
    const nueva: DosisSuministrada = {
      id: String(Date.now()),
      medicamento: medicamento.nombre,
      via: medicamento.via,
      cantidad,
      unidad: medicamento.unidad,
      hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };
    setDosisSuministradas((actuales) => [...actuales, nueva]);
  }, []);

  const actualizarPeso = useCallback((pesoKg: number) => {
    setPacienteEscaneado((actual) => (actual === null ? null : { ...actual, pesoKg }));
  }, []);

  const quitarDosis = useCallback((id: string) => {
    setDosisSuministradas((actuales) => actuales.filter((dosis) => dosis.id !== id));
  }, []);

  // Sin useMemo, cada render del Provider crea un objeto nuevo y re-renderiza a todos los consumidores
  const value = useMemo<Sesion>(
    () => ({
      usuario,
      pacienteEscaneado,
      dosisSuministradas,
      iniciarSesion: setUsuario,
      cerrarSesion,
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
