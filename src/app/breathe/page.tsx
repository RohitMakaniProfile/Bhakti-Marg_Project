'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import FloatingMantras from '@/components/FloatingMantras'

type Technique = '478' | 'box'
type Phase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'hold2'

const TECHNIQUES: Record<Technique, { phases: Phase[]; durations: number[]; label: string; hindi: string; desc: string }> = {
  '478': {
    phases: ['inhale', 'hold', 'exhale'],
    durations: [4, 7, 8],
    label: '4-7-8 Breathing',
    hindi: 'श्वास नियंत्रण',
    desc: 'Dr. Andrew Weil ka pranayama — anxiety ke liye best. 4 lo, 7 roko, 8 chodo.',
  },
  'box': {
    phases: ['inhale', 'hold', 'exhale', 'hold2'],
    durations: [4, 4, 4, 4],
    label: 'Box Breathing',
    hindi: 'समान श्वास',
    desc: 'Navy SEALs ka technique — focus aur calm ke liye. 4-4-4-4 pattern.',
  },
}

const PHASE_LABELS: Record<Phase, { text: string; hindi: string; color: string }> = {
  idle:   { text: 'Ready',       hindi: 'तैयार हैं',        color: '#f59e0b' },
  inhale: { text: 'Saans Lo...', hindi: 'सांस लीजिए...',    color: '#60a5fa' },
  hold:   { text: 'Rokein...',   hindi: 'रोकिए...',          color: '#fbbf24' },
  exhale: { text: 'Chhodein...', hindi: 'छोड़िए...',         color: '#a78bfa' },
  hold2:  { text: 'Rokein...',   hindi: 'रोकिए...',          color: '#fbbf24' },
}

const CIRCLE_SCALE: Record<Phase, number> = {
  idle: 0.65, inhale: 1.0, hold: 1.0, exhale: 0.65, hold2: 0.65,
}

