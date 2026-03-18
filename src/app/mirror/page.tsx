'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, RotateCcw, Search } from 'lucide-react'
import FloatingMantras from '@/components/FloatingMantras'

const QUESTIONS = [
  {
    q: 'Aap abhi kaisa feel kar rahe hain?',
    hindi: 'आप अभी कैसा महसूस कर रहे हैं?',
    options: ['💔 Dard / Takleef', '😔 Akela / Isolated', '😤 Gussa / Frustrated', '😰 Darr / Anxiety', '😊 Theek hoon']
  },
  {
    q: 'Yeh feeling kab se hai?',
    hindi: 'यह भावना कब से है?',
    options: ['📅 Aaj se', '🗓️ Kuch dino se', '🌊 Bahut samay se', '❓ Pata nahi']
  },
  {
    q: 'Kya aap Bhagwan mein vishwas rakhte hain?',
    hindi: 'क्या आप भगवान में विश्वास रखते हैं?',
    options: ['🙏 Haan, poora', '🌱 Thoda thoda', '❌ Nahi', '🔍 Dhundh raha hoon']
  },
  {
    q: 'Abhi aapko sabse zyada kya chahiye?',
    hindi: 'अभी आपको सबसे ज़्यादा क्या चाहिए?',
    options: ['🕊️ Shanti', '💪 Shakti', '💡 Samajh / Wisdom', '❤️ Pyaar', '🧭 Direction']
  },
  {
    q: 'Sabse badi takleef kya lagti hai?',
    hindi: 'सबसे बड़ी तकलीफ क्या है?',
    options: ['📿 Naam jap nahi hota', '😶 Mann nahi lagta', '⚡ Brahmacharya mushkil lagta hai', '💔 Rishton ki takleef', '❓ Jeevan ka maksad nahi pata']
  }
]

type VideoResult = {
  video_id: string
  youtube_id: string
  title: string
  thumbnail_url: string | null
  similarity: number
}

function ResultVideoCard({ v }: { v: VideoResult }) {
  const thumb = v.thumbnail_url ?? `https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`
  return (
    <Link href={`/video/${v.video_id}`}
      className="flex items-center gap-3 p-3 rounded-xl transition-all group"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(245,158,11,0.1)' }}>
      <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0">
        <img src={thumb} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.85)' }}>
            <span className="text-[8px] text-black font-bold ml-0.5">▶</span>
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/70 text-[11px] leading-snug line-clamp-2 group-hover:text-gold-300 transition-colors">
          {v.title}
        </p>
      </div>
    </Link>
  )
}

