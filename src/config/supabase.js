import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Usando a service role key para desenvolvimento

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are not properly configured');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Verify connection
const checkConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log('Supabase connection verified');
  } catch (error) {
    console.error('Error connecting to Supabase:', error.message);
  }
};

checkConnection();

export default supabase;