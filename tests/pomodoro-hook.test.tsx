// @vitest-environment jsdom
import { act, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { usePomodoro } from '../src/hooks/usePomodoro'
import type { PomodoroLog } from '../src/types'

vi.mock('../src/lib/audio', () => ({ unlockAudio: vi.fn(), playChime: vi.fn() }))

let host: HTMLDivElement
let root: ReturnType<typeof createRoot>
let api: ReturnType<typeof usePomodoro>
const complete = vi.fn<(log: PomodoroLog) => void>()
function Harness() { api = usePomodoro('test-user', complete); return <div>{api.remaining}</div> }

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  vi.useFakeTimers()
  localStorage.clear()
  complete.mockClear()
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
})
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.useRealTimers() })

it('completa una sola vez en StrictMode y mantiene el estado tras volver a montar', async () => {
  await act(async () => root.render(<StrictMode><Harness/></StrictMode>))
  await act(async () => api.configure({ focus: 1, short: 5, long: 15 }))
  await act(async () => api.toggle())
  await act(async () => vi.advanceTimersByTime(61000))
  expect(complete).toHaveBeenCalledTimes(1)
  expect(complete.mock.calls[0][0].duration_seconds).toBe(60)
  expect(api.timer.finished).toBe(true)
  await act(async () => root.unmount())
  root = createRoot(host)
  await act(async () => root.render(<StrictMode><Harness/></StrictMode>))
  await act(async () => vi.advanceTimersByTime(5000))
  expect(complete).toHaveBeenCalledTimes(1)
  expect(api.remaining).toBe(0)
})

it('pausar conserva el tiempo y reiniciar no genera registros', async () => {
  await act(async () => root.render(<Harness/>))
  await act(async () => api.toggle())
  await act(async () => vi.advanceTimersByTime(10000))
  await act(async () => api.toggle())
  const paused = api.remaining
  await act(async () => vi.advanceTimersByTime(50000))
  expect(api.remaining).toBe(paused)
  await act(async () => api.reset())
  expect(api.remaining).toBe(1500)
  expect(complete).not.toHaveBeenCalled()
})
