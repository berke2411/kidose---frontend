import Constants from 'expo-constants';

import {
  Alergeno,
  Atencion,
  DosisSuministrada,
  Generales,
  Medico,
  Paciente,
  PesosLibro,
  ProfesionalRegistrado,
  TablaLibro,
  Usuario,
} from '@/data/tipos';

// Si no hay EXPO_PUBLIC_API_URL, se usa la IP de la computadora que corre Expo.
function direccionDelServidor() {
  const configurada = process.env.EXPO_PUBLIC_API_URL;
  if (configurada) return configurada;

  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host ?? 'localhost'}:3000`;
}

export const API_URL = direccionDelServidor();

let token: string | null = null;
let alVencerLaSesion: (() => void) | null = null;

export function fijarToken(nuevo: string | null) {
  token = nuevo;
}

export function alVencerSesion(accion: (() => void) | null) {
  alVencerLaSesion = accion;
}

export class ErrorApi extends Error {
  estado: number;

  constructor(mensaje: string, estado: number) {
    super(mensaje);
    this.estado = estado;
  }
}

type Opciones = { metodo?: string; cuerpo?: unknown };

async function pedir<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}/api${ruta}`, {
      method: opciones.metodo ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opciones.cuerpo === undefined ? undefined : JSON.stringify(opciones.cuerpo),
    });
  } catch {
    throw new ErrorApi('No se pudo conectar con el servidor. Revisá tu conexión.', 0);
  }

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    // Con un token enviado, un 401 significa que la sesión ya no sirve
    if (respuesta.status === 401 && token !== null) alVencerLaSesion?.();
    throw new ErrorApi(datos?.error ?? 'Ocurrió un error inesperado.', respuesta.status);
  }
  return datos as T;
}

export function iniciarSesionApi(email: string, contrasena: string) {
  return pedir<{ token: string; usuario: Usuario }>('/auth/login', {
    metodo: 'POST',
    cuerpo: { email, contrasena },
  });
}

export function obtenerUsuarioActual() {
  return pedir<Usuario>('/auth/yo');
}

export type DatosRegistro = {
  rol: 'medico' | 'paciente';
  nombre: string;
  dni: string;
  email: string;
  contrasena: string;
  matricula?: string;
  hospital?: string;
  fechaNacimiento?: string;
  pesoKg?: number;
  alergias?: string[];
  direccion?: string;
  latitud?: number;
  longitud?: number;
};

export function registrarCuenta(datos: DatosRegistro) {
  return pedir<Usuario>('/auth/registro', { metodo: 'POST', cuerpo: datos });
}

export async function buscarMatricula(matricula: string): Promise<ProfesionalRegistrado | null> {
  try {
    return await pedir<ProfesionalRegistrado>(`/matriculas/${matricula}`);
  } catch (error) {
    if (error instanceof ErrorApi && error.estado === 404) return null;
    throw error;
  }
}

export function listarMedicos(estado: string) {
  return pedir<Medico[]>(`/usuarios?estado=${estado}`);
}

// Aprueba o rechaza una solicitud, da de baja a un médico aprobado o lo vuelve a habilitar (nunca se borra)
export function cambiarEstadoMedico(id: number, estado: 'aprobada' | 'rechazada' | 'baja') {
  return pedir<Medico>(`/usuarios/${id}`, { metodo: 'PATCH', cuerpo: { estado } });
}

export function pedirCodigoQr() {
  return pedir<{ codigo: string; venceEn: string }>('/qr', { metodo: 'POST' });
}

export function leerCodigoQr(codigo: string) {
  return pedir<Paciente>('/qr/leer', { metodo: 'POST', cuerpo: { codigo } });
}

// Pesos de las tablas del libro (pública: el registro la usa antes de tener cuenta)
export function obtenerPesosLibro() {
  return pedir<PesosLibro>('/libro/pesos');
}

// Alergias posibles: las sustancias del libro (pública, la usa el registro)
export async function obtenerAlergenos() {
  const respuesta = await pedir<{ alergenos: Alergeno[] }>('/libro/alergenos');
  return respuesta.alergenos;
}

export function obtenerTablaLibro(peso: number) {
  return pedir<TablaLibro>(`/libro/tabla?peso=${peso}`);
}

export function obtenerGenerales(peso: number) {
  return pedir<Generales>(`/libro/generales?peso=${peso}`);
}

export function listarAtenciones(pacienteId: number) {
  return pedir<Atencion[]>(`/atenciones?pacienteId=${pacienteId}`);
}

export function enviarAtencion(pacienteId: number, pesoKg: number, dosis: DosisSuministrada[]) {
  return pedir<Atencion>('/atenciones', {
    metodo: 'POST',
    cuerpo: {
      pacienteId,
      pesoKg,
      dosis: dosis.map((d) => ({ medicamentoId: d.medicamentoId, cantidad: d.cantidad, hora: d.hora })),
    },
  });
}

export function actualizarAlergias(id: number, alergias: string[]) {
  return pedir<Paciente>(`/pacientes/${id}`, { metodo: 'PATCH', cuerpo: { alergias } });
}

export function actualizarPesoPaciente(id: number, pesoKg: number) {
  return pedir<Paciente>(`/pacientes/${id}`, { metodo: 'PATCH', cuerpo: { pesoKg } });
}

export function obtenerPaciente(id: number) {
  return pedir<Paciente>(`/pacientes/${id}`);
}
