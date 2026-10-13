import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { Modal } from './Modal'
import { CozyIcon } from './CozyIcon'

export function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!supabase || busy) return
    setBusy(true); setError(''); setMessage('')
    try {
      const result = mode === 'login'
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } })
      if (result.error) {
        const code = result.error.code
        setError(code === 'invalid_credentials' ? 'El correo o la contraseña no son correctos.' : code === 'email_not_confirmed' ? 'Confirma tu correo antes de entrar.' : result.error.message)
      } else if (result.data.session) onClose()
      else setMessage('Revisa tu correo para confirmar la cuenta. Después podrás iniciar sesión.')
    } catch { setError('No se pudo conectar. Comprueba tu conexión y vuelve a intentarlo.') }
    finally { setBusy(false) }
  }
  return <Modal title={mode === 'login' ? 'Vuelve a tu rincón' : 'Un rincón para ti'} onClose={onClose}>
    <div className="auth-illustration"><CozyIcon name="sprout" size={72}/></div>
    {!supabase ? <><p className="muted">Puedes estudiar y guardar tu progreso en este navegador. Para activar las cuentas, configura la URL y la clave pública de Supabase siguiendo el README del proyecto.</p><button className="primary-button w-full mt-6" onClick={onClose}>Continuar en modo local</button></> : <>
      <p className="muted mb-5">Guarda tus pequeños avances y continúa desde cualquier dispositivo.</p>
      <form onSubmit={submit} className="space-y-4">
        <label className="field-label">Correo electrónico<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" maxLength={254}/></label>
        <label className="field-label">Contraseña<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'signup' ? 8 : 1} value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'Al menos 8 caracteres' : 'Tu contraseña'} maxLength={128}/></label>
        {error && <p className="error-message" role="alert">{error}</p>}
        {message && <p className="success-message" role="status">{message}</p>}
        <button disabled={busy} className="primary-button w-full" type="submit">{busy ? 'Un momento…' : mode === 'login' ? 'Entrar a mi espacio' : 'Crear mi cuenta'}</button>
      </form>
      <button className="text-button mt-5 w-full" disabled={busy} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}>{mode === 'login' ? '¿Primera vez? Crea una cuenta' : 'Ya tengo cuenta. Iniciar sesión'}</button>
      <p className="tiny muted mt-5">El espacio local y el de tu cuenta guardan planes independientes.</p>
    </>}
  </Modal>
}
