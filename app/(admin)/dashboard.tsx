import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
  const { profile, signOut } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola, {profile?.nombre || 'Admin'}!</Text>
        <Text style={styles.subtitle}>Gestiona tu flota</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/(admin)/choferes/crear')}>
          <Text style={styles.cardIcon}>➕</Text>
          <Text style={styles.cardTitle}>Crear Chofer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/(admin)/choferes/pendientes')}>
          <Text style={styles.cardIcon}>⏳</Text>
          <Text style={styles.cardTitle}>Pendientes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/(admin)/choferes/activos')}>
          <Text style={styles.cardIcon}>✅</Text>
          <Text style={styles.cardTitle}>Activos</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F3F4F6' },
  header: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  subtitle: { color: '#6B7280', marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 15, alignItems: 'center' },
  cardIcon: { fontSize: 40, marginBottom: 10 },
  cardTitle: { fontWeight: '600', color: '#374151' },
  logoutButton: { backgroundColor: '#EF4444', padding: 15, borderRadius: 10, marginTop: 20 },
  logoutText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});
