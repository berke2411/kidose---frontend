const PESO_MINIMO = 2;
const PESO_MAXIMO = 80;

// Con menos de 10 kg el peso cambia de a 0,5 kg; con más, de a 1 kg.
// Devuelve el mismo peso si el nuevo se saldría del rango permitido.
export function sumarPeso(peso: number) {
  const nuevo = peso + (peso < 10 ? 0.5 : 1);
  return nuevo <= PESO_MAXIMO ? nuevo : peso;
}

export function restarPeso(peso: number) {
  const nuevo = peso - (peso <= 10 ? 0.5 : 1);
  return nuevo >= PESO_MINIMO ? nuevo : peso;
}
