import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getChoferById } from '../../lib/database/sqlite';

export default function ChoferPanel() {
  const { profile, signOut } = useAuth();
  const [choferData, setChoferData] = useState<any>(null);

  useEffect(() => {
    if (profile?.chofer_id) {
      const data = getChoferById(profile.chofer_id);
      setChoferData(data);
    }
  }, [profile]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola, {profile?.nombre}!</Text>
        <Text style={styles.role}>Chofer</Text>
      </View>

      {choferData && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📋 Tu información actual</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Chapa:</Text>
            <Text style={styles.infoValue}>{choferData.chapa}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>WhatsApp:</Text>
            <Text style={styles.infoValue}>{choferData.telefono_whatsapp}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rating:</Text>
            <Text style={styles.infoValue}>⭐ {choferData.rating_trato?.toFixed(1)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado:</Text>
            <Text style={[styles.infoValue, { color: choferData.estado_suscripcion === 'activo' ? '#22C55E' : '#F59E0B' }]}>
              {choferData.estado_suscripcion}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Horario:</Text>
            <Text style={styles.infoValue}>{choferData.condiciones?.horario_habitual || 'No especificado'}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.editButton} onPress={() => router.push('/(chofer)/editar-perfil')}>
        <Text style={styles.editButtonText}>✏️ Editar mi información</Text>
      </TouchableOpacity>

      <View style={styles.menuSection}>
        <Text style={styles.menuTitle}>📊 Mis estadísticas</Text>
        <View style={styles.statsCard}>
          <Text style={styles.statValue}>{choferData?.rating_trato?.toFixed(1) || '5.0'}</Text>
          <Text style={styles.statLabel}>Rating promedio</Text>
        </View>
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
  infoCard: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 20 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#15803D' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  infoLabel: { fontSize: 15, color: '#6B7280' },
  infoValue: { fontSize: 15, fontWeight: '500', color: '#1F2937' },
  editButton: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  editButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  menuSection: { marginBottom: 20 },
  menuTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#374151' },
  statsCard: { backgroundColor: 'white', padding: 20, borderRadius: 15, alignItems: 'center' },
  statValue: { fontSize: 36, fontWeight: 'bold', color: '#F59E0B' },
  statLabel: { fontSize: 14, color: '#6B7280', marginTop: 5 },
  logout: { backgroundColor: '#EF4444', padding: 16, borderRadius: 12, marginBottom: 30 },
  logoutText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }
});