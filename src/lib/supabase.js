import { createClient } from '@supabase/supabase-js'

// Public, RLS-protected credentials. Provided at build time via Vite env vars
// (see .env.example). The service-role key is NEVER used in the frontend.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// When env vars are missing (e.g. local preview without a backend) the app
// gracefully falls back to static demo content instead of crashing.
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase = hasSupabase
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { storageKey: 'citylink-admin-auth' },
    })
  : null
