import { Contraindicaciones } from '@/data/tipos';

// CIMA: base de datos oficial de medicamentos de la agencia española (AEMPS). Es pública,
// gratuita, no necesita clave y está en español. Si falla la conexión, las funciones lanzan un error.
const URL_BASE = 'https://cima.aemps.es/cima/rest';

// Los campos de la respuesta de CIMA que usamos
type MedicamentoCima = {
  nregistro: string;
  nombre: string;
  labtitular: string;
  vtm?: { nombre: string }; // principio activo
  viasAdministracion: { nombre: string }[];
  docs: { tipo: number; secc: boolean }[]; // tipo 1 = ficha técnica
};

async function pedir(ruta: string) {
  const respuesta = await fetch(`${URL_BASE}/${ruta}`);
  if (!respuesta.ok) {
    throw new Error('CIMA respondió con error');
  }
  return respuesta;
}

// El texto de CIMA viene en un solo renglón: separa los párrafos y las viñetas con un espacio
// no separable junto a un espacio común. Ponemos cada uno en su propia línea. Un espacio no
// separable en medio de una frase (ej: "sección 4.4") queda como un espacio.
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

// Contraindicaciones (sección 4.3 de la ficha técnica) de un medicamento que tenga ese único
// principio activo y esa vía de administración. Devuelve null si CIMA no tiene uno.
export async function buscarContraindicaciones(
  principioActivo: string,
  via: string
): Promise<Contraindicaciones | null> {
  const respuestaLista = await pedir(`medicamentos?practiv1=${encodeURIComponent(principioActivo)}&comerc=1`);
  const lista: { resultados: MedicamentoCima[] } = await respuestaLista.json();

  // La búsqueda trae también combinaciones y otras formas (cremas, parches...): nos quedamos con la correcta
  const producto = lista.resultados.find(
    (medicamento) =>
      medicamento.vtm?.nombre.toLowerCase() === principioActivo &&
      medicamento.viasAdministracion.some((v) => v.nombre.includes(via)) &&
      medicamento.docs.some((doc) => doc.tipo === 1 && doc.secc)
  );
  if (producto === undefined) return null;

  // Esta ruta devuelve la sección directamente como texto plano
  const respuesta = await pedir(`docSegmentado/contenido/1?nregistro=${producto.nregistro}&seccion=4.3`);
  const texto = darFormato(await respuesta.text());
  if (texto === '') return null;

  return { producto: producto.nombre, laboratorio: producto.labtitular, texto };
}
