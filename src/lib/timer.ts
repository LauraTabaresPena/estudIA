import type { Durations, Mode, PomodoroLog } from '../types'

export const defaultDurations: Durations = { focus: 25, short: 5, long: 15 }
export const modeLabels: Record<Mode, string> = { focus: 'Concentración', short: 'Pausa corta', long: 'Pausa larga' }
export interface TimerState {
  id: string
  mode: Mode
  total: number
  remaining: number
  deadline: number | null
  startedAt: string | null
  finished: boolean
}
export function freshTimer(mode: Mode, minutes: number): TimerState {
  return { id: crypto.randomUUID(), mode, total: minutes * 60, remaining: minutes * 60, deadline: null, startedAt: null, finished: false }
}
export function remainingSeconds(timer: TimerState, now = Date.now()) {
  return timer.deadline === null ? timer.remaining : Math.max(0, Math.ceil((timer.deadline - now) / 1000))
}
export function resumeTimer(timer: TimerState, now = Date.now()): TimerState {
  return { ...timer, deadline: now + timer.remaining * 1000, startedAt: timer.startedAt ?? new Date(now).toISOString() }
}
export function pauseTimer(timer: TimerState, now = Date.now()): TimerState {
  return { ...timer, remaining: remainingSeconds(timer, now), deadline: null }
}
export function completedLog(timer: TimerState, now = Date.now()): PomodoroLog | null {
  if (timer.finished || timer.deadline === null || remainingSeconds(timer, now) > 0 || !timer.startedAt) return null
  return { id: timer.id, mode: timer.mode, duration_seconds: timer.total, started_at: timer.startedAt, completed_at: new Date(timer.deadline).toISOString() }
}
export function validDurations(value: Durations) {
  return Object.values(value).length === 3 && ['focus', 'short', 'long'].every(key => {
    const duration = value[key as Mode]
    return Number.isInteger(duration) && duration >= 1 && duration <= 180
  })
}
export function formatClock(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}
