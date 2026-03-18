'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Clock, Zap, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import FloatingMantras from '@/components/FloatingMantras'

// ─── Types ───────────────────────────────────────────────────────
type Category = 'all' | 'pranayama' | 'kriya' | 'routine' | 'dhyan'

type Activity = {
  id: string
  category: Category
  emoji: string
  title: string
  hindi: string
  subtitle: string
  duration: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  videoId?: string
  isShort?: boolean
  description: string
  benefits: string[]
  steps: { time?: string; step: string }[]
  quote?: string
  color: string
  glow: string
  featured?: boolean
}

// ─── Data ────────────────────────────────────────────────────────
const ACTIVITIES: Activity[] = [
  {
    id: 'tratak',
    category: 'kriya',
    emoji: '👁️',
    title: 'Trataka Kriya',
    hindi: 'त्राटक क्रिया',
    subtitle: 'Drishti aur Mann ko Ek Karo',
    duration: '10–30 min',
    level: 'Intermediate',
    videoId: 'Ej0RI6c_Vp4',
    description: 'Trataka ek prachin yog kriya hai jisme ek bindu par tiki nazar se mann aur prana dono ek ho jaate hain. Brahmacharya ki sadhana mein yeh sabse powerful kriyas mein se ek hai.',
    benefits: [
      'Aankhon ki shakti badti hai',
      'Mann ki chanchalta khatam hoti hai',
      'Concentration aur memory drastically improve hoti hai',
      'Brahmacharya mein madad karta hai — drishti shuddh hoti hai',
      'Nidra (neend) kam lagti hai, energy badhti hai',
    ],
    steps: [
      { step: 'Shuddh, andheri jagah mein baitho — diya ya mombatti jalaao' },
      { step: 'Ek haath ki doori par diye ko rakho — aankhon ki seedh mein' },
      { step: 'Palak jhapakaaye bina diye ki lau dekho' },
      { step: 'Aankhein jab tak sambhav ho band mat karo — aasuon se sahaj shuddhi hogi' },
      { step: 'Shuruaat 5 min se karo, dheere-dheere 15-20 min tak badhao' },
      { step: 'Baad mein aankhein band karo aur mann ki ankh se lau dekho' },
    ],
    quote: 'Jab drishti ek jagah tik jaati hai, tab mann apne aap ek ho jaata hai.',
    color: '#f97316',
    glow: 'rgba(249,115,22,0.4)',
    featured: true,
  },
  {
    id: 'brahmacharya-routine',
    category: 'routine',
    emoji: '🔱',
    title: 'Brahmacharya Daily Routine',
    hindi: 'ब्रह्मचर्य दिनचर्या',
    subtitle: 'Maharaj Ji ki Shiksha ke Anusar',
    duration: 'Poora Din',
    level: 'Intermediate',
    videoId: '2BxWiVvzPl4',
    description: 'Premanad Ji Maharaj ki shiksha ke anusar ek poori brahmacharya dincharya — subah se raat tak. Yeh routine energy, clarity aur spiritual growth ke liye proven hai.',
    benefits: [
      'Prana shakti mein zaroor vriddhi hogi',
      'Neend ki zaroorat kam hogi, utha hua feel hoga',
      'Concentration aur memory improve',
      'Mann ki shanti aur stability',
      'Spiritual practice naturally deepen hogi',
    ],
    steps: [
      { time: '4:00 AM', step: 'Brahma Muhurta mein uthna' },
      { time: '4:05 AM', step: 'Vajrasana mein baithkar 500ml garm paani peena' },
      { time: '4:15 AM', step: '400 kadam chalna phir fresh hona' },
      { time: '4:30 AM', step: 'Thanda snan (cold bath) — prana jagrat hogi' },
      { time: '4:45 AM', step: 'Pranayama — Anulom Vilom + Kapalbhati' },
      { time: '5:15 AM', step: 'Vyayam — push-ups, asanas' },
      { time: '6:00 AM', step: 'Naam Jap — kam se kam 108 baar' },
      { time: 'Din mein', step: 'Sattvic bhojan — chai/coffee bilkul nahi' },
      { time: '9:30 PM', step: 'Jaldi sona — "early to bed, early to rise"' },
    ],
    quote: 'Jo apni dincharya set kar leta hai, woh brahmacharya half jeet chuka hota hai.',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.4)',
    featured: true,
  },
  {
    id: 'pranayama',
    category: 'pranayama',
    emoji: '🌬️',
    title: 'Pranayama',
    hindi: 'प्राणायाम',
    subtitle: 'Prana Shakti ka Jaagran',
    duration: '10–20 min',
    level: 'Beginner',
    videoId: '8ILaqMJYGb8',
    isShort: true,
    description: 'Pranayama sirf saans ki kriya nahi — yeh prana ka niyantran hai. Maharaj Ji kehte hain: "Mann, prana ya brahmacharya — ek sadho, teeno sudhar jaate hain." Pranayama se prana sadhe, sab kuch sudhar jaata hai.',
    benefits: [
      'Prana energy tezi se badhti hai',
      'Brahmacharya naturally strong hota hai',
      'Anxiety aur stress khatam hota hai',
      'Lungs strong, oxygen flow better',
      'Meditation aur naam jap deep hota hai',
    ],
    steps: [
      { step: 'Sukhasana ya Padmasana mein seedha baitho' },
      { step: 'Pehle Anulom Vilom — 5 min (naak se baari-baari)' },
      { step: 'Kapalbhati — 100 baar (tezi se saans bahar nikalo)' },
      { step: 'Bhramari — 5 baar (aankhein band, kaan band karke "Hmm" ki aawaz)' },
      { step: '2 min chup baithna — prana feel karo' },
      { step: 'Dheere-dheere aankhein kholna' },
    ],
    quote: 'Prana par kaaboo pao — mann apne aap tham jaayega.',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.4)',
    featured: true,
  },
  {
    id: 'anulom-vilom',
    category: 'pranayama',
    emoji: '🍃',
    title: 'Anulom Vilom',
    hindi: 'अनुलोम विलोम',
    subtitle: 'Nadi Shuddhi Pranayama',
    duration: '5–15 min',
    level: 'Beginner',
    description: 'Naak ke donon nashtrikas ko baari-baari istemal karne wali yeh kriya brain ke dono hemisphere balance karta hai aur mann ko deeply shant karta hai.',
    benefits: [
      'Brain left-right balance hota hai',
      'Blood pressure normal rehta hai',
      'Anxiety aur fear dur hoti hai',
      'Sleep quality dramatically better',
      'Brahmacharya maintain karne mein madad',
    ],
    steps: [
      { step: 'Right thumb se right nostril band karo' },
      { step: 'Left nostril se 4 counts mein saans lo' },
      { step: 'Dono band karke 8 counts roko (Kumbhak)' },
      { step: 'Right nostril se 8 counts mein saans chodo' },
      { step: 'Ab right se lo, roko, left se chodo — yeh ek chakra hai' },
      { step: '10–20 chakra karo — dheere dheere badhao' },
    ],
    color: '#10b981',
    glow: 'rgba(16,185,129,0.4)',
  },
  {
    id: 'kapalbhati',
    category: 'pranayama',
    emoji: '💨',
    title: 'Kapalbhati',
    hindi: 'कपालभाति',
    subtitle: 'Mann aur Shareer ki Shuddhi',
    duration: '5–10 min',
    level: 'Beginner',
    description: 'Kapalbhati ek shuddhi kriya hai. Tezi se saans bahar khaichne se stomach, liver, kidneys aur puri body ki shuddhi hoti hai. Energy level instantly boost hota hai.',
    benefits: [
      'Body ki toxins bahar nikalta hai',
      'Digestive system strong hota hai',
      'Face aur aankhon mein chamak aati hai',
      'Weight control mein madad',
      'Instantly energize karta hai',
    ],
    steps: [
      { step: 'Seedha baithkar aankhein band karo' },
      { step: 'Naak se tezi se saans bahar nikalo — pet andar jaaye' },
      { step: 'Saans andar lena naturally hoga — force mat karo' },
      { step: 'Shuruaat mein 50 baar, phir 100-200 tak badhao' },
      { step: 'Ek round ke baad 30 sec rest karo, phir doosra round' },
      { step: '3-5 rounds karo, phir chup bethke feel karo' },
    ],
    color: '#eab308',
    glow: 'rgba(234,179,8,0.4)',
  },
  {
    id: 'surya-namaskar',
    category: 'routine',
    emoji: '☀️',
    title: 'Surya Namaskar',
    hindi: 'सूर्य नमस्कार',
    subtitle: 'Brahma Muhurta mein 12 Asanas',
    duration: '10–20 min',
    level: 'Beginner',
    description: 'Brahma Muhurta mein Surya Namaskar karna sabse powerful sadhana hai. 12 postures mein poori body active hoti hai, prana shakti badhti hai aur surya deva ka aashirvaad milta hai.',
    benefits: [
      'Poori body ek saath active hoti hai',
      'Prana shakti ka sanchar hota hai',
      'Flexibility aur strength dono improve',
      'Stress hormones reduce hote hain',
      'Brahmacharya ke liye body tayaar hoti hai',
    ],
    steps: [
      { step: '1. Pranamasana — haath jodo, seedhe khade ho' },
      { step: '2. Hastauttanasana — haath upar, peeche jhukhna' },
      { step: '3. Hasta Padasana — aage jhukkar paon ko haath laaono' },
      { step: '4. Ashwa Sanchalanasana — ek taang peeche' },
      { step: '5. Dandasana — plank position' },
      { step: '6. Ashtanga Namaskara — 8 points touch floor' },
      { step: '7. Bhujangasana — cobra pose' },
      { step: '8-12. Reverse the sequence — 12 steps complete' },
    ],
    quote: 'Surya ko pranam karo — woh har din naya jeevan deta hai.',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.4)',
  },
  {
    id: 'cold-bath',
    category: 'routine',
    emoji: '🚿',
    title: 'Thanda Snan',
    hindi: 'ठंडे जल से स्नान',
    subtitle: 'Prana Jagran ka Sab se Saral Raasta',
    duration: '5–10 min',
    level: 'Beginner',
    description: 'Maharaj Ji repeatedly kehte hain: thanda snan brahmacharya ka stambh hai. Cold water prana ko jagrata hai, nervous system ko train karta hai aur body mein ojas ki raksha karta hai.',
    benefits: [
      'Instantly prana jagrat hoti hai',
      'Ojas (vital energy) ki raksha',
      'Immunity dramatically improve hoti hai',
      'Dopamine 250% natural boost',
      'Body temperature regulation better',
    ],
    steps: [
      { step: 'Subah 4:20–4:30 AM pe snan karo' },
      { step: 'Pehle normal paani se start karo' },
      { step: 'Dheere-dheere thande paani ki taraf jao' },
      { step: '1 min sirf khade raho thande paani mein' },
      { step: 'Yahan tak badhao ki 3-5 min tak thande mein raho' },
      { step: 'Baad mein poori body ko rub karo, prana feel karo' },
    ],
    quote: 'Thanda snan woh kaam karta hai jo ghaanton ki sadhana nahi kar sakti.',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.4)',
  },
  {
    id: 'naam-jap',
    category: 'dhyan',
    emoji: '📿',
    title: 'Naam Jap Dhyan',
    hindi: 'नाम जप ध्यान',
    subtitle: 'Radhe Radhe — Mann ki Shuddhi',
    duration: '10–45 min',
    level: 'Beginner',
    description: 'Maharaj Ji kehte hain: "Radhe Radhe bolne se hi mann shant ho jaata hai." Naam jap sabse saral aur sabse powerful sadhana hai. Yeh brahmacharya ka saccha kavach hai.',
    benefits: [
      'Mann mein kaami vichaar apne aap kam hote hain',
      'Prana channel hoti hai positive direction mein',
      'Deep peace — anxiety natural khatam',
      'Brahmacharya naturally strong hota hai',
      'Bhagwan se seedha connection',
    ],
    steps: [
      { step: 'Tulsi mala haath mein lo — sukhasana mein baitho' },
      { step: '"Radhe Radhe" ya apna chosen naam jap shuru karo' },
      { step: 'Har bead pe ek jap — 108 beads = 1 mala' },
      { step: 'Dhyan sirf naam par — vichar aaye to wapas naam par jao' },
      { step: 'Shuruaat mein 1 mala, dheere-dheere 5-10 mala tak badhao' },
      { step: 'Jap ke baad 5 min chup baitho — anubhav mehsoos karo' },
    ],
    quote: '"Radhe Radhe bolne se hi mann shant ho jaata hai" — Premanad Ji Maharaj',
    color: '#ec4899',
    glow: 'rgba(236,72,153,0.4)',
  },
  {
    id: 'dhyan',
    category: 'dhyan',
    emoji: '🧘',
    title: 'Dhyan — Meditation',
    hindi: 'ध्यान',
    subtitle: 'Mann ko Shuddh Karo',
    duration: '10–30 min',
    level: 'Intermediate',
    description: 'Dhyan mein sirf baithna nahi — dhyan ka arth hai vichar ko rokna. Pranayama ke baad dhyan karna sabse effective hai. Brahmacharya ke liye dhyan ka daily practice zaroori hai.',
    benefits: [
      'Vichar ka pravah kam hota hai',
      'Brahmacharya strong hota hai — mann niyantrit rehta hai',
      'Focus aur memory best level par',
      'Inner peace — stress zero hota hai',
      'Prana concentrated hoti hai',
    ],
    steps: [
      { step: 'Padmasana ya Sukhasana — reedh seedhi' },
      { step: 'Aankhein band karo, 5 deep breaths lo' },
      { step: 'Pranayama ke baad directly dhyan mein jao' },
      { step: 'Ek bindu choose karo — "Radhe" naam ya OM sound' },
      { step: 'Vichar aaye — unhe judge mat karo, wapas bindu par jao' },
      { step: '10 min se start karo, 30 min tak badhao' },
    ],
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.4)',
  },
  {
    id: 'ashwini-mudra',
    category: 'kriya',
    emoji: '⚡',
    title: 'Ashwini Mudra',
    hindi: 'अश्विनी मुद्रा',
    subtitle: 'Ojas Raksha ki Maha-Mudra',
    duration: '5–10 min',
    level: 'Advanced',
    description: 'Brahmacharya sadhana mein Ashwini Mudra ka vishesh sthan hai. Yeh mudra prana ko upar ki taraf kheechti hai aur vital energy ki raksha karta hai. Maharaj Ji ise brahmacharya ka physical foundation kehte hain.',
    benefits: [
      'Prana ka upward flow — ojas ki raksha',
      'Brahmacharya naturally strong hota hai',
      'Mooladhara chakra active hota hai',
      'Digestive system strong',
      'Vital energy conserve aur sublimate hoti hai',
    ],
    steps: [
      { step: 'Padmasana ya Vajrasana mein baitho' },
      { step: 'Aankhein band, kuch deep breaths lo' },
      { step: 'Mooladhara (base) muscles ko contract karo — jaise toilet rokna ho' },
      { step: '3-5 sec contract, phir 3-5 sec release' },
      { step: 'Yeh ek chakra — 10-20 chakra karo' },
      { step: 'Dheere-dheere speed aur duration badhao' },
    ],
    quote: 'Prana ko rok lo — urja apne aap upar jaayegi.',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.4)',
  },
  {
    id: 'brahma-muhurta',
    category: 'routine',
    emoji: '🌅',
    title: 'Brahma Muhurta',
    hindi: 'ब्रह्ममुहूर्त',
    subtitle: 'Subah 4 AM — Divya Samay',
    duration: '4:00–6:00 AM',
    level: 'Beginner',
    description: 'Maharaj Ji kehte hain: "Brahma Muhurta mein utthan — yeh sabse pehla aur sabse zaroori niyam hai." Raat 1:30 AM se 6 AM — yeh samay brahmand mein sab se zyada prana hota hai.',
    benefits: [
      'Brahmanda ki prana shakti directly absorb hoti hai',
      'Jo subah 4 AM ka samay milta hai, din mein nahi milta',
      'Memory aur concentration best condition mein',
      'Mann sab se zyada shant aur receptive',
      'Brahmacharya ke liye optimal samay ki shuruaat',
    ],
    steps: [
      { time: '9:30 PM', step: 'Sona — 6-7 ghante ki neend 4 AM ke liye kaafi' },
      { time: '3:55 AM', step: 'Alarm — turant uthna, 5 second rule' },
      { time: '4:00 AM', step: 'Vajrasana mein garm paani peena' },
      { time: '4:10 AM', step: '400 kadam chalna' },
      { time: '4:20 AM', step: 'Thanda snan' },
      { time: '4:35 AM', step: 'Pranayama + Vyayam shuru' },
    ],
    quote: '"Brahma Muhurta mein uthne wale ke liye din alag hota hai — yeh main guarantee deta hun." — Maharaj Ji',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.4)',
  },
]

