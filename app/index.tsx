import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Chofer, db } from '../lib/database';

export default function HomeScreen() {
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.getChoferes()
      .then(data => {
        setChoferes(data.filter(c => c.estado_suscripcion === 'activo'));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const contactar = (chofer: Chofer) => {
    const mensaje = encodeURIComponent(`Hola ${chofer.nombre_completo}, vi tu perfil en Cuber Holguín. Necesito un viaje.`);
    window.open(`https://wa.me/${chofer.telefono_whatsapp}?text=${mensaje}`, '_blank');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#15803D" />
        <Text>Cargando choferes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚖 Cuber Holguín</Text>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.adminLink}>🔐 Admin</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={choferes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hay choferes disponibles</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.foto_perfil_url && (
              <Image source={{ uri: item.foto_perfil_url }} style={styles.avatar} />
            )}
            <View style={styles.info}>
              <Text style={styles.name}>{item.nombre_completo}</Text>
              <Text style={styles.detail}>🚘 {item.chapa}</Text>
              <Text style={styles.detail}>📍 {item.cobertura?.join(' · ')}</Text>
              <Text style={styles.detail}>⭐ {item.rating_trato?.toFixed(1) || '5.0'}</Text>
            </View>
            <TouchableOpacity style={styles.contactButton} onPress={() => contactar(item)}>
              <Text style={styles.contactText}>Contactar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#15803D' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  adminLink: { color: 'white', fontWeight: '600', textDecorationLine: 'underline' },
  list: { padding: 15 },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 50, fontSize: 16 },
  card: { backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  detail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  contactButton: { backgroundColor: '#25D366', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20 },
  contactText: { color: 'white', fontWeight: 'bold', fontSize: 14 }
});















