import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { router } from 'expo-router';

export default function Activos() {
  const [choferes, setChoferes] = useState([]);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    const { data } = await supabase.from('choferes').select('*').eq('estado_suscripcion', 'activo');
    setChoferes(data || []);
  }

  async function suspender(id: string) {
    await supabase.from('choferes').update({ estado_suscripcion: 'suspendido' }).eq('id', id);
    cargar();
  }

  return (
    <FlatList
      data={choferes}
      keyExtractor={(item: any) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.nombre_completo}</Text>
          <Text>CI: {item.ci}</Text>
          <Text>Chapa: {item.chapa}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.edit]} onPress={() => router.push(`/(admin)/choferes/crear?id=${item.id}`)}>
              <Text style={styles.btnText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.suspend]} onPress={() => suspender(item.id)}>
              <Text style={styles.btnText}>Suspender</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', padding: 15, margin: 10, borderRadius: 10 },
  name: { fontSize: 18, fontWeight: 'bold' },
  actions: { flexDirection: 'row', marginTop: 10, gap: 5 },
  btn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  edit: { backgroundColor: '#3B82F6' },
  suspend: { backgroundColor: '#F97316' },
  btnText: { color: 'white', fontWeight: 'bold' },
});
