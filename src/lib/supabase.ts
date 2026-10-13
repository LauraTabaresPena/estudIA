import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

// Nunca usar service_role ni sb_secret_ en VITE_*: se incluyen en el navegador.
export const isConfigured = Boolean(url && /^https?:\/\//.test(url) && key?.startsWith('sb_publishable_'))
export const supabase = isConfigured ? createClient(url!, key!, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
}) : null
