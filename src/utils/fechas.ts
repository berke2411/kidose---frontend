// Formatos de fecha para mostrar. La API manda las fechas como texto ISO.

function dosDigitos(numero: number) {
  return String(numero).padStart(2, '0');
}

// "2026-08-12T00:05:00.000Z" → "11/08/2026" (en la hora del teléfono)
export function formatearFecha(iso: string) {
  const fecha = new Date(iso);
  return `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/${fecha.getFullYear()}`;
}

// "2026-08-12T00:05:00.000Z" → "21:05"
export function formatearHora(iso: string) {
  const fecha = new Date(iso);
  return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

// Edad a partir de la fecha de nacimiento: "3 años", o en meses si es menor de 2 años.
export function calcularEdad(fechaNacimiento: string) {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();

  let meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + (hoy.getMonth() - nacimiento.getMonth());
  if (hoy.getDate() < nacimiento.getDate()) meses -= 1; // todavía no cumplió el mes

  if (meses < 1) return 'menos de 1 mes';
  if (meses < 24) return meses === 1 ? '1 mes' : `${meses} meses`;
  return `${Math.floor(meses / 12)} años`;
}

// Convierte "dd/mm/aaaa" a fecha ISO ("aaaa-mm-dd"), o null si no es una fecha real.
export function fechaDesdeTexto(texto: string) {
  const partes = texto.trim().split('/');
  if (partes.length !== 3) return null;

  const [dia, mes, anio] = partes.map(Number);
  if (!Number.isInteger(dia) || !Number.isInteger(mes) || !Number.isInteger(anio) || anio < 1900) return null;

  // Si el día no existe (ej: 31/02), JavaScript corre la fecha al mes siguiente: se detecta así
  const fecha = new Date(anio, mes - 1, dia);
  const existe = fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia;
  if (!existe || fecha > new Date()) return null;

  return `${anio}-${dosDigitos(mes)}-${dosDigitos(dia)}`;
}
