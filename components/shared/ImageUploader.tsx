import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const SUPABASE_URL = 'https://vnfoauzcddvgamgwodsk.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_REAL_AQUI';

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

export function ImageUploader({ label, value, onChange }: Props) {
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso denegado');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();
      const file = new File([blob], `${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await fetch(`${SUPABASE_URL}/storage/v1/object/choferes/fotos/${Date.now()}.jpg`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
          body: formData
        });
        if (res.ok) {
          const url = `${SUPABASE_URL}/storage/v1/object/public/choferes/fotos/${Date.now()}.jpg`;
          onChange(url);
          Alert.alert('✅ Éxito', 'Imagen subida');
        } else {
          Alert.alert('Error', 'No se pudo subir');
        }
      } catch (error) {
        Alert.alert('Error', 'Error de conexión');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {value ? (
          <Image source={{ uri: value }} style={styles.image} />
        ) : (
          <Text style={styles.placeholder}>📸 Toca para seleccionar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontWeight: '600', marginBottom: 8, color: '#374151' },
  imageBox: { height: 150, backgroundColor: '#F3F4F6', borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#15803D', borderStyle: 'dashed' },
  image: { width: '100%', height: '100%', borderRadius: 15 },
  placeholder: { color: '#9CA3AF' },
});
