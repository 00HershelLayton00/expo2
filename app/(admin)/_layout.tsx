import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function AdminLayout() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#15803D" /></View>;
  }
  if (!user || profile?.role !== 'admin') return <Redirect href="/login" />;

  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#15803D' }, headerTintColor: 'white' }}>
      <Stack.Screen name="dashboard" options={{ title: 'Panel Admin' }} />
      <Stack.Screen name="choferes/crear" options={{ title: 'Nuevo Chofer' }} />
      <Stack.Screen name="choferes/pendientes" options={{ title: 'Pendientes' }} />
      <Stack.Screen name="choferes/activos" options={{ title: 'Activos' }} />
    </Stack>
  );
}
