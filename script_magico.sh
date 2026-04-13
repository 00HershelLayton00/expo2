#!/bin/bash

echo "🧹 Limpiando archivos antiguos..."
# Eliminar archivos .ts y .tsx dentro de app/ y components/
find ./app -type f \( -name "*.ts" -o -name "*.tsx" \) -delete
find ./components -type f \( -name "*.ts" -o -name "*.tsx" \) -delete 2>/dev/null

# Eliminar directorios vacíos
find ./app -type d -empty -delete
find ./components -type d -empty -delete 2>/dev/null

echo "📁 Creando estructura de carpetas..."
mkdir -p app/\(auth\) app/\(admin\)/choferes app/\(chofer\) app/\(public\)
mkdir -p components/ui components/admin components/shared
mkdir -p lib/supabase lib/hooks lib/utils contexts config

echo "📝 Creando archivos esenciales..."

# --- 1. Configuración de Supabase (lib/supabase/client.ts) ---
cat > lib/supabase/client.ts << 'EOF'
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://vnfoauzcddvgamgwodsk.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_REAL_AQUI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type UserRole = 'admin' | 'chofer' | 'cliente';
export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  nombre: string;
}
EOF

# --- 2. Contexto de Autenticación (contexts/AuthContext.tsx) ---
cat > contexts/AuthContext.tsx << 'EOF'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, UserProfile } from '../lib/supabase/client';
import { router } from 'expo-router';

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
    if (data) {
      if (data.role === 'admin') router.replace('/(admin)/dashboard');
      else if (data.role === 'chofer') router.replace('/(chofer)/panel');
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
EOF

# --- 3. Layout Raíz (app/_layout.tsx) ---
cat > app/_layout.tsx << 'EOF'
import { Slot } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
EOF

# --- 4. Login (app/(auth)/login.tsx) ---
cat > app/\(auth\)/login.tsx << 'EOF'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🚖 Cuber Holguín</Text>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Iniciar Sesión</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#15803D' },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 30 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#15803D', marginBottom: 30 },
  input: { backgroundColor: '#F3F4F6', padding: 15, borderRadius: 10, marginBottom: 15 },
  button: { backgroundColor: '#15803D', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  disabled: { opacity: 0.6 },
});
EOF

# --- 5. Layout Admin (app/(admin)/_layout.tsx) ---
cat > app/\(admin\)/_layout.tsx << 'EOF'
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
EOF

# --- 6. Dashboard Admin (app/(admin)/dashboard.tsx) ---
cat > app/\(admin\)/dashboard.tsx << 'EOF'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
  const { profile, signOut } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola, {profile?.nombre || 'Admin'}!</Text>
        <Text style={styles.subtitle}>Gestiona tu flota</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/(admin)/choferes/crear')}>
          <Text style={styles.cardIcon}>➕</Text>
          <Text style={styles.cardTitle}>Crear Chofer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/(admin)/choferes/pendientes')}>
          <Text style={styles.cardIcon}>⏳</Text>
          <Text style={styles.cardTitle}>Pendientes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/(admin)/choferes/activos')}>
          <Text style={styles.cardIcon}>✅</Text>
          <Text style={styles.cardTitle}>Activos</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F3F4F6' },
  header: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  subtitle: { color: '#6B7280', marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 15, alignItems: 'center' },
  cardIcon: { fontSize: 40, marginBottom: 10 },
  cardTitle: { fontWeight: '600', color: '#374151' },
  logoutButton: { backgroundColor: '#EF4444', padding: 15, borderRadius: 10, marginTop: 20 },
  logoutText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});
EOF

# --- 7. ImageUploader (components/shared/ImageUploader.tsx) ---
cat > components/shared/ImageUploader.tsx << 'EOF'
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const SUPABASE_URL = 'https://vnfoauzcddvgamgwodsk.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_REAL_AQUI';

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

