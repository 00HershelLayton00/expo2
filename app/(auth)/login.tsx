import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [ci, setCi] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  useEffect(() => {
    AsyncStorage.getItem('rememberedCredentials').then(data => {
      if (!data) return;
      try {
        const parsed = JSON.parse(data);
        if (parsed.ci) setCi(parsed.ci);
        if (parsed.password) setPassword(parsed.password);
        setRememberMe(true);
      } catch {
        AsyncStorage.removeItem('rememberedCredentials');
      }
    });
  }, []);

  const handleLogin = async () => {
    if (!ci || !password) {
      Alert.alert('Error', 'CI y contraseña son obligatorios');
      return;
    }
    setLoading(true);
    try {
      await signIn(ci, password, rememberMe);
    } catch {
      Alert.alert('Error', 'CI o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🚖 Cuber Holguín</Text>
        <Text style={styles.subtitle}>Acceso con CI</Text>
        <TextInput style={styles.input} placeholder="Carnet de Identidad" value={ci} onChangeText={setCi} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
        <View style={styles.rememberRow}>
          <Text style={styles.rememberText}>Recordarme</Text>
          <Switch value={rememberMe} onValueChange={setRememberMe} thumbColor={rememberMe ? '#15803D' : '#f4f3f4'} trackColor={{ false: '#d1d5db', true: '#86efac' }} />
        </View>
        <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Iniciar Sesión</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#15803D' },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 30 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#15803D', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#6B7280', marginBottom: 30 },
  input: { backgroundColor: '#F3F4F6', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#15803D', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  rememberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  rememberText: { color: '#4B5563', fontSize: 15 },
  backLink: { textAlign: 'center', marginTop: 20, color: '#15803D' }
});