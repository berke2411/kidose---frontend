// Datos de prueba mientras no haya backend: usuarios, historial y registro de matrículas inventados.

import { Medico, Paciente, ProfesionalRegistrado, Usuario } from "@/data/tipos";

export const MEDICO_EJEMPLO: Medico = {
  rol: "medico",
  nombre: "Laura Fernández",
  email: "medico@kidose.com",
  contrasena: "Medico123",
  dni: "30123456",
  matricula: "123456",
  especialidad: "Emergentología pediátrica",
  hospital: "Hospital de Niños",
};

export const PACIENTE_EJEMPLO: Paciente = {
  rol: "paciente",
  nombre: "Lucía Ramos",
  email: "paciente@kidose.com",
  contrasena: "Paciente123",
  dni: "52345678",
  edad: "3 años",
  direccion: "AV SANTA FE 1234, Comuna 1, Ciudad Autónoma de Buenos Aires",
  pesoKg: 14,
  alergias: ["Penicilina", "Látex"],
  historial: [
    {
      id: "a2",
      fecha: "12/08/2026",
      medico: "Laura Fernández",
      lugar: "Hospital de Niños",
      dosis: [
        {
          id: "d3",
          medicamento: "Midazolam",
          via: "IV / IO",
          cantidad: 1.4,
          unidad: "mg",
          hora: "21:05",
        },
        {
          id: "d4",
          medicamento: "Levetiracetam",
          via: "IV — CARGA",
          cantidad: 560,
          unidad: "mg",
          hora: "21:20",
        },
      ],
    },
    {
      id: "a1",
      fecha: "03/05/2026",
      medico: "Martín Gómez",
      lugar: "Hospital de Niños",
      dosis: [
        {
          id: "d1",
          medicamento: "Metilprednisolona",
          via: "IV / VO",
          cantidad: 28,
          unidad: "mg",
          hora: "09:40",
        },
        {
          id: "d2",
          medicamento: "Sulfato de magnesio",
          via: "IV — 20 min",
          cantidad: 560,
          unidad: "mg",
          hora: "09:55",
        },
      ],
    },
  ],
};

export const USUARIOS: Usuario[] = [MEDICO_EJEMPLO, PACIENTE_EJEMPLO];

// Simula el registro oficial de matrículas de médicos de Argentina.
export const REGISTRO_MATRICULAS: ProfesionalRegistrado[] = [
  {
    matricula: "123456",
    nombre: "Laura Fernández",
    dni: "30123456",
    especialidad: "Emergentología pediátrica",
  },
  {
    matricula: "234567",
    nombre: "Martín Gómez",
    dni: "28456789",
    especialidad: "Pediatría",
  },
  {
    matricula: "345678",
    nombre: "Sofía Acosta",
    dni: "33987654",
    especialidad: "Terapia intensiva pediátrica",
  },
];
