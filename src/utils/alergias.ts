import { Alergeno } from '@/data/tipos';
import { normalizarNombre } from '@/utils/validaciones';

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
