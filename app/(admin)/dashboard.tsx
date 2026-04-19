import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
  const { profile, signOut } = useAuth();

  const menuItems = [
    { icon: '👥', title: 'Ver todos los choferes', route: '/(admin)/choferes', color: '#3B82F6' },
    { icon: '➕', title: 'Crear nuevo chofer', route: '/(admin)/choferes/crear', color: '#22C55E' },
    { icon: '⏳', title: 'Pendientes de aprobación', route: '/(admin)/choferes?filtro=pendiente', color: '#F59E0B' },
    { icon: '✅', title: 'Choferes activos', route: '/(admin)/choferes?filtro=activo', color: '#22C55E' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola, {profile?.nombre}!</Text>
        <Text style={styles.role}>Administrador</Text>
      </View>

      <Text style={styles.sectionTitle}>Gestión de Choferes</Text>
      <View style={styles.grid}>
        {menuItems.map((item, i) => (
          <TouchableOpacity key={i} style={styles.card} onPress={() => router.push(item.route as any)}>
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logout} onPress={signOut}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  header: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  role: { color: '#6B7280', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, color: '#374151' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 15, alignItems: 'center' },
  cardIcon: { fontSize: 40, marginBottom: 10 },
  cardTitle: { fontWeight: '600', color: '#374151', textAlign: 'center', fontSize: 14 },
  logout: { backgroundColor: '#EF4444', padding: 15, borderRadius: 10, marginTop: 20, marginBottom: 30 },
  logoutText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }
});