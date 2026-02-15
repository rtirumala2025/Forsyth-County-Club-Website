/**
 * Supabase Runtime Client
 *
 * Initializes a single Supabase client for the entire frontend.
 * Uses Vite's import.meta.env to read VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '⚠️ Supabase env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). ' +
        'Database features will be unavailable.'
    );
}

export const supabase = createClient(
    supabaseUrl ?? '',
    supabaseAnonKey ?? ''
);
