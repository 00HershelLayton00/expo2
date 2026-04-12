// lib/supabase/storage.ts
const SUPABASE_URL = 'https://vnfoauzcddvgamgwodsk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZm9hdXpjZGR2Z2FtZ3dvZHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNTU1NjgsImV4cCI6MjA1OTkzMTU2OH0.dummy_change_this_key';

export async function uploadImageWeb(file: File, path: string): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', file);
  
  const url = `${SUPABASE_URL}/storage/v1/object/choferes/${path}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: formData
    });
    
    if (response.ok) {
      return `${SUPABASE_URL}/storage/v1/object/public/choferes/${path}`;
    }
    return null;
  } catch (error) {
    console.error('Error uploading:', error);
    return null;
  }
}