const CATEGORIES = [
  { id: 'all' as Category,      label: 'Sab Activities', emoji: '🕉️' },
  { id: 'pranayama' as Category, label: 'Pranayama',      emoji: '🌬️' },
  { id: 'kriya' as Category,    label: 'Kriya',           emoji: '⚡' },
  { id: 'routine' as Category,  label: 'Dincharya',       emoji: '📅' },
  { id: 'dhyan' as Category,    label: 'Dhyan',           emoji: '🧘' },
]

const LEVEL_COLORS = {
  Beginner:     { bg: 'rgba(16,185,129,0.15)',  text: '#34d399', border: 'rgba(16,185,129,0.3)' },
  Intermediate: { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  Advanced:     { bg: 'rgba(239,68,68,0.15)',    text: '#f87171', border: 'rgba(239,68,68,0.3)'  },
}

// ─── Video Card ───────────────────────────────────────────────────
function VideoEmbed({ videoId, isShort }: { videoId: string; isShort?: boolean }) {
  const [playing, setPlaying] = useState(false)
  const thumb = isShort
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

  if (playing) {
    return (
      <div className="rounded-xl overflow-hidden" style={{ aspectRatio: isShort ? '9/16' : '16/9', maxHeight: isShort ? '400px' : 'auto' }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          className="w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden cursor-pointer group"
      style={{ aspectRatio: isShort ? '9/16' : '16/9', maxHeight: isShort ? '360px' : 'auto' }}
      onClick={() => setPlaying(true)}
    >
      <img src={thumb} alt="Video thumbnail"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        onError={e => { e.currentTarget.src = '/bhaktimarg4.png' }}
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)' }}>
          <Play size={22} fill="white" className="ml-1 text-white" />
        </div>
      </div>
      {/* Duration badge */}
      <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur">
        <Play size={8} fill="white" /> Watch Now
      </div>
    </div>
  )
}

// ─── Activity Card ────────────────────────────────────────────────
function ActivityCard({ act }: { act: Activity }) {
  const [expanded, setExpanded] = useState(false)
  const lc = LEVEL_COLORS[act.level]

  if (act.featured && act.videoId) {
    return (
      <div className="glass overflow-hidden rounded-2xl border"
        style={{ borderColor: `${act.color}33`, boxShadow: `0 0 40px ${act.glow}` }}>
        {/* Top glow line */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${act.color}, transparent)` }} />

        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: Video */}
          <div className="p-5">
            <VideoEmbed videoId={act.videoId} isShort={act.isShort} />
          </div>

          {/* Right: Info */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${act.color}22`, border: `1px solid ${act.color}44` }}>
                  {act.emoji}
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-white/30 mb-0.5 block">
                    {CATEGORIES.find(c => c.id === act.category)?.emoji} {act.category}
                  </span>
                  <h3 className="font-display text-lg font-bold text-white">{act.title}</h3>
                  <p className="font-hindi text-sm" style={{ color: act.color }}>{act.hindi}</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <span className="text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1"
                  style={{ background: lc.bg, color: lc.text, border: `1px solid ${lc.border}` }}>
                  <Zap size={9} /> {act.level}
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-full text-white/50 bg-white/8 border border-white/10 flex items-center gap-1">
                  <Clock size={9} /> {act.duration}
                </span>
              </div>

              <p className="text-white/55 text-sm leading-relaxed mb-4">{act.description}</p>

              {/* Benefits */}
              <div className="space-y-1.5 mb-4">
                {act.benefits.slice(0, 3).map((b, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-white/50">
                    <span className="flex-shrink-0 mt-0.5" style={{ color: act.color }}>✦</span>
                    {b}
                  </div>
                ))}
              </div>
            </div>

            {/* Quote */}
            {act.quote && (
              <div className="p-3 rounded-xl border-l-2 mt-auto" style={{ borderColor: act.color, background: `${act.color}0d` }}>
                <p className="font-hindi text-xs italic leading-relaxed" style={{ color: act.color }}>{act.quote}</p>
              </div>
            )}
          </div>
        </div>

        {/* Expandable steps */}
        <div className="border-t border-white/8">
          <button onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-6 py-3 text-sm text-white/40 hover:text-white/70 transition-colors">
            <span>Kaise Karein — Step by Step</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {expanded && (
            <div className="px-6 pb-5 grid sm:grid-cols-2 gap-2">
              {act.steps.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3">
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5"
                    style={{ background: `${act.color}33`, color: act.color }}>
                    {i + 1}
                  </div>
                  <div>
                    {s.time && <span className="text-[10px] font-mono mb-0.5 block" style={{ color: act.color }}>{s.time}</span>}
                    <p className="text-xs text-white/60 leading-relaxed">{s.step}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Regular card
  return (
    <div className="glass overflow-hidden rounded-2xl flex flex-col"
      style={{ borderColor: `${act.color}22`, border: `1px solid ${act.color}22` }}>
      <div className="h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${act.color}88, transparent)` }} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: `${act.color}20`, border: `1px solid ${act.color}33` }}>
            {act.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-widest text-white/25 mb-0.5">
              {CATEGORIES.find(c => c.id === act.category)?.emoji} {act.category}
            </p>
            <h3 className="font-semibold text-white text-sm leading-tight">{act.title}</h3>
            <p className="font-hindi text-xs mt-0.5" style={{ color: act.color }}>{act.hindi}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          <span className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: lc.bg, color: lc.text, border: `1px solid ${lc.border}` }}>
            {act.level}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full text-white/40 bg-white/6 border border-white/10">
            ⏱ {act.duration}
          </span>
        </div>

        <p className="text-white/45 text-xs leading-relaxed mb-3 flex-1">{act.description}</p>

        {/* Benefits (collapsed) */}
        {!expanded && (
          <div className="space-y-1 mb-3">
            {act.benefits.slice(0, 2).map((b, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-white/40">
                <span style={{ color: act.color }} className="flex-shrink-0">✦</span>{b}
              </div>
            ))}
          </div>
        )}

        {/* Expanded: all benefits + steps */}
        {expanded && (
          <div className="space-y-4 mb-3">
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest text-white/25 mb-2">Benefits</p>
              {act.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-white/50">
                  <span style={{ color: act.color }} className="flex-shrink-0 mt-0.5">✦</span>{b}
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/25 mb-2">Steps</p>
              <div className="space-y-1.5">
                {act.steps.map((s, i) => (
                  <div key={i} className="flex gap-2 text-[11px] text-white/45 p-2 rounded-lg bg-white/3">
                    <span className="font-bold flex-shrink-0" style={{ color: act.color }}>{i + 1}.</span>
                    <div>{s.time && <strong className="font-mono text-[10px]" style={{ color: act.color }}>{s.time} — </strong>}{s.step}</div>
                  </div>
                ))}
              </div>
            </div>
            {act.quote && (
              <div className="p-3 rounded-xl border-l-2" style={{ borderColor: act.color, background: `${act.color}0d` }}>
                <p className="font-hindi text-[11px] italic leading-relaxed" style={{ color: act.color }}>{act.quote}</p>
              </div>
            )}
          </div>
        )}

        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[11px] transition-colors mt-auto pt-2"
          style={{ color: act.color }}>
          {expanded ? <><ChevronUp size={11} /> Kam Dikhao</> : <><ChevronDown size={11} /> Poora Dekhein</>}
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────
export default function ActivitiesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')

  const filtered = activeCategory === 'all'
    ? ACTIVITIES
    : ACTIVITIES.filter(a => a.category === activeCategory)

  const featured = filtered.filter(a => a.featured)
  const regular  = filtered.filter(a => !a.featured)

  return (
    <div className="min-h-screen bg-temple">
      <FloatingMantras />
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.6), transparent)' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-16">
        {/* Nav */}
        <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-sm mb-10 transition-colors">
          <ArrowLeft size={13} /> Ghar
        </Link>

        {/* ── Hero ── */}
        <div className="text-center mb-14">
          <div className="text-6xl mb-4 animate-float">🕉️</div>
          <h1 className="font-display text-4xl lg:text-5xl font-black text-gold-shimmer mb-3">
            Sadhana Activities
          </h1>
          <p className="font-hindi text-xl text-gold-400 mb-3">॥ साधना गतिविधियाँ ॥</p>
          <p className="text-white/35 text-sm max-w-lg mx-auto leading-relaxed">
            Premanad Ji Maharaj ki shiksha ke anusar — woh sab kriyas jo aapki
            <span className="text-gold-400"> prana shakti badhayein</span> aur
            <span className="text-saffron-400"> brahmacharya strong karein</span>.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-8">
            {[
              ['11', 'Activities', '🔱'],
              ['4', 'Categories', '📿'],
              ['3', 'Videos', '▶️'],
            ].map(([n, l, e]) => (
              <div key={l} className="text-center">
                <p className="text-2xl font-black text-gold-300">{e} {n}</p>
                <p className="text-white/30 text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Category Filter ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-10 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'text-white shadow-xl scale-105'
                  : 'text-white/45 hover:text-white/70 bg-white/5 border border-white/10'
              }`}
              style={activeCategory === cat.id ? {
                background: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(255,124,26,0.2))',
                border: '1px solid rgba(245,158,11,0.5)',
                boxShadow: '0 0 20px rgba(245,158,11,0.25)',
              } : {}}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* ── Featured Activities (with video) ── */}
        {featured.length > 0 && (
          <div className="space-y-6 mb-10">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
              <span className="text-[11px] text-white/30 uppercase tracking-widest whitespace-nowrap px-2">▶ Video ke saath</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
            </div>
            {featured.map(act => <ActivityCard key={act.id} act={act} />)}
          </div>
        )}

        {/* ── Regular Activities ── */}
        {regular.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
              <span className="text-[11px] text-white/30 uppercase tracking-widest whitespace-nowrap px-2">🕉️ Aur Activities</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {regular.map(act => <ActivityCard key={act.id} act={act} />)}
            </div>
          </div>
        )}

        {/* ── Bottom CTA ── */}
        <div className="mt-14 glass p-8 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(180,60,0,0.15), rgba(128,0,32,0.1))' }}>
          <img src="/maharaj.png" alt="Maharaj Ji" className="w-16 h-16 rounded-full object-cover object-top mx-auto mb-4 border-2 border-gold-500/40" />
          <p className="font-hindi text-gold-300 text-xl italic mb-2">
            "Brahmacharya daman nahi — yeh mukti ka raasta hai 🌸"
          </p>
          <p className="text-white/30 text-sm mb-6">— Premanad Ji Maharaj</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/challenge"
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ff7c1a)', boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}>
              🔱 Brahmacharya Challenge Shuru Karo
            </Link>
            <Link href="/"
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white/60 border border-white/20 hover:border-gold-500/40 hover:text-white transition-all">
              <ExternalLink size={14} /> Pravachan Dhundho
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
