'use client'

import { useRef, useState, useCallback } from 'react'

type SoundId = 'bells' | 'river' | 'birds' | 'harmonium' | 'bowl'

const SOUNDS: { id: SoundId; emoji: string; label: string; color: string }[] = [
  { id: 'bells',     emoji: '🔔', label: 'Temple Bells',   color: '#fbbf24' },
  { id: 'river',     emoji: '🌊', label: 'River',          color: '#60a5fa' },
  { id: 'birds',     emoji: '🐦', label: 'Dawn Birds',     color: '#34d399' },
  { id: 'harmonium', emoji: '🎵', label: 'Harmonium',      color: '#c084fc' },
  { id: 'bowl',      emoji: '🙏', label: 'Singing Bowl',   color: '#fb923c' },
]

export default function TempleAmbience() {
  const [isOpen, setIsOpen] = useState(false)
  const [active, setActive] = useState<Set<SoundId>>(new Set())
  const [volume, setVolume] = useState(0.6)

  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const nodesRef = useRef<Partial<Record<SoundId, { stop: () => void }>>>({})
  const bellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const birdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const master = ctx.createGain()
      master.gain.value = volume
      master.connect(ctx.destination)
      ctxRef.current = ctx
      masterRef.current = master
    }
    return { ctx: ctxRef.current, master: masterRef.current! }
  }, [volume])

  const startBells = useCallback(() => {
    const { ctx, master } = ensureCtx()
    const scheduleNext = () => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 880 + Math.random() * 320
      g.gain.setValueAtTime(0, ctx.currentTime)
      g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5)
      o.connect(g); g.connect(master)
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 2.5)
      const next = 3000 + Math.random() * 5000
      bellTimerRef.current = setTimeout(scheduleNext, next)
    }
    scheduleNext()
    nodesRef.current.bells = { stop: () => { if (bellTimerRef.current) clearTimeout(bellTimerRef.current) } }
  }, [ensureCtx])

  const startRiver = useCallback(() => {
    const { ctx, master } = ensureCtx()
    const buf = ctx.createBuffer(2, ctx.sampleRate * 4, ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c)
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.3
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 800
    filter.Q.value = 0.5
    const g = ctx.createGain(); g.gain.value = 0.5
    src.connect(filter); filter.connect(g); g.connect(master)
    src.start()
    nodesRef.current.river = { stop: () => src.stop() }
  }, [ensureCtx])

  const startBirds = useCallback(() => {
    const { ctx, master } = ensureCtx()
    const scheduleChirp = () => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      const baseFreq = 2000 + Math.random() * 1500
      o.frequency.setValueAtTime(baseFreq, ctx.currentTime)
      o.frequency.linearRampToValueAtTime(baseFreq * 1.3, ctx.currentTime + 0.08)
      o.frequency.linearRampToValueAtTime(baseFreq, ctx.currentTime + 0.16)
      g.gain.setValueAtTime(0, ctx.currentTime)
      g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16)
      o.connect(g); g.connect(master)
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.2)
      birdTimerRef.current = setTimeout(scheduleChirp, 800 + Math.random() * 3000)
    }
    scheduleChirp()
    nodesRef.current.birds = { stop: () => { if (birdTimerRef.current) clearTimeout(birdTimerRef.current) } }
  }, [ensureCtx])

  const startHarmonium = useCallback(() => {
    const { ctx, master } = ensureCtx()
    const g = ctx.createGain(); g.gain.value = 0.08
    const oscs = [110, 220, 330].map(freq => {
      const o = ctx.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = freq
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.value = 5; lfoGain.gain.value = 1.5
      lfo.connect(lfoGain); lfoGain.connect(o.frequency)
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'; filter.frequency.value = 600
      o.connect(filter); filter.connect(g)
      lfo.start(); o.start()
      return { o, lfo }
    })
    g.connect(master)
    nodesRef.current.harmonium = { stop: () => { oscs.forEach(({ o, lfo }) => { try { o.stop(); lfo.stop() } catch {} }) } }
  }, [ensureCtx])

  const startBowl = useCallback(() => {
    const { ctx, master } = ensureCtx()
    const g = ctx.createGain(); g.gain.value = 0
    const o = ctx.createOscillator()
    o.type = 'sine'; o.frequency.value = 396
    const o2 = ctx.createOscillator()
    o2.type = 'sine'; o2.frequency.value = 792
    const g2 = ctx.createGain(); g2.gain.value = 0.3
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(master)
    o.start(); o2.start()
    // Slow attack swell
    g.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 3)
    nodesRef.current.bowl = { stop: () => { try { o.stop(); o2.stop() } catch {} } }
  }, [ensureCtx])

  const toggleSound = (id: SoundId) => {
    setActive(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        nodesRef.current[id]?.stop()
        delete nodesRef.current[id]
        next.delete(id)
      } else {
        next.add(id)
        const starters: Record<SoundId, () => void> = {
          bells: startBells, river: startRiver,
          birds: startBirds, harmonium: startHarmonium, bowl: startBowl,
        }
        starters[id]?.()
      }
      return next
    })
  }

  const updateVolume = (v: number) => {
    setVolume(v)
    if (masterRef.current) masterRef.current.gain.value = v
  }

  return (
    <div className="fixed bottom-6 left-4 z-50">
      {isOpen ? (
        /* Open panel */
        <div className="rounded-2xl overflow-hidden shadow-2xl"
          style={{ width: 220, background: 'rgba(10,3,0,0.95)', border: '1px solid rgba(245,158,11,0.2)', backdropFilter: 'blur(20px)' }}>
          {/* Top glow */}
          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)' }} />

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-gold-400">Temple Ambience</p>
                <p className="text-[10px] text-white/25 font-hindi">वृन्दावन में हैं</p>
              </div>
              <button onClick={() => setIsOpen(false)}
                className="text-white/25 hover:text-white/60 text-xs transition-colors">✕</button>
            </div>

            {/* Sound toggles */}
            <div className="space-y-2 mb-3">
              {SOUNDS.map(s => (
                <button key={s.id} onClick={() => toggleSound(s.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all"
                  style={{
                    background: active.has(s.id) ? `${s.color}18` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active.has(s.id) ? s.color + '50' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  <span>{s.emoji}</span>
                  <span style={{ color: active.has(s.id) ? s.color : 'rgba(255,255,255,0.5)' }}>{s.label}</span>
                  {active.has(s.id) && (
                    <span className="ml-auto flex gap-0.5">
                      {[1,2,3].map(i => (
                        <span key={i} className="inline-block w-0.5 rounded-full animate-pulse"
                          style={{ height: 6 + i * 3, background: s.color, animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Volume slider */}
            <div>
              <p className="text-[10px] text-white/25 mb-1.5 flex justify-between">
                <span>Volume</span><span>{Math.round(volume * 100)}%</span>
              </p>
              <input type="range" min="0" max="1" step="0.05" value={volume}
                onChange={e => updateVolume(parseFloat(e.target.value))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(90deg, #f59e0b ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)` }} />
            </div>
          </div>
        </div>
      ) : (
        /* Collapsed button */
        <button onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-xl"
          style={{
            background: active.size > 0 ? 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(180,60,0,0.3))' : 'rgba(10,3,0,0.85)',
            border: active.size > 0 ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: active.size > 0 ? '0 0 20px rgba(245,158,11,0.3)' : 'none',
          }}>
          <span className="text-lg">{active.size > 0 ? '🎵' : 'ॐ'}</span>
        </button>
      )}
    </div>
  )
}
