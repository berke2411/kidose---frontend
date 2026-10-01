// ⚠️ DATOS DE EJEMPLO — SOLO PARA LA MAQUETA (ENTREGA 1)
// Estos valores se copiaron del diseño visual para mostrar cómo se ve la
// calculadora. NO están validados. Los valores reales se cargarán desde la
// única fuente autorizada: el libro de Medicamentos en Emergencias
// Pediátricas de la SAE.

export type Medicamento = {
  nombre: string;
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
        via: "IV / IO",
        dosisPorKg: 0.01,
        dosisMaxima: 1,
        unidad: "mg",
        nota: "Repetir cada 3–5 min durante el paro.",
        esCritico: true,
      },
      {
        nombre: "Amiodarona",
        via: "IV / IO",
        dosisPorKg: 5,
        dosisMaxima: 300,
        unidad: "mg",
        nota: "FV / TV sin pulso, tras el 3.er choque.",
      },
      {
        nombre: "Solución fisiológica",
        via: "BOLO IV / IO",
        dosisPorKg: 20,
        unidad: "ml",
        nota: "Bolo en 5–10 min. Reevaluar.",
      },
      {
        nombre: "Dextrosa 10%",
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
        via: "IV — INDUCCIÓN",
        dosisPorKg: 2,
        unidad: "mg",
        nota: "De elección en shock o broncoespasmo.",
      },
      {
        nombre: "Fentanilo",
        via: "IV — ANALGESIA",
        dosisPorKg: 2,
        unidad: "mcg",
        nota: "Administrar lento.",
      },
      {
        nombre: "Rocuronio",
        via: "IV — BNM",
        dosisPorKg: 1,
        dosisMaxima: 100,
        unidad: "mg",
        nota: "Inicio 45–60 s.",
      },
      {
        nombre: "Succinilcolina",
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
        via: "IV / IO",
        dosisPorKg: 0.1,
        dosisMaxima: 5,
        unidad: "mg",
        nota: "Repetir a los 5 min si persiste la crisis.",
        esCritico: true,
      },
      {
        nombre: "Midazolam intranasal",
        via: "IN / IM",
        dosisPorKg: 0.2,
        dosisMaxima: 10,
        unidad: "mg",
        nota: "Sin acceso venoso.",
      },
      {
        nombre: "Diazepam",
        via: "RECTAL",
        dosisPorKg: 0.5,
        dosisMaxima: 10,
        unidad: "mg",
        nota: "Alternativa prehospitalaria.",
      },
      {
        nombre: "Levetiracetam",
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
        via: "IV / VO",
        dosisPorKg: 2,
        dosisMaxima: 60,
        unidad: "mg",
        nota: "Dentro de la primera hora.",
      },
      {
        nombre: "Sulfato de magnesio",
        via: "IV — 20 min",
        dosisPorKg: 40,
        dosisMaxima: 2000,
        unidad: "mg",
        nota: "Crisis grave refractaria.",
        esCritico: true,
      },
      {
        nombre: "Adrenalina",
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
        via: "IM",
        dosisPorKg: 0.01,
        dosisMaxima: 0.5,
        unidad: "mg",
        nota: "Primera línea. Repetir a los 5–15 min.",
        esCritico: true,
      },
      {
        nombre: "Solución fisiológica",
        via: "BOLO IV",
        dosisPorKg: 20,
        unidad: "ml",
        nota: "Si hay hipotensión.",
      },
      {
        nombre: "Difenhidramina",
        via: "IV / IM",
        dosisPorKg: 1,
        dosisMaxima: 50,
        unidad: "mg",
        nota: "Coadyuvante, nunca reemplaza la adrenalina.",
      },
      {
        nombre: "Hidrocortisona",
        via: "IV",
        dosisPorKg: 5,
        dosisMaxima: 200,
        unidad: "mg",
        nota: "Previene la reacción bifásica.",
      },
    ],
  },
];

// Accesos rápidos de peso aproximado por edad (también de ejemplo).
export const PESOS_POR_EDAD = [
  { edad: "RN", kg: 3.5 },
  { edad: "6 m", kg: 7 },
  { edad: "1 a", kg: 10 },
  { edad: "3 a", kg: 14 },
  { edad: "7 a", kg: 22 },
];
