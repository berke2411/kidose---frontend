// Tipos de datos compartidos por las pantallas. Los nombres de los campos son
// exactamente los de la API (y los de los modelos de Prisma del backend).

export type Medico = {
  rol: 'medico';
  id: number;
  estado: string; // pendiente, aprobada o rechazada
  nombre: string;
  email: string;
  dni: string;
  matricula: string;
  especialidad: string;
  hospital: string;
};

export type Paciente = {
  rol: 'paciente';
  id: number;
  estado: string;
  nombre: string;
  email: string;
  dni: string;
  fechaNacimiento: string; // fecha ISO, ej: "2023-07-15T12:00:00.000Z"
  direccion: string; // dirección normalizada, ej: "AV SANTA FE 1234, Comuna 1, Ciudad Autónoma de Buenos Aires"
  pesoKg: number;
  alergias: string[];
};

export type Admin = {
  rol: 'admin';
  id: number;
  estado: string;
  nombre: string;
  email: string;
  dni: string;
};

export type Usuario = Medico | Paciente | Admin;

// Un medicamento del catálogo, con la dosis por kg del libro de la fuente única.
export type Medicamento = {
  id: number;
  nombre: string;
  principioActivo: string; // nombre del principio activo en CIMA (en minúscula)
  viaCima: string; // vía de administración tal como figura en CIMA, para elegir la presentación correcta
  via: string; // vía de administración (IV, IM, etc.)
  dosisPorKg: number; // cantidad por cada kg de peso
  dosisMaxima: number | null; // tope: nunca se supera (null si el libro no trae uno)
  unidad: string; // mg, ml, mcg...
  nota: string;
  esCritico: boolean; // si es true se resalta en rojo
};

export type Categoria = {
  id: number;
  clave: string;
  nombre: string;
  medicamentos: Medicamento[];
};

// Una dosis que el médico suministró (o va a suministrar) en una atención.
export type DosisSuministrada = {
  id: number;
  medicamentoId: number;
  nombre: string;
  via: string;
  cantidad: number;
  unidad: string;
  hora: string; // fecha ISO
  medicamento?: Medicamento; // la API lo manda en el historial
};

// Una atención ya realizada: aparece en el historial del paciente.
export type Atencion = {
  id: number;
  fecha: string; // fecha ISO
  lugar: string;
  pesoKg: number;
  medico: { id: number; nombre: string };
  dosis: DosisSuministrada[];
};

// Un profesional tal como figura en el registro de matrículas.
export type ProfesionalRegistrado = {
  matricula: string;
  nombre: string;
  dni: string;
  especialidad: string;
};

// Una opción de una lista de Georef (provincia o localidad).
export type OpcionGeoref = {
  id: string;
  nombre: string;
  detalle?: string; // ej: el departamento, para distinguir localidades con el mismo nombre
};

// Contraindicaciones de un medicamento, tomadas de la ficha técnica de CIMA.
export type Contraindicaciones = {
  producto: string; // medicamento de la ficha técnica consultada
  laboratorio: string;
  texto: string;
};

// Dirección confirmada por Georef.
export type DireccionVerificada = {
  provincia: string;
  localidad: string;
  direccion: string; // dirección normalizada por Georef
  latitud: number;
  longitud: number;
};
