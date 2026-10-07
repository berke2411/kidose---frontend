import { REGISTRO_MATRICULAS } from '@/data/usuarios-ejemplo';
import { ProfesionalRegistrado } from '@/data/tipos';

// Busca una matrícula en el registro de médicos y devuelve el profesional, o null si no existe.
// Es una simulación con demora falsa; después se reemplaza por la consulta al registro real (REFEPS / SISA).
export async function buscarMatricula(matricula: string): Promise<ProfesionalRegistrado | null> {
  await new Promise((resolver) => setTimeout(resolver, 600));
  return REGISTRO_MATRICULAS.find((profesional) => profesional.matricula === matricula) ?? null;
}
