import { useMemo, useState, type FormEvent } from 'react'
import type { StudyTask } from '../types'
import { CozyIcon } from './CozyIcon'
import { Modal } from './Modal'
import { safeMarkdown } from '../lib/markdown'

function TaskBody({ source }: { source: string }) {
  const html = useMemo(() => safeMarkdown(source), [source])
  return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }}/>
}

export default function StudyPlan({ tasks, putTask, removeTask }: { tasks: StudyTask[]; putTask: (task: StudyTask) => void; removeTask: (id: string) => void }) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editing, setEditing] = useState<StudyTask | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const done = tasks.filter(task => task.completed_at).length
  const percent = tasks.length ? Math.round(done / tasks.length * 100) : 0
  const visibleTasks = tasks.filter(task => filter === 'all' || (filter === 'done' ? task.completed_at : !task.completed_at))
  function createTask() {
    setConfirmDelete(false)
    setEditing({ id: crypto.randomUUID(), title: '', body_markdown: '', sort_order: Math.max(-1, ...tasks.map(task => task.sort_order)) + 1, completed_at: null })
  }
  function saveTask(event: FormEvent) {
    event.preventDefault()
    if (!editing?.title.trim()) return
    putTask({ ...editing, title: editing.title.trim() }); setEditing(null)
  }
  return <section className="glass-panel study-panel" aria-labelledby="study-title">
    <div className="panel-heading"><div className="heading-with-icon"><CozyIcon name="book" size={42}/><div><h2 id="study-title">Mi plan de estudio</h2><p className="tiny muted">Las grandes metas empiezan aquí</p></div></div><span className="soft-badge">A tu ritmo</span></div>
    <div className="plan-progress"><div className="flex justify-between items-end"><div><span className="eyebrow">UN POQUITO MÁS CERCA</span><p><strong>{done}</strong> de {tasks.length} hitos completados</p></div><span className="progress-number">{percent}<small>%</small></span></div><div className="progress-track" role="progressbar" aria-label="Progreso del plan" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }}/></div></div>
    <div className="plan-toolbar"><div className="filter-tabs" aria-label="Filtrar hitos">{([['all', 'Todos'], ['pending', 'Pendientes'], ['done', 'Hechos']] as const).map(([value, label]) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div><span className="tiny muted">{visibleTasks.length} hitos</span></div>
    <div className="task-list">
      {visibleTasks.length === 0 && <div className="empty-state"><CozyIcon name={filter === 'pending' && tasks.length > 0 ? 'check' : 'sprout'} size={54}/><p>{filter === 'pending' && tasks.length > 0 ? '¡Todo por hoy! Disfruta de tu pausa.' : filter === 'done' ? 'Cada pequeño avance cuenta.' : 'Tu próximo paso empieza aquí.'}</p><span>{filter === 'all' ? 'Añade tu primer hito para darle forma a tu plan.' : 'Tus hitos aparecerán en este espacio.'}</span></div>}
      {visibleTasks.map((task, index) => <article key={task.id} className={`task-card ${task.completed_at ? 'task-done' : ''}`}>
        <div className="task-main"><input type="checkbox" className="task-checkbox" checked={Boolean(task.completed_at)} onChange={() => putTask({ ...task, completed_at: task.completed_at ? null : new Date().toISOString() })} aria-label={`Completar: ${task.title}`}/><button className="task-expand" aria-expanded={expanded === task.id} aria-controls={`detail-${task.id}`} onClick={() => setExpanded(expanded === task.id ? null : task.id)}><span className="task-kicker">PASO {String(tasks.indexOf(task) + 1).padStart(2, '0')}</span><span className="task-title">{task.title}</span><span className="task-subtitle">{task.completed_at ? 'Un pequeño logro, una gran sensación' : ['Empieza con intención', 'Dale espacio a la curiosidad', 'Aprender también es intentarlo', 'Celebra lo que has avanzado'][index % 4]}</span></button><button className="icon-button task-edit" aria-label={`Editar: ${task.title}`} onClick={() => { setConfirmDelete(false); setEditing(task) }}><CozyIcon name="edit" size={22}/></button></div>
        {expanded === task.id && <div id={`detail-${task.id}`} className="task-details"><TaskBody source={task.body_markdown || '_Añade tus apuntes desde el botón de editar._'}/></div>}
      </article>)}
    </div>
    <button className="add-task" onClick={createTask}><CozyIcon name="plus" size={21}/> Añadir un nuevo hito</button>
    <div className="plan-footer"><CozyIcon name="sprout" size={28}/><span>No necesitas hacerlo todo. Solo dar el siguiente paso.</span></div>
    {editing && <Modal title={tasks.some(t => t.id === editing.id) ? 'Dale forma a tu hito' : 'Un nuevo pequeño paso'} onClose={() => setEditing(null)}><form onSubmit={saveTask} className="space-y-4"><label className="field-label">¿Qué quieres conseguir?<input autoFocus required maxLength={160} value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="Por ejemplo: repasar el capítulo 3"/></label><label className="field-label">Apuntes y detalles<textarea rows={7} maxLength={20000} value={editing.body_markdown} onChange={e => setEditing({ ...editing, body_markdown: e.target.value })} placeholder="Añade tu plan en Markdown o HTML…"/></label><p className="tiny muted">Admite títulos, listas, enlaces, tablas y texto en negrita. El HTML se filtra para proteger tu espacio.</p><button type="submit" className="primary-button w-full">Guardar hito</button>{tasks.some(t => t.id === editing.id) && <button className="text-button delete-button w-full" type="button" onClick={() => { if (confirmDelete) { removeTask(editing.id); setEditing(null) } else setConfirmDelete(true) }}>{confirmDelete ? 'Confirmar: eliminar este hito' : 'Eliminar hito'}</button>}</form></Modal>}
  </section>
}
