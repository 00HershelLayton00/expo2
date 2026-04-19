import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Chofer, getChoferes } from '../../lib/database/sqlite';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const data = getChoferes({ estado: 'activo' });
      setChoferes(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const contactar = (chofer: Chofer) => {
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
        <Text style={styles.loadingText}>Cargando choferes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚖 Cuber Holguín</Text>
        <Text style={styles.headerSubtitle}>Transporte seguro y confiable</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
          <Text style={styles.loginButtonText}>🔐 Acceder</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={choferes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>😔 No hay choferes disponibles</Text>
            <Text style={styles.emptySubtext}>Vuelve más tarde</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push(`/(public)/chofer/${item.id}`)}
            activeOpacity={0.9}>
            
            {/* Foto de perfil */}
            <View style={styles.profileSection}>
              {item.foto_perfil_url ? (
                <Image source={{ uri: item.foto_perfil_url }} style={styles.profileImage} />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Text style={styles.profileInitial}>{item.nombre_completo?.[0] || '?'}</Text>
                </View>
              )}
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {item.rating_trato?.toFixed(1) || '5.0'}</Text>
              </View>
            </View>

            {/* Información */}
            <View style={styles.infoSection}>
              <Text style={styles.name}>{item.nombre_completo}</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🚘</Text>
                <Text style={styles.infoText}>{item.chapa}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoText}>{item.cobertura?.join(' · ') || 'No especificada'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🕒</Text>
                <Text style={styles.infoText}>{item.condiciones?.horario_habitual || 'Horario no especificado'}</Text>
              </View>
            </View>

            {/* Foto del carro (miniatura) */}
            {item.foto_carro_url && (
              <Image source={{ uri: item.foto_carro_url }} style={styles.carThumbnail} />
            )}

            {/* Botones de acción */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.whatsappButton} 
                onPress={(e) => {
                  e.stopPropagation();
                  contactar(item);
                }}>
                <Text style={styles.whatsappIcon}>💬</Text>
                <Text style={styles.whatsappText}>WhatsApp</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.detailButton}
                onPress={() => router.push(`/(public)/chofer/${item.id}`)}>
                <Text style={styles.detailButtonText}>Ver perfil</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  
  // Header
  header: { 
    backgroundColor: '#15803D', 
    paddingTop: 50, 
    paddingBottom: 30, 
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative'
  },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  headerSubtitle: { fontSize: 14, color: '#E8F5E9', textAlign: 'center', marginTop: 5 },
  loginButton: { 
    position: 'absolute', 
    top: 50, 
    right: 20, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 20 
  },
  loginButtonText: { color: 'white', fontWeight: '600' },
  
  // Lista
  list: { padding: 15 },
  
  // Tarjeta
  card: { 
    backgroundColor: 'white', 
    borderRadius: 20, 
    padding: 15, 
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3
  },
  
  // Sección de perfil
  profileSection: { alignItems: 'center', marginBottom: 15 },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#15803D' },
  profilePlaceholder: { 
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#15803D', 
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#15803D' 
  },
  profileInitial: { fontSize: 40, color: 'white', fontWeight: 'bold' },
  ratingBadge: { 
    position: 'absolute', 
    bottom: 0, 
    right: width / 2 - 60, 
    backgroundColor: '#FFD700', 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 20 
  },
  ratingText: { fontWeight: 'bold', color: '#333', fontSize: 13 },
  
  // Información
  infoSection: { marginBottom: 15 },
  name: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#1F2937' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoIcon: { fontSize: 16, marginRight: 8, width: 20 },
  infoText: { fontSize: 14, color: '#4B5563', flex: 1 },
  
  // Miniatura del carro
  carThumbnail: { 
    width: '100%', 
    height: 120, 
    borderRadius: 12, 
    marginBottom: 15,
    backgroundColor: '#F3F4F6'
  },
  
  // Botones
  actionButtons: { flexDirection: 'row', gap: 10 },
  whatsappButton: { 
    flex: 2, 
    backgroundColor: '#25D366', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 14, 
    borderRadius: 30,
    gap: 8
  },
  whatsappIcon: { fontSize: 20 },
  whatsappText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  detailButton: { 
    flex: 1, 
    backgroundColor: '#15803D', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 14, 
    borderRadius: 30 
  },
  detailButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },
  
  // Vacío
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 18, color: '#666', textAlign: 'center' },
  emptySubtext: { fontSize: 14, color: '#999', marginTop: 8 }
});