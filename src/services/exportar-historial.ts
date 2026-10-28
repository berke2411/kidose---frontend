import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { COLORES } from '@/constants/colores';
import { Atencion, Paciente } from '@/data/tipos';
import { listarAtenciones } from '@/services/api';
import { formatearNumero } from '@/utils/calcular-dosis';
import { calcularEdad, formatearFecha, formatearHora } from '@/utils/fechas';

// Exporta la historia clínica de un paciente como PDF con la marca de Kidose.
// Los datos se piden al servidor en el momento, para que el PDF tenga siempre lo último guardado.

// Los textos van dentro de HTML: se reemplazan los caracteres que tienen significado especial
function escapar(texto: string) {
  return texto
    .split('&').join('&amp;')
    .split('<').join('&lt;')
    .split('>').join('&gt;')
    .split('"').join('&quot;');
}

function armarHtml(paciente: Paciente, atenciones: Atencion[]) {
  const ahora = new Date().toISOString();

  const alergias =
    paciente.alergias.length === 0
      ? '<span class="vacio">Ninguna conocida</span>'
      : paciente.alergias.map((alergia) => `<span class="alergia">${escapar(alergia.toUpperCase())}</span>`).join('');

  const bloquesAtenciones =
    atenciones.length === 0
      ? '<p class="vacio">Todavía no hay atenciones registradas.</p>'
      : atenciones
          .map((atencion) => {
            const filas = atencion.dosis
              .map(
                (dosis) => `
                <tr>
                  <td class="medicamento">${escapar(dosis.nombre)}</td>
                  <td>${escapar(dosis.via)}</td>
                  <td>${formatearHora(dosis.hora)}</td>
                  <td class="cantidad">${formatearNumero(dosis.cantidad)} ${escapar(dosis.unidad)}</td>
                </tr>`
              )
              .join('');

            return `
              <div class="atencion">
                <div class="atencion-titulo">${formatearFecha(atencion.fecha)}</div>
                <div class="detalle">Dr/a. ${escapar(atencion.medico.nombre)} · ${escapar(atencion.lugar)} · Peso ${formatearNumero(atencion.pesoKg)} kg</div>
                <table>
                  <thead><tr><th>Medicamento</th><th>Vía</th><th>Hora</th><th class="cantidad">Dosis</th></tr></thead>
                  <tbody>${filas}</tbody>
                </table>
              </div>`;
          })
          .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; font-family: Helvetica, Arial, sans-serif; color: ${COLORES.texto}; background: ${COLORES.blanco}; font-size: 12px; }
  .encabezado { background: ${COLORES.azulPrimario}; color: ${COLORES.blanco}; padding: 22px 32px; display: flex; align-items: center; justify-content: space-between; }
  .marca { display: flex; align-items: center; }
  .gota { width: 30px; height: 30px; background: ${COLORES.blanco}; border-radius: 15px 15px 15px 3px; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; margin-right: 12px; }
  .cruz { position: relative; width: 13px; height: 13px; transform: rotate(45deg); }
  .cruz span { position: absolute; background: ${COLORES.azulPrimario}; border-radius: 1px; }
  .cruz .v { left: 4.5px; top: 0; width: 4px; height: 13px; }
  .cruz .h { left: 0; top: 4.5px; width: 13px; height: 4px; }
  .nombre-marca { font-size: 22px; font-weight: bold; }
  .etiqueta-encabezado { font-size: 11px; letter-spacing: 2px; color: ${COLORES.azulTextoSobreAzul}; }
  .contenido { padding: 24px 32px; }
  h1 { font-size: 20px; margin: 0 0 16px; color: ${COLORES.azulPrimario}; }
  h2 { font-size: 11px; letter-spacing: 1.3px; color: ${COLORES.gris}; margin: 24px 0 10px; }
  .paciente { background: ${COLORES.fondo}; border-radius: 10px; padding: 14px 16px; }
  .paciente .nombre { font-size: 17px; font-weight: bold; margin-bottom: 6px; }
  .fila-datos { display: flex; flex-wrap: wrap; }
  .dato { width: 50%; padding: 3px 0; }
  .dato b { display: block; font-size: 9px; letter-spacing: 1px; color: ${COLORES.gris}; font-weight: bold; }
  .alergia { display: inline-block; background: ${COLORES.alerta}; color: ${COLORES.rojoAcento}; font-size: 10px; font-weight: bold; letter-spacing: 0.8px; padding: 5px 8px; border-radius: 6px; margin: 0 6px 6px 0; }
  .vacio { color: ${COLORES.gris}; }
  .atencion { border: 1px solid ${COLORES.borde}; border-left: 4px solid ${COLORES.azulPrimario}; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px; page-break-inside: avoid; }
  .atencion-titulo { font-size: 15px; font-weight: bold; }
  .detalle { color: ${COLORES.gris}; margin: 2px 0 8px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 9px; letter-spacing: 1px; color: ${COLORES.gris}; padding: 5px 0; border-bottom: 1px solid ${COLORES.divisor}; }
  td { padding: 6px 0; border-bottom: 1px solid ${COLORES.divisor}; }
  .medicamento { font-weight: bold; }
  .cantidad { text-align: right; font-weight: bold; color: ${COLORES.azulPrimario}; }
  th.cantidad { color: ${COLORES.gris}; }
  .pie { margin-top: 24px; padding-top: 10px; border-top: 1px solid ${COLORES.divisor}; font-size: 9px; color: ${COLORES.gris}; line-height: 1.5; }
