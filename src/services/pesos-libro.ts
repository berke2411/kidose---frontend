import { useEffect, useState } from 'react';

import { PesosLibro } from '@/data/tipos';
import { obtenerPesosLibro } from '@/services/api';

// Los pesos del libro se piden una sola vez y se reusan en todas las pantallas
let guardados: PesosLibro | null = null;

export function usePesosLibro() {
  const [datos, setDatos] = useState<PesosLibro | null>(guardados);
  const [error, setError] = useState('');
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (guardados !== null) return;
    let cancelado = false;
    obtenerPesosLibro()
      .then((respuesta) => {
        guardados = respuesta;
        if (!cancelado) setDatos(respuesta);
      })
      .catch((e) => {
        if (!cancelado) setError(e instanceof Error ? e.message : 'No se pudieron cargar los pesos del libro.');
      });
    return () => {
      cancelado = true;
    };
  }, [intento]);

  function reintentar() {
    setError('');
    setIntento(intento + 1);
  }

  return { pesos: datos?.pesos ?? null, edadPeso: datos?.edadPeso ?? [], avisos: datos?.avisos ?? [], error, reintentar };
}
