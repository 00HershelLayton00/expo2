import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { ImageUploader } from '../shared/ImageUploader';

interface Props {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export function ChoferForm({ initialData, onSubmit, loading }: Props) {
  const [form, setForm] = useState({
    nombre_completo: initialData?.nombre_completo || '',
    ci: initialData?.ci || '',
    chapa: initialData?.chapa || '',
    telefono_whatsapp: initialData?.telefono_whatsapp || '',
    horario_habitual: initialData?.condiciones?.horario_habitual || '',
    notas_extra: initialData?.condiciones?.notas_extra || '',
    foto_perfil_url: initialData?.foto_perfil_url || '',
    foto_carro_url: initialData?.foto_carro_url || '',
    cobertura_provincial: initialData?.cobertura?.includes('provincial') || false,
    cobertura_municipal: initialData?.cobertura?.includes('municipal') || false,
    cobertura_centro: initialData?.cobertura?.includes('centro_ciudad') || false,
  });

  const handleSubmit = () => {
    if (!form.nombre_completo || !form.ci || !form.chapa || !form.telefono_whatsapp) {
      alert('Campos obligatorios: Nombre, CI, Chapa, WhatsApp');
      return;
    }
    onSubmit(form);
  };

  return (
    <ScrollView style={styles.container}>
      <ImageUploader label="Foto de Perfil" value={form.foto_perfil_url} onChange={(url) => setForm({...form, foto_perfil_url: url})} />
      <ImageUploader label="Foto del Carro" value={form.foto_carro_url} onChange={(url) => setForm({...form, foto_carro_url: url})} />

      <TextInput style={styles.input} placeholder="Nombre Completo *" value={form.nombre_completo} onChangeText={(t) => setForm({...form, nombre_completo: t})} />
      <TextInput style={styles.input} placeholder="CI *" value={form.ci} onChangeText={(t) => setForm({...form, ci: t})} />
      <TextInput style={styles.input} placeholder="Chapa *" value={form.chapa} onChangeText={(t) => setForm({...form, chapa: t})} />
      <TextInput style={styles.input} placeholder="WhatsApp *" value={form.telefono_whatsapp} onChangeText={(t) => setForm({...form, telefono_whatsapp: t})} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Horario habitual" value={form.horario_habitual} onChangeText={(t) => setForm({...form, horario_habitual: t})} />
      <TextInput style={[styles.input, styles.textArea]} placeholder="Notas extra" value={form.notas_extra} onChangeText={(t) => setForm({...form, notas_extra: t})} multiline />

      <Text style={styles.label}>Cobertura:</Text>
      <View style={styles.checkRow}>
        <TouchableOpacity style={styles.checkItem} onPress={() => setForm({...form, cobertura_provincial: !form.cobertura_provincial})}>
          <View style={[styles.checkbox, form.cobertura_provincial && styles.checked]} />
          <Text>Provincial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.checkItem} onPress={() => setForm({...form, cobertura_municipal: !form.cobertura_municipal})}>
          <View style={[styles.checkbox, form.cobertura_municipal && styles.checked]} />
          <Text>Municipal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.checkItem} onPress={() => setForm({...form, cobertura_centro: !form.cobertura_centro})}>
          <View style={[styles.checkbox, form.cobertura_centro && styles.checked]} />
          <Text>Centro</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{initialData ? 'Actualizar' : 'Crear'} Chofer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#D1D5DB' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  label: { fontWeight: '600', marginBottom: 10, color: '#374151' },
  checkRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#9CA3AF' },
  checked: { backgroundColor: '#15803D', borderColor: '#15803D' },
  button: { backgroundColor: '#15803D', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  disabled: { opacity: 0.6 },
});
