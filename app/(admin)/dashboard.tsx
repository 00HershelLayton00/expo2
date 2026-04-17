import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>
      
      <TouchableOpacity style={styles.card} onPress={() => router.push('/(admin)/choferes/crear')}>
        <Text style={styles.cardIcon}>➕</Text>
        <Text style={styles.cardTitle}>Crear Chofer</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.card} onPress={() => router.push('/(admin)/choferes/pendientes')}>
        <Text style={styles.cardIcon}>⏳</Text>
        <Text style={styles.cardTitle}>Pendientes de Aprobación</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.card} onPress={() => router.push('/(admin)/choferes/activos')}>
        <Text style={styles.cardIcon}>✅</Text>
        <Text style={styles.cardTitle}>Choferes Activos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logout} onPress={signOut}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F3F4F6' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, color: '#1F2937' },
  card: { backgroundColor: 'white', padding: 25, borderRadius: 15, marginBottom: 15, alignItems: 'center' },
  cardIcon: { fontSize: 40, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#374151' },
  logout: { backgroundColor: '#EF4444', padding: 15, borderRadius: 10, marginTop: 30 },
  logoutText: { color: 'white', textAlign: 'center', fontWeight: 'bold' }
});