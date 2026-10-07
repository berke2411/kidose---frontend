import { Medicamento } from '@/data/medicamentos-ejemplo';

// Calcula la dosis según el peso: peso × dosis por kg.
// Si el resultado supera la dosis máxima, se usa la dosis máxima.
export function calcularDosis(medicamento: Medicamento, peso: number) {
  let dosis = peso * medicamento.dosisPorKg;
  let llegoAlMaximo = false;

  if (medicamento.dosisMaxima !== undefined && dosis >= medicamento.dosisMaxima) {
    dosis = medicamento.dosisMaxima;
    llegoAlMaximo = true;
  }

  return { dosis, llegoAlMaximo };
}

// Muestra un número con hasta 3 decimales y coma decimal (ej: 0.035 → "0,035").
// Con 2 decimales una dosis chica como 0,035 mg se mostraría como 0,04 mg.
export function formatearNumero(numero: number) {
  const redondeado = Math.round(numero * 1000) / 1000;
  return String(redondeado).replace('.', ',');
}
