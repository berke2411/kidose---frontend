import * as LocalAuthentication from 'expo-local-authentication';

// Sin sensor o sin biometría configurada no hay nada que pedir y se deja pasar.
export async function confirmarIdentidad(): Promise<boolean> {
  const hayHardware = await LocalAuthentication.hasHardwareAsync();
  const estaConfigurada = await LocalAuthentication.isEnrolledAsync();
  if (!hayHardware || !estaConfigurada) return true;

  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Confirmá tu identidad para entrar a Kidose',
    cancelLabel: 'Cancelar',
  });
  return resultado.success;
}
