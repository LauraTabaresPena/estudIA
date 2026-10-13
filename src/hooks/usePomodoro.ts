import { useEffect, useRef, useState } from 'react'
import { completedLog, defaultDurations, freshTimer, pauseTimer, remainingSeconds, resumeTimer, validDurations } from '../lib/timer'
import type { TimerState } from '../lib/timer'
import { readStored, writeStored } from '../lib/storage'
import { playChime, unlockAudio } from '../lib/audio'
import type { Durations, Mode, PomodoroLog } from '../types'

export function usePomodoro(scope: string, onComplete: (log: PomodoroLog) => void) {
  const key = `study:timer:v1:${scope}`
  const [durations, setDurations] = useState<Durations>(() => {
    const saved = readStored<Durations>(`${key}:durations`, defaultDurations)
    return saved && validDurations(saved) ? saved : defaultDurations
  })
  const [timer, setTimer] = useState<TimerState>(() => {
    const saved = readStored<TimerState | null>(key, null)
    return saved && ['focus', 'short', 'long'].includes(saved.mode) && Number.isFinite(saved.total) && saved.total >= 60 && saved.total <= 10800 && Number.isFinite(saved.remaining) && saved.remaining >= 0 && saved.remaining <= saved.total && (saved.deadline === null || Number.isFinite(saved.deadline)) ? saved : freshTimer('focus', durations.focus)
  })
  const [remaining, setRemaining] = useState(() => remainingSeconds(timer))
  const [sound, setSound] = useState(() => readStored(`${key}:sound`, true))
  const [notice, setNotice] = useState('')
  const callback = useRef(onComplete)
  const completedId = useRef<string | null>(null)
  callback.current = onComplete

  useEffect(() => {
    // Una recarga pierde el AudioContext; el primer gesto vuelve a habilitarlo.
    const unlock = () => { void unlockAudio() }
    document.addEventListener('pointerdown', unlock, { once: true })
    document.addEventListener('keydown', unlock, { once: true })
    return () => { document.removeEventListener('pointerdown', unlock); document.removeEventListener('keydown', unlock) }
  }, [])

  function update(next: TimerState) { writeStored(key, next); setTimer(next); setRemaining(remainingSeconds(next)) }

  useEffect(() => {
    if (timer.deadline === null) return
    const tick = () => {
      setRemaining(remainingSeconds(timer))
      const log = completedLog(timer)
      if (!log || completedId.current === log.id) return
      completedId.current = log.id
      // El UUID hace que reanudar, recargar y reintentar nunca sumen dos ciclos.
      callback.current(log)
      const finished = { ...timer, remaining: 0, deadline: null, finished: true }
      writeStored(key, finished); setTimer(finished)
      setNotice(timer.mode === 'focus' ? '¡Sesión completada! Te has ganado una pausa.' : 'Pausa completada. Vuelve cuando estés listo.')
      if (sound) playChime()
    }
    tick()
    const interval = window.setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', tick) }
  }, [timer, sound, key])

  useEffect(() => {
    const previous = document.title
    return () => { document.title = previous }
  }, [])
  useEffect(() => {
    document.title = timer.deadline ? `${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')} · Study Companion` : 'Study Companion · Tu rincón de estudio'
  }, [remaining, timer.deadline])

  function toggle() {
    void unlockAudio()
    if (timer.deadline !== null) {
      // No convertir en pausa un ciclo que ya terminó entre dos ticks.
      const log = completedLog(timer)
      if (log) { callback.current(log); update({ ...timer, deadline: null, remaining: 0, finished: true }); setNotice('¡Ciclo completado!'); if (sound) playChime(); return }
      update(pauseTimer(timer)); return
    }
    setNotice('')
    update(resumeTimer(timer.finished ? freshTimer(timer.mode, durations[timer.mode]) : timer))
  }
  function selectMode(mode: Mode) { setNotice(''); update(freshTimer(mode, durations[mode])) }
  function configure(next: Durations) {
    if (!validDurations(next)) return
    setDurations(next); writeStored(`${key}:durations`, next)
    update(freshTimer(timer.mode, next[timer.mode])); setNotice('Duraciones guardadas. Empieza cuando quieras.')
  }
  function toggleSound() { void unlockAudio(); setSound(!sound); writeStored(`${key}:sound`, !sound) }
  return { timer, remaining, durations, sound, notice, toggle, selectMode, configure, toggleSound, reset: () => selectMode(timer.mode) }
}
