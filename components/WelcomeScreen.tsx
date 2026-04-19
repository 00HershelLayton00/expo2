import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WelcomeScreenProps {
  onProceed: () => void;
}

export default function WelcomeScreen({ onProceed }: WelcomeScreenProps) {
  const handleProceed = async () => {
    await AsyncStorage.setItem('firstTime', 'false');
    onProceed();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>¡Bienvenido a Cuber Holguín! 🚖</Text>
        <Text style={styles.message}>
          Transporte seguro y confiable en Holguín.{'\n\n'}
          Recuerda:{'\n'}
          • Verifica siempre la identidad del chofer.{'\n'}
          • Comparte tu ubicación con alguien de confianza.{'\n'}
          • Usa cinturón de seguridad.{'\n'}
          • Disfruta tu viaje de manera responsable.{'\n\n'}
          ¡Estamos aquí para hacer tu experiencia segura y cómoda!
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleProceed}>
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F4FE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#15803D',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});