export default function BreathePage() {
  const [technique, setTechnique] = useState<Technique>('478')
  const [phase, setPhase] = useState<Phase>('idle')
  const [counter, setCounter] = useState(0)
  const [rounds, setRounds] = useState(0)
  const [running, setRunning] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [totalSeconds, setTotalSeconds] = useState(0)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseIdxRef = useRef(0)
  const phaseCounterRef = useRef(0)
  const ctxRef = useRef<AudioContext | null>(null)
  const roundsRef = useRef(0)
  const totalSecondsRef = useRef(0)
  const audioEnabledRef = useRef(audioEnabled)

  useEffect(() => { audioEnabledRef.current = audioEnabled }, [audioEnabled])

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return ctxRef.current
  }, [])

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.06) => {
    if (!audioEnabledRef.current) return
    try {
      const ctx = getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(gainVal, ctx.currentTime + duration - 0.2)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + duration)
    } catch {}
  }, [getCtx])

  const startPhase = useCallback((pIdx: number, tech: Technique) => {
    const t = TECHNIQUES[tech]
    const ph = t.phases[pIdx % t.phases.length]
    const dur = t.durations[pIdx % t.phases.length]
    setPhase(ph)
    setCounter(dur)
    phaseCounterRef.current = dur

    // Play tone for this phase
    if (ph === 'inhale') playTone(432, dur, 'sine', 0.07)
    else if (ph === 'exhale') playTone(288, dur, 'sine', 0.07)
    else playTone(360, 0.3, 'sine', 0.05)
  }, [playTone])

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setRunning(false)
    setPhase('idle')
    setCounter(0)
    phaseIdxRef.current = 0
    phaseCounterRef.current = 0
  }, [])

  const start = useCallback(() => {
    const tech = technique
    phaseIdxRef.current = 0
    startPhase(0, tech)
    setRunning(true)

    timerRef.current = setInterval(() => {
      totalSecondsRef.current += 1
      setTotalSeconds(totalSecondsRef.current)

      phaseCounterRef.current -= 1
      setCounter(prev => Math.max(0, prev - 1))

      if (phaseCounterRef.current <= 0) {
        const t = TECHNIQUES[tech]
        phaseIdxRef.current += 1
        if (phaseIdxRef.current % t.phases.length === 0) {
          roundsRef.current += 1
          setRounds(roundsRef.current)
        }
        startPhase(phaseIdxRef.current, tech)
      }
    }, 1000)
  }, [technique, startPhase])

  const toggle = () => {
    if (running) stop()
    else start()
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const scale = CIRCLE_SCALE[phase]
  const tech = TECHNIQUES[technique]
  const phaseInfo = PHASE_LABELS[phase]
  const duration = tech.durations[phaseIdxRef.current % tech.phases.length] || 4
  const phaseProgress = duration > 0 ? (counter / duration) : 0

  return (
    <div className="min-h-screen bg-temple flex flex-col items-center justify-center"
      style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 20%, rgba(50,10,80,0.4), transparent), #080200' }}>
      <FloatingMantras />

      <Link href="/"
        className="fixed top-16 left-4 z-50 flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors">
        <ArrowLeft size={13} /> Ghar
      </Link>

      <div className="relative z-10 flex flex-col items-center px-4 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-black text-gold-shimmer mb-1">Sacred Breath</h1>
          <p className="font-hindi text-gold-400 text-sm">॥ श्वास साधना ॥</p>
        </div>

        {/* Technique selector */}
        <div className="flex bg-white/5 rounded-full p-1 mb-10 border border-white/10">
          {(Object.keys(TECHNIQUES) as Technique[]).map(t => (
            <button key={t} onClick={() => { if (!running) { setTechnique(t); setPhase('idle'); setCounter(0) } }}
              disabled={running}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                background: technique === t ? 'linear-gradient(135deg, #f59e0b, #ff7c1a)' : 'transparent',
                color: technique === t ? 'white' : 'rgba(255,255,255,0.4)',
                boxShadow: technique === t ? '0 0 15px rgba(245,158,11,0.3)' : 'none',
              }}>
              {TECHNIQUES[t].label}
            </button>
          ))}
        </div>

        {/* Main breathing circle */}
        <div className="relative flex items-center justify-center mb-10" style={{ width: 260, height: 260 }}>
          {/* Ambient glow */}
          <div className="absolute inset-0 rounded-full blur-3xl opacity-30 transition-all duration-1000"
            style={{ background: `radial-gradient(circle, ${phaseInfo.color}80, transparent)`, transform: `scale(${scale})` }} />

          {/* Outer ring (progress) */}
          <svg width="260" height="260" className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="130" cy="130" r="118" fill="none" stroke={`${phaseInfo.color}20`} strokeWidth="4" />
            <circle cx="130" cy="130" r="118" fill="none" stroke={phaseInfo.color} strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 118}`}
              strokeDashoffset={`${2 * Math.PI * 118 * phaseProgress}`}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.8s ease' }} />
          </svg>

          {/* Middle ring */}
          <div className="absolute rounded-full border opacity-20 transition-all duration-[1200ms] ease-in-out"
            style={{
              width: 200, height: 200,
              borderColor: phaseInfo.color,
              transform: `scale(${0.7 + scale * 0.3})`,
              boxShadow: `0 0 30px ${phaseInfo.color}40`,
            }} />

          {/* Main circle */}
          <div className="relative rounded-full transition-all duration-[1200ms] ease-in-out flex flex-col items-center justify-center"
            style={{
              width: 160, height: 160,
              transform: `scale(${scale})`,
              background: `radial-gradient(circle, ${phaseInfo.color}20, rgba(8,2,0,0.95))`,
              border: `2px solid ${phaseInfo.color}66`,
              boxShadow: `0 0 40px ${phaseInfo.color}30, inset 0 0 30px ${phaseInfo.color}10`,
            }}>
            {/* Counter */}
            {running && counter > 0 && (
              <span className="text-4xl font-black text-white leading-none"
                style={{ textShadow: `0 0 20px ${phaseInfo.color}` }}>
                {counter}
              </span>
            )}
            {!running && <span className="text-4xl">🌬️</span>}
          </div>
        </div>

        {/* Phase label */}
        <div className="text-center mb-8 min-h-[3rem]">
          <p className="text-xl font-bold transition-all duration-500"
            style={{ color: phaseInfo.color, textShadow: `0 0 20px ${phaseInfo.color}60` }}>
            {phaseInfo.text}
          </p>
          <p className="font-hindi text-sm text-white/30">{phaseInfo.hindi}</p>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-8 text-center">
          <div>
            <p className="text-xl font-bold text-gold-400">{rounds}</p>
            <p className="text-white/30 text-xs">Rounds</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-xl font-bold text-gold-400">{formatTime(totalSeconds)}</p>
            <p className="text-white/30 text-xs">Samay</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-xl font-bold text-gold-400">{rounds * tech.phases.length}</p>
            <p className="text-white/30 text-xs">Saans Cycles</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={toggle}
            className="flex items-center gap-2 px-10 py-4 rounded-full text-white font-bold text-base transition-all hover:scale-105 active:scale-95"
            style={{
              background: running ? 'linear-gradient(135deg, rgba(239,68,68,0.7), rgba(185,28,28,0.7))' : 'linear-gradient(135deg, #f59e0b, #ff7c1a)',
              boxShadow: running ? '0 0 25px rgba(239,68,68,0.3)' : '0 0 25px rgba(245,158,11,0.4)',
            }}>
            {running ? <><Pause size={18} /> Rokein</> : <><Play size={18} /> Shuru</>}
          </button>

          <button onClick={() => setAudioEnabled(a => !a)}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all border"
            style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}>
            {audioEnabled ? <Volume2 size={16} className="text-gold-400" /> : <VolumeX size={16} className="text-white/30" />}
          </button>
        </div>

        {/* Technique description */}
        <div className="text-center max-w-xs">
          <p className="text-white/30 text-xs leading-relaxed">{tech.desc}</p>
          <p className="text-white/15 text-[10px] mt-2 font-hindi">{tech.hindi}</p>
        </div>

        {/* Phase sequence visual */}
        <div className="flex items-center gap-2 mt-6">
          {tech.phases.map((ph, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold mb-0.5 transition-all"
                  style={{
                    background: phase === ph && running ? `${PHASE_LABELS[ph].color}30` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${phase === ph && running ? PHASE_LABELS[ph].color : 'rgba(255,255,255,0.1)'}`,
                    color: phase === ph && running ? PHASE_LABELS[ph].color : 'rgba(255,255,255,0.3)',
                  }}>
                  {tech.durations[i]}s
                </div>
                <p className="text-[9px] text-white/25">{ph === 'hold2' ? 'Hold' : ph.charAt(0).toUpperCase() + ph.slice(1)}</p>
              </div>
              {i < tech.phases.length - 1 && <div className="w-4 h-px bg-white/10" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
