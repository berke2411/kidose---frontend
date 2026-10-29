import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AvisosLibro } from '@/components/avisos-libro';
import { Boton } from '@/components/boton';
import { CampoPeso } from '@/components/campo-peso';
import { Encabezado } from '@/components/encabezado';
import { ModalInfoMedicamento } from '@/components/modal-info-medicamento';
import { TarjetaGeneral } from '@/components/tarjeta-general';
import { TarjetaLibro } from '@/components/tarjeta-libro';
import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';
import { useSesion } from '@/context/sesion';
import { Generales, ItemLibro, Medicamento, TablaLibro } from '@/data/tipos';
import { obtenerGenerales, obtenerTablaLibro } from '@/services/api';
import { useAlergenos } from '@/services/alergenos';
import { usePesosLibro } from '@/services/pesos-libro';
import { buscarAlergia } from '@/utils/alergias';
import { formatearNumero } from '@/utils/calcular-dosis';
import { normalizarPeso, pesoAnterior, pesoSiguiente } from '@/utils/peso';

function aMedicamento(item: ItemLibro): Medicamento {
  return {
    id: item.medicamentoId,
    nombre: item.nombre,
    principioActivo: item.principioActivo,
    viaCima: item.viaCima,
    via: item.via,
    esCritico: item.esCritico,
  };
}

