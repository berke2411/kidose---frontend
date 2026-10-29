
function soloNumeros(texto: string) {
  return texto !== '' && texto.split('').every((letra) => letra >= '0' && letra <= '9');
}

export function validarEmail(email: string): string | null {
  const texto = email.trim();
  if (texto === '') return 'Ingresá tu email.';

  const partes = texto.split('@');
  if (texto.includes(' ') || partes.length !== 2) return 'El email no es válido.';

  const [usuario, dominio] = partes;
  const ultimoPunto = dominio.lastIndexOf('.');
  const terminacionCorta = dominio.length - ultimoPunto < 3;
  if (usuario === '' || ultimoPunto < 1 || terminacionCorta || dominio.includes('..')) {
    return 'El email no es válido.';
  }
  return null;
}

export function validarContrasena(contrasena: string): string | null {
  if (contrasena.length < 8) return 'Debe tener al menos 8 caracteres.';

  const letras = contrasena.split('');
  const tieneLetra = letras.some((letra) => letra.toLowerCase() !== letra.toUpperCase());
  const tieneNumero = letras.some((letra) => letra >= '0' && letra <= '9');
  if (!tieneLetra || !tieneNumero) return 'Debe incluir letras y números.';
  return null;
}

export function validarNombre(nombre: string): string | null {
  const palabras = nombre.split(' ').filter((palabra) => palabra !== '');
  if (palabras.length < 2) return 'Ingresá nombre y apellido.';
  return null;
}

export function validarDni(dni: string): string | null {
  const texto = dni.trim();
  if (!soloNumeros(texto) || texto.length < 7 || texto.length > 8) {
    return 'El DNI debe tener 7 u 8 números, sin puntos.';
  }
  return null;
}

export function validarDireccion(direccion: string): string | null {
  const palabras = direccion.split(' ').filter((palabra) => palabra !== '');
  const ultima = palabras[palabras.length - 1];
  if (palabras.length < 2 || !soloNumeros(ultima)) {
    return 'Ingresá calle y altura. Ej: Av Santa Fe 1234';
  }
  return null;
}

export function validarMatricula(matricula: string): string | null {
  const texto = matricula.trim();
  if (!soloNumeros(texto) || texto.length < 5 || texto.length > 6) {
    return 'La matrícula debe tener 5 o 6 números.';
  }
  return null;
}

// Compara nombres sin importar mayúsculas, tildes ni espacios de más
export function nombresIguales(a: string, b: string) {
  return normalizarNombre(a) === normalizarNombre(b);
}

export function normalizarNombre(nombre: string) {
  const sinTildes = nombre
    .normalize('NFD')
    .split('')
    .filter((letra) => letra < '̀' || letra > 'ͯ')
    .join('');
  return sinTildes
    .toLowerCase()
    .split(' ')
    .filter((palabra) => palabra !== '')
    .join(' ');
}
