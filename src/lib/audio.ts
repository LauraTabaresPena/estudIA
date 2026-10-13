let context: AudioContext | null = null

export async function unlockAudio() {
  try { context ??= new AudioContext(); if (context.state === 'suspended') await context.resume() }
  catch { /* El aviso visual sigue disponible cuando el navegador bloquea audio. */ }
}
export function playChime() {
  if (!context || context.state !== 'running') return
  ;[523.25, 659.25, 783.99].forEach((frequency, index) => {
    const oscillator = context!.createOscillator()
    const gain = context!.createGain()
    const start = context!.currentTime + index * 0.16
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.09, start + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.75)
    oscillator.connect(gain); gain.connect(context!.destination)
    oscillator.start(start); oscillator.stop(start + 0.8)
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect() }
  })
}
