import { createContext, ReactNode, useContext, useState } from 'react';

import { DosisSuministrada, Paciente, Usuario } from '@/data/tipos';
import { Medicamento } from '@/data/medicamentos-ejemplo';

// Estado compartido de toda la app (todavía sin base de datos, vive en memoria):
//   - quién inició sesión
//   - qué paciente escaneó el médico
//   - qué dosis se suministraron en la atención actual
type Sesion = {
  usuario: Usuario | null;
  pacienteEscaneado: Paciente | null;
  dosisSuministradas: DosisSuministrada[];
  iniciarSesion: (usuario: Usuario) => void;
  cerrarSesion: () => void;
  escanearPaciente: (paciente: Paciente) => void;
  suministrarDosis: (medicamento: Medicamento, cantidad: number) => void;
  quitarDosis: (id: string) => void;
  terminarAtencion: () => void; // limpia el paciente y las dosis (al enviar o cancelar)
};

const SesionContext = createContext<Sesion | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pacienteEscaneado, setPacienteEscaneado] = useState<Paciente | null>(null);
  const [dosisSuministradas, setDosisSuministradas] = useState<DosisSuministrada[]>([]);

  function terminarAtencion() {
    setPacienteEscaneado(null);
    setDosisSuministradas([]);
  }

  function cerrarSesion() {
    setUsuario(null);
    terminarAtencion();
  }

  function suministrarDosis(medicamento: Medicamento, cantidad: number) {
    const nueva: DosisSuministrada = {
      id: String(Date.now()),
      medicamento: medicamento.nombre,
      via: medicamento.via,
      cantidad,
      unidad: medicamento.unidad,
      hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };
    setDosisSuministradas((actuales) => [...actuales, nueva]);
  }

  function quitarDosis(id: string) {
    setDosisSuministradas((actuales) => actuales.filter((dosis) => dosis.id !== id));
  }

  return (
    <SesionContext.Provider
      value={{
        usuario,
        pacienteEscaneado,
        dosisSuministradas,
        iniciarSesion: setUsuario,
        cerrarSesion,
        escanearPaciente: setPacienteEscaneado,
        suministrarDosis,
        quitarDosis,
        terminarAtencion,
      }}>
      {children}
    </SesionContext.Provider>
  );
}

// Para leer el estado desde cualquier pantalla: const { usuario } = useSesion();
export function useSesion() {
  const sesion = useContext(SesionContext);
  if (sesion === null) {
    throw new Error('useSesion se tiene que usar dentro de SesionProvider');
  }
  return sesion;
}
