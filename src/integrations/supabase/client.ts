import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Configuração do Supabase usando variáveis de ambiente
// As variáveis VITE_ são expostas ao cliente no Vite
// NOTA: Fallback values são seguros - a anon key é pública por design
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jabknizcvotecmljzglf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphYmtuaXpjdm90ZWNtbGp6Z2xmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTE1MjAsImV4cCI6MjA3OTkyNzUyMH0.tuOsE8Pv5kqrzuNoiBPTwVY92fepwn5AOttwM9NNIr0';

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment platform.');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storage: localStorage
    }
  }
);
