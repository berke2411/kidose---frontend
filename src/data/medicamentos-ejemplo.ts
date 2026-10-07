// DATOS DE EJEMPLO
// Estos valores se copiaron del diseño visual para mostrar cómo se ve la
// calculadora. NO están validados. Los valores reales se cargarán desde la
// única fuente autorizada: el libro de Medicamentos en Emergencias
// Pediátricas de la SAE.

export type Medicamento = {
  nombre: string;
  principioActivo: string; // nombre del principio activo en CIMA (en minúscula)
  viaCima: string; // vía de administración tal como figura en CIMA, para elegir la presentación correcta
  via: string; // vía de administración (IV, IM, etc.)
  dosisPorKg: number; // cantidad por cada kg de peso
  dosisMaxima?: number; // tope: nunca se supera (opcional)
  unidad: string; // mg, ml, mcg...
  nota: string;
  esCritico?: boolean; // si es true se resalta en rojo
};

export type Categoria = {
  id: string;
  nombre: string;
  medicamentos: Medicamento[];
};

export const CATEGORIAS: Categoria[] = [
  {
    id: "reanimacion",
    nombre: "Reanimación",
    medicamentos: [
      {
        nombre: "Adrenalina 1:10.000",
        principioActivo: "epinefrina",
        viaCima: "INTRAVENOSA",
        via: "IV / IO",
        dosisPorKg: 0.01,
        dosisMaxima: 1,
        unidad: "mg",
        nota: "Repetir cada 3–5 min durante el paro.",
        esCritico: true,
      },
      {
        nombre: "Amiodarona",
        principioActivo: "amiodarona",
        viaCima: "INTRAVENOSA",
        via: "IV / IO",
        dosisPorKg: 5,
        dosisMaxima: 300,
        unidad: "mg",
        nota: "FV / TV sin pulso, tras el 3.er choque.",
      },
      {
        nombre: "Solución fisiológica",
        principioActivo: "sodio cloruro",
        viaCima: "INTRAVENOSA",
        via: "BOLO IV / IO",
        dosisPorKg: 20,
        unidad: "ml",
        nota: "Bolo en 5–10 min. Reevaluar.",
      },
      {
        nombre: "Dextrosa 10%",
        principioActivo: "glucosa",
        viaCima: "INTRAVENOSA",
        via: "IV / IO",
        dosisPorKg: 5,
        unidad: "ml",
        nota: "Hipoglucemia.",
      },
    ],
  },
  {
    id: "intubacion",
    nombre: "Intubación",
    medicamentos: [
      {
        nombre: "Ketamina",
        principioActivo: "ketamina",
        viaCima: "INTRAVENOSA",
        via: "IV — INDUCCIÓN",
        dosisPorKg: 2,
        unidad: "mg",
        nota: "De elección en shock o broncoespasmo.",
      },
      {
        nombre: "Fentanilo",
        principioActivo: "fentanilo",
        viaCima: "INTRAVENOSA",
        via: "IV — ANALGESIA",
        dosisPorKg: 2,
        unidad: "mcg",
        nota: "Administrar lento.",
      },
      {
        nombre: "Rocuronio",
        principioActivo: "rocuronio",
        viaCima: "INTRAVENOSA",
        via: "IV — BNM",
        dosisPorKg: 1,
        dosisMaxima: 100,
        unidad: "mg",
        nota: "Inicio 45–60 s.",
      },
      {
        nombre: "Succinilcolina",
        principioActivo: "suxametonio",
        viaCima: "INTRAVENOSA",
        via: "IV — BNM",
        dosisPorKg: 1.5,
        dosisMaxima: 150,
        unidad: "mg",
        nota: "Contraindicada en hiperkalemia y quemados.",
        esCritico: true,
      },
    ],
  },
  {
    id: "convulsiones",
    nombre: "Convulsiones",
    medicamentos: [
      {
        nombre: "Midazolam",
        principioActivo: "midazolam",
        viaCima: "INTRAVENOSA",
        via: "IV / IO",
        dosisPorKg: 0.1,
        dosisMaxima: 5,
        unidad: "mg",
        nota: "Repetir a los 5 min si persiste la crisis.",
        esCritico: true,
      },
      {
        nombre: "Midazolam intranasal",
        principioActivo: "midazolam",
        viaCima: "INTRAMUSCULAR",
        via: "IN / IM",
        dosisPorKg: 0.2,
        dosisMaxima: 10,
        unidad: "mg",
        nota: "Sin acceso venoso.",
      },
      {
        nombre: "Diazepam",
        principioActivo: "diazepam",
        viaCima: "RECTAL",
        via: "RECTAL",
        dosisPorKg: 0.5,
        dosisMaxima: 10,
        unidad: "mg",
        nota: "Alternativa prehospitalaria.",
      },
      {
        nombre: "Levetiracetam",
        principioActivo: "levetiracetam",
        viaCima: "INTRAVENOSA",
        via: "IV — CARGA",
        dosisPorKg: 40,
        dosisMaxima: 3000,
        unidad: "mg",
        nota: "Infundir en 15 min.",
      },
    ],
  },
  {
    id: "asma",
    nombre: "Asma",
    medicamentos: [
      {
        nombre: "Metilprednisolona",
        principioActivo: "metilprednisolona",
        viaCima: "INTRAVENOSA",
        via: "IV / VO",
        dosisPorKg: 2,
        dosisMaxima: 60,
        unidad: "mg",
        nota: "Dentro de la primera hora.",
      },
      {
        nombre: "Sulfato de magnesio",
        principioActivo: "magnesio sulfato",
        viaCima: "INTRAVENOSA",
        via: "IV — 20 min",
        dosisPorKg: 40,
        dosisMaxima: 2000,
        unidad: "mg",
        nota: "Crisis grave refractaria.",
        esCritico: true,
      },
      {
        nombre: "Adrenalina",
        principioActivo: "epinefrina",
        viaCima: "INTRAMUSCULAR",
        via: "IM",
        dosisPorKg: 0.01,
        dosisMaxima: 0.5,
        unidad: "mg",
        nota: "Asma casi fatal.",
        esCritico: true,
      },
    ],
  },
  {
    id: "anafilaxia",
    nombre: "Anafilaxia",
    medicamentos: [
      {
        nombre: "Adrenalina 1:1.000",
        principioActivo: "epinefrina",
        viaCima: "INTRAMUSCULAR",
        via: "IM",
        dosisPorKg: 0.01,
        dosisMaxima: 0.5,
        unidad: "mg",
        nota: "Primera línea. Repetir a los 5–15 min.",
        esCritico: true,
      },
      {
        nombre: "Solución fisiológica",
        principioActivo: "sodio cloruro",
        viaCima: "INTRAVENOSA",
        via: "BOLO IV",
        dosisPorKg: 20,
        unidad: "ml",
        nota: "Si hay hipotensión.",
      },
      {
        nombre: "Difenhidramina",
        principioActivo: "difenhidramina",
        viaCima: "INTRAVENOSA",
        via: "IV / IM",
        dosisPorKg: 1,
        dosisMaxima: 50,
        unidad: "mg",
        nota: "Coadyuvante, nunca reemplaza la adrenalina.",
      },
      {
        nombre: "Hidrocortisona",
        principioActivo: "hidrocortisona",
        viaCima: "INTRAVENOSA",
        via: "IV",
        dosisPorKg: 5,
        dosisMaxima: 200,
        unidad: "mg",
        nota: "Previene la reacción bifásica.",
      },
    ],
  },
];

// Busca un medicamento por su nombre (el historial guarda solo el nombre)
export function buscarMedicamento(nombre: string) {
  for (const categoria of CATEGORIAS) {
    const encontrado = categoria.medicamentos.find((medicamento) => medicamento.nombre === nombre);
    if (encontrado) return encontrado;
  }
  return null;
}

// Accesos rápidos de peso aproximado por edad (también de ejemplo).
export const PESOS_POR_EDAD = [
  { edad: "RN", kg: 3.5 },
  { edad: "6 m", kg: 7 },
  { edad: "1 a", kg: 10 },
  { edad: "3 a", kg: 14 },
  { edad: "7 a", kg: 22 },
];
