import { useId } from 'react'

export type IconName = 'sprout' | 'timer' | 'book' | 'music' | 'cup' | 'sun' | 'moon' | 'check' | 'play' | 'pause' | 'reset' | 'settings' | 'plus' | 'close' | 'volume' | 'muted' | 'arrow' | 'cloud' | 'edit'

export function CozyIcon({ name, size = 28, className = '' }: { name: IconName; size?: number; className?: string }) {
  const id = useId().replaceAll(':', '')
  return <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className={`cozy-icon ${className}`}>
    <defs>
      <linearGradient id={`${id}-green`} x1="10" y1="6" x2="48" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#b8cf8f"/><stop offset="1" stopColor="#6d925c"/></linearGradient>
      <linearGradient id={`${id}-peach`} x1="15" y1="9" x2="52" y2="54" gradientUnits="userSpaceOnUse"><stop stopColor="#ffe0ac"/><stop offset="1" stopColor="#df9b79"/></linearGradient>
      <linearGradient id={`${id}-lilac`} x1="13" y1="10" x2="48" y2="54" gradientUnits="userSpaceOnUse"><stop stopColor="#e0d4ed"/><stop offset="1" stopColor="#a38cbb"/></linearGradient>
    </defs>
    {name === 'sprout' && <><ellipse cx="32" cy="55" rx="19" ry="4" fill="#48664d" opacity=".12"/><path d="M31 51V26" stroke="#5a7548" strokeWidth="5" strokeLinecap="round"/><path d="M32 38C8 41 7 19 11 14c18-1 26 10 21 24Z" fill={`url(#${id}-green)`} stroke="#6b8955" strokeWidth="2"/><path d="M33 29C30 11 45 5 55 9c2 17-9 25-22 20Z" fill="#759a64" stroke="#5f8052" strokeWidth="2"/><path d="m18 24 13 13M44 17 33 28" stroke="#e7edc9" strokeWidth="2.5" strokeLinecap="round"/></>}
    {name === 'timer' && <><ellipse cx="32" cy="56" rx="22" ry="4" fill="#a16551" opacity=".12"/><rect x="25" y="4" width="14" height="9" rx="4" fill="#ae8668"/><path d="m47 14 5-5" stroke="#ae8668" strokeWidth="6" strokeLinecap="round"/><circle cx="32" cy="34" r="23" fill={`url(#${id}-peach)`} stroke="#c38b70" strokeWidth="2"/><circle cx="32" cy="34" r="17" fill="#fff9e9"/><path d="M32 23v12l8 5" stroke="#9b715c" strokeWidth="3.5" strokeLinecap="round"/><circle cx="32" cy="34" r="3" fill="#9b715c"/><path d="M18 21c2-3 5-5 9-5" stroke="#fff2d2" strokeWidth="3" strokeLinecap="round"/></>}
    {name === 'book' && <><ellipse cx="32" cy="55" rx="23" ry="4" fill="#776594" opacity=".12"/><path d="M8 15q12-5 24 3 12-8 24-3v34q-12-4-24 3-12-7-24-3Z" fill={`url(#${id}-lilac)`} stroke="#9a82ab" strokeWidth="2"/><path d="M12 11q10-2 20 5 10-7 20-5v31q-10-2-20 5-10-7-20-5Z" fill="#fff8e8"/><path d="M32 17v29M17 20l9 3M17 27l9 3M17 34l7 2M38 23l9-3M38 30l9-3" stroke="#c7b9a5" strokeWidth="2" strokeLinecap="round"/><path d="M42 10v14l4-3 4 1V10" fill="#dfa68a"/></>}
    {name === 'music' && <><ellipse cx="31" cy="55" rx="22" ry="4" fill="#5b695a" opacity=".12"/><path d="M12 34v-6a20 20 0 0 1 40 0v6" stroke="#5f795b" strokeWidth="8" strokeLinecap="round"/><path d="M16 25a16 16 0 0 1 32 0" stroke="#c8d6b3" strokeWidth="3" strokeLinecap="round"/><rect x="8" y="28" width="14" height="24" rx="7" fill={`url(#${id}-green)`} stroke="#67885b" strokeWidth="2"/><rect x="42" y="28" width="14" height="24" rx="7" fill={`url(#${id}-green)`} stroke="#67885b" strokeWidth="2"/><path d="M13 35v10M47 35v10" stroke="#dce6c6" strokeWidth="3" strokeLinecap="round"/></>}
    {name === 'cup' && <><ellipse cx="31" cy="55" rx="25" ry="4" fill="#a87651" opacity=".12"/><path d="M47 25h5c12 0 10 21-6 19" stroke="#d5a07e" strokeWidth="6"/><path d="M10 24h38v19c0 15-38 15-38 0Z" fill={`url(#${id}-peach)`} stroke="#c4926e" strokeWidth="2"/><ellipse cx="29" cy="24" rx="19" ry="5" fill="#eecba2"/><ellipse cx="29" cy="24" rx="15" ry="3" fill="#92705a"/><path d="M20 17c-8-7 5-7 0-14M34 15c-7-7 5-7 0-13" stroke="#c2b5a0" strokeWidth="2.5" strokeLinecap="round"/><path d="M23 36q5-5 7 0 5-5 7 0c0 5-7 9-7 9s-7-4-7-9" fill="#fff0d5"/></>}
    {name === 'sun' && <><path d="M32 3v6M32 55v6M3 32h6M55 32h6M11 11l5 5M48 48l5 5M11 53l5-5M48 16l5-5" stroke="#dcb369" strokeWidth="4" strokeLinecap="round"/><circle cx="32" cy="32" r="18" fill={`url(#${id}-peach)`} stroke="#dbad61" strokeWidth="2"/><path d="M23 31h1m15 0h1M27 39q5 4 10 0" stroke="#9b7548" strokeWidth="3" strokeLinecap="round"/></>}
    {name === 'moon' && <path d="M44 7a24 24 0 1 0 13 35C32 49 21 20 44 7Z" fill={`url(#${id}-lilac)`} stroke="#9b88ad" strokeWidth="2"/>}
    {name === 'cloud' && <path d="M17 49h31c19 0 17-25 3-24C49 5 21 4 16 24-2 23-2 49 17 49Z" fill="#c9dac4" stroke="#77926d" strokeWidth="3"/>}
    {name === 'check' && <><circle cx="32" cy="32" r="24" fill={`url(#${id}-green)`}/><path d="m20 32 8 8 17-18" stroke="#fff9e9" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></>}
    {name === 'play' && <path d="M22 13c-2-1-4 0-4 3v32c0 3 2 4 4 3l27-17c2-1 2-3 0-4Z" fill="currentColor"/>}
    {name === 'pause' && <><rect x="16" y="12" width="11" height="40" rx="4" fill="currentColor"/><rect x="37" y="12" width="11" height="40" rx="4" fill="currentColor"/></>}
    {name === 'reset' && <><path d="M15 22a20 20 0 1 1-1 20" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/><path d="M13 9v17h17" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></>}
    {name === 'settings' && <><path d="M13 15h38M13 32h38M13 49h38" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/><circle cx="24" cy="15" r="6" fill="#dcb590" stroke="currentColor" strokeWidth="3"/><circle cx="41" cy="32" r="6" fill="#bed09f" stroke="currentColor" strokeWidth="3"/><circle cx="25" cy="49" r="6" fill="#c5b4d8" stroke="currentColor" strokeWidth="3"/></>}
    {name === 'plus' && <path d="M32 14v36M14 32h36" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>}
    {name === 'close' && <path d="m17 17 30 30m0-30L17 47" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>}
    {(name === 'volume' || name === 'muted') && <><path d="M10 24h11l14-12v40L21 40H10Z" fill={`url(#${id}-peach)`} stroke="#9e7d62" strokeWidth="3" strokeLinejoin="round"/>{name === 'volume' ? <path d="M43 24q9 8 0 16m6-23q17 15 0 30" stroke="#9e7d62" strokeWidth="3" strokeLinecap="round"/> : <path d="m44 25 12 14m0-14L44 39" stroke="#9e7d62" strokeWidth="3" strokeLinecap="round"/>}</>}
    {name === 'arrow' && <path d="m26 16 16 16-16 16" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>}
    {name === 'edit' && <><path d="m17 38 25-25 10 10-25 25-14 4Z" fill={`url(#${id}-peach)`} stroke="#95745e" strokeWidth="3" strokeLinejoin="round"/><path d="m36 19 10 10M17 38l10 10" stroke="#95745e" strokeWidth="3"/></>}
  </svg>
}

