import { lazy, Suspense, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useStudyData } from './hooks/useStudyData'
import { supabase } from './lib/supabase'
import { readStored, writeStored } from './lib/storage'
import { CozyIcon, DeskIllustration } from './components/CozyIcon'
import { Pomodoro } from './components/Pomodoro'
import { MediaWidget } from './components/MediaWidget'
import { Ambience } from './components/Ambience'
import { customBackgrounds } from './config/themes'

const StudyPlan = lazy(() => import('./components/StudyPlan'))
const AuthModal = lazy(() => import('./components/AuthModal').then(module => ({ default: module.AuthModal })))

function StudySpace({ userId }: { userId?: string }) {
  const data = useStudyData(userId)
  const [theme, setTheme] = useState(() => readStored('study:theme', 'garden'))
  const [background, setBackground] = useState(() => readStored('study:background', ''))
  const day = new Date().toDateString()
  const focusLogs = data.logs.filter(log => log.mode === 'focus' && new Date(log.completed_at).toDateString() === day)
  const minutes = Math.round(focusLogs.reduce((total, log) => total + log.duration_seconds, 0) / 60)
  const completed = data.tasks.filter(task => task.completed_at).length
  const image = customBackgrounds.find(item => item.id === background)
  const statusLabels = { local: 'Guardado en este navegador', syncing: 'Sincronizando tu progreso…', saved: 'Tu progreso está al día', offline: 'Sin conexión · guardado local', error: 'Cambios pendientes de sincronizar' }
  function changeTheme(value: string) { setTheme(value); writeStored('study:theme', value) }
  return <div className="study-space" data-theme={theme}>
    <div className="scenery" style={image ? { backgroundImage: `url("${image.url}")` } : undefined}/><div className="scenery-wash"/>
    <div className="workspace-content">
      <header className="hero"><div><div className="welcome-label"><span/> TU ESPACIO PARA CRECER</div><h1>Un pequeño paso,<br/><em>un gran comienzo.</em></h1><p>Prepara algo calentito. Hoy también es un buen día para aprender.</p></div><div className="hero-aside"><DeskIllustration/><span>Sin prisa. Con intención.</span></div></header>
      <div className="workspace-toolbar"><div className="space-label"><CozyIcon name="sprout" size={24}/><span>Mi rincón de estudio</span><span className="toolbar-divider"/><span className="date-label">{new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</span></div><button className={`sync-status ${data.status === 'error' ? 'sync-error' : ''}`} onClick={() => void data.sync()} disabled={!userId || data.status === 'syncing'} title={userId ? 'Sincronizar ahora' : 'Inicia sesión para sincronizar entre dispositivos'}><span className="status-dot"/>{statusLabels[data.status]}</button></div>
      {data.storageError && <p className="error-message mb-4" role="alert">El navegador no permite guardar más datos. No cierres esta página hasta recuperar espacio o sincronizar tu cuenta.</p>}
      {data.error && <div className="error-message mb-4" role="alert">{data.error} <button className="text-button" onClick={() => void data.sync()}>Reintentar</button></div>}
      <main className="widget-grid" id="mi-espacio"><div className="widget-column"><Pomodoro scope={userId ?? 'guest'} onComplete={data.addLog} cycles={focusLogs.length}/><section className="glass-panel today-panel" aria-labelledby="today-title"><div className="heading-with-icon"><CozyIcon name="sun" size={32}/><h2 id="today-title">Tus pequeños logros</h2><span className="soft-badge ml-auto">Hoy</span></div><div className="today-stats"><div><strong>{minutes}<small> min</small></strong><span>de concentración</span></div><div><strong>{focusLogs.length.toString().padStart(2, '0')}</strong><span>sesiones de foco</span></div></div><p className="tiny muted">Cada minuto que te dedicas cuenta.</p></section></div><Suspense fallback={<section className="glass-panel loading-panel">Preparando tu plan…</section>}><StudyPlan tasks={data.tasks} putTask={data.putTask} removeTask={data.removeTask}/></Suspense><div className="widget-column"><MediaWidget/><Ambience theme={theme} onTheme={changeTheme} background={background} onBackground={id => { setBackground(id); writeStored('study:background', id) }}/></div></main>
      <footer className="workspace-footer"><span><CozyIcon name="sprout" size={20}/> Hecho para aprender. Pensado para estar a gusto.</span><span>{completed} {completed === 1 ? 'hito completado' : 'hitos completados'} · Un paso a la vez</span></footer>
    </div>
  </div>
}

export default function App() {
  const { session, loading, authError } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [signingOut, setSigningOut] = useState(false)
  async function signOut() {
    if (!supabase) return
    setSigningOut(true); setLogoutError('')
    try { const { error } = await supabase.auth.signOut({ scope: 'local' }); if (error) setLogoutError('No se pudo cerrar la sesión. Inténtalo de nuevo.') }
    catch { setLogoutError('No se pudo cerrar la sesión. Comprueba tu conexión.') }
    finally { setSigningOut(false) }
  }
  return <><a className="skip-link" href="#mi-espacio">Ir a mi espacio de estudio</a><nav className="topbar" aria-label="Navegación principal"><a href="#" className="brand"><span className="brand-icon"><CozyIcon name="sprout" size={37}/></span><span>study companion<span className="brand-tagline">UN RINCÓN PARA TU MENTE</span></span></a><div className="nav-center"><span className="nav-active"><CozyIcon name="book" size={23}/> Mi espacio</span><span className="nav-caption">Menos ruido. Más tú.</span></div><div className="account-controls">{session ? <><span className="account-name" title={session.user.email}>{session.user.email?.split('@')[0]}</span><button className="secondary-button" disabled={signingOut} onClick={() => void signOut()}>{signingOut ? 'Saliendo…' : 'Cerrar sesión'}</button></> : <><span className="guest-label">Tu calma empieza aquí</span><button className="secondary-button" onClick={() => setAuthOpen(true)} disabled={loading}>Iniciar sesión <CozyIcon name="arrow" size={14}/></button></>}</div></nav>{(authError || logoutError) && <p role="alert" className="error-message">{authError || logoutError}</p>}{loading ? <div className="page-loading"><CozyIcon name="sprout" size={70}/><p>Preparando tu rincón…</p></div> : <StudySpace key={session?.user.id ?? 'guest'} userId={session?.user.id}/>}<Suspense fallback={null}>{authOpen && <AuthModal onClose={() => setAuthOpen(false)}/>}</Suspense></>
}
