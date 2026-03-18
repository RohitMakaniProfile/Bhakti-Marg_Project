'use client'
import { useEffect, useState } from 'react'

const SYMBOLS = ['🪷','✨','🌸','🕉️','🌺','💫','🌼','✦']

export default function Particles() {
  const [particles, setParticles] = useState<{ id: number; left: string; duration: string; delay: string; symbol: string }[]>([])

  useEffect(() => {
    const p = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${12 + Math.random() * 18}s`,
      delay: `${Math.random() * 15}s`,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    }))
    setParticles(p)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{ left: p.left, animationDuration: p.duration, animationDelay: p.delay }}
        >
          {p.symbol}
        </div>
      ))}
    </div>
  )
}
