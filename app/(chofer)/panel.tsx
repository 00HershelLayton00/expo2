import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function ChoferPanel() {
  const { profile, signOut } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel del Chofer</Text>
      <Text>Bienvenido, {profile?.nombre}</Text>
      <Text onPress={signOut} style={styles.logout}>Cerrar Sesión</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  logout: { marginTop: 20, color: 'red' },
});