export function DeskIllustration() {
  return <svg viewBox="0 0 220 135" aria-hidden="true" className="desk-illustration">
    <ellipse cx="111" cy="119" rx="98" ry="8" fill="#5a7154" opacity=".12"/>
    <rect x="62" y="95" width="113" height="18" rx="5" fill="#b095ba"/><path d="M72 99h97v9H72" fill="#f4eada"/><path d="M72 103h92" stroke="#d6cab8"/>
    <rect x="74" y="77" width="103" height="18" rx="5" fill="#7d9a70"/><path d="M85 81h86v9H85" fill="#fff2d9"/>
    <rect x="64" y="57" width="105" height="19" rx="5" transform="rotate(-6 64 57)" fill="#daa380"/><path d="m75 60 88-9 1 9-88 9" fill="#f9edd5"/><path d="m145 54 2 20 6-5 6 4-2-20" fill="#b86e5c"/>
    <path d="M18 83h37l-4 30H23Z" fill="#c9987d"/><path d="M16 80h42v8H16Z" fill="#dbad91"/>
    <path d="M37 82V46" stroke="#526d4c" strokeWidth="3"/><path d="M36 68C8 65 15 42 18 40c20 1 23 14 18 28" fill="#88a470"/><path d="M37 58c-3-24 12-30 22-25 1 23-10 27-22 25" fill="#628650"/><path d="m24 49 13 20m14-28L38 58" stroke="#b3c797" strokeWidth="2"/>
    <path d="M178 79h23v23c0 12-23 12-23 0Z" fill="#f2d2a2"/><path d="M201 82c18-3 14 20 0 17" fill="none" stroke="#ddbb8d" strokeWidth="5"/><ellipse cx="189" cy="79" rx="12" ry="3" fill="#a78866"/><path d="M184 69c-7-9 8-8 2-17m8 16c-4-7 5-9 2-14" fill="none" stroke="#aaa88e" strokeWidth="2" strokeLinecap="round"/>
    <path d="m101 23 2 7 7 2-7 2-2 7-2-7-7-2 7-2Zm75-12 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#bfaa6f"/>
  </svg>
}
