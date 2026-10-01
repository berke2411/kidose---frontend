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

// Muestra un número con hasta 2 decimales y coma decimal (ej: 0.14 → "0,14").
export function formatearNumero(numero: number) {
  const redondeado = Math.round(numero * 100) / 100;
  return String(redondeado).replace('.', ',');
}
