import { DireccionVerificada, OpcionGeoref } from '@/data/tipos';

const URL_BASE = 'https://apis.datos.gob.ar/georef/api';

async function pedir(ruta: string, parametros: Record<string, string>) {
  const consulta = Object.keys(parametros)
    .map((clave) => `${clave}=${encodeURIComponent(parametros[clave])}`)
    .join('&');

  const respuesta = await fetch(`${URL_BASE}/${ruta}?${consulta}`);
  if (!respuesta.ok) {
    throw new Error('Georef respondió con error');
  }
  return respuesta.json();
}

export async function listarProvincias(): Promise<OpcionGeoref[]> {
  const datos = await pedir('provincias', { campos: 'id,nombre', orden: 'nombre', max: '30' });
  return datos.provincias;
}

export async function buscarLocalidades(provinciaId: string, texto: string): Promise<OpcionGeoref[]> {
  const datos = await pedir('localidades', {
    provincia: provinciaId,
    nombre: texto,
    campos: 'id,nombre,departamento.nombre',
    orden: 'nombre',
    max: '10',
  });

  const opciones: OpcionGeoref[] = [];
  for (const localidad of datos.localidades) {
    const detalle: string | undefined = localidad.departamento.nombre ?? undefined;
    // Georef a veces repite la misma localidad con dos códigos: dejamos una sola
    const repetida = opciones.some(
      (opcion) => opcion.nombre === localidad.nombre && opcion.detalle === detalle
    );
    if (!repetida) {
      opciones.push({ id: localidad.id, nombre: localidad.nombre, detalle });
    }
  }
  return opciones;
}

export async function verificarDireccion(
  direccion: string,
  provincia: OpcionGeoref,
  localidad: OpcionGeoref
): Promise<DireccionVerificada | null> {
  const datos = await pedir('direcciones', {
    direccion,
    provincia: provincia.id,
    // Los primeros 5 números del código de la localidad son los de su departamento
    departamento: localidad.id.slice(0, 5),
    max: '1',
  });

  const encontrada = datos.direcciones[0];
  if (encontrada === undefined) return null;

  return {
    provincia: provincia.nombre,
    localidad: localidad.nombre,
    direccion: encontrada.nomenclatura,
    latitud: encontrada.ubicacion.lat,
    longitud: encontrada.ubicacion.lon,
  };
}
