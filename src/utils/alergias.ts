import { Medicamento } from '@/data/tipos';
import { normalizarNombre } from '@/utils/validaciones';

// Devuelve la alergia del paciente que coincide con el medicamento, o null si ninguna.
// Es una coincidencia de texto, sin tildes ni mayúsculas: la alergia aparece dentro del
// nombre o del principio activo del medicamento (o al revés). Por ejemplo, "Epinefrina"
// coincide con Adrenalina porque ese es su principio activo.
// No relaciona familias de fármacos (ej: penicilina con otros antibióticos): eso lo decide el médico.
export function buscarAlergia(alergias: string[], medicamento: Medicamento) {
  const nombre = normalizarNombre(medicamento.nombre);
  const principioActivo = normalizarNombre(medicamento.principioActivo);

  for (const alergia of alergias) {
    const texto = normalizarNombre(alergia);
    // Con menos de 3 letras cualquier medicamento coincidiría
    if (texto.length < 3) continue;

    if (nombre.includes(texto) || principioActivo.includes(texto) || texto.includes(principioActivo)) {
      return alergia;
    }
  }
  return null;
}
