import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  label: string;
  value: string | null;
  onChange: (url: string) => void;
}

export function ImageUploader({ label, value, onChange }: Props) {
  const pickImage = async () => {
    Alert.alert(
      'Seleccionar imagen',
      '¿Cómo quieres agregar la imagen?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Galería', onPress: selectFromGallery },
        { text: 'Cámara', onPress: takePhoto },
      ]
    );
  };

  const selectFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Error', 'Se necesitan permisos para acceder a las fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].uri) {
        await saveImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo cargar la imagen');
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Error', 'Se necesitan permisos para usar la cámara');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].uri) {
        await saveImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const saveImage = async (uri: string) => {
    try {
      // Crear nombre único
      const fileName = `imagen_${Date.now()}.jpg`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Copiar archivo
      await FileSystem.copyAsync({ from: uri, to: newUri });
      
      onChange(newUri);
      Alert.alert('✅ Éxito', 'Imagen guardada');
    } catch (error) {
      console.error('Error al guardar imagen:', error);
      Alert.alert('Error', 'No se pudo guardar la imagen');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {value ? (
          <Image source={{ uri: value }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>📸 Toca para seleccionar</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontWeight: '600', marginBottom: 8, color: '#374151' },
  imageBox: { 
    height: 150, 
    backgroundColor: '#F3F4F6', 
    borderRadius: 15, 
    overflow: 'hidden',
    borderWidth: 2, 
    borderColor: '#15803D', 
    borderStyle: 'dashed' 
  },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#9CA3AF', fontSize: 14 }
});