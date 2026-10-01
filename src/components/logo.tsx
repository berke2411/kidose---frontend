import { StyleSheet, Text, View } from 'react-native';

import { COLORES } from '@/constants/colores';

type Props = {
  tamano?: 'chico' | 'grande';
};

// Isotipo de Kidose: una gota blanca con una cruz médica azul, más el nombre.
export function Logo({ tamano = 'chico' }: Props) {
  const esGrande = tamano === 'grande';

  return (
    <View style={styles.fila}>
      <View style={[styles.gota, esGrande && styles.gotaGrande]}>
        {/* La gota está girada: giramos la cruz al revés para que quede derecha */}
        <View style={[styles.cruz, esGrande && styles.cruzGrande]}>
          <View style={styles.cruzVertical} />
          <View style={styles.cruzHorizontal} />
        </View>
      </View>
      <Text style={[styles.nombre, esGrande && styles.nombreGrande]}>Kidose</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  gota: {
    width: 30,
    height: 30,
    backgroundColor: COLORES.blanco,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 3,
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotaGrande: {
    width: 56,
    height: 56,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomLeftRadius: 5,
  },
  cruz: {
    width: 13,
    height: 13,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  cruzGrande: {
    transform: [{ rotate: '45deg' }, { scale: 1.8 }],
  },
  cruzVertical: {
    position: 'absolute',
    width: 4,
    height: 13,
    borderRadius: 1,
    backgroundColor: COLORES.azulPrimario,
  },
  cruzHorizontal: {
    position: 'absolute',
    width: 13,
    height: 4,
    borderRadius: 1,
    backgroundColor: COLORES.azulPrimario,
  },
  nombre: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORES.blanco,
  },
  nombreGrande: {
    fontSize: 36,
  },
});
