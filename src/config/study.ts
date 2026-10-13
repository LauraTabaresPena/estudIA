import type { StudyTask } from '../types'

// Plantilla editable. Las cuentas nuevas empiezan con su propio plan vacío.
export const starterTasks: StudyTask[] = [
  { id: 'objetivo', title: 'Define el objetivo de hoy', body_markdown: 'Escribe qué quieres **comprender o practicar** al terminar tu sesión. Un objetivo pequeño y concreto es un buen comienzo.', sort_order: 0, completed_at: null },
  { id: 'lectura', title: 'Lee y conecta las ideas', body_markdown: 'Selecciona una sección de tus apuntes. Identifica sus tres ideas principales y relaciónalas con lo que ya sabes.', sort_order: 1, completed_at: null },
  { id: 'practica', title: 'Pon a prueba lo que sabes', body_markdown: 'Cierra los apuntes y resuelve un ejercicio o explica el tema con tus propias palabras. Después, revisa tus dudas.', sort_order: 2, completed_at: null },
  { id: 'repaso', title: 'Deja preparado tu próximo paso', body_markdown: 'Anota lo que necesitas repasar y elige una tarea concreta para tu siguiente sesión.', sort_order: 3, completed_at: null },
]
