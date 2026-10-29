import { Alergeno } from '@/data/tipos';
import { normalizarNombre } from '@/utils/validaciones';

// Devuelve la alergia del paciente que corresponde a la indicación, o null si ninguna.
// La alergia es una sustancia de la lista del libro: coincide si es el principio activo de la indicación
// o si aparece en su nombre (sin tildes ni mayúsculas). No relaciona familias de fármacos: eso lo decide el médico.
export function buscarAlergia(
  alergias: string[],
  alergenos: Alergeno[],
  indicacion: { nombre: string; principioActivo?: string }
) {
  const nombre = normalizarNombre(indicacion.nombre);
  const principioActivo = normalizarNombre(indicacion.principioActivo ?? '');

  for (const alergia of alergias) {
    const alergeno = alergenos.find((otro) => otro.nombre === alergia);
    if (alergeno === undefined) continue;

    const sustancia = normalizarNombre(alergeno.principioActivo);
    if (sustancia === principioActivo || nombre.includes(sustancia)) return alergia;
  }
  return null;
}
