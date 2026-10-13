export type Mode = 'focus' | 'short' | 'long'
export type Durations = Record<Mode, number>
export interface StudyTask {
  id: string
  title: string
  body_markdown: string
  sort_order: number
  completed_at: string | null
}
export interface PomodoroLog {
  id: string
  mode: Mode
  duration_seconds: number
  started_at: string
  completed_at: string
}
