// Hasta 3 decimales: con 2, una dosis de 0,035 mg se mostraría como 0,04.
export function formatearNumero(numero: number) {
  const redondeado = Math.round(numero * 1000) / 1000;
  return String(redondeado).replace('.', ',');
}
