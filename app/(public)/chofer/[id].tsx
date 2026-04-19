import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Chofer, getChoferById } from '../../../lib/database/sqlite';

export default function ChoferDetalle() {
  const { id } = useLocalSearchParams();
  const [chofer, setChofer] = useState<Chofer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getChoferById(Number(id));
    setChofer(data);
    setLoading(false);
  }, [id]);

  const contactar = () => {
    if (!chofer) return;
    const mensaje = `Hola ${chofer.nombre_completo}, vi tu perfil en Cuber Holguín. Necesito un viaje.`;
    const url = `https://wa.me/${chofer.telefono_whatsapp}?text=${encodeURIComponent(mensaje)}`;
    
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(() => Alert.alert('Error', 'WhatsApp no está instalado'));
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#15803D" />
      </View>
    );
  }

  if (!chofer) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Chofer no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con foto de perfil */}
      <View style={styles.header}>
        {chofer.foto_perfil_url ? (
          <Image source={{ uri: chofer.foto_perfil_url }} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Text style={styles.profileInitial}>{chofer.nombre_completo?.[0] || '?'}</Text>
          </View>
        )}
        <Text style={styles.name}>{chofer.nombre_completo}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {chofer.rating_trato?.toFixed(1) || '5.0'}</Text>
          <Text style={styles.ratingLabel}>Calificación</Text>
        </View>
      </View>

      {/* Información de contacto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📞 Contacto</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>WhatsApp</Text>
            <Text style={styles.infoValue}>{chofer.telefono_whatsapp}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Chapa</Text>
            <Text style={styles.infoValue}>{chofer.chapa}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado</Text>
            <Text style={[styles.infoValue, { color: chofer.estado_suscripcion === 'activo' ? '#22C55E' : '#F59E0B' }]}>
              {chofer.estado_suscripcion?.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Foto del carro EN GRANDE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚗 Vehículo</Text>
        {chofer.foto_carro_url ? (
          <Image source={{ uri: chofer.foto_carro_url }} style={styles.carImage} />
        ) : (
          <View style={styles.carPlaceholder}>
            <Text style={styles.carPlaceholderText}>🚙 Sin foto del vehículo</Text>
          </View>
        )}
      </View>

      {/* Cobertura */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Cobertura</Text>
        <View style={styles.tagsContainer}>
          {chofer.cobertura?.map((tag, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Horario y condiciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🕒 Horario</Text>
        <View style={styles.infoCard}>
          <Text style={styles.horario}>{chofer.condiciones?.horario_habitual || 'Horario no especificado'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Notas adicionales</Text>
        <View style={styles.infoCard}>
          <Text style={styles.notas}>{chofer.condiciones?.notas_extra || 'Sin notas adicionales'}</Text>
        </View>
      </View>

      {/* Botón de WhatsApp grande */}
      <TouchableOpacity style={styles.whatsappButton} onPress={contactar}>
        <Text style={styles.whatsappIcon}>💬</Text>
        <Text style={styles.whatsappButtonText}>Contactar por WhatsApp</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Volver a la lista</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: '#666', marginBottom: 20 },
  
  // Header
  header: { 
    backgroundColor: '#15803D', 
    alignItems: 'center', 
    paddingTop: 40, 
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
  },
  profileImage: { width: 130, height: 130, borderRadius: 65, borderWidth: 4, borderColor: 'white' },
  profilePlaceholder: { 
    width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.3)', 
    justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'white' 
  },
  profileInitial: { fontSize: 50, color: 'white', fontWeight: 'bold' },
  name: { fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 15 },
  ratingContainer: { alignItems: 'center', marginTop: 5 },
  rating: { fontSize: 20, color: '#FFD700', fontWeight: 'bold' },
  ratingLabel: { fontSize: 12, color: '#E8F5E9', marginTop: 2 },
  
  // Secciones
  section: { paddingHorizontal: 20, marginTop: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1F2937' },
  infoCard: { backgroundColor: 'white', borderRadius: 15, padding: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  infoLabel: { fontSize: 15, color: '#6B7280' },
  infoValue: { fontSize: 15, fontWeight: '500', color: '#1F2937' },
  
  // Carro
  carImage: { width: '100%', height: 200, borderRadius: 15, backgroundColor: '#E5E7EB' },
  carPlaceholder: { 
    width: '100%', height: 200, borderRadius: 15, backgroundColor: '#E5E7EB', 
    justifyContent: 'center', alignItems: 'center' 
  },
  carPlaceholderText: { fontSize: 16, color: '#9CA3AF' },
  
  // Tags
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#15803D', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  tagText: { color: 'white', fontWeight: '500', textTransform: 'capitalize' },
  
  // Textos
  horario: { fontSize: 15, color: '#374151' },
  notas: { fontSize: 15, color: '#374151', lineHeight: 22 },
  
  // Botones
  whatsappButton: { 
    backgroundColor: '#25D366', 
    marginHorizontal: 20, 
    marginTop: 30, 
    padding: 18, 
    borderRadius: 40, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 10
  },
  whatsappIcon: { fontSize: 24 },
  whatsappButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  backButton: { alignItems: 'center', marginVertical: 20 },
  backButtonText: { color: '#15803D', fontSize: 16, fontWeight: '500' },
  backLink: { color: '#15803D', fontSize: 16, marginTop: 10 }
});