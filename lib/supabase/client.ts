const SUPABASE_URL = 'https://vnfoauzcddvgamgwodsk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZm9hdXpjZGR2Z2FtZ3dvZHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTY1NTMsImV4cCI6MjA5MTUzMjU1M30.CW3zJ-e2ypxG7Iv1YhnTSjbNs7hD8JOYE5ZD2l_B8t8';

// lib/supabase/client.ts

// Helper para construir URLs correctamente
function buildUrl(base: string, params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  return `${base}?${query}`;
}

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Credenciales inválidas');
      const data = await res.json();
      return { data: { user: data.user, session: data }, error: null };
    },
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },

  from: (table: string) => ({
    select: (columns: string = '*') => ({
      // Caso: .select().eq('campo', valor)
      eq: (field: string, value: any) => {
        // Si encadenamos .single() después
        const single = async () => {
          const url = `${SUPABASE_URL}/rest/v1/${table}?select=${columns}&${field}=eq.${encodeURIComponent(value)}&limit=1`;
          const res = await fetch(url, { headers: { 'apikey': SUPABASE_ANON_KEY } });
          const data = await res.json();
          return { data: data[0] || null, error: null };
        };

        // Si encadenamos .order() después
        const order = (orderField: string, { ascending }: { ascending: boolean }) => {
          const direction = ascending ? 'asc' : 'desc';
          return {
            async then(resolve: any) {
              const url = `${SUPABASE_URL}/rest/v1/${table}?select=${columns}&${field}=eq.${encodeURIComponent(value)}&order=${orderField}.${direction}`;
              const res = await fetch(url, { headers: { 'apikey': SUPABASE_ANON_KEY } });
              const data = await res.json();
              resolve({ data, error: null });
            }
          };
        };

        // Si no encadenamos nada más (solo .eq())
        const then = async (resolve: any) => {
          const url = `${SUPABASE_URL}/rest/v1/${table}?select=${columns}&${field}=eq.${encodeURIComponent(value)}`;
          const res = await fetch(url, { headers: { 'apikey': SUPABASE_ANON_KEY } });
          const data = await res.json();
          resolve({ data, error: null });
        };

        return { single, order, then };
      },

      // Caso: .select().order()
      order: (field: string, { ascending }: { ascending: boolean }) => {
        const direction = ascending ? 'asc' : 'desc';
        return {
          async then(resolve: any) {
            const url = `${SUPABASE_URL}/rest/v1/${table}?select=${columns}&order=${field}.${direction}`;
            const res = await fetch(url, { headers: { 'apikey': SUPABASE_ANON_KEY } });
            const data = await res.json();
            resolve({ data, error: null });
          }
        };
      },

      // Caso: solo .select()
      async then(resolve: any) {
        const url = `${SUPABASE_URL}/rest/v1/${table}?select=${columns}`;
        const res = await fetch(url, { headers: { 'apikey': SUPABASE_ANON_KEY } });
        const data = await res.json();
        resolve({ data, error: null });
      }
    }),

    insert: (data: any) => ({
      async then(resolve: any) {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify(Array.isArray(data) ? data : [data]),
          });
          resolve({ error: res.ok ? null : await res.json() });
        } catch (error) {
          resolve({ error });
        }
      }
    }),

    update: (data: any) => ({
      eq: (field: string, value: any) => ({
        async then(resolve: any) {
          try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${field}=eq.${encodeURIComponent(value)}`, {
              method: 'PATCH',
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });
            resolve({ error: res.ok ? null : await res.json() });
          } catch (error) {
            resolve({ error });
          }
        }
      })
    }),

    delete: () => ({
      eq: (field: string, value: any) => ({
        async then(resolve: any) {
          try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${field}=eq.${encodeURIComponent(value)}`, {
              method: 'DELETE',
              headers: { 'apikey': SUPABASE_ANON_KEY },
            });
            resolve({ error: res.ok ? null : await res.json() });
          } catch (error) {
            resolve({ error });
          }
        }
      })
    }),
  }),
};

export type Chofer = {
  id: string;
  nombre_completo: string;
  ci: string;
  chapa: string;
  telefono_whatsapp: string;
  cobertura: string[];
  condiciones: { horario_habitual: string; notas_extra: string };
  foto_perfil_url: string | null;
  foto_carro_url: string | null;
  estado_suscripcion: string;
  rating_trato: number;
};

export type UserRole = 'admin' | 'chofer' | 'cliente';
export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  nombre: string;
}