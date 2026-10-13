import { useState } from 'react'
import { embedUrl, mediaSelections } from '../config/media'
import type { MediaSelection } from '../config/media'
import { CozyIcon } from './CozyIcon'

export function MediaWidget() {
  const [selected, setSelected] = useState<MediaSelection | null>(null)
  const [tab, setTab] = useState<'selection' | 'player'>('selection')
  function choose(item: MediaSelection) { setSelected(item); setTab('player') }
  return <section className="glass-panel media-panel" aria-labelledby="media-title">
    <div className="panel-heading"><div className="heading-with-icon"><CozyIcon name="music" size={39}/><div><h2 id="media-title">En buena compañía</h2><p className="tiny muted">Ponle banda sonora a tu sesión</p></div></div></div>
    <div className="media-tabs"><button aria-pressed={tab === 'selection'} onClick={() => setTab('selection')}>Tu selección</button><button aria-pressed={tab === 'player'} onClick={() => setTab('player')}>Reproductor {selected && <span className="playing-dot"/>}</button><span className="youtube-mark" aria-label="YouTube"><CozyIcon name="play" size={13}/>YouTube</span></div>
    <div className={tab === 'selection' ? 'media-view' : 'hidden'}>
      <button className="featured-music" onClick={() => choose(mediaSelections[0])}><span className="album-art"><span className="album-window"/><CozyIcon name="cup" size={75}/><span className="album-sparkle">✦</span></span><span className="featured-caption"><span className="eyebrow">DALE AL PLAY. SUELTA EL RUIDO.</span><strong>{mediaSelections[0].title}</strong><span>Un lugar para concentrarte</span></span><span className="featured-play"><CozyIcon name="play" size={20}/></span></button>
      <div className="playlist-list">{mediaSelections.slice(1).map((item, index) => <button key={item.id} className={`playlist-item ${selected?.id === item.id ? 'selected' : ''}`} onClick={() => choose(item)}><span className={`playlist-art ${item.color}`}><CozyIcon name={(['sprout', 'book', 'cup', 'sun', 'moon'] as const)[index]} size={30}/></span><span className="playlist-text"><strong>{item.title}</strong><span>{item.subtitle}</span></span><CozyIcon name="play" size={16}/></button>)}</div>
    </div>
    <div className={tab === 'player' ? 'media-view player-view' : 'hidden'}>
      {selected ? <><div className="video-frame"><iframe key={selected.id} src={embedUrl(selected)} title={`YouTube · ${selected.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/></div><p className="now-playing-label">EN TU REPRODUCTOR</p><h3>{selected.title}</h3><p className="tiny muted">Usa los controles de YouTube para reproducir, pausar y ajustar el volumen.</p><a className="text-button external-link" href={selected.kind === 'playlist' ? `https://www.youtube.com/playlist?list=${selected.id}` : `https://www.youtube.com/watch?v=${selected.id}`} target="_blank" rel="noreferrer">Abrir en YouTube <CozyIcon name="arrow" size={14}/></a><p className="tiny muted mt-3">Si el propietario no permite insertarlo, puedes escucharlo en YouTube.</p></> : <div className="empty-state"><CozyIcon name="music" size={60}/><p>Elige tu compañía de hoy</p><button className="text-button" onClick={() => setTab('selection')}>Ver mi selección</button></div>}
    </div>
    <p className="media-footnote"><span/> Música a tu gusto. Concentración a tu ritmo.</p>
  </section>
}
