import { Stack } from 'expo-router';

export default function PublicLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#15803D' },
        headerTintColor: 'white',
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
      <Stack.Screen name="index" options={{ title: 'Cuber Holguín' }} />
      <Stack.Screen name="chofer/[id]" options={{ title: 'Detalle del Chofer' }} />
    </Stack>
  );
}