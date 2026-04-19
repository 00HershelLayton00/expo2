import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Chofer, getChoferes } from '../../../lib/database/sqlite';

export default function ChoferesList() {
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'pendiente' | 'activo' | 'suspendido'>('todos');

  useEffect(() => {
    const data = getChoferes();
    setChoferes(data);
  }, []);

  const filtered = filtro === 'todos' ? choferes : choferes.filter(c => c.estado_suscripcion === filtro);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return '#22C55E';
      case 'pendiente': return '#F59E0B';
      case 'suspendido': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filtros}>
        {['todos', 'pendiente', 'activo', 'suspendido'].map((f) => (
          <TouchableOpacity key={f} style={[styles.filtro, filtro === f && styles.filtroActivo]} onPress={() => setFiltro(f as any)}>
            <Text style={[styles.filtroText, filtro === f && styles.filtroTextActivo]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/(admin)/choferes/${item.id}`)}>
            <View>
              <Text style={styles.name}>{item.nombre_completo}</Text>
              <Text style={styles.detail}>🚘 {item.chapa}</Text>
              <Text style={styles.detail}>📞 {item.telefono_whatsapp}</Text>
            </View>
            <View style={[styles.estado, { backgroundColor: getEstadoColor(item.estado_suscripcion) }]}>
              <Text style={styles.estadoText}>{item.estado_suscripcion}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  filtros: { flexDirection: 'row', padding: 10, backgroundColor: 'white' },
  filtro: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8, marginHorizontal: 2 },
  filtroActivo: { backgroundColor: '#15803D' },
  filtroText: { color: '#6B7280', fontWeight: '500', textTransform: 'capitalize' },
  filtroTextActivo: { color: 'white' },
  card: { backgroundColor: 'white', padding: 15, marginHorizontal: 10, marginTop: 10, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: 'bold' },
  detail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  estado: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  estadoText: { color: 'white', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }
});