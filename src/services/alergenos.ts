import { useEffect, useState } from 'react';

import { Alergeno } from '@/data/tipos';
import { obtenerAlergenos } from '@/services/api';

// La lista de alergias posibles se pide una sola vez y se reusa en todas las pantallas
let guardados: Alergeno[] | null = null;

export function useAlergenos() {
  const [alergenos, setAlergenos] = useState<Alergeno[] | null>(guardados);
  const [error, setError] = useState('');
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (guardados !== null) return;
    let cancelado = false;
    obtenerAlergenos()
      .then((respuesta) => {
        guardados = respuesta;
        if (!cancelado) setAlergenos(respuesta);
      })
      .catch((e) => {
        if (!cancelado) setError(e instanceof Error ? e.message : 'No se pudo cargar la lista de alergias.');
      });
    return () => {
      cancelado = true;
    };
  }, [intento]);

  function reintentar() {
    setError('');
    setIntento(intento + 1);
  }

  return { alergenos, error, reintentar };
}
