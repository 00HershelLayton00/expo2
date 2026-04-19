import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ImageUploader } from '../../../components/shared/ImageUploader';
import { createChofer } from '../../../lib/database/sqlite';

export default function CrearChofer() {
  const [form, setForm] = useState({
    nombre_completo: '',
    ci: '',
    password: '',
    chapa: '',
    telefono_whatsapp: '',
    cobertura_provincial: false,
    cobertura_municipal: false,
    cobertura_centro: false,
    horario_habitual: '',
    notas_extra: '',
    foto_perfil_url: null as string | null,
    foto_carro_url: null as string | null
  });

  const handleSubmit = () => {
    if (!form.nombre_completo || !form.ci || !form.password || !form.chapa || !form.telefono_whatsapp) {
      Alert.alert('Error', 'Todos los campos con * son obligatorios');
      return;
    }

    if (form.password.length < 4) {
      Alert.alert('Error', 'La contraseña debe tener al menos 4 caracteres');
      return;
    }

    const cobertura: string[] = [];
    if (form.cobertura_provincial) cobertura.push('provincial');
    if (form.cobertura_municipal) cobertura.push('municipal');
    if (form.cobertura_centro) cobertura.push('centro_ciudad');

    try {
      createChofer({
        nombre_completo: form.nombre_completo,
        ci: form.ci,
        chapa: form.chapa,
        telefono_whatsapp: form.telefono_whatsapp,
        cobertura,
        condiciones: { 
          horario_habitual: form.horario_habitual, 
          notas_extra: form.notas_extra 
        },
        foto_perfil_url: form.foto_perfil_url,
        foto_carro_url: form.foto_carro_url,
        estado_suscripcion: 'pendiente',
        rating_trato: 5.0
      }, form.password);

      Alert.alert('✅ Éxito', `Chofer creado\nCI: ${form.ci}\nContraseña: ${form.password}`);
      router.back();
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo crear el chofer. ¿CI duplicado?');
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ImageUploader label="Foto de perfil" value={form.foto_perfil_url} onChange={(url) => setForm({...form, foto_perfil_url: url})} />
      <ImageUploader label="Foto del carro" value={form.foto_carro_url} onChange={(url) => setForm({...form, foto_carro_url: url})} />

      <Text style={styles.label}>Nombre completo *</Text>
      <TextInput style={styles.input} value={form.nombre_completo} onChangeText={(t) => setForm({...form, nombre_completo: t})} />

      <Text style={styles.label}>CI (será su usuario) *</Text>
      <TextInput style={styles.input} value={form.ci} onChangeText={(t) => setForm({...form, ci: t})} keyboardType="numeric" />

      <Text style={styles.label}>Contraseña *</Text>
      <TextInput style={styles.input} value={form.password} onChangeText={(t) => setForm({...form, password: t})} secureTextEntry placeholder="Mínimo 4 caracteres" />

      <Text style={styles.label}>Chapa *</Text>
      <TextInput style={styles.input} value={form.chapa} onChangeText={(t) => setForm({...form, chapa: t})} />

      <Text style={styles.label}>WhatsApp *</Text>
      <TextInput style={styles.input} value={form.telefono_whatsapp} onChangeText={(t) => setForm({...form, telefono_whatsapp: t})} keyboardType="phone-pad" />

      <Text style={styles.label}>Cobertura</Text>
      <View style={styles.checkRow}>
        <TouchableOpacity onPress={() => setForm({...form, cobertura_provincial: !form.cobertura_provincial})} style={styles.checkItem}>
          <View style={[styles.checkbox, form.cobertura_provincial && styles.checked]} />
          <Text>Provincial</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setForm({...form, cobertura_municipal: !form.cobertura_municipal})} style={styles.checkItem}>
          <View style={[styles.checkbox, form.cobertura_municipal && styles.checked]} />
          <Text>Municipal</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setForm({...form, cobertura_centro: !form.cobertura_centro})} style={styles.checkItem}>
          <View style={[styles.checkbox, form.cobertura_centro && styles.checked]} />
          <Text>Centro</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Horario habitual</Text>
      <TextInput style={styles.input} value={form.horario_habitual} onChangeText={(t) => setForm({...form, horario_habitual: t})} />

      <Text style={styles.label}>Notas extra</Text>
      <TextInput style={[styles.input, styles.textArea]} value={form.notas_extra} onChangeText={(t) => setForm({...form, notas_extra: t})} multiline />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Crear Chofer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F3F4F6' },
  label: { fontWeight: '600', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  checkRow: { flexDirection: 'row', gap: 20, marginVertical: 10 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#9CA3AF' },
  checked: { backgroundColor: '#15803D', borderColor: '#15803D' },
  button: { backgroundColor: '#15803D', padding: 16, borderRadius: 10, marginTop: 20, marginBottom: 30 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }
});