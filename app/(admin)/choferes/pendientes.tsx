import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { router } from 'expo-router';

export default function Pendientes() {
  const [choferes, setChoferes] = useState([]);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    const { data } = await supabase.from('choferes').select('*').eq('estado_suscripcion', 'pendiente');
    setChoferes(data || []);
  }

  async function aprobar(id: string) {
    await supabase.from('choferes').update({ estado_suscripcion: 'activo' }).eq('id', id);
    cargar();
  }

  async function eliminar(id: string, nombre: string) {
    Alert.alert('Confirmar', `¿Eliminar a ${nombre}?`, [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        await supabase.from('choferes').delete().eq('id', id);
        cargar();
      }}
    ]);
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
            <TouchableOpacity style={[styles.btn, styles.approve]} onPress={() => aprobar(item.id)}>
              <Text style={styles.btnText}>Aprobar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.edit]} onPress={() => router.push(`/(admin)/choferes/crear?id=${item.id}`)}>
              <Text style={styles.btnText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.delete]} onPress={() => eliminar(item.id, item.nombre_completo)}>
              <Text style={styles.btnText}>Eliminar</Text>
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
  approve: { backgroundColor: '#22C55E' },
  edit: { backgroundColor: '#3B82F6' },
  delete: { backgroundColor: '#EF4444' },
  btnText: { color: 'white', fontWeight: 'bold' },
});
