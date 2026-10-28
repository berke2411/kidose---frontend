# Kidose

App móvil educativa de dosificación pediátrica de emergencia para personal de salud (Expo / React Native con TypeScript). Es un proyecto universitario: no maneja datos médicos reales y no implica responsabilidad médica.

Este repositorio contiene solo el frontend. Los datos (cuentas, pacientes, medicamentos, historial) viven en el backend, que es otro repositorio (`kidose---backend`): la app nunca toca la base de datos, solo hace `fetch()` a la API.

## Cómo correrla

Primero hay que tener el backend andando (ver el README del backend):

```bash
cd ../kidose---backend
npm run dev          # queda escuchando en http://localhost:3000
```

Después, en otra terminal:

```bash
npm install
npx expo start       # "w" para abrir en el navegador, o el QR con Expo Go
```

La app encuentra el backend sola: usa la IP de la computadora desde la que corre Expo, así que en un celular físico funciona si ambos están en la misma red Wi-Fi (y el firewall deja pasar el puerto 3000). Para apuntar a otro servidor se define `EXPO_PUBLIC_API_URL`, por ejemplo `EXPO_PUBLIC_API_URL=http://192.168.1.25:3000 npx expo start`. En el emulador de Android la computadora es `http://10.0.2.2:3000`.

Cuentas de prueba (las crea el backend):

| Rol | Email | Contraseña |
|---|---|---|
| Médico | medico@kidose.com | Medico123 |
| Paciente | paciente@kidose.com | Paciente123 |
| Administrador | admin@kidose.com | Admin123 |

Para probar el registro de un médico: matrícula 345678 · Sofía Acosta · DNI 33987654 (la 123456 y la 234567 ya tienen cuenta). La cuenta queda pendiente hasta que el administrador la apruebe desde su pestaña "Solicitudes".

## Qué hace

**Médico**
- Escanea con la cámara el QR de un paciente y ve su atención actual con peso, edad y alergias.
- Puede corregir el peso del paciente si cambió; se guarda al enviar la atención.
- Calculadora de dosis por peso, con los medicamentos del backend, dosis máxima y botón para suministrar.
- Si una alergia del paciente coincide con el nombre o el principio activo de un medicamento, la tarjeta muestra una alerta en rojo y "Suministrar" pide confirmar antes de registrar la dosis (`utils/alergias.ts`).
- Exporta en PDF la historia clínica del paciente que está atendiendo (para llevarla a otra clínica).
- "Enviar atención" guarda las dosis en el servidor, que revalida que ninguna supere lo que da el peso.
- "Más info" en cada medicamento: contraindicaciones de la ficha técnica.

**Paciente**
- Exporta su historia clínica en PDF desde la pestaña Historial.
- Edita sus alergias desde el perfil (agregar y quitar, se guardan en el servidor).
- Muestra su QR (con un código que el servidor renueva cada pocos minutos), consulta su historial de atenciones y ve las contraindicaciones de cada medicamento que recibió.

**Administrador**
- Aprueba o rechaza las solicitudes de cuenta de médicos.

**Todos**
- La sesión se conserva al cerrar la app (token guardado en el teléfono).
- Registro de cuentas: el médico se verifica contra el registro de matrículas del backend y el paciente con su dirección validada con Georef.

## Estructura

```
src/
  app/          pantallas (cada archivo es una ruta de Expo Router)
    (medico)/     escanear, calculadora, perfil
    (paciente)/   historial, mi QR, perfil
    (admin)/      solicitudes, perfil
  components/   componentes reutilizables
  constants/    paleta de colores de la guía visual
  context/      sesion.tsx: estado compartido de la app
  data/         tipos (los mismos campos que devuelve la API)
  services/     api.ts (backend de Kidose), georef.ts y cima.ts (APIs públicas), exportar-historial.ts (PDF)
  utils/        funciones puras (cálculo de dosis, validaciones, peso, fechas)
```

## Decisiones de diseño

- **Un solo Context (`SesionProvider`)** para lo que comparten varias pantallas: quién inició sesión, el paciente escaneado y las dosis suministradas. El resto del estado es local de cada pantalla (`useState`).
- **El `value` del Provider va con `useMemo`** y sus funciones con `useCallback`, para que las pantallas no se rendericen de nuevo si nada cambió.
- **AsyncStorage** guarda el token de la sesión, el paciente que se está atendiendo y las dosis todavía sin enviar. Al abrir la app el usuario se pide al servidor (`GET /api/auth/yo`); nunca se guarda la contraseña.
- **Las listas se vuelven a pedir al servidor** después de cada escritura o al entrar a una pestaña: la fuente de verdad es la base de datos, no el estado local.
- **Valores derivados no se guardan en estado:** el peso que usa la calculadora, la categoría elegida y las dosis calculadas se calculan en cada render a partir del estado real.
- **Los servicios (`services/`) son el único lugar que habla con internet**; las pantallas solo reciben datos o un error.

## APIs usadas

| API | Para qué | Archivo |
|---|---|---|
| [Georef](https://datos.gob.ar/dataset/modernizacion-georef) (Estado argentino) | Verificar la dirección del paciente al registrarse | `services/georef.ts` |
| [CIMA](https://cima.aemps.es/cima/doc/rest.html) (agencia de medicamentos de España) | Contraindicaciones de cada medicamento, en español | `services/cima.ts` |

Las dos son públicas y no necesitan clave.

## Limitaciones conocidas

- Las dosis salen del libro de Medicamentos en Emergencias Pediátricas (SAE). Para ketamina y fentanilo el libro da un rango (1–2 por kg) y la app calcula el mínimo. Los accesos rápidos de peso por edad (RN, 6 m, 1 a...) son orientativos y no vienen del libro.
- Las contraindicaciones de CIMA son fichas técnicas de España, no de Argentina, y no todos los medicamentos están disponibles.
- El aviso de alergias es una coincidencia de texto: no relaciona familias de fármacos (ej: penicilina con otros antibióticos). Es un aviso, no un bloqueo; la decisión es del médico.
