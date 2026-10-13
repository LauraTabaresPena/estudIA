import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [authError, setAuthError] = useState('')
  useEffect(() => {
    if (!supabase) return
    let active = true
    let eventReceived = false
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      eventReceived = true
      if (active) { setSession(next); setLoading(false) }
    })
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active || eventReceived) return
      if (error) setAuthError('No se pudo recuperar tu sesión. Vuelve a iniciar sesión.')
      setSession(data.session); setLoading(false)
    }).catch(() => { if (active) { setLoading(false); setAuthError('No se pudo conectar con tu cuenta.') } })
    return () => { active = false; subscription.unsubscribe() }
  }, [])
  return { session, loading, authError }
}
