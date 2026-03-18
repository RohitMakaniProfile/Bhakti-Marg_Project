'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Share2, Copy, Check, Volume2 } from 'lucide-react'

type Pravachan = {
  id: string
  chunk_text: string
  video_id: string
  videos: { id: string; youtube_id: string; title: string; thumbnail_url: string | null } | null
}

export default function DailyPravachan() {
  const [pravachan, setPravachan] = useState<Pravachan | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    fetch('/api/daily-pravachan')
      .then(r => r.json())
      .then(d => setPravachan(d.pravachan))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const copy = () => {
    if (!pravachan) return
    const text = `"${pravachan.chunk_text}"\n\n— Premanad Ji Maharaj\n\n🙏 Radhe Radhe`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const speak = async () => {
    if (!pravachan) return
    if (speaking) { setSpeaking(false); return }
    setSpeaking(true)
    try {
      const res = await fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: pravachan.chunk_text }) })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url) }
      audio.onerror = () => setSpeaking(false)
      await audio.play()
    } catch { setSpeaking(false) }
  }

  const shareWA = () => {
    if (!pravachan) return
    const text = `"${pravachan.chunk_text.slice(0, 250)}..."\n\n— Premanad Ji Maharaj 🙏\nRadhe Radhe`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="relative overflow-hidden rounded-2xl"
      style={{ background: 'rgba(10,3,0,0.92)', border: '1px solid rgba(245,158,11,0.15)' }}>
      {/* Top shimmer */}
      <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)' }} />

      {/* Faint background photo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img src="/radha-quote.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.04]"
          style={{ filter: 'blur(4px) saturate(0.5)' }} />
      </div>

      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gold-500/70 flex items-center gap-1">
              <span className="animate-pulse">✨</span> Aaj ka Pravachan
            </p>
            <p className="text-white/20 text-[10px] mt-0.5">{today}</p>
          </div>
          <div className="text-xl opacity-40">📜</div>
        </div>

        {loading ? (
          <div className="py-6 text-center">
            <div className="text-2xl animate-spin-slow">🕉️</div>
          </div>
        ) : pravachan ? (
          <>
            {/* Quote */}
            <div className="mb-4">
              <div className="text-2xl text-gold-500/30 font-serif leading-none mb-1">"</div>
              <p className="font-hindi text-base text-white/90 leading-loose">
                {pravachan.chunk_text.slice(0, 300)}{pravachan.chunk_text.length > 300 ? '...' : ''}
              </p>
              <div className="text-2xl text-gold-500/30 font-serif leading-none text-right mt-1">"</div>
            </div>

            {/* Source */}
            {pravachan.videos?.title && (
              <p className="text-gold-400/60 text-[11px] mb-4 flex items-center gap-1.5">
                <span className="text-gold-500/40">▶</span>
                <span className="truncate">{pravachan.videos.title}</span>
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <button onClick={speak}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] transition-all"
                style={{ background: speaking ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)', color: speaking ? '#f59e0b' : 'rgba(255,255,255,0.45)', border: speaking ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.08)' }}>
                <Volume2 size={10} /> {speaking ? 'Rokein' : 'Suno'}
              </button>

              <button onClick={copy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', color: copied ? '#34d399' : 'rgba(255,255,255,0.45)', border: `1px solid ${copied ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                {copied ? <Check size={10} /> : <Copy size={10} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>

              <button onClick={shareWA}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] transition-all bg-green-800/40 text-green-400/80 border border-green-700/30 hover:bg-green-700/40">
                <Share2 size={10} /> WhatsApp
              </button>

              {pravachan.videos?.id && (
                <Link href={`/video/${pravachan.videos.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] transition-all"
                  style={{ background: 'rgba(245,158,11,0.1)', color: 'rgba(245,158,11,0.7)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  💬 Chat
                </Link>
              )}
            </div>
          </>
        ) : (
          <p className="text-white/25 text-sm text-center py-4">Aaj ka pravachan load nahi hua 🙏</p>
        )}
      </div>
    </div>
  )
}
