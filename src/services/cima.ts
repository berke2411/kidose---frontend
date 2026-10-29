import { Contraindicaciones } from '@/data/tipos';

const URL_BASE = 'https://cima.aemps.es/cima/rest';

type MedicamentoCima = {
  nregistro: string;
  nombre: string;
  labtitular: string;
  vtm?: { nombre: string };
  viasAdministracion: { nombre: string }[];
  docs: { tipo: number; secc: boolean }[];
};

async function pedir(ruta: string) {
  const respuesta = await fetch(`${URL_BASE}/${ruta}`);
  if (!respuesta.ok) {
    throw new Error('CIMA respondió con error');
  }
  return respuesta;
}

// CIMA separa párrafos y viñetas con un espacio no separable; ahí se corta la línea.
function darFormato(texto: string) {
  const partes = texto.split('\u00a0');
  let resultado = partes[0];
  for (const parte of partes.slice(1)) {
    const separa = resultado.endsWith(' ') || parte.startsWith(' ') || parte === '';
    resultado += separa ? `\n${parte}` : ` ${parte}`;
  }

  return resultado
    .split('\n')
    .map((linea) => linea.trim())
    .filter((linea) => linea !== '' && linea !== '-')
    .join('\n');
}

// CIMA nombra el principio activo con las palabras en otro orden ("ácido tranexámico" / "tranexámico ácido")
function palabrasOrdenadas(texto: string) {
  return texto.toLowerCase().split(' ').filter((palabra) => palabra !== '').sort().join(' ');
}

export async function buscarContraindicaciones(
  principioActivo: string,
  via: string
): Promise<Contraindicaciones | null> {
  const respuestaLista = await pedir(`medicamentos?practiv1=${encodeURIComponent(principioActivo)}&comerc=1`);
  const lista: { resultados: MedicamentoCima[] } = await respuestaLista.json();

  const producto = lista.resultados.find(
    (medicamento) =>
      palabrasOrdenadas(medicamento.vtm?.nombre ?? '') === palabrasOrdenadas(principioActivo) &&
      medicamento.viasAdministracion.some((v) => v.nombre.includes(via)) &&
      medicamento.docs.some((doc) => doc.tipo === 1 && doc.secc)
  );
  if (producto === undefined) return null;

  const respuesta = await pedir(`docSegmentado/contenido/1?nregistro=${producto.nregistro}&seccion=4.3`);
  const texto = darFormato(await respuesta.text());
  if (texto === '') return null;

  return { producto: producto.nombre, laboratorio: producto.labtitular, texto };
}
