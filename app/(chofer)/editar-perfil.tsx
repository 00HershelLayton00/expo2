import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { ImageUploader } from '../../components/shared/ImageUploader';
import { useAuth } from '../../contexts/AuthContext';
import { getChoferById, updatePerfilChofer } from '../../lib/database/sqlite';

export default function EditarPerfil() {
  const { profile, user } = useAuth();
  const [form, setForm] = useState({
    telefono_whatsapp: '',
    horario_habitual: '',
    notas_extra: '',
    foto_perfil_url: null as string | null,
    foto_carro_url: null as string | null
  });

  useEffect(() => {
    if (profile?.chofer_id) {
      const chofer = getChoferById(profile.chofer_id);
      if (chofer) {
        setForm({
          telefono_whatsapp: chofer.telefono_whatsapp,
          horario_habitual: chofer.condiciones?.horario_habitual || '',
          notas_extra: chofer.condiciones?.notas_extra || '',
          foto_perfil_url: chofer.foto_perfil_url,
          foto_carro_url: chofer.foto_carro_url
        });
      }
    }
  }, [profile]);

  const handleSave = () => {
    if (!profile?.chofer_id || !user) return;
    
    const success = updatePerfilChofer(profile.chofer_id, user.id, {
      telefono_whatsapp: form.telefono_whatsapp,
      condiciones: {
        horario_habitual: form.horario_habitual,
        notas_extra: form.notas_extra
      },
      foto_perfil_url: form.foto_perfil_url,
      foto_carro_url: form.foto_carro_url
    });

    if (success) {
      Alert.alert('✅ Éxito', 'Perfil actualizado');
      router.back();
    } else {
      Alert.alert('❌ Error', 'No se pudo actualizar');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar mi información</Text>
      <ImageUploader label="Foto de perfil" value={form.foto_perfil_url} onChange={(url) => setForm({...form, foto_perfil_url: url})} />
      <ImageUploader label="Foto del carro" value={form.foto_carro_url} onChange={(url) => setForm({...form, foto_carro_url: url})} />
      <Text style={styles.label}>WhatsApp *</Text>
      <TextInput style={styles.input} value={form.telefono_whatsapp} onChangeText={(t) => setForm({...form, telefono_whatsapp: t})} keyboardType="phone-pad" />
      <Text style={styles.label}>Horario habitual</Text>
      <TextInput style={styles.input} value={form.horario_habitual} onChangeText={(t) => setForm({...form, horario_habitual: t})} />
      <Text style={styles.label}>Notas adicionales</Text>
      <TextInput style={[styles.input, styles.textArea]} value={form.notas_extra} onChangeText={(t) => setForm({...form, notas_extra: t})} multiline numberOfLines={3} />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Guardar cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F3F4F6' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontWeight: '600', marginBottom: 5 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#15803D', padding: 15, borderRadius: 10 },
  saveButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }
});