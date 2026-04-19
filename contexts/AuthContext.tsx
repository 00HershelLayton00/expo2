import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { login } from '../lib/database/sqlite';

interface AuthContextType {
  user: any;
  profile: any;
  loading: boolean;
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('session').then(data => {
      if (data) {
        const parsed = JSON.parse(data);
        setUser(parsed.user);
        setProfile(parsed.profile);
      }
      setLoading(false);
    });
  }, []);

  const signIn = async (email: string, password: string, remember = false) => {
    const result = login(email, password);
    if (!result) throw new Error('Credenciales inválidas');
    
    setUser(result.user);
    setProfile(result.profile);
    await AsyncStorage.setItem('session', JSON.stringify(result));

    if (remember) {
      await AsyncStorage.setItem('rememberedCredentials', JSON.stringify({ ci: email, password }));
    } else {
      await AsyncStorage.removeItem('rememberedCredentials');
    }
    
    if (result.profile.role === 'admin') {
      router.replace('/(admin)/dashboard');
    } else {
      router.replace('/(chofer)/panel');
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    await AsyncStorage.removeItem('session');
    router.replace('/');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}

// Hook para proteger rutas (opcional)
export function useProtectedRoute() {
  const { user, profile, loading } = useAuth();
  // Implementación básica
}