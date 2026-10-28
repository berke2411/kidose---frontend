import Constants from 'expo-constants';

import {
  Atencion,
  Categoria,
  DosisSuministrada,
  Medico,
  Paciente,
  ProfesionalRegistrado,
  Usuario,
} from '@/data/tipos';

// Dirección del backend. Se puede fijar con EXPO_PUBLIC_API_URL; si no, se usa la IP de la
// computadora desde la que corre Expo (así funciona en el celular sin configurar nada).
function direccionDelServidor() {
  const configurada = process.env.EXPO_PUBLIC_API_URL;
  if (configurada) return configurada;

  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host ?? 'localhost'}:3000`;
}

export const API_URL = direccionDelServidor();

// El token de la sesión: lo fija el contexto al iniciar sesión y se manda en cada pedido.
let token: string | null = null;
let alVencerLaSesion: (() => void) | null = null;

export function fijarToken(nuevo: string | null) {
  token = nuevo;
}

// El contexto avisa qué hacer cuando el servidor rechaza el token (sesión vencida).
export function alVencerSesion(accion: (() => void) | null) {
  alVencerLaSesion = accion;
}

// Error de la API: guarda el código HTTP, y el mensaje es el que mandó el servidor.
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

// --- Cuenta y sesión ---

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
  // médico
  matricula?: string;
  hospital?: string;
  // paciente
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

// Busca una matrícula en el registro. Devuelve null si no existe.
export async function buscarMatricula(matricula: string): Promise<ProfesionalRegistrado | null> {
  try {
    return await pedir<ProfesionalRegistrado>(`/matriculas/${matricula}`);
  } catch (error) {
    if (error instanceof ErrorApi && error.estado === 404) return null;
    throw error;
  }
}

// --- Administración de cuentas de médicos ---

export function listarSolicitudes(estado: string) {
  return pedir<Medico[]>(`/usuarios?estado=${estado}`);
}

export function resolverSolicitud(id: number, estado: 'aprobada' | 'rechazada') {
  return pedir<Medico>(`/usuarios/${id}`, { metodo: 'PATCH', cuerpo: { estado } });
}

// --- QR ---

export function pedirCodigoQr() {
  return pedir<{ codigo: string; venceEn: string }>('/qr', { metodo: 'POST' });
}

export function leerCodigoQr(codigo: string) {
  return pedir<Paciente>('/qr/leer', { metodo: 'POST', cuerpo: { codigo } });
}

// --- Calculadora e historial ---

export function listarCategorias() {
  return pedir<Categoria[]>('/categorias');
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

// Reemplaza la lista de alergias del paciente (solo puede hacerlo el propio paciente).
export function actualizarAlergias(id: number, alergias: string[]) {
  return pedir<Paciente>(`/pacientes/${id}`, { metodo: 'PATCH', cuerpo: { alergias } });
}

export function obtenerPaciente(id: number) {
  return pedir<Paciente>(`/pacientes/${id}`);
}
