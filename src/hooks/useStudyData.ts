import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { readStored, writeStored } from '../lib/storage'
import { starterTasks } from '../config/study'
import type { StudyTask, PomodoroLog } from '../types'

type Change = { token: string; id: string; task: StudyTask | null }
interface Cache { tasks: StudyTask[]; logs: PomodoroLog[]; changes: Change[]; pendingLogs: PomodoroLog[] }
type SyncStatus = 'local' | 'syncing' | 'saved' | 'offline' | 'error'

export function useStudyData(userId?: string) {
  const key = `study:data:v1:${userId ?? 'guest'}`
  const [cache, setCache] = useState<Cache>(() => {
    const empty: Cache = { tasks: userId ? [] : starterTasks, logs: [], changes: [], pendingLogs: [] }
    const stored = readStored<Cache>(key, empty)
    return stored && ['tasks', 'logs', 'changes', 'pendingLogs'].every(k => Array.isArray(stored[k as keyof Cache])) ? stored : empty
  })
  const current = useRef(cache)
  const alive = useRef(true)
  const inFlight = useRef(false)
  const [status, setStatus] = useState<SyncStatus>(userId ? 'syncing' : 'local')
  const [error, setError] = useState('')
  const [storageError, setStorageError] = useState(false)
  const save = useCallback((next: Cache) => {
    current.current = next
    const persisted = writeStored(key, next)
    if (alive.current) { setCache(next); setStorageError(!persisted) }
  }, [key])

  const sync = useCallback(async () => {
    const client = supabase
    if (!client || !userId || inFlight.current || !alive.current) return
    if (!navigator.onLine) { setStatus('offline'); return }
    inFlight.current = true
    setStatus('syncing'); setError('')
    try {
      const profile = await client.from('users').upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true })
      if (profile.error) throw profile.error
      // Cola persistente: solo se elimina una operación después de confirmación del servidor.
      while (alive.current && (current.current.changes.length || current.current.pendingLogs.length)) {
        const operation = current.current.changes[0]
        if (operation) {
          const result = operation.task
            ? await client.from('study_plans').upsert({ ...operation.task, user_id: userId }, { onConflict: 'user_id,id' })
            : await client.from('study_plans').delete().eq('user_id', userId).eq('id', operation.id)
          if (result.error) throw result.error
          save({ ...current.current, changes: current.current.changes.filter(item => item.token !== operation.token) })
        } else {
          const log = current.current.pendingLogs[0]
          const result = await client.from('pomodoro_logs').insert({ ...log, user_id: userId })
          // Mismo UUID tras reintentar una respuesta perdida = ciclo ya registrado.
          if (result.error && result.error.code !== '23505') throw result.error
          save({ ...current.current, pendingLogs: current.current.pendingLogs.filter(item => item.id !== log.id) })
        }
      }
      if (!alive.current) return
      const remoteTasks: StudyTask[] = []
      const remoteLogs: PomodoroLog[] = []
      // Paginación explícita para no truncar silenciosamente el progreso a 1.000 filas.
      for (let offset = 0; ; offset += 1000) {
        const result = await client.from('study_plans').select('id,title,body_markdown,sort_order,completed_at').eq('user_id', userId).order('id').range(offset, offset + 999)
        if (result.error) throw result.error
        remoteTasks.push(...result.data)
        if (result.data.length < 1000) break
      }
      for (let offset = 0; ; offset += 1000) {
        const result = await client.from('pomodoro_logs').select('id,mode,duration_seconds,started_at,completed_at').eq('user_id', userId).order('id').range(offset, offset + 999)
        if (result.error) throw result.error
        remoteLogs.push(...result.data as PomodoroLog[])
        if (result.data.length < 1000) break
      }
      if (!alive.current) return
      const taskMap = new Map(remoteTasks.map(task => [task.id, task]))
      current.current.changes.forEach(change => change.task ? taskMap.set(change.id, change.task) : taskMap.delete(change.id))
      const logMap = new Map([...remoteLogs, ...current.current.pendingLogs].map(log => [log.id, log]))
      save({ ...current.current, tasks: [...taskMap.values()], logs: [...logMap.values()] })
      setStatus('saved')
    } catch (cause) {
      if (alive.current) {
        setStatus(navigator.onLine ? 'error' : 'offline')
        setError(cause instanceof Error ? cause.message : 'No se pudo sincronizar. Comprueba la conexión y el esquema de Supabase.')
      }
    } finally { inFlight.current = false }
  }, [userId, save])

  useEffect(() => {
    alive.current = true
    void sync()
    const online = () => { void sync() }
    const offline = () => { if (userId) setStatus('offline') }
    const visible = () => { if (document.visibilityState === 'visible') void sync() }
    window.addEventListener('online', online); window.addEventListener('offline', offline)
    document.addEventListener('visibilitychange', visible)
    return () => { alive.current = false; window.removeEventListener('online', online); window.removeEventListener('offline', offline); document.removeEventListener('visibilitychange', visible) }
  }, [sync, userId])

  useEffect(() => {
    if (!userId || status === 'syncing' || status === 'error' || status === 'offline' || (!cache.changes.length && !cache.pendingLogs.length)) return
    const timeout = window.setTimeout(() => { void sync() }, 700)
    return () => clearTimeout(timeout)
  }, [cache.changes, cache.pendingLogs, sync, userId, status])

  function putTask(task: StudyTask) {
    const tasks = [...current.current.tasks.filter(item => item.id !== task.id), task]
    const changes = userId ? [...current.current.changes, { token: crypto.randomUUID(), id: task.id, task }] : []
    save({ ...current.current, tasks, changes })
  }
  function removeTask(id: string) {
    const changes = userId ? [...current.current.changes, { token: crypto.randomUUID(), id, task: null }] : []
    save({ ...current.current, tasks: current.current.tasks.filter(item => item.id !== id), changes })
  }
  function addLog(log: PomodoroLog) {
    if (current.current.logs.some(item => item.id === log.id)) return
    save({ ...current.current, logs: [...current.current.logs, log], pendingLogs: userId ? [...current.current.pendingLogs, log] : [] })
  }
  return { tasks: [...cache.tasks].sort((a, b) => a.sort_order - b.sort_order), logs: cache.logs, putTask, removeTask, addLog, status, error, storageError, sync }
}
