import * as LocalAuthentication from 'expo-local-authentication';

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
