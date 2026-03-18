'use client'

import { useState, useRef, useCallback } from 'react'

type Particle = { id: number; x: number; y: number; vx: number; vy: number; life: number; color: string }

let pid = 0

export default function DiyaLighting() {
  const [lit, setLit] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const animRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])

  const playClick = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'; o.frequency.value = 880
      g.gain.setValueAtTime(0.1, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3)
      o.connect(g); g.connect(ctx.destination)
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.3)
    } catch {}
  }, [])

  const spawnParticles = useCallback((cx: number, cy: number) => {
    const newP: Particle[] = Array.from({ length: 14 }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 1.5 + Math.random() * 2.5
      const colors = ['#f59e0b', '#ff7c1a', '#fde68a', '#fbbf24', '#ef4444']
      return {
        id: pid++,
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      }
    })
    particlesRef.current = newP
    setParticles(newP)

    const animate = () => {
      particlesRef.current = particlesRef.current
        .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.08, life: p.life - 0.035 }))
        .filter(p => p.life > 0)
      setParticles([...particlesRef.current])
      if (particlesRef.current.length > 0) animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
  }, [])

  const handleClick = useCallback(() => {
    playClick()
    if (!lit) {
      setLit(true)
      spawnParticles(60, 30)
    } else {
      setLit(false)
      setParticles([])
    }
  }, [lit, playClick, spawnParticles])

  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer select-none" onClick={handleClick}>
      {/* SVG Diya */}
      <div className="relative" style={{ width: 120, height: 110 }}>
        {/* Particles */}
        <svg className="absolute inset-0 overflow-visible pointer-events-none" width="120" height="110">
          {particles.map(p => (
            <circle key={p.id} cx={p.x} cy={p.y} r={3 * p.life}
              fill={p.color} opacity={p.life}
              style={{ filter: `drop-shadow(0 0 3px ${p.color})` }} />
          ))}
        </svg>

        {/* Diya SVG */}
        <svg viewBox="0 0 120 110" width="120" height="110">
          <defs>
            <radialGradient id="glow-diya" cx="50%" cy="80%" r="60%">
              <stop offset="0%" stopColor="rgba(245,158,11,0.6)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <linearGradient id="clay" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c2844c" />
              <stop offset="100%" stopColor="#8b4513" />
            </linearGradient>
            <linearGradient id="flame-grad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="40%" stopColor="#ff7c1a" />
              <stop offset="100%" stopColor="#fde68a" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Glow when lit */}
          {lit && <ellipse cx="60" cy="82" rx="45" ry="20" fill="url(#glow-diya)" />}

          {/* Diya base — ellipse */}
          <ellipse cx="60" cy="85" rx="36" ry="10" fill="url(#clay)" />

          {/* Diya bowl body */}
          <path d="M24,85 Q20,65 35,60 Q60,52 85,60 Q100,65 96,85 Z"
            fill="url(#clay)" stroke="#6b2e00" strokeWidth="1" />

          {/* Oil inside */}
          <ellipse cx="60" cy="70" rx="22" ry="6"
            fill={lit ? 'rgba(245,158,11,0.4)' : 'rgba(150,100,50,0.3)'} />

          {/* Wick */}
          <line x1="60" y1="70" x2="60" y2="55" stroke="#8b4513" strokeWidth="2" strokeLinecap="round" />

          {/* Flame — only when lit */}
          {lit && (
            <g>
              {/* Outer flame glow */}
              <ellipse cx="60" cy="42" rx="12" ry="18" fill="rgba(245,158,11,0.15)" />
              {/* Main flame */}
              <path d="M60,55 C54,48 50,38 60,26 C70,38 66,48 60,55Z"
                fill="url(#flame-grad)"
                style={{ transformOrigin: '60px 55px', animation: 'flame-flicker 0.8s ease-in-out infinite alternate' }} />
              {/* Inner flame */}
              <path d="M60,53 C57,47 55,40 60,32 C65,40 63,47 60,53Z"
                fill="rgba(255,240,180,0.9)"
                style={{ transformOrigin: '60px 53px', animation: 'flame-flicker 0.6s ease-in-out infinite alternate-reverse' }} />
            </g>
          )}

          {/* Spout */}
          <path d="M84,72 Q96,68 98,72 Q96,76 84,74Z" fill="url(#clay)" />
        </svg>
      </div>

      {/* Label */}
      <div className="text-center min-h-[32px]">
        {lit ? (
          <p className="font-hindi text-gold-400 text-sm animate-pulse glow-gold">ॐ जय जगदीश हरे</p>
        ) : (
          <p className="text-white/25 text-xs">🙏 Diya Jalaayein</p>
        )}
      </div>

      <style>{`
        @keyframes flame-flicker {
          0%   { transform: scaleX(1)   scaleY(1)   rotate(-1deg); }
          50%  { transform: scaleX(0.9) scaleY(1.05) rotate(1.5deg); }
          100% { transform: scaleX(1.1) scaleY(0.95) rotate(-2deg); }
        }
      `}</style>
    </div>
  )
}
