
function dosDigitos(numero: number) {
  return String(numero).padStart(2, '0');
}

export function formatearFecha(iso: string) {
  const fecha = new Date(iso);
  return `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/${fecha.getFullYear()}`;
}

export function formatearHora(iso: string) {
  const fecha = new Date(iso);
  return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

export function calcularEdad(fechaNacimiento: string) {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();

  let meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + (hoy.getMonth() - nacimiento.getMonth());
  if (hoy.getDate() < nacimiento.getDate()) meses -= 1;

  if (meses < 1) return 'menos de 1 mes';
  if (meses < 24) return meses === 1 ? '1 mes' : `${meses} meses`;
  return `${Math.floor(meses / 12)} años`;
}

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