export default function MirrorPage() {
  const [step, setStep] = useState(0) // 0=intro, 1-5=questions, 6=loading, 7=result
  const [answers, setAnswers] = useState<string[]>([])
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null)
  const [result, setResult] = useState<{ message: string; keywords: string[]; videos?: VideoResult[] } | null>(null)
  const [dots, setDots] = useState('')

  const progress = step >= 1 && step <= 5 ? step / 5 : 0

  const nextStep = async () => {
    if (step >= 1 && step <= 5 && currentAnswer) {
      const newAnswers = [...answers, currentAnswer]
      setAnswers(newAnswers)
      setCurrentAnswer(null)
      if (step === 5) {
        setStep(6)
        // Animate dots
        let d = ''
        const interval = setInterval(() => { d = d.length < 3 ? d + '.' : ''; setDots(d) }, 500)
        try {
          const res = await fetch('/api/mirror', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: newAnswers })
          })
          const data = await res.json()
          setResult(data)
        } catch {
          setResult({ message: 'Radhe Radhe 🙏 Prabhu ki sharan mein sab theek hoga.', keywords: ['peace', 'bhakti', 'naam jap'] })
        }
        clearInterval(interval)
        setStep(7)
      } else {
        setStep(s => s + 1)
      }
    }
  }

  const restart = () => { setStep(0); setAnswers([]); setCurrentAnswer(null); setResult(null) }

  return (
    <div className="min-h-screen bg-temple flex flex-col">
      <FloatingMantras />

      {/* Progress bar */}
      {step >= 1 && step <= 5 && (
        <div className="fixed top-14 left-0 right-0 z-40 h-0.5">
          <div className="h-full transition-all duration-500"
            style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg, #f59e0b, #ff7c1a, #fde68a)' }} />
        </div>
      )}

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-20">

        {/* ── INTRO ── */}
        {step === 0 && (
          <div className="text-center max-w-md w-full">
            <div className="text-6xl mb-5 animate-float" style={{ filter: 'drop-shadow(0 0 30px rgba(245,158,11,0.6))' }}>🪞</div>
            <h1 className="font-display text-4xl font-black text-gold-shimmer mb-2">Aatma ka Darpan</h1>
            <p className="font-hindi text-lg text-gold-400 mb-4">॥ आत्मा का दर्पण ॥</p>
            <p className="text-white/45 text-sm leading-relaxed max-w-sm mx-auto mb-8">
              5 sawaalon mein jaanein — <span className="text-gold-400">Maharaj Ji ka aapke liye kya sandesh hai</span>. Dil se jawab dein.
            </p>

            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold-500/40"
                style={{ boxShadow: '0 0 30px rgba(245,158,11,0.3)' }}>
                <img src="/maharaj.png" alt="Maharaj Ji" className="w-full h-full object-cover object-top" />
              </div>
            </div>

            <button onClick={() => setStep(1)}
              className="flex items-center gap-2 mx-auto px-8 py-3.5 rounded-full text-white font-semibold text-sm transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ff7c1a)', boxShadow: '0 0 25px rgba(245,158,11,0.4)' }}>
              Shuru Karein <ChevronRight size={16} />
            </button>

            <Link href="/" className="block mt-4 text-white/25 text-xs hover:text-white/50 transition-colors">
              <ArrowLeft size={11} className="inline mr-1" />Ghar
            </Link>
          </div>
        )}

        {/* ── QUESTIONS 1-5 ── */}
        {step >= 1 && step <= 5 && (
          <div className="w-full max-w-md">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => { setStep(s => Math.max(0, s - 1)); setCurrentAnswer(null) }}
                className="text-white/30 hover:text-white/60 transition-colors flex items-center gap-1 text-xs">
                <ArrowLeft size={12} /> Peeche
              </button>
              <span className="text-white/30 text-xs">Sawaal {step} / 5</span>
            </div>

            {/* Question card */}
            <div className="glass p-6 rounded-2xl mb-5"
              style={{ background: 'rgba(20,8,0,0.85)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <p className="font-hindi text-xl text-gold-300 leading-relaxed mb-1 font-semibold">
                {QUESTIONS[step - 1].q}
              </p>
              <p className="text-white/25 text-sm font-hindi">{QUESTIONS[step - 1].hindi}</p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {QUESTIONS[step - 1].options.map(opt => (
                <button key={opt} onClick={() => setCurrentAnswer(opt)}
                  className="w-full text-left px-5 py-3.5 rounded-xl text-sm transition-all duration-200"
                  style={{
                    background: currentAnswer === opt ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.04)',
                    border: currentAnswer === opt ? '1px solid rgba(245,158,11,0.6)' : '1px solid rgba(255,255,255,0.08)',
                    color: currentAnswer === opt ? '#fbbf24' : 'rgba(255,255,255,0.65)',
                    boxShadow: currentAnswer === opt ? '0 0 15px rgba(245,158,11,0.2)' : 'none',
                    transform: currentAnswer === opt ? 'scale(1.01)' : 'scale(1)',
                  }}>
                  {opt}
                </button>
              ))}
            </div>

            {/* Next button */}
            <button onClick={nextStep} disabled={!currentAnswer}
              className="w-full py-3.5 rounded-full text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
              style={{
                background: currentAnswer ? 'linear-gradient(135deg, #f59e0b, #ff7c1a)' : 'rgba(255,255,255,0.08)',
                boxShadow: currentAnswer ? '0 0 20px rgba(245,158,11,0.3)' : 'none',
                opacity: currentAnswer ? 1 : 0.5,
                cursor: currentAnswer ? 'pointer' : 'not-allowed',
              }}>
              {step === 5 ? '🙏 Maharaj Ji ka Sandesh Paao' : <> Agle Sawaal <ChevronRight size={15} /></>}
            </button>
          </div>
        )}

        {/* ── LOADING ── */}
        {step === 6 && (
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-gold-500/20" />
              <div className="absolute inset-0 rounded-full border-t-2 border-gold-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-3xl">🕉️</div>
            </div>
            <p className="font-hindi text-gold-400 text-lg animate-pulse">Maharaj Ji ka sandesh aa raha hai{dots}</p>
            <p className="text-white/30 text-sm mt-2 font-serif italic">Thoda intezaar karein...</p>
          </div>
        )}

        {/* ── RESULT ── */}
        {step === 7 && result && (
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              {/* Maharaj Ji avatar with glow */}
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full blur-xl opacity-70" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.6), transparent)' }} />
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gold-500/50"
                  style={{ boxShadow: '0 0 30px rgba(245,158,11,0.4)' }}>
                  <img src="/maharaj.png" alt="Maharaj Ji" className="w-full h-full object-cover object-top" />
                </div>
              </div>
              <p className="font-hindi text-gold-400 text-sm font-semibold">Maharaj Ji ka Aapke Liye Sandesh</p>
              <p className="text-white/25 text-xs font-serif italic mt-0.5">A personal message for you</p>
            </div>

            {/* Message */}
            <div className="glass p-6 rounded-2xl mb-5"
              style={{ background: 'rgba(20,8,0,0.9)', border: '1px solid rgba(245,158,11,0.25)', boxShadow: '0 0 40px rgba(245,158,11,0.1)' }}>
              <div className="text-3xl text-gold-500/40 font-serif leading-none mb-2">"</div>
              <p className="font-hindi text-lg text-white/90 leading-loose">{result.message}</p>
              <div className="text-3xl text-gold-500/40 font-serif leading-none text-right mt-2">"</div>
              <div className="mt-3 pt-3 border-t border-white/8 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
                <p className="text-gold-400/60 text-xs font-serif italic">— Premanad Ji Maharaj</p>
              </div>
            </div>

            {/* Search related pravachans */}
            {result.keywords?.length > 0 && (
              <Link href={`/?q=${encodeURIComponent(result.keywords[0])}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm text-white/60 border border-white/10 hover:border-gold-500/30 hover:text-gold-400 transition-all mb-4">
                <Search size={13} /> Related Pravachan Dhundho
              </Link>
            )}

            <div className="flex gap-3">
              <button onClick={restart}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
                <RotateCcw size={13} /> Naya Prayog
              </button>
              <Link href="/"
                className="flex-1 flex items-center justify-center py-3 rounded-xl text-sm text-white/40 border border-white/10 hover:border-white/20 transition-all">
                Ghar Jaayen
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
