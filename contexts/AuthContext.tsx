import { router } from 'expo-router';
import React, { createContext, useContext, useState } from 'react';
import { db } from '../lib/database';

interface AuthContextType {
  user: any;
  profile: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false); // ← false porque no hay sesión persistente en offline

  async function signIn(email: string, password: string) {
    setLoading(true);
    try {
      const result = await db.login(email, password);
      if (!result) throw new Error('Credenciales inválidas');
      setUser(result.user);
      setProfile(result.profile);
      if (result.profile?.role === 'admin') {
        router.replace('/(admin)/dashboard');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setUser(null);
    setProfile(null);
    router.replace('/');
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);