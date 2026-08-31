import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://rpfztwbqlgoxeefthexa.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_YpJnSewImWumzLaKlYzmLA_J1ZHf89I";

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn("⚠️ VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing from environment. Using default fallback configuration.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
