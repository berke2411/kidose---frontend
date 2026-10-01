import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CampoTexto } from '@/components/campo-texto';
import { COLORES } from '@/constants/colores';
import { DireccionVerificada, OpcionGeoref } from '@/data/tipos';
import { buscarLocalidades, listarProvincias, verificarDireccion } from '@/services/georef';
import { validarDireccion } from '@/utils/validaciones';

type Props = {
  mostrarErrores: boolean; // true después de apretar "Crear cuenta"
  onCambio: (direccion: DireccionVerificada | null) => void; // avisa la dirección confirmada (o null)
};

// Provincia + localidad + calle y altura, verificadas con la API Georef.
// Solo avisa hacia afuera cuando la dirección está confirmada.
export function CamposDireccion({ mostrarErrores, onCambio }: Props) {
  // --- Provincia (lista que se carga al abrir la pantalla) ---
  const [provincias, setProvincias] = useState<OpcionGeoref[]>([]);
  const [falloProvincias, setFalloProvincias] = useState(false);
  const [provincia, setProvincia] = useState<OpcionGeoref | null>(null);
  const [listaAbierta, setListaAbierta] = useState(false);

  // --- Localidad (se escribe y se elige de las sugerencias) ---
  const [localidadTexto, setLocalidadTexto] = useState('');
  const [localidad, setLocalidad] = useState<OpcionGeoref | null>(null);
  const [sugerencias, setSugerencias] = useState<{
    clave: string;
    lista: OpcionGeoref[];
    fallo: boolean;
  } | null>(null);

  // --- Calle y altura (se verifica sola) ---
  const [direccionTexto, setDireccionTexto] = useState('');
  const [consulta, setConsulta] = useState<{
    clave: string;
    direccion: DireccionVerificada | null;
    fallo: boolean;
  } | null>(null);

  useEffect(() => {
    listarProvincias()
      .then(setProvincias)
      .catch(() => setFalloProvincias(true));
  }, []);

  function tocarSelectorProvincia() {
    if (falloProvincias) {
      // reintenta la carga si había fallado
      setFalloProvincias(false);
      listarProvincias()
        .then(setProvincias)
        .catch(() => setFalloProvincias(true));
      return;
    }
    setListaAbierta(!listaAbierta);
  }

  function elegirProvincia(opcion: OpcionGeoref) {
    setProvincia(opcion);
    setListaAbierta(false);
    // La localidad depende de la provincia: se borra
    setLocalidad(null);
    setLocalidadTexto('');
  }

  function escribirLocalidad(texto: string) {
    setLocalidadTexto(texto);
    setLocalidad(null); // hasta que elija una sugerencia, no hay localidad confirmada
  }

  function elegirLocalidad(opcion: OpcionGeoref) {
    setLocalidad(opcion);
    setLocalidadTexto(opcion.nombre);
  }

  // --- Búsqueda de localidades (espera 400 ms sin escribir antes de consultar) ---
  const busquedaLocalidad = localidadTexto.trim();
  // Georef solo encuentra localidades con 4 letras o más
  const debeBuscarLocalidades = provincia !== null && localidad === null && busquedaLocalidad.length >= 4;
  const claveLocalidades = `${provincia?.id}|${busquedaLocalidad}`;

  useEffect(() => {
    if (!debeBuscarLocalidades || provincia === null) return;

    // "cancelado" evita usar una respuesta vieja si el usuario siguió escribiendo
    let cancelado = false;
    const espera = setTimeout(() => {
      buscarLocalidades(provincia.id, busquedaLocalidad)
        .then((lista) => {
          if (!cancelado) setSugerencias({ clave: claveLocalidades, lista, fallo: false });
        })
        .catch(() => {
          if (!cancelado) setSugerencias({ clave: claveLocalidades, lista: [], fallo: true });
        });
    }, 400);

    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [claveLocalidades, debeBuscarLocalidades]);

  const sugerenciasActuales =
    debeBuscarLocalidades && sugerencias?.clave === claveLocalidades ? sugerencias : null;
  const buscandoLocalidades = debeBuscarLocalidades && sugerenciasActuales === null;

  // --- Verificación de la dirección (espera 600 ms sin escribir) ---
  const direccionLimpia = direccionTexto.trim();
  const errorFormato = validarDireccion(direccionLimpia);
  const puedeVerificar = provincia !== null && localidad !== null && errorFormato === null;
  const claveDireccion = `${localidad?.id}|${direccionLimpia}`;

  useEffect(() => {
    if (!puedeVerificar || provincia === null || localidad === null) return;

    let cancelado = false;
    const espera = setTimeout(() => {
      verificarDireccion(direccionLimpia, provincia, localidad)
        .then((direccion) => {
          if (!cancelado) setConsulta({ clave: claveDireccion, direccion, fallo: false });
        })
        .catch(() => {
          if (!cancelado) setConsulta({ clave: claveDireccion, direccion: null, fallo: true });
        });
    }, 600);

    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [claveDireccion, puedeVerificar]);

  const consultaActual = puedeVerificar && consulta?.clave === claveDireccion ? consulta : null;
  const verificando = puedeVerificar && consultaActual === null;
  const verificada = consultaActual?.direccion ?? null;

  // Le avisamos a la pantalla de registro cuando la dirección queda confirmada (o deja de estarlo)
  useEffect(() => {
    onCambio(verificada);
  }, [verificada, onCambio]);

  // --- Mensajes ---
  const errorProvincia = mostrarErrores && provincia === null ? 'Elegí tu provincia.' : undefined;

  let errorLocalidad: string | undefined;
  let mensajeLocalidad: string | undefined;
  if (sugerenciasActuales?.fallo) errorLocalidad = 'No se pudo consultar Georef. Revisá tu conexión.';
  else if (mostrarErrores && localidad === null) errorLocalidad = 'Escribí y elegí tu localidad de la lista.';
  else if (provincia === null) mensajeLocalidad = 'Elegí primero la provincia.';
  else if (buscandoLocalidades) mensajeLocalidad = 'Buscando…';
  else if (sugerenciasActuales && sugerenciasActuales.lista.length === 0) {
    mensajeLocalidad = 'No encontramos esa localidad.';
  } else if (localidad === null && busquedaLocalidad.length > 0 && busquedaLocalidad.length < 4) {
    mensajeLocalidad = 'Escribí al menos 4 letras para buscar.';
  }

  let errorDireccion: string | undefined;
  if (consultaActual?.fallo) errorDireccion = 'No se pudo verificar la dirección. Revisá tu conexión.';
  else if (consultaActual && consultaActual.direccion === null) {
    errorDireccion = 'No encontramos esa dirección en la zona de la localidad elegida.';
  } else if (mostrarErrores && errorFormato) errorDireccion = errorFormato;
  else if (mostrarErrores && verificada === null) {
    errorDireccion = verificando
      ? 'Esperá a que termine la verificación.'
      : 'Elegí provincia y localidad para verificar la dirección.';
  }

  let mensajeDireccion: string | undefined;
  if (verificando) mensajeDireccion = 'Verificando dirección…';
  else if (verificada) mensajeDireccion = `Dirección verificada: ${verificada.direccion}`;

  return (
    <View style={styles.contenedor}>
      {/* Provincia */}
      <View style={styles.grupo}>
        <Text style={styles.etiqueta}>PROVINCIA</Text>
        <Pressable
          style={[styles.caja, errorProvincia ? styles.cajaConError : null]}
          onPress={tocarSelectorProvincia}>
          <Text style={provincia ? styles.valor : styles.placeholder}>
            {provincia ? provincia.nombre : 'Elegí tu provincia'}
          </Text>
          <Ionicons
            name={listaAbierta ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORES.gris}
          />
        </Pressable>

        {listaAbierta && (
          <View style={styles.lista}>
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              style={styles.scrollLista}>
              {provincias.length === 0 && (
                <View style={styles.filaLista}>
                  <Text style={styles.textoLista}>Cargando provincias…</Text>
                </View>
              )}
              {provincias.map((opcion) => (
                <Pressable
                  key={opcion.id}
                  style={styles.filaLista}
                  onPress={() => elegirProvincia(opcion)}>
                  <Text style={styles.textoLista}>{opcion.nombre}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {falloProvincias && (
          <Text style={styles.error}>
            No se pudieron cargar las provincias. Revisá tu conexión y tocá para reintentar.
          </Text>
        )}
        {errorProvincia && <Text style={styles.error}>{errorProvincia}</Text>}
      </View>

      {/* Localidad con sugerencias */}
      <View style={styles.grupo}>
        <CampoTexto
          etiqueta="LOCALIDAD"
          placeholder="Ej: Córdoba"
          value={localidadTexto}
          onChangeText={escribirLocalidad}
          mayusculas
          error={errorLocalidad}
          mensaje={mensajeLocalidad}
        />
        {sugerenciasActuales && sugerenciasActuales.lista.length > 0 && (
          <View style={styles.lista}>
            {sugerenciasActuales.lista.map((opcion) => (
              <Pressable key={opcion.id} style={styles.filaLista} onPress={() => elegirLocalidad(opcion)}>
                <Text style={styles.textoLista}>
                  {opcion.nombre}
                  {opcion.detalle ? ` · ${opcion.detalle}` : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Calle y altura */}
      <CampoTexto
        etiqueta="CALLE Y ALTURA"
        placeholder="Ej: Av Santa Fe 1234"
        value={direccionTexto}
        onChangeText={setDireccionTexto}
        mayusculas
        error={errorDireccion}
        mensaje={mensajeDireccion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: 16,
  },
  grupo: {
    gap: 6,
  },
  etiqueta: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.3,
    color: COLORES.gris,
  },
  caja: {
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORES.borde,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORES.blanco,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cajaConError: {
    borderColor: COLORES.rojoAcento,
  },
  valor: {
    fontSize: 16,
    color: COLORES.texto,
  },
  placeholder: {
    fontSize: 16,
    color: COLORES.grisIconoInactivo,
  },
  lista: {
    borderWidth: 1.5,
    borderColor: COLORES.borde,
    borderRadius: 12,
    backgroundColor: COLORES.blanco,
    overflow: 'hidden',
  },
  scrollLista: {
    maxHeight: 220,
  },
  filaLista: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.divisor,
  },
  textoLista: {
    fontSize: 15,
    color: COLORES.texto,
  },
  error: {
    fontSize: 12,
    color: COLORES.rojoAcento,
  },
});
