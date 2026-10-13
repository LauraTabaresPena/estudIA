// Añade tus imágenes a /assets/images/ del proyecto. Vite las optimiza por nombre hash.
const images = import.meta.glob<string>('../../assets/images/*.{webp,avif,jpg,jpeg,png}', { eager: true, query: '?url', import: 'default' })
export const customBackgrounds = Object.entries(images).map(([path, url]) => ({
  id: path.split('/').pop()!, name: path.split('/').pop()!.replace(/\.[^.]+$/, '').replaceAll(/[-_]/g, ' '), url,
}))
export const themes = [
  { id: 'garden', name: 'Jardín', icon: 'sprout' },
  { id: 'sunset', name: 'Atardecer', icon: 'sun' },
  { id: 'night', name: 'Noche', icon: 'moon' },
] as const