export function ImageUploader({ label, value, onChange }: Props) {
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso denegado');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();
      const file = new File([blob], `${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await fetch(`${SUPABASE_URL}/storage/v1/object/choferes/fotos/${Date.now()}.jpg`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
          body: formData
        });
        if (res.ok) {
          const url = `${SUPABASE_URL}/storage/v1/object/public/choferes/fotos/${Date.now()}.jpg`;
          onChange(url);
          Alert.alert('✅ Éxito', 'Imagen subida');
        } else {
          Alert.alert('Error', 'No se pudo subir');
        }
      } catch (error) {
        Alert.alert('Error', 'Error de conexión');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {value ? (
          <Image source={{ uri: value }} style={styles.image} />
        ) : (
          <Text style={styles.placeholder}>📸 Toca para seleccionar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontWeight: '600', marginBottom: 8, color: '#374151' },
  imageBox: { height: 150, backgroundColor: '#F3F4F6', borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#15803D', borderStyle: 'dashed' },
  image: { width: '100%', height: '100%', borderRadius: 15 },
  placeholder: { color: '#9CA3AF' },
});
EOF

# --- 8. Formulario Chofer (components/admin/ChoferForm.tsx) ---
cat > components/admin/ChoferForm.tsx << 'EOF'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { ImageUploader } from '../shared/ImageUploader';

interface Props {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export function ChoferForm({ initialData, onSubmit, loading }: Props) {
  const [form, setForm] = useState({
    nombre_completo: initialData?.nombre_completo || '',
    ci: initialData?.ci || '',
    chapa: initialData?.chapa || '',
    telefono_whatsapp: initialData?.telefono_whatsapp || '',
    horario_habitual: initialData?.condiciones?.horario_habitual || '',
    notas_extra: initialData?.condiciones?.notas_extra || '',
    foto_perfil_url: initialData?.foto_perfil_url || '',
    foto_carro_url: initialData?.foto_carro_url || '',
    cobertura_provincial: initialData?.cobertura?.includes('provincial') || false,
    cobertura_municipal: initialData?.cobertura?.includes('municipal') || false,
    cobertura_centro: initialData?.cobertura?.includes('centro_ciudad') || false,
  });

  const handleSubmit = () => {
    if (!form.nombre_completo || !form.ci || !form.chapa || !form.telefono_whatsapp) {
      alert('Campos obligatorios: Nombre, CI, Chapa, WhatsApp');
      return;
    }
    onSubmit(form);
  };

  return (
    <ScrollView style={styles.container}>
      <ImageUploader label="Foto de Perfil" value={form.foto_perfil_url} onChange={(url) => setForm({...form, foto_perfil_url: url})} />
      <ImageUploader label="Foto del Carro" value={form.foto_carro_url} onChange={(url) => setForm({...form, foto_carro_url: url})} />

      <TextInput style={styles.input} placeholder="Nombre Completo *" value={form.nombre_completo} onChangeText={(t) => setForm({...form, nombre_completo: t})} />
      <TextInput style={styles.input} placeholder="CI *" value={form.ci} onChangeText={(t) => setForm({...form, ci: t})} />
      <TextInput style={styles.input} placeholder="Chapa *" value={form.chapa} onChangeText={(t) => setForm({...form, chapa: t})} />
      <TextInput style={styles.input} placeholder="WhatsApp *" value={form.telefono_whatsapp} onChangeText={(t) => setForm({...form, telefono_whatsapp: t})} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Horario habitual" value={form.horario_habitual} onChangeText={(t) => setForm({...form, horario_habitual: t})} />
      <TextInput style={[styles.input, styles.textArea]} placeholder="Notas extra" value={form.notas_extra} onChangeText={(t) => setForm({...form, notas_extra: t})} multiline />

      <Text style={styles.label}>Cobertura:</Text>
      <View style={styles.checkRow}>
        <TouchableOpacity style={styles.checkItem} onPress={() => setForm({...form, cobertura_provincial: !form.cobertura_provincial})}>
          <View style={[styles.checkbox, form.cobertura_provincial && styles.checked]} />
          <Text>Provincial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.checkItem} onPress={() => setForm({...form, cobertura_municipal: !form.cobertura_municipal})}>
          <View style={[styles.checkbox, form.cobertura_municipal && styles.checked]} />
          <Text>Municipal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.checkItem} onPress={() => setForm({...form, cobertura_centro: !form.cobertura_centro})}>
          <View style={[styles.checkbox, form.cobertura_centro && styles.checked]} />
          <Text>Centro</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{initialData ? 'Actualizar' : 'Crear'} Chofer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#D1D5DB' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  label: { fontWeight: '600', marginBottom: 10, color: '#374151' },
  checkRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#9CA3AF' },
  checked: { backgroundColor: '#15803D', borderColor: '#15803D' },
  button: { backgroundColor: '#15803D', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  disabled: { opacity: 0.6 },
});
EOF

# --- 9. Pantalla Crear Chofer (app/(admin)/choferes/crear.tsx) ---
cat > app/\(admin\)/choferes/crear.tsx << 'EOF'
import { Alert } from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ChoferForm } from '../../../components/admin/ChoferForm';
import { supabase } from '../../../lib/supabase/client';

export default function CrearChofer() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    const cobertura = [];
    if (formData.cobertura_provincial) cobertura.push('provincial');
    if (formData.cobertura_municipal) cobertura.push('municipal');
    if (formData.cobertura_centro) cobertura.push('centro_ciudad');

    const payload = {
      nombre_completo: formData.nombre_completo,
      ci: formData.ci,
      chapa: formData.chapa,
      telefono_whatsapp: formData.telefono_whatsapp,
      cobertura,
      condiciones: { horario_habitual: formData.horario_habitual, notas_extra: formData.notas_extra },
      foto_perfil_url: formData.foto_perfil_url,
      foto_carro_url: formData.foto_carro_url,
    };

    try {
      if (id) {
        await supabase.from('choferes').update(payload).eq('id', id);
      } else {
        await supabase.from('choferes').insert([{ ...payload, estado_suscripcion: 'pendiente' }]);
      }
      Alert.alert('✅ Éxito', id ? 'Chofer actualizado' : 'Chofer creado');
      router.back();
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  };

  return <ChoferForm onSubmit={handleSubmit} loading={loading} />;
}
EOF

# --- 10. Pantalla Pendientes (app/(admin)/choferes/pendientes.tsx) ---
cat > app/\(admin\)/choferes/pendientes.tsx << 'EOF'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { router } from 'expo-router';

export default function Pendientes() {
  const [choferes, setChoferes] = useState([]);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    const { data } = await supabase.from('choferes').select('*').eq('estado_suscripcion', 'pendiente');
    setChoferes(data || []);
  }

  async function aprobar(id: string) {
    await supabase.from('choferes').update({ estado_suscripcion: 'activo' }).eq('id', id);
    cargar();
  }

  async function eliminar(id: string, nombre: string) {
    Alert.alert('Confirmar', `¿Eliminar a ${nombre}?`, [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        await supabase.from('choferes').delete().eq('id', id);
        cargar();
      }}
    ]);
  }

  return (
    <FlatList
      data={choferes}
      keyExtractor={(item: any) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.nombre_completo}</Text>
          <Text>CI: {item.ci}</Text>
          <Text>Chapa: {item.chapa}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.approve]} onPress={() => aprobar(item.id)}>
              <Text style={styles.btnText}>Aprobar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.edit]} onPress={() => router.push(`/(admin)/choferes/crear?id=${item.id}`)}>
              <Text style={styles.btnText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.delete]} onPress={() => eliminar(item.id, item.nombre_completo)}>
              <Text style={styles.btnText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', padding: 15, margin: 10, borderRadius: 10 },
  name: { fontSize: 18, fontWeight: 'bold' },
  actions: { flexDirection: 'row', marginTop: 10, gap: 5 },
  btn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  approve: { backgroundColor: '#22C55E' },
  edit: { backgroundColor: '#3B82F6' },
  delete: { backgroundColor: '#EF4444' },
  btnText: { color: 'white', fontWeight: 'bold' },
});
EOF

# --- 11. Pantalla Activos (similar a pendientes) ---
cat > app/\(admin\)/choferes/activos.tsx << 'EOF'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { router } from 'expo-router';

export default function Activos() {
  const [choferes, setChoferes] = useState([]);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    const { data } = await supabase.from('choferes').select('*').eq('estado_suscripcion', 'activo');
    setChoferes(data || []);
  }

  async function suspender(id: string) {
    await supabase.from('choferes').update({ estado_suscripcion: 'suspendido' }).eq('id', id);
    cargar();
  }

  return (
    <FlatList
      data={choferes}
      keyExtractor={(item: any) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.nombre_completo}</Text>
          <Text>CI: {item.ci}</Text>
          <Text>Chapa: {item.chapa}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.edit]} onPress={() => router.push(`/(admin)/choferes/crear?id=${item.id}`)}>
              <Text style={styles.btnText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.suspend]} onPress={() => suspender(item.id)}>
              <Text style={styles.btnText}>Suspender</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', padding: 15, margin: 10, borderRadius: 10 },
  name: { fontSize: 18, fontWeight: 'bold' },
  actions: { flexDirection: 'row', marginTop: 10, gap: 5 },
  btn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  edit: { backgroundColor: '#3B82F6' },
  suspend: { backgroundColor: '#F97316' },
  btnText: { color: 'white', fontWeight: 'bold' },
});
EOF

# --- 12. Panel del Chofer (app/(chofer)/panel.tsx) ---
cat > app/\(chofer\)/panel.tsx << 'EOF'
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function ChoferPanel() {
  const { profile, signOut } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel del Chofer</Text>
      <Text>Bienvenido, {profile?.nombre}</Text>
      <Text onPress={signOut} style={styles.logout}>Cerrar Sesión</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  logout: { marginTop: 20, color: 'red' },
});
EOF

# --- 13. Layout Chofer (protegido) ---
cat > app/\(chofer\)/_layout.tsx << 'EOF'
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function ChoferLayout() {
  const { user, profile, loading } = useAuth();

  if (loading) return <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><ActivityIndicator size="large" /></View>;
  if (!user || profile?.role !== 'chofer') return <Redirect href="/login" />;

  return <Stack screenOptions={{ headerStyle: { backgroundColor: '#15803D' }, headerTintColor: 'white' }} />;
}
EOF

# --- 14. Index (redirige a login) ---
cat > app/index.tsx << 'EOF'
import { Redirect } from 'expo-router';
export default function Index() { return <Redirect href="/login" />; }
EOF

echo "✅ ¡Proyecto reconstruido exitosamente!"
echo "⚠️  Recuerda:"
echo "  - Reemplazar 'TU_ANON_KEY_REAL_AQUI' en lib/supabase/client.ts y components/shared/ImageUploader.tsx"
echo "  - Ejecutar el SQL en Supabase (crear tabla profiles, trigger, etc.)"
echo "  - Crear un usuario admin manualmente en Authentication y asignarle role='admin' en profiles"
echo "  - Instalar dependencias: npx expo install expo-router @supabase/supabase-js @react-native-async-storage/async-storage expo-image-picker"