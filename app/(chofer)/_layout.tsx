import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function ChoferLayout() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#15803D" /></View>;
  }
  
  if (!user || profile?.role !== 'chofer') {
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#15803D' }, headerTintColor: 'white' }}>
      <Stack.Screen name="panel" options={{ title: 'Panel del Chofer' }} />
      <Stack.Screen name="editar-perfil" options={{ title: 'Editar Perfil' }} />
    </Stack>
  );
}