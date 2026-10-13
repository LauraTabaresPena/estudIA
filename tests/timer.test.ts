import { describe, expect, it } from 'vitest'
import { completedLog, formatClock, freshTimer, pauseTimer, remainingSeconds, resumeTimer, validDurations } from '../src/lib/timer'

describe('Pomodoro: tiempo real, pausas y recargas', () => {
  it('calcula el tiempo por fecha límite aunque no se ejecuten ticks en segundo plano', () => {
    const timer = resumeTimer(freshTimer('focus', 25), 100000)
    expect(remainingSeconds(timer, 160000)).toBe(1440)
    expect(remainingSeconds(timer, 1700000)).toBe(0)
  })
  it('no cuenta la pausa y conserva el UUID al reanudar', () => {
    const running = resumeTimer(freshTimer('focus', 25), 100000)
    const paused = pauseTimer(running, 160000)
    expect(remainingSeconds(paused, 900000)).toBe(1440)
    const resumed = resumeTimer(paused, 1000000)
    expect(resumed.id).toBe(running.id)
    expect(resumed.startedAt).toBe(running.startedAt)
    expect(remainingSeconds(resumed, 1060000)).toBe(1380)
  })
  it('recupera un ciclo vencido tras recargar y registra la hora real de fin', () => {
    const timer = resumeTimer(freshTimer('focus', 1), 100000)
    const restored = JSON.parse(JSON.stringify(timer))
    const log = completedLog(restored, 300000)
    expect(log?.duration_seconds).toBe(60)
    expect(log?.completed_at).toBe(new Date(160000).toISOString())
    expect(log?.id).toBe(timer.id)
    expect(completedLog({ ...restored, finished: true }, 300000)).toBeNull()
  })
  it('no registra un ciclo incompleto o pausado', () => {
    const timer = resumeTimer(freshTimer('short', 5), 100000)
    expect(completedLog(timer, 120000)).toBeNull()
    expect(completedLog(pauseTimer(timer, 120000), 900000)).toBeNull()
  })
  it('rechaza duraciones no enteras, fuera de rango o ausentes', () => {
    expect(validDurations({ focus: 25, short: 5, long: 15 })).toBe(true)
    expect(validDurations({ focus: 0, short: 5, long: 15 })).toBe(false)
    expect(validDurations({ focus: 25.5, short: 5, long: 15 })).toBe(false)
    expect(validDurations({ focus: 181, short: 5, long: 15 })).toBe(false)
    expect(validDurations({ focus: NaN, short: 5, long: 15 })).toBe(false)
    expect(formatClock(1500)).toBe('25:00')
    expect(formatClock(0)).toBe('00:00')
  })
})
