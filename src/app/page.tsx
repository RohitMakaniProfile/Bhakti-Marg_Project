'use client'

import { useState } from 'react'
import { Search, Loader2, Play, Clock, MessageCircle, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import SpiritualChatbot from '@/components/SpiritualChatbot'
import Particles from '@/components/Particles'
import FloatingMantras from '@/components/FloatingMantras'
import NaamJapCounter from '@/components/NaamJapCounter'
import DailyPravachan from '@/components/DailyPravachan'
import TithiWidget from '@/components/TithiWidget'
import DiyaLighting from '@/components/DiyaLighting'
import TempleAmbience from '@/components/TempleAmbience'

// Each emotion gets a local image background + mood overlay color
const EMOTIONS = [
  { img: '/radha.png',           color: 'rgba(128,0,32,0.72)',  label: 'Toota Dil',          sub: 'Heartbreak',      q: 'heartbreak relationship pain loneliness' },
  { img: '/radha-quote.jpg',     color: 'rgba(60,20,80,0.72)',  label: 'Rona Chahte Ho',     sub: 'Emotional Pain',  q: 'emotional breakdown crying grief overwhelmed' },
  { img: '/bhaktimarg4.png',     color: 'rgba(10,20,60,0.75)',  label: 'Akela Mehsoos',      sub: 'Loneliness',      q: 'loneliness akela isolated alone' },
  { img: '/krishna-rukmini.jpg', color: 'rgba(150,40,0,0.72)',  label: 'Krodh & Gussa',      sub: 'Anger',           q: 'anger krodh frustration' },
  { img: '/maharaj.png',         color: 'rgba(20,30,70,0.75)',  label: 'Darr & Chinta',      sub: 'Fear & Anxiety',  q: 'fear anxiety chinta darr worry' },
  { img: '/radha-quote.jpg',     color: 'rgba(20,20,40,0.78)',  label: 'Udaasi',             sub: 'Depression',      q: 'depression sadness darkness hopeless' },
  { img: '/maharaj.png',         color: 'rgba(120,50,0,0.65)',  label: 'Bhakti Ka Raasta',   sub: 'Spiritual Path',  q: 'bhakti devotion how to pray spirituality' },
  { img: '/radha.png',           color: 'rgba(0,60,50,0.70)',   label: 'Shanti Chahiye',     sub: 'Seeking Peace',   q: 'peace shanti calm inner peace mind' },
  { img: '/krishna-rukmini.jpg', color: 'rgba(100,10,40,0.70)', label: 'Rishton Ki Takleef', sub: 'Family Pain',     q: 'relationship family problems rishta' },
  { img: '/bhaktimarg4.png',     color: 'rgba(80,50,0,0.70)',   label: 'Jeene Ka Maksad',    sub: 'Life Purpose',    q: 'life purpose meaning goal direction' },
  { img: '/maharaj.png',         color: 'rgba(100,30,0,0.70)',  label: 'Stress & Thakan',    sub: 'Exhaustion',      q: 'stress exhaustion tired burnout' },
  { img: '/radha-quote.jpg',     color: 'rgba(10,10,50,0.78)',  label: 'Sukoon Nahi',        sub: 'No inner rest',   q: 'restless mind sleep overthinking' },
]

type SearchResult = {
  chunk_id: string; video_id: string; chunk_text: string; similarity: number
  youtube_id: string; title: string; thumbnail_url: string | null
  youtube_url: string; duration: number
}

function fmtDur(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

function VideoCard({ v }: { v: SearchResult }) {
  const thumb = v.thumbnail_url || `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`
  return (
    <div className="sacred-border glass group overflow-hidden">
      <div className="relative aspect-video overflow-hidden rounded-t-[14px]">
        <img src={thumb} alt={v.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={e => (e.currentTarget.src = '/bhaktimarg4.png')} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-saffron-500/90 flex items-center justify-center shadow-2xl">
            <Play size={20} fill="white" className="ml-1" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
          <Clock size={9} />{fmtDur(v.duration)}
        </div>
        {v.similarity !== undefined && (
          <div className="absolute top-2 left-2 bg-gold-500 text-[#080200] text-[10px] font-bold px-2 py-0.5 rounded-full">
            {Math.round(v.similarity * 100)}% match
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        <p className="text-xs font-medium text-saffron-100 line-clamp-2 leading-snug">{v.title}</p>
        {v.chunk_text && <p className="text-[10px] text-white/40 line-clamp-2 italic">"...{v.chunk_text.slice(0, 90)}..."</p>}
        <div className="flex gap-1.5 pt-1">
          <a href={v.youtube_url} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 text-[10px] bg-red-700 hover:bg-red-600 text-white py-1.5 rounded-lg transition-colors font-medium">
            <Play size={9} fill="white" /> YouTube
          </a>
          {v.video_id && (
            <Link href={`/video/${v.video_id}`}
              className="flex-1 flex items-center justify-center gap-1 text-[10px] bg-saffron-800 hover:bg-saffron-700 text-white py-1.5 rounded-lg transition-colors font-medium">
              <MessageCircle size={9} /> Chat
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedEmotion, setSelectedEmotion] = useState<number | null>(null)
  const [customQ, setCustomQ] = useState('')
  const [searched, setSearched] = useState(false)
  const [searchLabel, setSearchLabel] = useState('')

  const doSearch = async (query: string, label: string) => {
    setSearching(true); setSearched(true); setSearchLabel(label)
    try {
      const res = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, matchCount: 6 }) })
      const data = await res.json()
      setResults(data.results || [])
    } catch { setResults([]) }
    finally { setSearching(false) }
  }

  return (
    <div className="relative min-h-screen bg-temple">
      <FloatingMantras />
      <Particles />

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: '100svh' }}>
        <div className="hero-photo-bg" style={{ backgroundImage: "url('/bhaktimarg4.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080200]/50 via-transparent to-[#080200]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080200]/70 via-transparent to-[#080200]/70" />

        {/* Mandala rings */}
        <div className="absolute top-1/3 left-1/2 pointer-events-none">
          {[600,420,280,160].map((s, i) => (
            <div key={i} className={`mandala-ring ${i < 2 ? 'mandala-ring-bright' : ''}`}
              style={{ width: s, height: s, marginLeft: -s/2, marginTop: -s/2, animationDuration: `${24+i*12}s`, animationDirection: i%2===0?'normal':'reverse' }} />
          ))}
        </div>

        <div className="lamp-glow" style={{ top: '10%', left: '5%' }} />
        <div className="lamp-glow" style={{ top: '10%', right: '5%' }} />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-20 pb-8">

          {/* Top row: Radha | Center title | Krishna */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 mb-8">

            {/* Left: Radha */}
            <div className="hidden lg:block flex-shrink-0 animate-float2" style={{ animationDelay: '1s' }}>
              <div className="divine-frame w-36" style={{ height: '190px' }}>
                <img src="/radha.png" alt="Radha" className="w-full h-full object-cover rounded-xl object-top" />
              </div>
              <p className="text-center text-gold-400 text-xs mt-2 font-hindi">श्री राधे</p>
            </div>

            {/* Center */}
            <div className="flex-1 flex flex-col items-center text-center z-10">
              <div className="text-5xl mb-3 animate-float glow-gold inline-block">🕉️</div>
              <h1 className="font-display font-black mb-2 leading-tight">
                <span className="text-gold-shimmer" style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)' }}>Bhakti Marg</span>
              </h1>
              <p className="font-hindi text-xl lg:text-2xl text-gold-400 mb-1 glow-gold">
                ॥ श्री प्रेमानंद जी महाराज ॥
              </p>
              <p className="font-serif italic text-base text-saffron-300/60 mb-5 tracking-wide">
                Radhe Radhe · राधे राधे · Radhe Radhe
              </p>

              {/* Maharaj Ji — smaller */}
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-500 to-saffron-500 blur-2xl opacity-20 scale-125" />
                <div className="maharaj-frame w-40 h-40 mx-auto">
                  <img src="/maharaj.png" alt="Premanad Ji Maharaj" className="w-full h-full object-cover object-top" />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-gold-600 to-saffron-500 text-[#080200] text-xs font-bold px-4 py-1 rounded-full shadow-xl">
                  🙏 Premanad Ji Maharaj
                </div>
              </div>

              <p className="text-white/50 text-sm max-w-xs leading-relaxed mb-0">
                <span className="text-gold-400">Apni bhavna chunein</span> — sabse sahi pravachan paayein.
              </p>
            </div>

            {/* Right: Krishna */}
            <div className="hidden lg:block flex-shrink-0 animate-float2" style={{ animationDelay: '2s' }}>
              <div className="divine-frame w-36" style={{ height: '190px' }}>
                <img src="/krishna-rukmini.jpg" alt="Krishna" className="w-full h-full object-cover rounded-xl" />
              </div>
              <p className="text-center text-gold-400 text-xs mt-2 font-hindi">श्री कृष्ण</p>
            </div>
          </div>

          {/* ── PORTAL CARDS — visible in hero ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">

            {/* Pravachan Search */}
            <button onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative overflow-hidden rounded-xl text-left cursor-pointer"
              style={{ background: 'rgba(8,2,0,0.8)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <img src="/radha-quote.jpg" alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  style={{ filter: 'brightness(0.15) blur(1px) saturate(1.4)' }} />
              </div>
              <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg,rgba(180,80,0,0.5),rgba(8,2,0,0.6))' }} />
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: 'linear-gradient(90deg,transparent,rgba(245,158,11,0.9),transparent)' }} />
              <div className="relative z-10 p-4 flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">🌸</span>
                <div>
                  <p className="text-white font-semibold text-sm">Pravachan Dhundho</p>
                  <p className="font-hindi text-[11px] text-gold-400">भावना से खोजें</p>
                </div>
                <div className="ml-auto text-gold-400/60 group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </button>

            {/* Challenge */}
            <Link href="/challenge"
              className="group relative overflow-hidden rounded-xl"
              style={{ background: 'rgba(8,2,0,0.8)', border: '1px solid rgba(245,120,0,0.35)' }}>
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <img src="/maharaj.png" alt="" className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                  style={{ filter: 'brightness(0.15) blur(1px) saturate(1.5)' }} />
              </div>
              <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg,rgba(160,50,0,0.55),rgba(8,2,0,0.6))' }} />
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,140,0,1),transparent)' }} />
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{ boxShadow: 'inset 0 0 40px rgba(245,120,0,0.12)' }} />
              <div className="relative z-10 p-4 flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">🔱</span>
                <div>
                  <p className="text-white font-semibold text-sm">Brahmacharya Challenge</p>
                  <p className="font-hindi text-[11px]" style={{ color: 'rgba(255,160,50,0.8)' }}>90 din ki sadhana</p>
                </div>
                <div className="ml-auto text-saffron-400/60 group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </Link>

            {/* Activities */}
            <Link href="/activities"
              className="group relative overflow-hidden rounded-xl"
              style={{ background: 'rgba(8,2,0,0.8)', border: '1px solid rgba(100,160,255,0.25)' }}>
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <img src="/bhaktimarg4.png" alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  style={{ filter: 'brightness(0.15) blur(1px) saturate(1.4)' }} />
              </div>
              <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg,rgba(10,50,130,0.55),rgba(8,2,0,0.6))' }} />
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: 'linear-gradient(90deg,transparent,rgba(120,180,255,0.9),transparent)' }} />
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{ boxShadow: 'inset 0 0 40px rgba(100,160,255,0.1)' }} />
              <div className="relative z-10 p-4 flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">🕉️</span>
                <div>
                  <p className="text-white font-semibold text-sm">Activities</p>
                  <p className="font-hindi text-[11px]" style={{ color: 'rgba(140,200,255,0.8)' }}>Trataka · Pranayama · Jap</p>
                </div>
                <div className="ml-auto text-blue-400/60 group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </Link>
          </div>

          {/* Scroll hint */}
          <div className="flex flex-col items-center animate-bounce opacity-40">
            <ChevronDown size={18} className="text-gold-400" />
          </div>
        </div>
      </section>

      {/* ════════════════ MARQUEE ════════════════ */}
      <div className="relative z-10 py-4 overflow-hidden border-y border-gold-500/15"
        style={{ background: 'linear-gradient(90deg, rgba(180,60,0,0.2), rgba(128,0,32,0.15), rgba(180,60,0,0.2))' }}>
        <div className="flex overflow-hidden">
          <div className="marquee-track">
            {['🕉️ राधे राधे बोलने से ही मन शांत हो जाता है','🪷 भक्ति में जितना डूबोगे, उतना निखरोगे','✨ प्रेम ही परमात्मा है, प्रेम ही मुक्ति है','🌸 जप करो, ध्यान करो, शांति मिलेगी','🙏 गुरु कृपा बिना भक्ति नहीं होती',
              '🕉️ राधे राधे बोलने से ही मन शांत हो जाता है','🪷 भक्ति में जितना डूबोगे, उतना निखरोगे','✨ प्रेम ही परमात्मा है, प्रेम ही मुक्ति है','🌸 जप करो, ध्यान करो, शांति मिलेगी','🙏 गुरु कृपा बिना भक्ति नहीं होती',
            ].map((q, i) => (
              <span key={i} className="font-hindi text-gold-400/80 text-sm lg:text-base tracking-wide flex-shrink-0">{q}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════ NEW FEATURE PORTALS ════════════ */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pt-6 pb-0">
        {/* Ashirwad + Reels row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Ashirwad Photo */}
          <Link href="/ashirwad"
            className="group relative overflow-hidden rounded-xl"
            style={{ background: 'rgba(8,2,0,0.88)', border: '1px solid rgba(245,158,11,0.35)' }}>
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <img src="/maharaj-chat.jpeg" alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                style={{ objectPosition: '50% 35%', filter: 'brightness(0.18) blur(1px) saturate(1.5)' }} />
            </div>
            <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg,rgba(160,80,0,0.6),rgba(8,2,0,0.7))' }} />
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: 'linear-gradient(90deg,transparent,rgba(245,158,11,1),transparent)' }} />
            <div className="relative z-10 p-4 flex flex-col items-center text-center gap-1.5">
              <span className="text-2xl">🙏</span>
              <p className="text-white font-semibold text-sm">Ashirwad Photo</p>
              <p className="text-[10px]" style={{ color: 'rgba(245,158,11,0.75)' }}>Maharaj Ji ke saath selfie</p>
            </div>
          </Link>

          {/* Pravachan Reels */}
          <Link href="/reels"
            className="group relative overflow-hidden rounded-xl"
            style={{ background: 'rgba(8,2,0,0.8)', border: '1px solid rgba(232,121,160,0.3)' }}>
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <img src="/radha.png" alt="" className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                style={{ filter: 'brightness(0.12) blur(1px) saturate(1.4)' }} />
            </div>
            <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg,rgba(128,0,32,0.55),rgba(8,2,0,0.7))' }} />
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: 'linear-gradient(90deg,transparent,#e879a0,transparent)' }} />
            <div className="relative z-10 p-4 flex flex-col items-center text-center gap-1.5">
              <span className="text-2xl">▶</span>
              <p className="text-white font-semibold text-sm">Pravachan Reels</p>
              <p className="text-[10px]" style={{ color: 'rgba(232,121,160,0.75)' }}>Swipe karo, gyan lo</p>
            </div>
          </Link>
        </div>

        {/* Row 2: NaamJapCounter + DailyPravachan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <NaamJapCounter />
          <DailyPravachan />
        </div>

        {/* Row 3: TithiWidget + Diya */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <TithiWidget />
          <div className="flex flex-col items-center justify-center glass py-6 rounded-2xl"
            style={{ background: 'rgba(10,3,0,0.85)', border: '1px solid rgba(245,158,11,0.12)' }}>
            <p className="text-[10px] uppercase tracking-widest text-gold-500/50 mb-4">🔥 Diya Prakashan</p>
            <DiyaLighting />
          </div>
        </div>
      </section>

      {/* Persistent temple ambience player */}
      <TempleAmbience />

      {/* ════════════════ DIVINE DARSHAN ════════════════ */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-14">
        <div className="text-center mb-8">
          <p className="font-hindi text-gold-400 text-xl glow-gold mb-1">॥ दिव्य दर्शन ॥</p>
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-gold-shimmer">Divine Darshan</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { src: '/maharaj.png',         hindi: 'श्री प्रेमानंद जी', label: 'Premanad Ji Maharaj' },
            { src: '/radha.png',            hindi: 'श्री राधे',         label: 'Shri Radhe' },
            { src: '/krishna-rukmini.jpg',  hindi: 'श्री कृष्ण',        label: 'Shri Krishna' },
            { src: '/radha-quote.jpg',      hindi: 'राधे राधे',         label: 'Radhe Radhe' },
          ].map((item, i) => (
            <div key={i} className="group text-center">
              <div className="relative overflow-hidden rounded-xl mb-2"
                style={{ aspectRatio: '3/4', border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(20,8,0,0.6)' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'radial-gradient(circle, rgba(255,180,40,0.35) 0%, transparent 70%)' }} />
                <img src={item.src} alt={item.label}
                  className="shrine-img w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-base opacity-0 group-hover:opacity-100 transition-opacity">🌺</div>
              </div>
              <p className="font-hindi text-gold-400 text-sm">{item.hindi}</p>
              <p className="text-white/30 text-[10px] font-serif italic">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ EMOTION SEARCH ════════════════ */}
      <section id="search-section" className="relative z-10 max-w-5xl mx-auto px-4 pb-8">
        <div className="glass p-6 lg:p-10 box-glow">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🌸</div>
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-gold-shimmer mb-2">
              Aaj Aap Kaisi Feel Kar Rahe Ho?
            </h2>
            <p className="text-white/40 text-sm">Apni bhavna chunein — Premanad Ji ke sahi pravachan milenge</p>
            <div className="divider mt-5"><span className="text-gold-500 text-sm tracking-widest">✦ ✦ ✦</span></div>
          </div>

          {/* Search */}
          <form onSubmit={e => { e.preventDefault(); if (customQ.trim()) { setSelectedEmotion(null); doSearch(customQ.trim(), customQ.trim()) } }}
            className="flex gap-2 mb-8">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="text" value={customQ} onChange={e => setCustomQ(e.target.value)}
                placeholder="Ya seedha likhein — jaise 'mujhe neend nahi aati'..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-gold-500/70 transition-all" />
            </div>
            <button type="submit" disabled={!customQ.trim() || searching}
              className="px-6 py-3.5 bg-gradient-to-r from-gold-600 to-saffron-600 hover:from-gold-500 hover:to-saffron-500 disabled:opacity-40 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg">
              {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Dhundho
            </button>
          </form>

          {/* ── EMOTION CARDS with photo backgrounds ── */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {EMOTIONS.map((em, i) => (
              <button key={i} disabled={searching}
                onClick={() => { setSelectedEmotion(i); doSearch(em.q, em.label) }}
                className={`relative overflow-hidden rounded-xl text-center cursor-pointer transition-all duration-300 disabled:cursor-wait group ${selectedEmotion === i ? 'ring-2 ring-gold-400 scale-105' : 'hover:scale-105 hover:ring-1 hover:ring-gold-500/60'}`}
                style={{ aspectRatio: '3/4', minHeight: '110px' }}
              >
                {/* Background photo */}
                <img src={em.img} alt={em.label}
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  style={{ filter: 'brightness(0.55) saturate(1.2)' }} />

                {/* Mood color overlay */}
                <div className="absolute inset-0 transition-opacity duration-300" style={{ background: em.color }} />

                {/* Selected / hover glow */}
                {selectedEmotion === i && (
                  <div className="absolute inset-0 bg-gold-500/10" />
                )}

                {/* Top golden vignette */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-2.5 px-1">
                  {searching && selectedEmotion === i ? (
                    <Loader2 size={18} className="animate-spin text-gold-400 mb-1" />
                  ) : null}
                  <p className="text-[11px] font-bold text-white leading-tight text-center drop-shadow-lg">{em.label}</p>
                  <p className="text-[9px] text-white/60 mt-0.5">{em.sub}</p>
                </div>

                {/* Gold top bar on selected */}
                {selectedEmotion === i && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ RESULTS ════════════════ */}
      {searched && (
        <section className="relative z-10 max-w-5xl mx-auto px-4 pb-24">
          <div className="divider mb-6">
            <span className="text-gold-400 text-xs px-4 whitespace-nowrap font-serif italic">
              {searching
                ? <span className="flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> Dhundh rahe hain...</span>
                : results.length > 0 ? `"${searchLabel}" ke liye ${results.length} pravachan` : 'Koi pravachan nahi mila'}
            </span>
          </div>

          {searching ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass overflow-hidden animate-pulse">
                  <div className="aspect-video bg-white/5 rounded-t-[14px]" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-white/5 rounded w-full" />
                    <div className="h-3 bg-white/5 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {results.map(r => <VideoCard key={r.chunk_id} v={r} />)}
            </div>
          ) : (
            <div className="glass p-12 text-center box-glow">
              <div className="text-5xl mb-4 animate-float">🪷</div>
              <p className="text-white/50 text-sm leading-relaxed">
                Is bhavna ke liye abhi koi pravachan nahi mila.<br />
                <span className="text-gold-400">Dusri bhavna try karein</span> ya apne shabd likhein.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ════════════════ WELCOME CARDS ════════════════ */}
      {!searched && (
        <section className="relative z-10 max-w-4xl mx-auto px-4 pb-24">
          <div className="glass p-8 text-center box-glow mb-8">
            <div className="text-3xl mb-4">📿</div>
            <p className="font-hindi text-xl lg:text-2xl text-gold-300 italic leading-relaxed mb-3">
              "राधे राधे बोलने से ही मन शांत हो जाता है"
            </p>
            <p className="text-white/30 text-sm font-serif">— Premanad Ji Maharaj</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { img: '/radha-quote.jpg',     title: 'Radhe Radhe',    text: 'Prem aur bhakti ki shakti',       icon: '🌸' },
              { img: '/bhaktimarg4.png',     title: 'Bhakti Marg',    text: 'Antar ki shanti ka saccha maarg', icon: '🕉️' },
              { img: '/krishna-rukmini.jpg', title: 'Har Pal Bhakti', text: 'Prabhu ki sharan mein sukoon',    icon: '🙏' },
            ].map((card, i) => (
              <div key={i} className="glass overflow-hidden group cursor-pointer">
                <div className="relative aspect-video overflow-hidden rounded-t-xl">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-3 text-xl">{card.icon}</div>
                </div>
                <div className="p-3 text-center">
                  <p className="font-hindi text-gold-400 font-semibold">{card.title}</p>
                  <p className="text-white/40 text-xs mt-1 font-serif italic">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <SpiritualChatbot />
    </div>
  )
}
