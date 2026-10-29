const PESO_MAXIMO_ESCRITO = 300;

// El libro solo tiene tablas para ciertos pesos: siempre se redondea hacia abajo,
// al de la tabla que no supera al peso real (11,7 kg se trata como 11 kg).
// Devuelve null si el peso es menor al de la primera tabla.
export function normalizarPeso(pesos: number[], peso: number) {
  let elegido: number | null = null;
  for (const candidato of pesos) {
    if (candidato <= peso) elegido = candidato;
  }
  return elegido;
}

// Los botones + y − recorren las tablas del libro, no de a 0,5 o 1 kg
export function pesoSiguiente(pesos: number[], peso: number) {
  return pesos.find((candidato) => candidato > peso) ?? peso;
}

export function pesoAnterior(pesos: number[], peso: number) {
  const menores = pesos.filter((candidato) => candidato < peso);
  return menores.length === 0 ? peso : menores[menores.length - 1];
}

// Convierte lo que escribió el médico ("12,5" o "12.5") en el peso de la tabla que corresponde.
// Devuelve null si no es un número o si es menor al de la primera tabla.
export function leerPeso(texto: string, pesos: number[]) {
  const limpio = texto.trim().split(',').join('.');
  // Solo dígitos y a lo sumo un punto (así no entran cosas como "1e1" o "0x10")
  const soloDigitos = limpio.split('').every((letra) => (letra >= '0' && letra <= '9') || letra === '.');
  const numero = Number(limpio);
  if (limpio === '' || !soloDigitos || Number.isNaN(numero) || numero > PESO_MAXIMO_ESCRITO) return null;
  return normalizarPeso(pesos, numero);
}
