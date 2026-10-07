// Tipos de datos compartidos por las pantallas de médico y paciente.

// Una dosis que un médico suministró (o va a suministrar) en una atención.
export type DosisSuministrada = {
  id: string;
  medicamento: string;
  via: string;
  cantidad: number;
  unidad: string;
  hora: string; // ej: "14:32"
};

// Una atención ya realizada: aparece en el historial del paciente.
export type Atencion = {
  id: string;
  fecha: string; // ej: "12/08/2026"
  medico: string;
  lugar: string;
  dosis: DosisSuministrada[];
};

export type Medico = {
  rol: 'medico';
  nombre: string;
  email: string;
  contrasena: string;
  dni: string;
  matricula: string;
  especialidad: string;
  hospital: string;
};

export type Paciente = {
  rol: 'paciente';
  nombre: string;
  email: string;
  contrasena: string;
  dni: string;
  edad: string; // ej: "3 años"
  direccion: string; // dirección normalizada, ej: "AV SANTA FE 1234, Comuna 1, Ciudad Autónoma de Buenos Aires"
  pesoKg: number;
  alergias: string[];
  historial: Atencion[];
};

export type Usuario = Medico | Paciente;

// Un profesional tal como figuraría en el registro oficial de matrículas.
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