// Pestaña central del médico: tablas del libro según el peso del paciente.
// Con un paciente escaneado usa su peso y agrega el botón "Suministrar".
export default function CalculadoraScreen() {
  const { pacienteEscaneado, dosisSuministradas, suministrarDosis, actualizarPeso } = useSesion();
  const { pesos, edadPeso, avisos, error: errorPesos, reintentar: reintentarPesos } = usePesosLibro();
  const { alergenos } = useAlergenos();
  const [pesoManual, setPesoManual] = useState(14);
  const [vista, setVista] = useState<'tabla' | 'otras'>('tabla');
  const [tabla, setTabla] = useState<TablaLibro | null>(null);
  const [generales, setGenerales] = useState<Generales | null>(null);
  const [errorCarga, setErrorCarga] = useState('');
  const [reintento, setReintento] = useState(0);
  const [claveElegida, setClaveElegida] = useState<string | null>(null);
  const [medicamentoInfo, setMedicamentoInfo] = useState<Medicamento | null>(null);

  // Siempre se usa el peso de una tabla del libro (hacia abajo)
  const pesoElegido = pacienteEscaneado ? pacienteEscaneado.pesoKg : pesoManual;
  const peso = pesos === null ? null : (normalizarPeso(pesos, pesoElegido) ?? pesos[0]);

  useEffect(() => {
    if (peso === null) return;
    let cancelado = false;
    const pedido = vista === 'tabla' ? obtenerTablaLibro(peso).then(setTabla) : obtenerGenerales(peso).then(setGenerales);
    pedido
      .then(() => {
        if (!cancelado) setErrorCarga('');
      })
      .catch((error) => {
        if (!cancelado) setErrorCarga(error instanceof Error ? error.message : 'No se pudo cargar el libro.');
      });
    return () => {
      cancelado = true;
    };
  }, [peso, vista, reintento]);

  function cambiarPeso(nuevoPeso: number) {
    if (pacienteEscaneado) {
      actualizarPeso(nuevoPeso);
    } else {
      setPesoManual(nuevoPeso);
    }
  }

  // Con los botones se cierra el teclado, para que el campo muestre el peso nuevo
  function ajustarPeso(nuevoPeso: number) {
    Keyboard.dismiss();
    cambiarPeso(nuevoPeso);
  }

  const tablaLista = tabla !== null && tabla.peso === peso;
  const generalesListas = generales !== null && generales.peso === peso;
  const seccionesTabla = tablaLista ? tabla.categorias : [];
  const fichas = generalesListas ? generales.fichas : [];
  const secciones = vista === 'tabla' ? seccionesTabla : fichas;
  const seccionTabla = seccionesTabla.find((seccion) => seccion.clave === claveElegida) ?? seccionesTabla[0];
  const ficha = fichas.find((otra) => otra.clave === claveElegida) ?? fichas[0];
  const claveActiva = vista === 'tabla' ? seccionTabla?.clave : claveElegida === 'referencias' ? 'referencias' : ficha?.clave;
  const cargando = peso === null || (vista === 'tabla' ? !tablaLista : !generalesListas);

  return (
    <View style={styles.pantalla}>
      <Encabezado etiqueta="CALCULADORA">
        <View style={styles.tarjetaPeso}>
          <Text style={styles.etiquetaPeso}>
            {pacienteEscaneado ? `PESO DE ${pacienteEscaneado.nombre.toUpperCase()}` : 'PESO DEL PACIENTE'}
          </Text>

          {pesos !== null && peso !== null ? (
            <View style={styles.filaPeso}>
              <Pressable style={styles.botonPeso} onPress={() => ajustarPeso(pesoAnterior(pesos, peso))}>
                <Ionicons name="remove" size={28} color={COLORES.blanco} />
              </Pressable>

              <View style={styles.valorPeso}>
                <CampoPeso valor={peso} pesos={pesos} onCambiar={cambiarPeso} estilo={styles.numeroPeso} />
                <Text style={styles.unidadPeso}>kg</Text>
              </View>

              <Pressable style={styles.botonPeso} onPress={() => ajustarPeso(pesoSiguiente(pesos, peso))}>
                <Ionicons name="add" size={28} color={COLORES.blanco} />
              </Pressable>
            </View>
          ) : (
            <Text style={styles.etiquetaPeso}>{errorPesos === '' ? 'Cargando pesos del libro…' : errorPesos}</Text>
          )}

          {!pacienteEscaneado && edadPeso.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filaEdades}>
              {edadPeso.map((item) => (
                <Pressable key={item.edad} style={styles.botonEdad} onPress={() => ajustarPeso(item.kg)}>
                  <Text style={styles.textoEdad}>{item.etiqueta}</Text>
                  <Text style={styles.kgEdad}>{item.texto} kg</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </Encabezado>

      <View style={styles.selectorVista}>
        <Pressable style={[styles.opcionVista, vista === 'tabla' && styles.opcionVistaActiva]} onPress={() => setVista('tabla')}>
          <Text style={[styles.textoVista, vista === 'tabla' && styles.textoVistaActivo]}>Tabla por peso</Text>
        </Pressable>
        <Pressable style={[styles.opcionVista, vista === 'otras' && styles.opcionVistaActiva]} onPress={() => setVista('otras')}>
          <Text style={[styles.textoVista, vista === 'otras' && styles.textoVistaActivo]}>Otras indicaciones</Text>
        </Pressable>
      </View>

      <View style={styles.barraCategorias}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filaCategorias}>
          {secciones.map((seccion) => {
            const estaActiva = seccion.clave === claveActiva;
            return (
              <Pressable
                key={seccion.clave}
                style={[styles.chipCategoria, estaActiva && styles.chipCategoriaActiva]}
                onPress={() => setClaveElegida(seccion.clave)}>
                <Text style={[styles.textoCategoria, estaActiva && styles.textoCategoriaActiva]}>{seccion.nombre}</Text>
              </Pressable>
            );
          })}
          {vista === 'otras' && generalesListas && (
            <Pressable
              style={[styles.chipCategoria, claveActiva === 'referencias' && styles.chipCategoriaActiva]}
              onPress={() => setClaveElegida('referencias')}>
              <Text style={[styles.textoCategoria, claveActiva === 'referencias' && styles.textoCategoriaActiva]}>Referencias</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.listaDosis}>
        {cargando && errorCarga === '' && <ActivityIndicator color={COLORES.azulPrimario} style={styles.cargando} />}
        {errorCarga !== '' && (
          <View style={styles.errorCarga}>
            <Text style={styles.avisoTexto}>{errorCarga}</Text>
            <Boton
              texto="Reintentar"
              variante="secundario"
              onPress={() => {
                setErrorCarga('');
                reintentarPesos();
                setReintento(reintento + 1);
              }}
            />
          </View>
        )}

        {vista === 'tabla' &&
          seccionTabla !== undefined &&
          seccionTabla.items.map((item) => (
            <TarjetaLibro
              key={item.medicamentoId}
              item={item}
              onMasInfo={() => setMedicamentoInfo(aMedicamento(item))}
              onSuministrar={pacienteEscaneado ? (cantidad) => suministrarDosis(item, cantidad) : undefined}
              alergia={pacienteEscaneado && alergenos ? buscarAlergia(pacienteEscaneado.alergias, alergenos, item) : null}
              vecesSuministrada={dosisSuministradas.filter((dosis) => dosis.medicamentoId === item.medicamentoId).length}
            />
          ))}
        {vista === 'tabla' && seccionTabla?.nota != null && <Text style={styles.nota}>{seccionTabla.nota}</Text>}

        {vista === 'otras' &&
          claveActiva !== 'referencias' &&
          ficha !== undefined &&
          ficha.items.map((item) => (
            <TarjetaGeneral
              key={item.nombre}
              item={item}
              alergia={pacienteEscaneado && alergenos ? buscarAlergia(pacienteEscaneado.alergias, alergenos, item) : null}
            />
          ))}

        {vista === 'otras' && generalesListas && claveActiva === 'referencias' && (
          <View style={styles.referencias}>
            <Text style={styles.tituloReferencia}>Fórmulas por edad</Text>
            {generales.formulas.map((formula) => (
              <Text key={formula.nombre} style={styles.textoReferencia}>
                {formula.nombre}: {formula.texto}
              </Text>
            ))}
            <Text style={styles.tituloReferencia}>Edad y peso aproximado</Text>
            {edadPeso.map((item) => (
              <Text key={item.edad} style={styles.textoReferencia}>
                {item.edad}: {item.texto} kg
              </Text>
            ))}
          </View>
        )}

        <AvisosLibro avisos={avisos} />
        <View style={styles.aviso}>
          <Text style={styles.avisoTexto}>
            Fuente única: Libro de Medicamentos en Emergencias Pediátricas: Latinoamérica. Los pesos son los de las tablas del
            libro ({peso !== null ? `${formatearNumero(peso)} kg` : '—'}). Verificá siempre la dosis con un segundo operador antes de
            administrar.
          </Text>
        </View>
      </ScrollView>

      <ModalInfoMedicamento medicamento={medicamentoInfo} onCerrar={() => setMedicamentoInfo(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },

  tarjetaPeso: {
    backgroundColor: COLORES.superficieSobreAzul,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  etiquetaPeso: {
    fontSize: 11,
    fontFamily: FUENTES.seminegrita,
    letterSpacing: 1.5,
    color: COLORES.azulTextoSobreAzul,
  },
  filaPeso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  botonPeso: {
    width: 52,
    height: 52,
    borderRadius: 13,
    backgroundColor: COLORES.botonSobreAzul,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valorPeso: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
  },
  numeroPeso: {
    fontSize: 54,
    fontFamily: FUENTES.negrita,
    color: COLORES.blanco,
  },
  unidadPeso: {
    fontSize: 20,
    fontFamily: FUENTES.seminegrita,
    color: COLORES.azulTextoSobreAzul,
  },
  filaEdades: {
    gap: 7,
  },
  botonEdad: {
    minWidth: 64,
    height: 40,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: COLORES.superficieSobreAzul,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoEdad: {
    fontSize: 12,
    fontFamily: FUENTES.seminegrita,
    color: COLORES.blanco,
  },
  kgEdad: {
    fontSize: 9,
    fontFamily: FUENTES.media,
    color: COLORES.azulTextoSobreAzul,
  },

  selectorVista: {
    flexDirection: 'row',
    backgroundColor: COLORES.divisor,
    borderRadius: 11,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 12,
  },
  opcionVista: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcionVistaActiva: {
    backgroundColor: COLORES.blanco,
  },
  textoVista: {
    fontSize: 14,
    fontFamily: FUENTES.seminegrita,
    color: COLORES.gris,
  },
  textoVistaActivo: {
    color: COLORES.azulPrimario,
  },

  barraCategorias: {
    backgroundColor: COLORES.blanco,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.divisor,
    paddingVertical: 10,
    marginTop: 12,
  },
  filaCategorias: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chipCategoria: {
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 19,
    backgroundColor: COLORES.fondo,
    justifyContent: 'center',
  },
  chipCategoriaActiva: {
    backgroundColor: COLORES.azulPrimario,
  },
  textoCategoria: {
    fontSize: 14,
    fontFamily: FUENTES.seminegrita,
    color: COLORES.gris,
  },
  textoCategoriaActiva: {
    color: COLORES.blanco,
  },

  listaDosis: {
    padding: 16,
    paddingBottom: 32,
    gap: 10,
  },
  cargando: {
    marginVertical: 40,
  },
  errorCarga: {
    gap: 12,
  },
  nota: {
    fontSize: 12,
    fontFamily: FUENTES.normal,
    color: COLORES.gris,
  },
  referencias: {
    backgroundColor: COLORES.blanco,
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  tituloReferencia: {
    marginTop: 6,
    fontSize: 15,
    fontFamily: FUENTES.negrita,
    color: COLORES.texto,
  },
  textoReferencia: {
    fontSize: 14,
    fontFamily: FUENTES.normal,
    color: COLORES.texto,
  },
  aviso: {
    backgroundColor: COLORES.azulSuave,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  avisoTexto: {
    fontSize: 12,
    fontFamily: FUENTES.normal,
    lineHeight: 18,
    color: COLORES.azulPrimario,
  },
});
