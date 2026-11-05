export function formatearNumero(numero: number) {
  const redondeado = Math.round(numero * 1000) / 1000;
  return String(redondeado).replace('.', ',');
}
