import { useEffect, useId, useRef, type ReactNode } from 'react'
import { CozyIcon } from './CozyIcon'

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const element = ref.current!
    const previous = document.activeElement as HTMLElement | null
    element.showModal()
    return () => { element.close(); previous?.focus() }
  }, [])
  return <dialog ref={ref} className="modal" aria-labelledby={titleId} onCancel={onClose} onClick={event => { if (event.target === ref.current) onClose() }}>
    <div className="modal-inner">
      <div className="flex items-center justify-between gap-4 mb-6"><h2 id={titleId}>{title}</h2><button type="button" className="icon-button" aria-label="Cerrar" onClick={onClose}><CozyIcon name="close" size={24}/></button></div>
      {children}
    </div>
  </dialog>
}
