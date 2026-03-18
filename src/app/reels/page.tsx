'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart, Volume2, VolumeX, Share2, MessageCircle, Play, Loader2 } from 'lucide-react'
import FloatingMantras from '@/components/FloatingMantras'

type Reel = {
  id: string
  chunk_text: string
  chunk_index: number
  video_id: string
  videos: { id: string; youtube_id: string; title: string; thumbnail_url: string | null }
}

const GRADIENTS = [
  'linear-gradient(160deg, rgba(128,0,32,0.85) 0%, rgba(30,5,0,0.95) 100%)',
  'linear-gradient(160deg, rgba(10,20,80,0.85) 0%, rgba(5,10,40,0.95) 100%)',
  'linear-gradient(160deg, rgba(5,50,30,0.85) 0%, rgba(2,20,10,0.95) 100%)',
  'linear-gradient(160deg, rgba(60,10,90,0.85) 0%, rgba(20,5,40,0.95) 100%)',
  'linear-gradient(160deg, rgba(100,40,0,0.85) 0%, rgba(30,10,0,0.95) 100%)',
]
const ACCENT_COLORS = ['#e879a0', '#60a5fa', '#34d399', '#c084fc', '#f59e0b']

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [speaking, setSpeaking] = useState<string | null>(null)
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const reelRefs = useRef<(HTMLDivElement | null)[]>([])
  const touchStartY = useRef(0)

  useEffect(() => {
    fetch('/api/reels')
      .then(r => r.json())
      .then(d => {
        setReels(d.reels || [])
        const counts: Record<string, number> = {}
        ;(d.reels || []).forEach((r: Reel) => { counts[r.id] = Math.floor(Math.random() * 80) + 5 })
        setLikeCounts(counts)
      })
      .finally(() => setLoading(false))
  }, [])

  // IntersectionObserver to track current reel
  useEffect(() => {
    if (!reels.length) return
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = reelRefs.current.indexOf(e.target as HTMLDivElement)
          if (idx !== -1) setCurrentIndex(idx)
        }
      })
    }, { threshold: 0.6 })
    reelRefs.current.forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [reels])

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') scrollTo(currentIndex + 1)
      if (e.key === 'ArrowUp') scrollTo(currentIndex - 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentIndex])

  const scrollTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, reels.length - 1))
    reelRefs.current[clamped]?.scrollIntoView({ behavior: 'smooth' })
  }

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id); setLikeCounts(c => ({ ...c, [id]: (c[id] || 1) - 1 })) }
      else { next.add(id); setLikeCounts(c => ({ ...c, [id]: (c[id] || 0) + 1 })) }
      return next
    })
  }

  const stopAudio = useCallback(() => {
    audioRef.current?.pause()
    setSpeaking(null)
  }, [])

  const speak = async (text: string, id: string) => {
    if (speaking === id) { stopAudio(); return }
    stopAudio()
    setSpeaking(id)
    try {
      const res = await fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => { setSpeaking(null); URL.revokeObjectURL(url) }
      audio.onerror = () => setSpeaking(null)
      await audio.play()
    } catch { setSpeaking(null) }
  }

  const share = (reel: Reel) => {
    const text = `"${reel.chunk_text.slice(0, 200)}..."\n\n— Premanad Ji Maharaj\n\n🙏 Radhe Radhe`
    if (navigator.share) navigator.share({ text })
    else navigator.clipboard.writeText(text)
  }

  if (loading) return (
    <div className="min-h-screen bg-temple flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl animate-spin-slow mb-4">🕉️</div>
        <p className="font-hindi text-gold-400 animate-pulse">Pravachan lode ho rahe hain...</p>
      </div>
    </div>
  )

  if (!reels.length) return (
    <div className="min-h-screen bg-temple flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="text-5xl">🙏</div>
        <p className="font-hindi text-gold-400">Koi pravachan nahi mila</p>
        <Link href="/" className="text-white/40 text-sm hover:text-white">Ghar Wapas</Link>
      </div>
    </div>
  )

  return (
    <div className="relative" style={{ background: '#080200' }}>
      <FloatingMantras />

      {/* Back button */}
      <Link href="/"
        className="fixed top-16 left-4 z-50 flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors bg-black/40 backdrop-blur px-3 py-1.5 rounded-full">
        <ArrowLeft size={13} /> Ghar
      </Link>

      {/* Progress dots */}
      <div className="fixed top-1/2 right-3 -translate-y-1/2 z-50 flex flex-col gap-1.5">
        {reels.map((_, i) => (
          <button key={i} onClick={() => scrollTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === currentIndex ? 6 : 4,
              height: i === currentIndex ? 6 : 4,
              background: i === currentIndex ? '#f59e0b' : 'rgba(255,255,255,0.2)',
            }} />
        ))}
      </div>

      {/* Reel counter */}
      <div className="fixed top-16 right-4 z-50 text-white/30 text-xs bg-black/40 backdrop-blur px-3 py-1 rounded-full">
        {currentIndex + 1} / {reels.length}
      </div>

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="overflow-y-scroll"
        style={{ height: '100svh', scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}
        onTouchStart={e => { touchStartY.current = e.touches[0].clientY }}
        onTouchEnd={e => {
          const dy = touchStartY.current - e.changedTouches[0].clientY
          if (Math.abs(dy) > 50) scrollTo(currentIndex + (dy > 0 ? 1 : -1))
        }}
      >
        {reels.map((reel, i) => {
          const gradient = GRADIENTS[i % GRADIENTS.length]
          const accent = ACCENT_COLORS[i % ACCENT_COLORS.length]
          const thumb = reel.videos?.thumbnail_url || `https://img.youtube.com/vi/${reel.videos?.youtube_id}/hqdefault.jpg`
          const isActive = i === currentIndex

          return (
            <div
              key={reel.id}
              ref={el => { reelRefs.current[i] = el }}
              className="relative flex items-center justify-center"
              style={{ height: '100svh', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
            >
              {/* Background thumbnail */}
              <div className="absolute inset-0 overflow-hidden">
                <img src={thumb} alt="" className="w-full h-full object-cover scale-110"
                  style={{ filter: 'blur(18px) brightness(0.25) saturate(1.5)' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).src = '/bhaktimarg4.png' }} />
              </div>
              {/* Gradient overlay */}
              <div className="absolute inset-0" style={{ background: gradient }} />
              {/* Top & bottom fade */}
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />

              {/* Accent glow */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse 60% 50% at 50% 60%, ${accent}10, transparent)` }} />

              {/* Main content */}
              <div className="relative z-10 w-full max-w-lg mx-auto px-8 flex flex-col items-center text-center">

                {/* OM symbol */}
                <div className={`text-3xl mb-5 transition-all duration-700 ${isActive ? 'opacity-60 scale-100' : 'opacity-0 scale-75'}`}
                  style={{ filter: `drop-shadow(0 0 12px ${accent})`, color: accent }}>
                  ॐ
                </div>

                {/* Quote */}
                <div className={`mb-6 transition-all duration-700 delay-100 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  {/* Decorative quote mark */}
                  <div className="text-4xl font-serif mb-2 leading-none" style={{ color: `${accent}60` }}>"</div>
                  <p className="font-hindi text-lg sm:text-xl text-white/95 leading-loose tracking-wide">
                    {reel.chunk_text}
                  </p>
                  <div className="text-4xl font-serif mt-2 leading-none text-right" style={{ color: `${accent}60` }}>"</div>
                </div>

                {/* Source */}
                <div className={`transition-all duration-700 delay-200 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="h-px w-8" style={{ background: accent }} />
                    <img src="/maharaj.png" alt="" className="w-6 h-6 rounded-full object-cover object-top border border-white/20" />
                    <div className="h-px w-8" style={{ background: accent }} />
                  </div>
                  <p className="text-xs font-serif italic" style={{ color: `${accent}cc` }}>Premanad Ji Maharaj</p>
                  {reel.videos?.title && (
                    <p className="text-white/25 text-[10px] mt-1 max-w-xs truncate">{reel.videos.title}</p>
                  )}
                </div>

                {/* Action buttons */}
                <div className={`mt-8 flex items-center gap-4 transition-all duration-700 delay-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  {reel.videos?.id && (
                    <Link href={`/video/${reel.videos.id}`}
                      className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-medium transition-all hover:scale-105"
                      style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}>
                      <MessageCircle size={12} /> Chat
                    </Link>
                  )}
                  {reel.videos?.youtube_id && (
                    <a href={`https://www.youtube.com/watch?v=${reel.videos.youtube_id}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-medium transition-all hover:scale-105 bg-red-700/60 text-white border border-red-600/40">
                      <Play size={10} fill="white" /> YouTube
                    </a>
                  )}
                </div>
              </div>

              {/* Right action bar */}
              <div className="absolute right-4 bottom-32 flex flex-col items-center gap-5 z-20">
                {/* Like */}
                <button onClick={() => toggleLike(reel.id)} className="flex flex-col items-center gap-1 group">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${liked.has(reel.id) ? 'scale-110' : 'group-hover:scale-105'}`}
                    style={{ background: liked.has(reel.id) ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)', border: liked.has(reel.id) ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.15)' }}>
                    <Heart size={18} fill={liked.has(reel.id) ? '#ef4444' : 'none'} stroke={liked.has(reel.id) ? '#ef4444' : 'white'} />
                  </div>
                  <span className="text-[10px] text-white/50">{(likeCounts[reel.id] || 0) + (liked.has(reel.id) ? 1 : 0)}</span>
                </button>

                {/* TTS */}
                <button onClick={() => speak(reel.chunk_text, reel.id)} className="flex flex-col items-center gap-1 group">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${speaking === reel.id ? 'scale-110' : 'group-hover:scale-105'}`}
                    style={{ background: speaking === reel.id ? `${accent}33` : 'rgba(255,255,255,0.1)', border: speaking === reel.id ? `1px solid ${accent}66` : '1px solid rgba(255,255,255,0.15)' }}>
                    {speaking === reel.id
                      ? <VolumeX size={18} style={{ color: accent }} />
                      : <Volume2 size={18} className="text-white/70" />}
                  </div>
                  <span className="text-[10px] text-white/50">{speaking === reel.id ? 'Rokein' : 'Suno'}</span>
                </button>

                {/* Share */}
                <button onClick={() => share(reel)} className="flex flex-col items-center gap-1 group">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10 border border-white/15 group-hover:scale-105 transition-all">
                    <Share2 size={16} className="text-white/70" />
                  </div>
                  <span className="text-[10px] text-white/50">Share</span>
                </button>
              </div>

              {/* Swipe hint (only on first reel) */}
              {i === 0 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40 animate-bounce">
                  <div className="w-px h-6 bg-white/40" />
                  <p className="text-white/50 text-[10px]">Upar swipe karein</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
