import { themes, customBackgrounds } from '../config/themes'
import { CozyIcon } from './CozyIcon'

export function Ambience({ theme, onTheme, background, onBackground }: { theme: string; onTheme: (theme: string) => void; background: string; onBackground: (id: string) => void }) {
  return <section className="glass-panel ambience-panel" aria-labelledby="ambience-title"><div className="heading-with-icon"><CozyIcon name="sun" size={32}/><h2 id="ambience-title">Hazlo tuyo</h2></div><p className="tiny muted mt-1 mb-4">Un ambiente para cada momento.</p><div className="theme-options">{themes.map(item => <button key={item.id} aria-pressed={theme === item.id} onClick={() => onTheme(item.id)}><span className={`theme-swatch ${item.id}`}><CozyIcon name={item.icon} size={29}/></span><span>{item.name}</span></button>)}</div>{customBackgrounds.length > 0 && <label className="field-label mt-4">Tu fondo<select value={background} onChange={e => onBackground(e.target.value)}><option value="">Jardín ilustrado</option>{customBackgrounds.map(image => <option key={image.id} value={image.id}>{image.name}</option>)}</select></label>}</section>
}
