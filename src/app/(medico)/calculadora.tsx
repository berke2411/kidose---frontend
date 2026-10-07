import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Encabezado } from '@/components/encabezado';
import { ModalInfoMedicamento } from '@/components/modal-info-medicamento';
import { TarjetaDosis } from '@/components/tarjeta-dosis';
import { COLORES } from '@/constants/colores';
import { useSesion } from '@/context/sesion';
import { CATEGORIAS, Medicamento, PESOS_POR_EDAD } from '@/data/medicamentos-ejemplo';
import { formatearNumero } from '@/utils/calcular-dosis';
import { restarPeso, sumarPeso } from '@/utils/peso';

// Pestaña central del médico: calculadora de dosis según el peso del paciente.
// Con un paciente escaneado usa su peso y agrega el botón "Suministrar".
export default function CalculadoraScreen() {
  const { pacienteEscaneado, dosisSuministradas, suministrarDosis, actualizarPeso } = useSesion();
  const [pesoManual, setPesoManual] = useState(14);
  // Con paciente escaneado el peso sale de su ficha (y se puede corregir); sin paciente se ajusta a mano
  const peso = pacienteEscaneado ? pacienteEscaneado.pesoKg : pesoManual;
  const [categoriaId, setCategoriaId] = useState(CATEGORIAS[0].id);
  const [medicamentoInfo, setMedicamentoInfo] = useState<Medicamento | null>(null);

  const categoriaElegida = CATEGORIAS.find((categoria) => categoria.id === categoriaId);

  function cambiarPeso(nuevoPeso: number) {
    if (pacienteEscaneado) {
      actualizarPeso(nuevoPeso);
    } else {
      setPesoManual(nuevoPeso);
    }
  }

  return (
    <View style={styles.pantalla}>
      <Encabezado etiqueta="CALCULADORA">
        <View style={styles.tarjetaPeso}>
          <Text style={styles.etiquetaPeso}>
            {pacienteEscaneado ? `PESO DE ${pacienteEscaneado.nombre.toUpperCase()}` : 'PESO DEL PACIENTE'}
          </Text>

          <View style={styles.filaPeso}>
            <Pressable style={styles.botonPeso} onPress={() => cambiarPeso(restarPeso(peso))}>
              <Ionicons name="remove" size={28} color={COLORES.blanco} />
            </Pressable>

            <View style={styles.valorPeso}>
              <Text style={styles.numeroPeso}>{formatearNumero(peso)}</Text>
              <Text style={styles.unidadPeso}>kg</Text>
            </View>

            <Pressable style={styles.botonPeso} onPress={() => cambiarPeso(sumarPeso(peso))}>
              <Ionicons name="add" size={28} color={COLORES.blanco} />
            </Pressable>
          </View>

          {!pacienteEscaneado && (
            <View style={styles.filaEdades}>
              {PESOS_POR_EDAD.map((item) => (
                <Pressable key={item.edad} style={styles.botonEdad} onPress={() => cambiarPeso(item.kg)}>
                  <Text style={styles.textoEdad}>{item.edad}</Text>
                  <Text style={styles.kgEdad}>{formatearNumero(item.kg)} kg</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </Encabezado>

      <View style={styles.barraCategorias}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filaCategorias}>
          {CATEGORIAS.map((categoria) => {
            const estaActiva = categoria.id === categoriaId;
            return (
              <Pressable
                key={categoria.id}
                style={[styles.chipCategoria, estaActiva && styles.chipCategoriaActiva]}
                onPress={() => setCategoriaId(categoria.id)}>
                <Text style={[styles.textoCategoria, estaActiva && styles.textoCategoriaActiva]}>
                  {categoria.nombre}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.listaDosis}>
        {categoriaElegida?.medicamentos.map((medicamento) => (
          <TarjetaDosis
            key={medicamento.nombre}
            medicamento={medicamento}
            peso={peso}
            onMasInfo={() => setMedicamentoInfo(medicamento)}
            onSuministrar={
              pacienteEscaneado
                ? (cantidad) => suministrarDosis(medicamento, cantidad)
                : undefined
            }
            vecesSuministrada={
              dosisSuministradas.filter((dosis) => dosis.medicamento === medicamento.nombre).length
            }
          />
        ))}

        <View style={styles.aviso}>
          <Text style={styles.avisoTexto}>
            Valores de ejemplo para la maqueta: todavía no están cargados desde la fuente oficial.
            Verificá siempre la dosis con un segundo operador antes de administrar.
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
    fontWeight: '600',
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
    fontWeight: '700',
    color: COLORES.blanco,
  },
  unidadPeso: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORES.azulTextoSobreAzul,
  },
  filaEdades: {
    flexDirection: 'row',
    gap: 7,
  },
  botonEdad: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    backgroundColor: COLORES.superficieSobreAzul,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoEdad: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.blanco,
  },
  kgEdad: {
    fontSize: 9,
    fontWeight: '500',
    color: COLORES.azulTextoSobreAzul,
  },

  barraCategorias: {
    backgroundColor: COLORES.blanco,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.divisor,
    paddingVertical: 10,
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
    fontWeight: '600',
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
  aviso: {
    backgroundColor: COLORES.azulSuave,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  avisoTexto: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORES.azulPrimario,
  },
});
