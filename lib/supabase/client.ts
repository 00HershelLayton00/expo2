// lib/supabase/client.ts
// SIN DEPENDENCIAS EXTERNAS - Usa Fetch API nativa

const SUPABASE_URL = 'https://vnfoauzcddvgamgwodsk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZm9hdXpjZGR2Z2FtZ3dvZHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTY1NTMsImV4cCI6MjA5MTUzMjU1M30.CW3zJ-e2ypxG7Iv1YhnTSjbNs7hD8JOYE5ZD2l_B8t8';
// lib/supabase/client.ts
// Cliente Supabase ultra-ligero SIN dependencias externas

export type Chofer = {
  id: string;
  nombre_completo: string;
  foto_perfil_url: string | null;
  foto_carro_url: string | null;
  chapa: string;
  cobertura: string[];
  condiciones: {
    horario_habitual: string;
    tarifa_centro?: string;
    tarifa_municipal?: string;
    tarifa_provincial?: string;
    notas_extra: string;
  };
  rating_puntualidad: number;
  rating_trato: number;
  telefono_whatsapp: string;
  estado_suscripcion: string;
};

export const supabase = {
  from: (table: string) => ({
    select: (columns: string = '*') => ({
      eq: (field: string, value: any) => ({
        order: (orderField: string, { ascending }: { ascending: boolean }) => ({
          async then(resolve: any) {
            try {
              let url = `${SUPABASE_URL}/rest/v1/${table}?select=${columns}`;
              url += `&${field}=eq.${encodeURIComponent(value)}`;
              url += `&order=${orderField}.${ascending ? 'asc' : 'desc'}`;
              
              const response = await fetch(url, {
                headers: {
                  'apikey': SUPABASE_ANON_KEY,
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
              });
              const data = await response.json();
              resolve({ data, error: null });
            } catch (error) {
              resolve({ data: null, error });
            }
          }
        }),
        async then(resolve: any) {
          try {
            let url = `${SUPABASE_URL}/rest/v1/${table}?select=${columns}`;
            if (field && value) {
              url += `&${field}=eq.${encodeURIComponent(value)}`;
            }
            const response = await fetch(url, {
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
              }
            });
            const data = await response.json();
            resolve({ data, error: null });
          } catch (error) {
            resolve({ data: null, error });
          }
        }
      }),
      order: (field: string, { ascending }: { ascending: boolean }) => ({
        async then(resolve: any) {
          try {
            let url = `${SUPABASE_URL}/rest/v1/${table}?select=${columns}`;
            url += `&order=${field}.${ascending ? 'asc' : 'desc'}`;
            const response = await fetch(url, {
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
              }
            });
            const data = await response.json();
            resolve({ data, error: null });
          } catch (error) {
            resolve({ data: null, error });
          }
        }
      })
    }),
    insert: (data: any) => ({
      async then(resolve: any) {
        try {
          const url = `${SUPABASE_URL}/rest/v1/${table}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(data)
          });
          resolve({ error: null });
        } catch (error) {
          resolve({ error });
        }
      }
    }),
    update: (data: any) => ({
      eq: (field: string, value: any) => ({
        async then(resolve: any) {
          try {
            const url = `${SUPABASE_URL}/rest/v1/${table}?${field}=eq.${encodeURIComponent(value)}`;
            const response = await fetch(url, {
              method: 'PATCH',
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            });
            resolve({ error: null });
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
            const url = `${SUPABASE_URL}/rest/v1/${table}?${field}=eq.${encodeURIComponent(value)}`;
            const response = await fetch(url, {
              method: 'DELETE',
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
              }
            });
            resolve({ error: null });
          } catch (error) {
            resolve({ error });
          }
        }
      })
    })
  })
};