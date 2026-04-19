import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Chofer, deleteChofer, getChoferById, updateChofer } from '../../../lib/database/sqlite';

export default function EditarChofer() {
  const { id } = useLocalSearchParams();
  const [chofer, setChofer] = useState<Chofer | null>(null);
  const [form, setForm] = useState<Partial<Chofer>>({});

  useEffect(() => {
    const data = getChoferById(Number(id));
    if (data) {
      setChofer(data);
      setForm(data);
    }
  }, [id]);

  const handleSave = () => {
    if (!chofer) return;
    updateChofer(chofer.id, form);
    Alert.alert('✅ Éxito', 'Chofer actualizado');
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('⚠️ Confirmar', '¿Eliminar este chofer?', [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: () => {
        deleteChofer(Number(id));
        router.replace('/(admin)/choferes');
      }}
    ]);
  };

  if (!chofer) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nombre completo</Text>
      <TextInput style={styles.input} value={form.nombre_completo || ''} onChangeText={(t) => setForm({...form, nombre_completo: t})} />

      <Text style={styles.label}>CI</Text>
      <TextInput style={styles.input} value={form.ci || ''} onChangeText={(t) => setForm({...form, ci: t})} />

      <Text style={styles.label}>Chapa</Text>
      <TextInput style={styles.input} value={form.chapa || ''} onChangeText={(t) => setForm({...form, chapa: t})} />

      <Text style={styles.label}>WhatsApp</Text>
      <TextInput style={styles.input} value={form.telefono_whatsapp || ''} onChangeText={(t) => setForm({...form, telefono_whatsapp: t})} keyboardType="phone-pad" />

      <Text style={styles.label}>Estado</Text>
      <View style={styles.estadoContainer}>
        {['pendiente', 'activo', 'suspendido'].map((estado) => (
          <TouchableOpacity key={estado} style={[styles.estadoButton, form.estado_suscripcion === estado && styles.estadoActivo]} onPress={() => setForm({...form, estado_suscripcion: estado as any})}>
            <Text style={[styles.estadoButtonText, form.estado_suscripcion === estado && styles.estadoActivoText]}>{estado}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Rating</Text>
      <TextInput style={styles.input} value={String(form.rating_trato || '5.0')} onChangeText={(t) => setForm({...form, rating_trato: parseFloat(t) || 5.0})} keyboardType="numeric" />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Guardar cambios</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Eliminar chofer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F3F4F6' },
  label: { fontWeight: '600', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 5 },
  estadoContainer: { flexDirection: 'row', gap: 10, marginVertical: 10 },
  estadoButton: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#E5E7EB', alignItems: 'center' },
  estadoActivo: { backgroundColor: '#15803D' },
  estadoButtonText: { color: '#374151', fontWeight: '500', textTransform: 'capitalize' },
  estadoActivoText: { color: 'white' },
  saveButton: { backgroundColor: '#15803D', padding: 15, borderRadius: 10, marginTop: 20 },
  saveButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  deleteButton: { backgroundColor: '#EF4444', padding: 15, borderRadius: 10, marginTop: 10, marginBottom: 30 },
  deleteButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }
});