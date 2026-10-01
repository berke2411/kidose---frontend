import { REGISTRO_MATRICULAS } from '@/data/usuarios-ejemplo';
import { ProfesionalRegistrado } from '@/data/tipos';

// Busca una matrícula en el registro de médicos.
// Devuelve el profesional, o null si la matrícula no existe.
//
// HOY es una simulación con datos de prueba (con una demora falsa, como una
// llamada a internet). Más adelante acá se reemplaza por la consulta real al
// registro federal de profesionales de salud de Argentina (REFEPS / SISA);
// el resto de la app no cambia porque solo usa esta función.
export async function buscarMatricula(matricula: string): Promise<ProfesionalRegistrado | null> {
  await new Promise((resolver) => setTimeout(resolver, 600));
  return REGISTRO_MATRICULAS.find((profesional) => profesional.matricula === matricula) ?? null;
}
