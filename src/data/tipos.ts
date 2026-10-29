
export type Medico = {
  rol: 'medico';
  id: number;
  estado: string;
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
  fechaNacimiento: string;
  direccion: string;
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

// Un medicamento del libro. principioActivo y viaCima sirven para buscar las contraindicaciones en CIMA y
// para cruzar con las alergias del paciente; están vacíos en lo que no es un medicamento (dispositivos, electrolitos).
export type Medicamento = {
  id: number;
  nombre: string;
  principioActivo: string;
  viaCima: string;
  via: string;
  esCritico: boolean;
};

// Una indicación de la tabla del libro para un peso: los textos van tal cual los imprime el libro.
// cantidadMin y cantidadMax son lo que se registra al suministrar (la dosis, o la cantidad principal
// si no es una dosis única: infusiones, electrolitos, descarga, tubo).
export type ItemLibro = {
  medicamentoId: number;
  nombre: string;
  principioActivo: string;
  viaCima: string;
  via: string;
  esCritico: boolean;
  dosisKg: string;
  indicar: string;
  preparar: string;
  administrar: string;
  alerta: string;
  detalle: string[];
  cantidadMin: number;
  cantidadMax: number;
  unidad: string;
  correccion: string;
};

export type SeccionLibro = {
  clave: string;
  nombre: string;
  nota: string | null;
  items: ItemLibro[];
};

export type TablaLibro = {
  pesoIngresado: number;
  peso: number;
  categorias: SeccionLibro[];
};

// Sustancia que menciona el libro: las alergias se eligen de esta lista
export type Alergeno = { nombre: string; principioActivo: string };

export type PesoPorEdad = { edad: string; etiqueta: string; kg: number; texto: string };

export type PesosLibro = { pesos: number[]; edadPeso: PesoPorEdad[]; avisos: string[] };

// Un valor calculado para el peso a partir de lo que el libro indica fuera de las tablas por peso
export type CalculoGeneral = {
  etiqueta: string;
  min: number;
  max: number | null;
  unidad: string;
  por: string | null;
  tope: number | null;
  llegoAlTope: boolean;
};

export type ItemGeneral = {
  nombre: string;
  dosis?: string;
  maximo?: string;
  info?: string;
  pasos?: string[];
  calculos: CalculoGeneral[];
};

export type FichaGeneral = { clave: string; nombre: string; items: ItemGeneral[] };

export type Generales = {
  peso: number;
  formulas: { nombre: string; texto: string }[];
  fichas: FichaGeneral[];
};

export type DosisSuministrada = {
  id: number;
  medicamentoId: number;
  nombre: string;
  via: string;
  cantidad: number;
  unidad: string;
  detalle?: string;
  hora: string;
  medicamento?: Medicamento;
};

export type Atencion = {
  id: number;
  fecha: string;
  lugar: string;
  pesoKg: number;
  medico: { id: number; nombre: string };
  dosis: DosisSuministrada[];
};

export type ProfesionalRegistrado = {
  matricula: string;
  nombre: string;
  dni: string;
  especialidad: string;
};

export type OpcionGeoref = {
  id: string;
  nombre: string;
  detalle?: string;
};

export type Contraindicaciones = {
  producto: string;
  laboratorio: string;
  texto: string;
};

export type DireccionVerificada = {
  provincia: string;
  localidad: string;
  direccion: string;
  latitud: number;
  longitud: number;
};
