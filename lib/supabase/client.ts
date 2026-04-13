// lib/supabase/client.ts
// Cliente 100% nativo - CERO dependencias externas

const SUPABASE_URL = 'https://vnfoauzcddvgamgwodsk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZm9hdXpjZGR2Z2FtZ3dvZHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTY1NTMsImV4cCI6MjA5MTUzMjU1M30.CW3zJ-e2ypxG7Iv1YhnTSjbNs7hD8JOYE5ZD2l_B8t8';

// Storage simulado para web
const memoryStorage: Record<string, string> = {};

export const supabase = {
  auth: {
    getSession: async () => {
      const session = memoryStorage['supabase_session'];
      return { data: { session: session ? JSON.parse(session) : null } };
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || 'Error de autenticación');
      }
      
      const data = await response.json();
      memoryStorage['supabase_session'] = JSON.stringify(data);
      
      // Obtener usuario
      const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { 'Authorization': `Bearer ${data.access_token}` },
      });
      const user = await userResponse.json();
      
      return { data: { user, session: data }, error: null };
    },
    signOut: async () => {
      delete memoryStorage['supabase_session'];
      return { error: null };
    },
    onAuthStateChange: (callback: any) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  },
  
  from: (table: string) => ({
    select: (columns: string = '*') => ({
      eq: (field: string, value: any) => ({
        single: async () => {
          const url = `${SUPABASE_URL}/rest/v1/${table}?select=${columns}&${field}=eq.${value}&limit=1`;
          const response = await fetch(url, {
            headers: { 'apikey': SUPABASE_ANON_KEY },
          });
          const data = await response.json();
          return { data: data[0] || null, error: null };
        },
        order: (orderField: string, { ascending }: { ascending: boolean }) => ({
          async then(resolve: any) {
            const url = `${SUPABASE_URL}/rest/v1/${table}?select=${columns}&${field}=eq.${value}&order=${orderField}.${ascending ? 'asc' : 'desc'}`;
            const response = await fetch(url, {
              headers: { 'apikey': SUPABASE_ANON_KEY },
            });
            const data = await response.json();
            resolve({ data, error: null });
          }
        }),
        async then(resolve: any) {
          const url = `${SUPABASE_URL}/rest/v1/${table}?select=${columns}&${field}=eq.${value}`;
          const response = await fetch(url, {
            headers: { 'apikey': SUPABASE_ANON_KEY },
          });
          const data = await response.json();
          resolve({ data, error: null });
        }
      }),
      order: (field: string, { ascending }: { ascending: boolean }) => ({
        async then(resolve: any) {
          const url = `${SUPABASE_URL}/rest/v1/${table}?select=${columns}&order=${field}.${ascending ? 'asc' : 'desc'}`;
          const response = await fetch(url, {
            headers: { 'apikey': SUPABASE_ANON_KEY },
          });
          const data = await response.json();
          resolve({ data, error: null });
        }
      }),
      async then(resolve: any) {
        const url = `${SUPABASE_URL}/rest/v1/${table}?select=${columns}`;
        const response = await fetch(url, {
          headers: { 'apikey': SUPABASE_ANON_KEY },
        });
        const data = await response.json();
        resolve({ data, error: null });
      }
    }),
    insert: (data: any) => ({
      async then(resolve: any) {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify(Array.isArray(data) ? data : [data]),
        });
        resolve({ error: response.ok ? null : await response.json() });
      }
    }),
    update: (data: any) => ({
      eq: (field: string, value: any) => ({
        async then(resolve: any) {
          const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${field}=eq.${value}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          resolve({ error: response.ok ? null : await response.json() });
        }
      })
    }),
    delete: () => ({
      eq: (field: string, value: any) => ({
        async then(resolve: any) {
          const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${field}=eq.${value}`, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_ANON_KEY },
          });
          resolve({ error: response.ok ? null : await response.json() });
        }
      })
    }),
  }),
};

export type UserRole = 'admin' | 'chofer' | 'cliente';
export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  nombre: string;
}