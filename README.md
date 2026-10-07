# Kidose

App móvil educativa de dosificación pediátrica de emergencia para personal de salud (Expo / React Native con TypeScript). Es un proyecto universitario: no maneja datos médicos reales y no implica responsabilidad médica.

Este repositorio contiene solo el frontend. Los datos de usuarios, historial y medicamentos son de prueba y viven en la app.

## Cómo correrla

```bash
npm install
npx expo start
```

Se abre en el celular con Expo Go (escaneando el QR) o en un emulador.

Cuentas de prueba:

| Rol | Email | Contraseña |
|---|---|---|
| Médico | medico@kidose.com | Medico123 |
| Paciente | paciente@kidose.com | Paciente123 |

## Qué hace

**Médico**
- Escanea el QR de un paciente (por ahora simulado) y ve su atención actual con peso, edad y alergias.
- Puede corregir el peso del paciente si cambió.
- Calculadora de dosis por peso, con dosis máxima y botón para suministrar.
- "Más info" en cada medicamento: contraindicaciones de la ficha técnica.

**Paciente**
- Muestra su QR, consulta su historial de atenciones y ve las contraindicaciones de cada medicamento que recibió.

**Ambos**
- La sesión se conserva al cerrar la app.
- Registro de cuentas: el médico se verifica con un registro de matrículas (simulado) y el paciente con su dirección validada con Georef.

## Estructura

```
src/
  app/          pantallas (cada archivo es una ruta de Expo Router)
    (medico)/     escanear, calculadora, perfil
    (paciente)/   historial, mi QR, perfil
  components/   componentes reutilizables
  constants/    paleta de colores de la guía visual
  context/      sesion.tsx: estado compartido de la app
  data/         tipos y datos de prueba
  services/     llamadas a APIs externas
  utils/        funciones puras (cálculo de dosis, validaciones, peso)
```

## Decisiones de diseño

- **Un solo Context (`SesionProvider`)** para lo que comparten varias pantallas: quién inició sesión, el paciente escaneado y las dosis suministradas. El resto del estado es local de cada pantalla (`useState`).
- **El `value` del Provider va con `useMemo`** y sus funciones con `useCallback`, para que las pantallas no se rendericen de nuevo si nada cambió.
- **AsyncStorage** guarda la sesión. Se guardan solo los emails (no la contraseña ni los datos completos) y el usuario se reconstruye al abrir la app.
- **Valores derivados no se guardan en estado:** el peso que usa la calculadora, la categoría elegida y las dosis calculadas se calculan en cada render a partir del estado real.
- **Los servicios (`services/`) son el único lugar que habla con internet**; las pantallas solo reciben datos o un error.

## APIs usadas

| API | Para qué | Archivo |
|---|---|---|
| [Georef](https://datos.gob.ar/dataset/modernizacion-georef) (Estado argentino) | Verificar la dirección del paciente al registrarse | `services/georef.ts` |
| [CIMA](https://cima.aemps.es/cima/doc/rest.html) (agencia de medicamentos de España) | Contraindicaciones de cada medicamento, en español | `services/cima.ts` |

Las dos son públicas y no necesitan clave.

## Limitaciones conocidas

- Los valores de dosis de `data/medicamentos-ejemplo.ts` son de maqueta y no están validados. Deben reemplazarse por los de la fuente autorizada (libro de Medicamentos en Emergencias Pediátricas de la SAE) antes de cualquier uso real.
- Las contraindicaciones de CIMA son fichas técnicas de España, no de Argentina, y no todos los medicamentos están disponibles.
- El escaneo de QR es simulado y no hay backend: el login, el historial y el registro de cuentas son de prueba.
