export interface MediaSelection { id: string; title: string; subtitle: string; kind: 'video' | 'playlist'; color: string }

// Nombres editoriales, editables; no son los títulos oficiales de los vídeos.
// Para una playlist: kind: 'playlist', id: 'PL...'. El enlace repetido se incluye una sola vez.
export const mediaSelections: MediaSelection[] = [
  { id: 'XbmvRfaufeE', title: 'Una tarde tranquila', subtitle: 'Tu selección · 01', kind: 'video', color: 'moss' },
  { id: 'VejvBNabeec', title: 'A tu propio ritmo', subtitle: 'Tu selección · 02', kind: 'video', color: 'peach' },
  { id: 'aL4THIvtmiI', title: 'Entre libros', subtitle: 'Tu selección · 03', kind: 'video', color: 'lavender' },
  { id: 'w4s__g3Ac8A', title: 'Un poco de calma', subtitle: 'Tu selección · 04', kind: 'video', color: 'moss' },
  { id: '3u0wlqe8lVk', title: 'En buena compañía', subtitle: 'Tu selección · 05', kind: 'video', color: 'peach' },
  { id: 'Uqo9knga2CE', title: 'Mi momento de foco', subtitle: 'Tu selección · 06', kind: 'video', color: 'lavender' },
]

export function embedUrl(item: MediaSelection) {
  if (item.kind === 'playlist') return `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(item.id)}&rel=0`
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.id)}?rel=0&playsinline=1`
}
