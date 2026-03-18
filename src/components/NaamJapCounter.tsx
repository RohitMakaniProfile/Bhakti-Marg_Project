'use client'

import { useState, useEffect, useRef } from 'react'

function formatCount(n: number) {
  return n.toLocaleString('en-IN')
}

export default function NaamJapCounter() {
  const [count, setCount] = useState(247381)
  const [localCount, setLocalCount] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([])
  const pid = useRef(0)

  useEffect(() => {
    fetch('/api/naam-jap')
      .then(r => r.json())
      .then(d => { if (d.count) setCount(d.count) })
      .catch(() => {})
      .finally(() => setLoading(false))

    const interval = setInterval(() => {
      fetch('/api/naam-jap')
        .then(r => r.json())
        .then(d => { if (d.count) setCount(d.count) })
        .catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleJap = async () => {
    setLocalCount(c => c + 1)
    setAnimating(true)
    setTimeout(() => setAnimating(false), 600)

    // Spawn particles
    const newParts = Array.from({ length: 6 }, () => ({
      id: pid.current++,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 20,
    }))
    setParticles(p => [...p, ...newParts])
    setTimeout(() => setParticles(p => p.filter(x => !newParts.find(n => n.id === x.id))), 1000)

    try {
      const res = await fetch('/api/naam-jap', { method: 'POST' })
      const d = await res.json()
      if (d.count) setCount(d.count)
    } catch {}
  }

  return (
    <div className="relative overflow-hidden rounded-2xl"
      style={{ background: 'rgba(12,4,0,0.92)', border: '1px solid rgba(245,158,11,0.2)' }}>
      {/* Top shimmer */}
      <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.8), rgba(255,200,50,1), rgba(245,158,11,0.8), transparent)' }} />

      {/* Faint Radha bg */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <img src="/radha.png" alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover object-top opacity-[0.03]"
          style={{ filter: 'blur(2px) saturate(0)' }} />
      </div>

      <div className="relative z-10 p-5 text-center">
        {/* Title */}
        <p className="font-hindi text-gold-shimmer text-xl font-bold mb-0.5">॥ राधे राधे ॥</p>
        <p className="text-white/25 text-[10px] uppercase tracking-widest mb-4">Vishwa Jap Ginti — Global Chant Count</p>

        {/* Count display */}
        <div className="mb-5">
          <div
            className="font-display text-4xl font-black transition-transform duration-300"
            style={{
              color: '#f59e0b',
              textShadow: '0 0 30px rgba(245,158,11,0.5)',
              transform: animating ? 'scale(1.15)' : 'scale(1)',
            }}>
            {loading ? '...' : formatCount(count)}
          </div>
          <p className="text-white/20 text-xs mt-1">baar "Radhe Radhe" kaha gaya</p>
        </div>

        {/* Big tap button */}
        <div className="relative inline-block">
          {/* Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {particles.map(p => (
              <div key={p.id} className="absolute text-sm pointer-events-none"
                style={{
                  left: `${p.x}%`, top: `${p.y}%`,
                  animation: 'float-up 1s ease-out forwards',
                  color: '#f59e0b',
                }}>
                🌸
              </div>
            ))}
          </div>

          <button onClick={handleJap}
            className="relative flex flex-col items-center gap-1 px-8 py-4 rounded-full font-bold text-white transition-all active:scale-95 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #ff7c1a)',
              boxShadow: animating ? '0 0 40px rgba(245,158,11,0.7)' : '0 0 20px rgba(245,158,11,0.35)',
            }}>
            <span className="text-2xl">🙏</span>
            <span className="text-sm font-semibold tracking-wide">Radhe Radhe</span>
          </button>
        </div>

        {/* Session count */}
        {localCount > 0 && (
          <p className="mt-3 text-gold-400/60 text-xs">
            Aapne abhi: <span className="text-gold-400 font-bold">{localCount}</span> baar kiya 🌸
          </p>
        )}
      </div>

      <style>{`
        @keyframes float-up {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-50px) scale(0.5); }
        }
      `}</style>
    </div>
  )
}
