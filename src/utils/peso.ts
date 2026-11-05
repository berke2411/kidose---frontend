const PESO_MAXIMO_ESCRITO = 300;

export function normalizarPeso(pesos: number[], peso: number) {
  let elegido: number | null = null;
  for (const candidato of pesos) {
    if (candidato <= peso) elegido = candidato;
  }
  return elegido;
}

export function pesoSiguiente(pesos: number[], peso: number) {
  return pesos.find((candidato) => candidato > peso) ?? peso;
}

export function pesoAnterior(pesos: number[], peso: number) {
  const menores = pesos.filter((candidato) => candidato < peso);
  return menores.length === 0 ? peso : menores[menores.length - 1];
}

export function leerPeso(texto: string, pesos: number[]) {
  const limpio = texto.trim().split(',').join('.');
  const soloDigitos = limpio.split('').every((letra) => (letra >= '0' && letra <= '9') || letra === '.');
  const numero = Number(limpio);
  if (limpio === '' || !soloDigitos || Number.isNaN(numero) || numero > PESO_MAXIMO_ESCRITO) return null;
  return normalizarPeso(pesos, numero);
}