</style>
</head>
<body>
  <div class="encabezado">
    <div class="marca">
      <div class="gota"><div class="cruz"><span class="v"></span><span class="h"></span></div></div>
      <div class="nombre-marca">Kidose</div>
    </div>
    <div class="etiqueta-encabezado">HISTORIA CLÍNICA</div>
  </div>

  <div class="contenido">
    <h1>Historia clínica</h1>

    <div class="paciente">
      <div class="nombre">${escapar(paciente.nombre)}</div>
      <div class="fila-datos">
        <div class="dato"><b>DNI</b>${escapar(paciente.dni)}</div>
        <div class="dato"><b>EDAD</b>${calcularEdad(paciente.fechaNacimiento)}</div>
        <div class="dato"><b>FECHA DE NACIMIENTO</b>${formatearFecha(paciente.fechaNacimiento)}</div>
        <div class="dato"><b>PESO ACTUAL</b>${formatearNumero(paciente.pesoKg)} kg</div>
      </div>
    </div>

    <h2>ALERGIAS</h2>
    <div>${alergias}</div>

    <h2>ATENCIONES (${atenciones.length})</h2>
    ${bloquesAtenciones}

    <div class="pie">
      Documento emitido por Kidose el ${formatearFecha(ahora)} a las ${formatearHora(ahora)}.
      Kidose es un proyecto educativo: no maneja datos médicos reales ni implica responsabilidad médica.
      Las dosis se calculan con el libro de Medicamentos en Emergencias Pediátricas.
    </div>
  </div>
</body>
</html>`;
}

// Pide las atenciones, arma el PDF y abre el menú para compartirlo o guardarlo.
// En la web se abre el diálogo de impresión del navegador con el documento (ahí se elige "Guardar como PDF").
export async function exportarHistorial(paciente: Paciente) {
  const atenciones = await listarAtenciones(paciente.id);
  const html = armarHtml(paciente, atenciones);

  if (Platform.OS === 'web') {
    const ventana = window.open('', '_blank');
    if (ventana === null) {
      throw new Error('El navegador bloqueó la ventana. Permití las ventanas emergentes e intentá de nuevo.');
    }
    ventana.document.write(html);
    ventana.document.close();
    ventana.focus();
    ventana.print();
    return;
  }

  // Tamaño A4 en puntos (595 × 842)
  const { uri } = await Print.printToFileAsync({ html, width: 595, height: 842 });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Este dispositivo no permite compartir archivos.');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Historia clínica',
    UTI: 'com.adobe.pdf',
  });
}
