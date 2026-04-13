import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function ChoferLayout() {
  const { user, profile, loading } = useAuth();

  if (loading) return <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><ActivityIndicator size="large" /></View>;
  if (!user || profile?.role !== 'chofer') return <Redirect href="/login" />;

  return <Stack screenOptions={{ headerStyle: { backgroundColor: '#15803D' }, headerTintColor: 'white' }} />;
}
