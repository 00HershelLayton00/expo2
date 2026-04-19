import AsyncStorage from '@react-native-async-storage/async-storage';
import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import WelcomeScreen from '../components/WelcomeScreen';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  const [firstTime, setFirstTime] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('firstTime').then(val => {
      if (val === 'false') {
        setFirstTime(false);
      }
    });
  }, []);

  if (firstTime) {
    return <WelcomeScreen onProceed={() => setFirstTime(false)} />;
  }

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}