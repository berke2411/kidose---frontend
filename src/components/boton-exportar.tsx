import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { COLORES } from '@/constants/colores';
import { FUENTES } from '@/constants/tipografia';
import { Paciente } from '@/data/tipos';
import { exportarHistorial } from '@/services/exportar-historial';

export function BotonExportar({ paciente }: { paciente: Paciente }) {
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState('');

  async function exportar() {
    setExportando(true);
    setError('');
    try {
      await exportarHistorial(paciente);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo generar el PDF.');
    } finally {
      setExportando(false);
    }
  }

  return (
    <View style={styles.contenedor}>
      <Boton
        texto={exportando ? 'Generando PDF…' : 'Exportar historia clínica (PDF)'}
        variante="secundario"
        onPress={exportar}
        deshabilitado={exportando}
      />
      {error !== '' && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: 8,
  },
  error: {
    fontSize: 13,
    fontFamily: FUENTES.seminegrita,
    color: COLORES.rojoAcento,
    textAlign: 'center',
  },
});
