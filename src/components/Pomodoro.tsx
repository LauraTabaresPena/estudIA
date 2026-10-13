import { useState, type FormEvent } from 'react'
import { usePomodoro } from '../hooks/usePomodoro'
import { formatClock, modeLabels } from '../lib/timer'
import type { Durations, Mode, PomodoroLog } from '../types'
import { CozyIcon } from './CozyIcon'
import { Modal } from './Modal'

export function Pomodoro({ scope, onComplete, cycles }: { scope: string; onComplete: (log: PomodoroLog) => void; cycles: number }) {
  const pomo = usePomodoro(scope, onComplete)
  const [settings, setSettings] = useState(false)
  const [draft, setDraft] = useState<Durations>(pomo.durations)
  const progress = (pomo.timer.total - pomo.remaining) / pomo.timer.total
  const busy = pomo.timer.startedAt !== null && !pomo.timer.finished
  function saveSettings(e: FormEvent) { e.preventDefault(); pomo.configure(draft); setSettings(false) }
  return <section className="glass-panel timer-panel" aria-labelledby="pomodoro-title">
    <div className="panel-heading"><div className="heading-with-icon"><CozyIcon name="timer" size={40}/><h2 id="pomodoro-title">Encuentra tu ritmo</h2></div><button className="icon-button" aria-label="Configurar temporizador" disabled={busy} onClick={() => { setDraft(pomo.durations); setSettings(true) }}><CozyIcon name="settings" size={25}/></button></div>
    <div className="segmented timer-tabs" aria-label="Tipo de sesión">{(['focus', 'short', 'long'] as Mode[]).map(mode => <button key={mode} aria-pressed={pomo.timer.mode === mode} disabled={busy} onClick={() => pomo.selectMode(mode)}>{mode === 'focus' ? 'Foco' : modeLabels[mode]}</button>)}</div>
    <div className="timer-face">
      <svg viewBox="0 0 240 240" className="timer-ring" aria-hidden="true"><circle className="ring-track" cx="120" cy="120" r="108"/><circle className="ring-progress" cx="120" cy="120" r="108" strokeDasharray={678.58} strokeDashoffset={678.58 * (1 - progress)} transform="rotate(-90 120 120)"/></svg>
      <div className="timer-content"><span className="timer-eyebrow">{pomo.timer.mode === 'focus' ? 'UN PASO A LA VEZ' : 'RESPIRA UN POCO'}</span><span className="timer-digits" role="timer" aria-label={`${pomo.remaining} segundos restantes`}>{formatClock(pomo.remaining)}</span><span className="timer-caption">{pomo.timer.finished ? 'Lo has hecho muy bien' : pomo.timer.deadline ? 'Este momento es para ti' : busy ? 'Sin prisa. Aquí te esperamos' : 'Tu momento de concentración'}</span><span className="timer-leaf"><CozyIcon name={pomo.timer.mode === 'focus' ? 'sprout' : 'cup'} size={33}/></span></div>
    </div>
    <div className="timer-controls"><button className="icon-button reset-button" aria-label="Reiniciar ciclo sin guardarlo" onClick={pomo.reset}><CozyIcon name="reset" size={26}/></button><button className="primary-button timer-start" onClick={pomo.toggle}><CozyIcon name={pomo.timer.deadline ? 'pause' : 'play'} size={22}/>{pomo.timer.deadline ? 'Pausar' : pomo.timer.finished ? 'Otra sesión' : busy ? 'Continuar' : 'Comenzar'}</button><button className="icon-button" aria-label={pomo.sound ? 'Desactivar sonido' : 'Activar sonido'} aria-pressed={pomo.sound} onClick={pomo.toggleSound}><CozyIcon name={pomo.sound ? 'volume' : 'muted'} size={29}/></button></div>
    <div className="cycle-summary"><div className="cycle-dots" aria-hidden="true">{[0, 1, 2, 3].map(i => <span className={i < cycles % 4 || cycles > 0 && cycles % 4 === 0 ? 'filled' : ''} key={i}/>)}</div><span>{cycles} {cycles === 1 ? 'sesión completada' : 'sesiones completadas'} hoy</span></div>
    <p className="timer-notice" role="status">{pomo.notice || (busy ? 'Reinicia el ciclo para cambiar sus ajustes.' : 'Después de 4 sesiones, regálate una pausa larga.')}</p>
    {settings && <Modal title="Tu ritmo, tus tiempos" onClose={() => setSettings(false)}><p className="muted mb-5">Elige la duración de cada ciclo. Las pausas empiezan cuando tú decidas.</p><form onSubmit={saveSettings} className="space-y-4">{(['focus', 'short', 'long'] as Mode[]).map(mode => <label key={mode} className="field-label">{modeLabels[mode]} · minutos<input type="number" min={1} max={180} step={1} required value={draft[mode] || ''} onChange={e => setDraft({ ...draft, [mode]: Number(e.target.value) })}/></label>)}<button className="primary-button w-full" type="submit">Guardar mis tiempos</button></form></Modal>}
  </section>
}

