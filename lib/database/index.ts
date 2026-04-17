// lib/database/index.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chofer, MOCK_CHOFERES, MOCK_PROFILES, MOCK_USERS } from './mockData';

// ⚙️ CONFIGURACIÓN: Cambia esto a false cuando quieras usar Supabase real
const MODO_OFFLINE = true;

// URLs de Supabase (solo se usan si MODO_OFFLINE = false)
const SUPABASE_URL = 'https://vnfoauzcddvgamgwodsk.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_REAL_AQUI';

// ============================================
//         CLIENTE OFFLINE (AsyncStorage)
// ============================================
class OfflineDB {
  private async getData<T>(key: string, defaultData: T): Promise<T> {
    const stored = await AsyncStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
  }

  private async setData(key: string, data: any): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  }

  async getChoferes(): Promise<Chofer[]> {
    return this.getData('choferes', MOCK_CHOFERES);
  }

  async saveChofer(chofer: Chofer): Promise<void> {
    const choferes = await this.getChoferes();
    const index = choferes.findIndex(c => c.id === chofer.id);
    if (index >= 0) {
      choferes[index] = chofer;
    } else {
      choferes.push({ ...chofer, id: Date.now().toString() });
    }
    await this.setData('choferes', choferes);
  }

  async updateChoferStatus(id: string, estado: string): Promise<void> {
    const choferes = await this.getChoferes();
    const chofer = choferes.find(c => c.id === id);
    if (chofer) {
      chofer.estado_suscripcion = estado as any;
      await this.setData('choferes', choferes);
    }
  }

  async deleteChofer(id: string): Promise<void> {
    const choferes = await this.getChoferes();
    await this.setData('choferes', choferes.filter(c => c.id !== id));
  }

  async login(email: string, password: string): Promise<{ user: any; profile: any } | null> {
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!user) return null;
    const profile = MOCK_PROFILES.find(p => p.email === email);
    return { user: { email: user.email }, profile };
  }
}

// ============================================
//         CLIENTE SUPABASE (Real)
// ============================================
class SupabaseDB {
  async request(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${SUPABASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        ...options.headers,
      },
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  }

  async getChoferes(): Promise<Chofer[]> {
    return this.request('/rest/v1/choferes?select=*&estado_suscripcion=eq.activo&order=rating_trato.desc');
  }

  async login(email: string, password: string) {
    const data = await this.request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const profile = await this.request(`/rest/v1/profiles?select=*&email=eq.${email}&limit=1`);
    return { user: data.user, profile: profile[0] };
  }

  async saveChofer(chofer: Partial<Chofer>): Promise<void> {
    if (chofer.id) {
      await this.request(`/rest/v1/choferes?id=eq.${chofer.id}`, {
        method: 'PATCH',
        body: JSON.stringify(chofer),
      });
    } else {
      await this.request('/rest/v1/choferes', {
        method: 'POST',
        body: JSON.stringify([{ ...chofer, estado_suscripcion: 'pendiente' }]),
      });
    }
  }

  async updateChoferStatus(id: string, estado: string): Promise<void> {
    await this.request(`/rest/v1/choferes?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ estado_suscripcion: estado }),
    });
  }

  async deleteChofer(id: string): Promise<void> {
    await this.request(`/rest/v1/choferes?id=eq.${id}`, { method: 'DELETE' });
  }
}

// ============================================
//            EXPORTACIÓN ÚNICA
// ============================================
export const db = MODO_OFFLINE ? new OfflineDB() : new SupabaseDB();

// Re-exportar tipos
export type { Chofer };
