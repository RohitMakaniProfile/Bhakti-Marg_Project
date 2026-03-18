'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Minus, RotateCcw, ChevronRight, X, Lock } from 'lucide-react'
import FloatingMantras from '@/components/FloatingMantras'

// ─── Sound engine ────────────────────────────────────────────────
let _ctx: AudioContext | null = null
function getCtx() {
  if (typeof window === 'undefined') return null
  if (!_ctx) _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  return _ctx
}
function playBell() {
  const ctx = getCtx(); if (!ctx) return
  try {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'sine'; o.connect(g); g.connect(ctx.destination)
    o.frequency.setValueAtTime(880, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.35)
    g.gain.setValueAtTime(0.18, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7)
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.7)
  } catch {}
}
function playChime() {
  const ctx = getCtx(); if (!ctx) return
  try {
    [523, 659, 784].forEach((freq, i) => {
      const o = ctx!.createOscillator(), g = ctx!.createGain()
      o.type = 'sine'; o.connect(g); g.connect(ctx!.destination)
      const t = ctx!.currentTime + i * 0.12
      o.frequency.setValueAtTime(freq, t)
      g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
      o.start(t); o.stop(t + 0.6)
    })
  } catch {}
}

// ─── Types ───────────────────────────────────────────────────────
type DayProgress = { tasks: Record<string, boolean>; namaJapCount: number }
type ChallengeData = { tierId: number; startDate: string; dailyProgress: Record<string, DayProgress> }

// ─── Constants ───────────────────────────────────────────────────
const TIERS = [
  { id: 0, days: 7,  badge: '🌱', name: 'Seed of Discipline', hindi: 'बीज — अनुशासन का बीज', level: 'Beginner', desc: 'Pehle 7 din. Ek choti sa beej jo ek din brahmacharya ka ped banega.', namaJapTarget: 108, completionVideo: 'OIGi6wv60OM', completionBadge: '7-Day Warrior', gradient: 'from-emerald-900 to-emerald-600', glow: '#10b981', enemies: ['Kaam'] },
  { id: 1, days: 15, badge: '🌿', name: 'Roots of Strength',  hindi: 'जड़ — शक्ति की जड़ें',   level: 'Intermediate', desc: 'Mann aur praan ka sangam. Prana shakti naturally badhne lagti hai.', namaJapTarget: 216, completionVideo: 'TqHWSc7-4vw', completionBadge: '15-Day Brahmachari', gradient: 'from-blue-900 to-blue-600', glow: '#3b82f6', enemies: ['Kaam', 'Krodh'] },
  { id: 2, days: 30, badge: '⚔️', name: "Warrior's Path",    hindi: 'योद्धा — साहस का मार्ग', level: 'Advanced', desc: 'Mann mein badlav aayega. Prana siddhi ki taraf badhoge.', namaJapTarget: 324, completionVideo: 'KPKcAKgJ5bk', completionBadge: '30-Day Tapasvi', gradient: 'from-amber-900 to-amber-600', glow: '#f59e0b', enemies: ['Kaam', 'Krodh', 'Lobh'] },
  { id: 3, days: 45, badge: '🔱', name: 'The Brahmachari',   hindi: 'ब्रह्मचारी — दृढ़ संकल्प',  level: 'Expert', desc: 'Saccha brahmachari yahan se paida hota hai. 45 din ki maha-tapasya.', namaJapTarget: 432, completionVideo: 'Wapmkz_jMhs', completionBadge: '45-Day Yogi', gradient: 'from-purple-900 to-purple-600', glow: '#a855f7', enemies: ['Kaam', 'Krodh', 'Lobh', 'Moh'] },
  { id: 4, days: 90, badge: '👑', name: 'Unshakeable',       hindi: 'सिद्ध — अटल संकल्प',      level: 'Master', desc: '90 din ki maha-siddhi. Yogi se Siddha. Brahmacharya ka param lakshya.', namaJapTarget: 540, completionVideo: 'OGm_IJaprDM', completionBadge: '90-Day Siddha', gradient: 'from-rose-900 to-rose-600', glow: '#f43f5e', enemies: ['Kaam', 'Krodh', 'Lobh', 'Moh', 'Ahankar', 'Matsarya'] },
]

const TASKS = [
  { id: 'wake',     emoji: '🌅', label: 'Brahma Muhurta 4 AM',          hindi: 'ब्रह्ममुहूर्त में उठना', xp: 15 },
  { id: 'water',    emoji: '💧', label: 'Garm Paani + 400 Qadam',        hindi: 'गर्म जल + 400 कदम',     xp: 10 },
  { id: 'bath',     emoji: '🚿', label: 'Thanda Snan',                   hindi: 'ठंडे पानी से स्नान',    xp: 10 },
  { id: 'exercise', emoji: '💪', label: 'Vyayam & Pranayama',            hindi: 'व्यायाम एवं प्राणायाम', xp: 20 },
  { id: 'sattvic',  emoji: '🥗', label: 'Sattvic Bhojan',                hindi: 'सात्त्विक भोजन',        xp: 15 },
  { id: 'naam_jap', emoji: '📿', label: 'Naam Jap (mala counter)',       hindi: 'नाम जप',                xp: 25 },
  { id: 'screen',   emoji: '📵', label: 'Screen Control',                hindi: 'स्क्रीन नियंत्रण',     xp: 20 },
  { id: 'company',  emoji: '🤝', label: 'Sat-Sangat',                    hindi: 'सत्संगति',              xp: 10 },
  { id: 'thoughts', emoji: '🧠', label: 'Vichar Raksha',                 hindi: 'विचार रक्षा',           xp: 25 },
  { id: 'satsang',  emoji: '🙏', label: 'Satsang / Pravachan',           hindi: 'सत्संग',                xp: 15 },
]

const LEVELS = [
  { num: 1, min: 0,    max: 150,  title: 'नव साधक',    titleEn: 'Nava Sadhak',   icon: '🌱', color: '#10b981' },
  { num: 2, min: 150,  max: 400,  title: 'साधक',        titleEn: 'Sadhak',        icon: '🧘', color: '#3b82f6' },
  { num: 3, min: 400,  max: 900,  title: 'योद्धा',       titleEn: 'Yoddha',       icon: '⚔️', color: '#f59e0b' },
  { num: 4, min: 900,  max: 2000, title: 'तपस्वी',       titleEn: 'Tapasvi',      icon: '🔥', color: '#f97316' },
  { num: 5, min: 2000, max: 4000, title: 'ब्रह्मचारी',   titleEn: 'Brahmachari',  icon: '🔱', color: '#a855f7' },
  { num: 6, min: 4000, max: 99999,title: 'सिद्ध',        titleEn: 'Siddha',       icon: '👑', color: '#fde68a' },
]

const ENEMIES = [
  { id: 'kaam',     name: 'काम',     nameEn: 'Kaam',     icon: '🔥', desc: 'Sabse bada shatru. Indriyon par kabza karta hai.',      startDay: 1,  endDay: 7,  color: '#ef4444' },
  { id: 'krodh',    name: 'क्रोध',   nameEn: 'Krodh',    icon: '😤', desc: 'Gyaan ka naashak. Mann ki shanti barbad karta hai.',    startDay: 8,  endDay: 15, color: '#f97316' },
  { id: 'lobh',     name: 'लोभ',     nameEn: 'Lobh',     icon: '🤑', desc: 'Santosh ka dushman. Mann ko bhatakta rehta hai.',       startDay: 16, endDay: 30, color: '#eab308' },
  { id: 'moh',      name: 'मोह',     nameEn: 'Moh',      icon: '🔗', desc: 'Vairagya ka dushman. Aankhon par parda dalta hai.',     startDay: 31, endDay: 45, color: '#8b5cf6' },
  { id: 'ahankar',  name: 'अहंकार',  nameEn: 'Ahankar',  icon: '👁️', desc: 'Sab kuch naash karta hai. Vinay se hi haara jaata.',    startDay: 46, endDay: 70, color: '#06b6d4' },
  { id: 'matsarya', name: 'मत्सर्य', nameEn: 'Matsarya', icon: '🐍', desc: 'Prem ka shatru. Radhe prem se hi harao ise.',           startDay: 71, endDay: 90, color: '#84cc16' },
]

const ACHIEVEMENTS = [
  { id: 'first_jap',   icon: '📿', label: 'Pehla Jap',        desc: 'Pehla naam jap kiya',           xp: 10,   check: (c: ChallengeData) => Object.values(c.dailyProgress).some(d => d.namaJapCount > 0) },
  { id: 'first_mala',  icon: '🌸', label: 'Pehli Mala',       desc: '108 naam jap ek din mein',      xp: 50,   check: (c: ChallengeData) => Object.values(c.dailyProgress).some(d => d.namaJapCount >= 108) },
  { id: 'first_task',  icon: '⚡', label: 'Pehla Qadam',      desc: 'Pehla kaam poora kiya',         xp: 20,   check: (c: ChallengeData) => Object.values(c.dailyProgress).some(d => Object.values(d.tasks).some(Boolean)) },
  { id: 'full_day',    icon: '⭐', label: 'Poora Din',         desc: 'Saare 10 kaam ek din mein',     xp: 100,  check: (c: ChallengeData) => Object.values(c.dailyProgress).some(d => Object.values(d.tasks).filter(Boolean).length >= 10) },
  { id: 'streak_3',    icon: '🔥', label: '3 Din Streak',     desc: '3 din lagataar',                xp: 75,   check: (_: ChallengeData, streak: number) => streak >= 3 },
  { id: 'streak_7',    icon: '💎', label: '7 Din Diamond',    desc: '7 din ka diamond streak',       xp: 200,  check: (_: ChallengeData, streak: number) => streak >= 7 },
  { id: 'kaam_vijay',  icon: '🏆', label: 'Kaam Vijay',       desc: '7 din — Kaam ko haraaya!',      xp: 300,  check: (c: ChallengeData) => daysBetween(c.startDate, today()) >= 7 },
  { id: 'krodh_vijay', icon: '🌊', label: 'Krodh Vijay',      desc: '15 din — Krodh ko haraaya!',    xp: 400,  check: (c: ChallengeData) => daysBetween(c.startDate, today()) >= 15 },
  { id: 'lobh_vijay',  icon: '🗡️', label: 'Lobh Vijay',       desc: '30 din — Lobh ko haraaya!',     xp: 600,  check: (c: ChallengeData) => daysBetween(c.startDate, today()) >= 30 },
  { id: 'yogi_45',     icon: '🕉️', label: 'Maha Yogi',        desc: '45 din ka yoga sampann!',       xp: 900,  check: (c: ChallengeData) => daysBetween(c.startDate, today()) >= 45 },
  { id: 'siddha_90',   icon: '👑', label: 'Brahma Siddha',    desc: '90 din — Siddhi prapt!',        xp: 2000, check: (c: ChallengeData) => daysBetween(c.startDate, today()) >= 90 },
]

const QUOTES = [
  '"Jo sochte, dekhte aur sunte ho — wahi tumhara dhyaan hai, wahi tumhari aadat."',
  '"Brahmacharya daman nahi — yeh mukti ka raasta hai."',
  '"Mann, praan ya brahmacharya — ek par kaaboo pao, teeno sudhar jaayenge."',
  '"Haar se mat ghabrao. Uthho, seekho, aur phir se chalo."',
  '"Brahma-muhurta mein uthna — yeh pehla kaadam hai sadhana ka."',
  '"Jap karo, dhyaan karo — shanti aapke andar hai."',
]

// ─── Helpers ─────────────────────────────────────────────────────
function toDateStr(d: Date) { return d.toISOString().split('T')[0] }
function today() { return toDateStr(new Date()) }
function daysBetween(a: string, b: string) {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}
function calcDayXP(day: DayProgress) {
  const n = Object.values(day.tasks).filter(Boolean).length
  return n * 15 + (n >= 10 ? 50 : 0) + Math.floor(day.namaJapCount / 10) * 3
}
function calcTotalXP(data: ChallengeData) {
  return Object.values(data.dailyProgress).reduce((s, d) => s + calcDayXP(d), 0)
}
function getLevel(xp: number) { return LEVELS.slice().reverse().find(l => xp >= l.min) || LEVELS[0] }
function getCurrentEnemy(day: number) { return ENEMIES.find(e => day >= e.startDay && day <= e.endDay) || null }

// ─── Aura Ring ────────────────────────────────────────────────────
function AuraRing({ level, color, days, maxDays, xp }: { level: number; color: string; days: number; maxDays: number; xp: number }) {
  const size = 96
  const cx = size / 2, cy = size / 2
  const RINGS = [
    { r: 42, stroke: 4,  opacity: 0.9,  speed: 8,  dir: 1  },
    { r: 38, stroke: 2,  opacity: 0.5,  speed: 14, dir: -1 },
    { r: 44, stroke: 1,  opacity: 0.25, speed: 20, dir: 1  },
  ]
  const progress = Math.min(days / maxDays, 1)
  // Number of orbiting particles scales with level
  const particleCount = Math.min(level * 2, 12)
  const lv = getLevel(xp)

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`aura-${level}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <filter id="aura-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Ambient glow bg */}
        <circle cx={cx} cy={cy} r={44} fill={`url(#aura-${level})`} />

        {/* Progress arc (main) */}
        <circle cx={cx} cy={cy} r={40}
          fill="none" stroke={`${color}22`} strokeWidth={6} />
        <circle cx={cx} cy={cy} r={40}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 40}`}
          strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress)}`}
          filter="url(#aura-glow)"
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dashoffset 1s ease' }}
        />

        {/* Orbiting particles based on level */}
        {Array.from({ length: particleCount }, (_, i) => {
          const angle = (i / particleCount) * 2 * Math.PI
          const r = 40
          const px = cx + r * Math.cos(angle)
          const py = cy + r * Math.sin(angle)
          return (
            <circle key={i} cx={px} cy={py} r={2.5}
              fill={color}
              opacity={0.7}
              filter="url(#aura-glow)"
              style={{
                transformOrigin: `${cx}px ${cy}px`,
                animation: `spin ${8 + i * 0.5}s linear infinite`,
                animationDelay: `${-i * (8 / particleCount)}s`,
              }}
            />
          )
        })}

        {/* Spinning ring lines */}
        {level >= 3 && RINGS.slice(0, level - 1).map((ring, i) => (
          <circle key={i} cx={cx} cy={cy} r={ring.r}
            fill="none" stroke={color} strokeWidth={ring.stroke}
            strokeOpacity={ring.opacity * 0.4}
            strokeDasharray={`${Math.PI * ring.r * 0.15} ${Math.PI * ring.r * 0.85}`}
            style={{ transformOrigin: `${cx}px ${cy}px`, animation: `spin ${ring.speed}s linear infinite ${ring.dir === -1 ? 'reverse' : ''}` }}
          />
        ))}
      </svg>

      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{
            background: `radial-gradient(circle, ${color}33, rgba(0,0,0,0.85))`,
            border: `2px solid ${color}88`,
            boxShadow: `0 0 20px ${color}55, inset 0 0 15px ${color}11`,
          }}>
          {lv.icon}
        </div>
      </div>
    </div>
  )
}

// ─── Profile Card ────────────────────────────────────────────────
function ProfileCard({ challenge, tier, totalXP, streak, currentDay, onClose }:
  { challenge: ChallengeData; tier: typeof TIERS[0]; totalXP: number; streak: number; currentDay: number; onClose: () => void }
) {
  const lv = getLevel(totalXP)
  const checkedToday = Object.values(challenge.dailyProgress[today()]?.tasks || {}).filter(Boolean).length

  const copyText = `🔱 Brahmacharya Challenge Progress\n\n📅 Din ${currentDay}/${tier.days} — ${tier.name}\n🏆 Level ${lv.num}: ${lv.titleEn}\n⚡ ${totalXP} XP\n🔥 ${streak} din streak\n📿 Aaj ${checkedToday}/10 kaam poore\n\n🙏 Premanad Ji Maharaj ki shiksha se\nRadhe Radhe — BhaktiMarg`

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}>
      <div className="relative max-w-sm w-full" onClick={e => e.stopPropagation()}>
        {/* The card */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #120600 0%, #0a0300 50%, #1a0800 100%)', border: `1px solid ${tier.glow}44` }}>
          {/* Top shimmer line */}
          <div className="h-1" style={{ background: `linear-gradient(90deg, transparent, ${tier.glow}, #fde68a, ${tier.glow}, transparent)` }} />

          {/* Maharaj Ji banner */}
          <div className="relative h-32 overflow-hidden">
            <img src="/maharaj.png" alt="" className="w-full h-full object-cover object-top" style={{ filter: 'brightness(0.3) saturate(1.5)' }} />
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${tier.glow}22, rgba(0,0,0,0.7))` }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="font-hindi text-2xl font-bold text-gold-shimmer">॥ राधे राधे ॥</p>
                <p className="text-white/40 text-xs font-serif italic">Sadhana Progress Card</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Tier + Level */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: `radial-gradient(circle, ${tier.glow}33, rgba(0,0,0,0.8))`, border: `2px solid ${tier.glow}66`, boxShadow: `0 0 25px ${tier.glow}55` }}>
                {tier.badge}
              </div>
              <div>
                <p className="font-hindi text-xl font-bold" style={{ color: tier.glow }}>{tier.hindi}</p>
                <p className="text-white/60 text-sm">{tier.name}</p>
                <p className="text-white/30 text-xs">Day {currentDay} / {tier.days}</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: `Lv.${lv.num}`, label: lv.titleEn, icon: lv.icon, color: lv.color },
                { val: `${totalXP}`, label: 'Total XP', icon: '⚡', color: '#fbbf24' },
                { val: `${streak}🔥`, label: 'Streak', icon: '', color: '#fb923c' },
              ].map(s => (
                <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: `${s.color}11`, border: `1px solid ${s.color}22` }}>
                  <p className="font-bold text-base" style={{ color: s.color }}>{s.icon}{s.val}</p>
                  <p className="text-white/30 text-[9px]">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-[10px] text-white/30 mb-1.5">
                <span>Challenge Progress</span>
                <span style={{ color: tier.glow }}>{Math.round((currentDay / tier.days) * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min((currentDay / tier.days) * 100, 100)}%`, background: `linear-gradient(90deg, ${tier.glow}88, ${tier.glow}, #fde68a)` }} />
              </div>
            </div>

            {/* Quote */}
            <div className="p-3 rounded-xl border-l-2" style={{ borderColor: tier.glow, background: `${tier.glow}0d` }}>
              <p className="font-hindi text-xs italic" style={{ color: tier.glow }}>"Brahmacharya daman nahi — yeh mukti ka raasta hai" 🙏</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(copyText); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${tier.glow}cc, ${tier.glow}88)` }}>
                📋 Copy
              </button>
              <a href={`https://wa.me/?text=${encodeURIComponent(copyText)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center text-white bg-green-700 hover:bg-green-600 transition-all">
                💬 WhatsApp
              </a>
              <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-white/40 border border-white/10 hover:border-white/30 transition-all">
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Mala SVG ────────────────────────────────────────────────────
function MalaSVG({ count, target, onTap }: { count: number; target: number; onTap: () => void }) {
  const BEADS = 108
  const cx = 140, cy = 140, r = 112
  const filled = count % BEADS
  const rounds = Math.floor(count / BEADS)
  const pct = Math.min(count / target, 1)

  return (
    <div className="relative select-none">
      <svg viewBox="0 0 280 280" className="w-full max-w-[260px] mx-auto">
        <defs>
          <filter id="bead-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245,158,11,0.15)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Inner glow circle */}
        <circle cx={cx} cy={cy} r={r - 20} fill="url(#innerGlow)" />

        {/* Track ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />

        {/* Beads */}
        {Array.from({ length: BEADS }, (_, i) => {
          const ang = (i / BEADS) * 2 * Math.PI - Math.PI / 2
          const x = cx + r * Math.cos(ang)
          const y = cy + r * Math.sin(ang)
          const isFilled = i < filled
          const isNext = i === filled
          const isMount = i === 0

          return (
            <circle key={i} cx={x} cy={y}
              r={isMount ? 7 : 3.5}
              fill={isFilled ? '#f59e0b' : isNext ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.1)'}
              filter={isFilled ? 'url(#bead-glow)' : 'none'}
              style={{ transition: 'fill 0.15s' }}
            />
          )
        })}

        {/* Progress arc */}
        <circle cx={cx} cy={cy} r={r}
          fill="none"
          stroke="rgba(245,158,11,0.15)"
          strokeWidth="28"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * r}`}
          strokeDashoffset={`${2 * Math.PI * r * (1 - pct)}`}
          style={{ transition: 'stroke-dashoffset 0.5s ease', transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Center tap button */}
        <foreignObject x={cx - 60} y={cy - 60} width="120" height="120">
          <div className="w-full h-full flex flex-col items-center justify-center">
            <button onClick={onTap}
              className="w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, #1a0800, #2d1000)', border: '2px solid rgba(245,158,11,0.4)' }}>
              <span className="text-2xl font-bold" style={{ color: '#f59e0b', lineHeight: 1 }}>{count}</span>
              <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>/ {target}</span>
              <span className="text-xs mt-0.5">📿</span>
            </button>
          </div>
        </foreignObject>
      </svg>

      {/* Rounds */}
      {rounds > 0 && (
        <div className="text-center mt-1">
          <span className="text-xs text-gold-400 font-hindi">🌸 {rounds} माला पूर्ण</span>
        </div>
      )}
    </div>
  )
}

// ─── Achievement Toast ────────────────────────────────────────────
function AchToast({ ach, onClose }: { ach: typeof ACHIEVEMENTS[0] | null; onClose: () => void }) {
  useEffect(() => {
    if (!ach) return
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [ach, onClose])

  if (!ach) return null
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[200] animate-float">
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border"
        style={{ background: 'linear-gradient(135deg, #1a0800, #0d0500)', borderColor: 'rgba(245,158,11,0.5)', boxShadow: '0 0 30px rgba(245,158,11,0.3)' }}>
        <span className="text-2xl">{ach.icon}</span>
        <div>
          <p className="text-gold-300 font-bold text-sm">Achievement Unlock! 🎉</p>
          <p className="text-white/70 text-xs">{ach.label} — +{ach.xp} XP</p>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white ml-2"><X size={12} /></button>
      </div>
    </div>
  )
}

// ─── Enemy Card ───────────────────────────────────────────────────
function EnemyBattle({ currentDay, tier }: { currentDay: number; tier: typeof TIERS[0] }) {
  const enemy = getCurrentEnemy(Math.min(currentDay, tier.days))
  const defeated = ENEMIES.filter(e => currentDay > e.endDay && e.endDay <= tier.days)

  if (!enemy) return (
    <div className="glass p-5 text-center">
      <div className="text-4xl mb-2">👑</div>
      <p className="font-hindi text-gold-400 font-semibold">सभी शत्रु पराजित!</p>
      <p className="text-white/40 text-xs mt-1">Aap Siddha ban gaye hain 🙏</p>
    </div>
  )

  const range = enemy.endDay - enemy.startDay + 1
  const doneInRange = Math.max(0, currentDay - enemy.startDay)
  const hpPct = Math.max(0, 1 - doneInRange / range)

  return (
    <div className="glass p-5 space-y-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] text-white/30 uppercase tracking-widest">⚔️ Current Battle</p>
        {defeated.length > 0 && <p className="text-[10px] text-emerald-400">{defeated.length} defeated</p>}
      </div>

      {/* Enemy display */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-full blur-xl opacity-60" style={{ background: enemy.color }} />
          <div className="relative w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={{ background: `radial-gradient(circle, ${enemy.color}33, rgba(0,0,0,0.8))`, border: `2px solid ${enemy.color}66` }}>
            {enemy.icon}
          </div>
        </div>
        <div className="flex-1">
          <p className="font-hindi text-xl font-bold" style={{ color: enemy.color }}>{enemy.name}</p>
          <p className="text-white/50 text-xs font-semibold">{enemy.nameEn} — Aarishadvarg</p>
          <p className="text-white/30 text-[10px] mt-0.5 leading-snug">{enemy.desc}</p>
        </div>
      </div>

      {/* HP bar */}
      <div>
        <div className="flex justify-between text-[10px] mb-1.5">
          <span className="text-white/40">Enemy HP</span>
          <span style={{ color: enemy.color }}>{Math.round(hpPct * 100)}% remaining</span>
        </div>
        <div className="h-3 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
            style={{ width: `${hpPct * 100}%`, background: `linear-gradient(90deg, ${enemy.color}88, ${enemy.color})` }}>
            <div className="absolute inset-0 bg-white/20 animate-pulse" style={{ animationDuration: '1.5s' }} />
          </div>
        </div>
        <p className="text-[9px] text-white/25 mt-1">
          {Math.max(0, enemy.endDay - currentDay + 1)} din mein {enemy.nameEn} harega
        </p>
      </div>

      {/* Defeated enemies row */}
      {defeated.length > 0 && (
        <div className="flex gap-2 flex-wrap pt-1 border-t border-white/5">
          {defeated.map(e => (
            <div key={e.id} className="flex items-center gap-1 text-[10px] text-emerald-400/70 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <Check size={9} /> {e.nameEn}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────
export default function ChallengePage() {
  const [challenge, setChallenge] = useState<ChallengeData | null>(null)
  const [todayP, setTodayP] = useState<DayProgress>({ tasks: {}, namaJapCount: 0 })
  const [unlockedAch, setUnlockedAch] = useState<string[]>([])
  const [toast, setToast] = useState<typeof ACHIEVEMENTS[0] | null>(null)
  const [milestoneFor, setMilestoneFor] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [levelUp, setLevelUp] = useState<typeof LEVELS[0] | null>(null)
  const [tapFlash, setTapFlash] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const prevXP = useRef(0)

  // Load state
  useEffect(() => {
    const raw = localStorage.getItem('bhakti_challenge')
    if (raw) {
      const data: ChallengeData = JSON.parse(raw)
      setChallenge(data)
      setTodayP(data.dailyProgress[today()] || { tasks: {}, namaJapCount: 0 })
      prevXP.current = calcTotalXP(data)
    }
    const ach = localStorage.getItem('bhakti_achievements')
    if (ach) setUnlockedAch(JSON.parse(ach))
    const ms = localStorage.getItem('bhakti_milestone')
    if (ms) setMilestoneFor(ms)
    setLoaded(true)
  }, [])

  const saveAll = useCallback((data: ChallengeData, prog: DayProgress) => {
    const updated = { ...data, dailyProgress: { ...data.dailyProgress, [today()]: prog } }
    localStorage.setItem('bhakti_challenge', JSON.stringify(updated))
    setChallenge(updated)
    return updated
  }, [])

  const checkAchievements = useCallback((data: ChallengeData, streak: number, achList: string[]) => {
    let newList = [...achList]
    let newToast: typeof ACHIEVEMENTS[0] | null = null
    for (const ach of ACHIEVEMENTS) {
      if (!newList.includes(ach.id) && ach.check(data, streak)) {
        newList.push(ach.id)
        newToast = ach
        playChime()
      }
    }
    if (newList.length !== achList.length) {
      localStorage.setItem('bhakti_achievements', JSON.stringify(newList))
      setUnlockedAch(newList)
      if (newToast) setToast(newToast)
    }
    return newList
  }, [])

  const startChallenge = (tierId: number) => {
    const data: ChallengeData = { tierId, startDate: today(), dailyProgress: {} }
    localStorage.setItem('bhakti_challenge', JSON.stringify(data))
    setChallenge(data); setTodayP({ tasks: {}, namaJapCount: 0 })
  }

  const toggleTask = (taskId: string) => {
    if (!challenge) return
    const wasChecked = todayP.tasks[taskId]
    if (!wasChecked) playChime()
    const newP = { ...todayP, tasks: { ...todayP.tasks, [taskId]: !wasChecked } }
    setTodayP(newP)
    const updated = saveAll(challenge, newP)
    const newXP = calcTotalXP(updated)
    const oldLv = getLevel(prevXP.current)
    const newLv = getLevel(newXP)
    if (newLv.num > oldLv.num) { setLevelUp(newLv); playChime() }
    prevXP.current = newXP
    checkAchievements(updated, calcStreak(updated), unlockedAch)
  }

  const addJap = (delta: number) => {
    if (!challenge) return
    const tier = TIERS[challenge.tierId]
    const newCount = Math.max(0, todayP.namaJapCount + delta)
    if (delta > 0) { playBell(); setTapFlash(true); setTimeout(() => setTapFlash(false), 120) }
    const newP: DayProgress = {
      ...todayP,
      namaJapCount: newCount,
      tasks: { ...todayP.tasks, naam_jap: newCount >= tier.namaJapTarget },
    }
    setTodayP(newP)
    const updated = saveAll(challenge, newP)
    const newXP = calcTotalXP(updated)
    const oldLv = getLevel(prevXP.current)
    const newLv = getLevel(newXP)
    if (newLv.num > oldLv.num) { setLevelUp(newLv); playChime() }
    prevXP.current = newXP
    checkAchievements(updated, calcStreak(updated), unlockedAch)
  }

  const calcStreak = (data: ChallengeData) => {
    const currentDay = daysBetween(data.startDate, today())
    let streak = 0
    for (let i = currentDay; i >= 0; i--) {
      const d = new Date(data.startDate)
      d.setDate(d.getDate() + i)
      const dp = data.dailyProgress[toDateStr(d)]
      if (!dp || Object.values(dp.tasks).filter(Boolean).length < 5) break
      streak++
    }
    return streak
  }

  const resetChallenge = () => {
    localStorage.removeItem('bhakti_challenge')
    localStorage.removeItem('bhakti_milestone')
    setChallenge(null); setTodayP({ tasks: {}, namaJapCount: 0 })
    setConfirmReset(false); setMilestoneFor(null); prevXP.current = 0
  }

  if (!loaded) return (
    <div className="min-h-screen bg-temple flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-3 animate-float">🔱</div>
        <p className="font-hindi text-gold-400 animate-pulse">साधना लोड हो रही है...</p>
      </div>
    </div>
  )

  // ── Derived ───────────────────────────────────────────────────
  const tier = challenge ? TIERS[challenge.tierId] : null
  const currentDay = challenge ? daysBetween(challenge.startDate, today()) + 1 : 0
  const totalXP = challenge ? calcTotalXP(challenge) : 0
  const lv = getLevel(totalXP)
  const streak = challenge ? calcStreak(challenge) : 0
  const checkedCount = Object.values(todayP.tasks).filter(Boolean).length
  const pct = Math.round((checkedCount / TASKS.length) * 100)
  const isComplete = tier ? currentDay > tier.days : false
  const shouldShowMilestone = isComplete && tier && milestoneFor !== `${challenge!.tierId}`

  // Level XP progress
  const lvNext = LEVELS.find(l => l.num === lv.num + 1)
  const lvPct = lvNext ? ((totalXP - lv.min) / (lvNext.min - lv.min)) * 100 : 100

  // Calendar
  const calDays = tier ? Array.from({ length: tier.days }, (_, i) => {
    const d = new Date(challenge!.startDate); d.setDate(d.getDate() + i)
    const ds = toDateStr(d)
    const dp = challenge!.dailyProgress[ds]
    const checked = dp ? Object.values(dp.tasks).filter(Boolean).length : 0
    return { ds, checked, isPast: ds < today(), isTdy: ds === today(), isFuture: ds > today(), day: i + 1 }
  }) : []

  // ── TIER SELECTION VIEW ────────────────────────────────────────
  if (!challenge) return (
    <div className="min-h-screen bg-temple">
      <FloatingMantras />
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-sm mb-10 transition-colors">
          <ArrowLeft size={13} /> Ghar
        </Link>

        <div className="text-center mb-14">
          <div className="text-6xl mb-4 animate-float">🔱</div>
          <h1 className="font-display text-4xl lg:text-5xl font-black text-gold-shimmer mb-3">
            Sadhana Quest
          </h1>
          <p className="font-hindi text-xl text-gold-400 mb-1">ब्रह्मचर्य की महाशक्ति</p>
          <p className="text-white/35 text-sm max-w-sm mx-auto">
            6 shatruon ko harao. Prana shakti badhao. Siddha bano.
          </p>
        </div>

        {/* Enemies preview */}
        <div className="glass p-5 mb-10">
          <p className="text-center text-[11px] text-white/30 uppercase tracking-widest mb-4">⚔️ Arishadvarga — 6 Shatru Jo Haraaane Hain</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {ENEMIES.map((e) => (
              <div key={e.id} className="text-center p-2 rounded-xl border border-white/8 bg-white/3">
                <div className="text-2xl mb-1" style={{ filter: `drop-shadow(0 0 8px ${e.color})` }}>{e.icon}</div>
                <p className="font-hindi text-xs" style={{ color: e.color }}>{e.name}</p>
                <p className="text-white/25 text-[9px]">Day {e.startDay}–{e.endDay}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {TIERS.map(t => (
            <button key={t.id} onClick={() => startChallenge(t.id)}
              className="text-left relative overflow-hidden rounded-2xl p-6 transition-all duration-300 group cursor-pointer hover:scale-105 hover:-translate-y-2"
              style={{ background: 'rgba(10,3,0,0.9)', border: `1px solid ${t.glow}33`, boxShadow: `0 0 0 0 ${t.glow}` }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 50px 5px ${t.glow}40`)}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 0 transparent')}
            >
              {/* BG gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${t.gradient} opacity-30 group-hover:opacity-50 transition-opacity`} />
              {/* Top glare */}
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${t.glow}80, transparent)` }} />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-5xl" style={{ filter: `drop-shadow(0 0 15px ${t.glow})` }}>{t.badge}</span>
                  <span className="text-[10px] text-white/30 bg-white/8 px-2.5 py-1 rounded-full">{t.level}</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <span className="text-4xl font-black" style={{ color: t.glow }}>{t.days}</span>
                  <span className="text-white/40 text-sm">din</span>
                </div>
                <p className="font-hindi text-sm mb-1" style={{ color: t.glow }}>{t.hindi}</p>
                <p className="font-display text-white/80 text-sm font-semibold mb-2">{t.name}</p>
                <p className="text-white/35 text-xs leading-relaxed mb-4">{t.desc}</p>

                {/* Enemies to defeat */}
                <div className="flex gap-1.5 flex-wrap mb-4">
                  {t.enemies.map(name => {
                    const e = ENEMIES.find(x => x.nameEn === name)!
                    return <span key={name} className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: `${e.color}22`, color: e.color, border: `1px solid ${e.color}44` }}>{e.icon} {name}</span>
                  })}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/8">
                  <span className="text-[10px] text-white/25">📿 {t.namaJapTarget} jap/din</span>
                  <span className="text-xs font-bold flex items-center gap-1" style={{ color: t.glow }}>
                    Begin Quest <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Levels preview */}
        <div className="glass p-6">
          <p className="text-center text-[11px] text-white/30 uppercase tracking-widest mb-4">🏆 XP Levels — Kya Ban Sakte Ho</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {LEVELS.map(l => (
              <div key={l.num} className="text-center p-3 rounded-xl bg-white/3 border border-white/8">
                <div className="text-xl mb-1">{l.icon}</div>
                <p className="text-[11px] font-bold" style={{ color: l.color }}>{l.titleEn}</p>
                <p className="font-hindi text-[10px] text-white/40">{l.title}</p>
                <p className="text-[9px] text-white/20 mt-1">{l.min}+ XP</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // ── ACTIVE CHALLENGE VIEW ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-temple">
      <FloatingMantras />
      <AchToast ach={toast} onClose={() => setToast(null)} />
      {showProfile && (
        <ProfileCard
          challenge={challenge}
          tier={tier!}
          totalXP={totalXP}
          streak={streak}
          currentDay={currentDay}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* Level up modal */}
      {levelUp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }}>
          <div className="glass p-10 text-center max-w-sm w-full mx-4">
            <div className="text-6xl mb-3 animate-float">{levelUp.icon}</div>
            <p className="text-[11px] text-white/30 uppercase tracking-widest mb-2">⬆ Level Up!</p>
            <h2 className="font-hindi text-3xl font-bold mb-1" style={{ color: levelUp.color }}>{levelUp.title}</h2>
            <p className="text-white/50 text-sm mb-1">{levelUp.titleEn}</p>
            <p className="text-gold-400 text-xl font-bold mb-6">Level {levelUp.num} 🎉</p>
            <button onClick={() => setLevelUp(null)}
              className="px-8 py-3 rounded-full text-white font-semibold text-sm transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${levelUp.color}cc, ${levelUp.color}88)` }}>
              Aage Badhte Hain! 🙏
            </button>
          </div>
        </div>
      )}

      {/* Milestone video */}
      {shouldShowMilestone && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.95)' }}>
          <div className="glass max-w-md w-full p-6 text-center">
            <button onClick={() => { localStorage.setItem('bhakti_milestone', `${challenge.tierId}`); setMilestoneFor(`${challenge.tierId}`) }}
              className="absolute top-4 right-4 text-white/30 hover:text-white"><X size={16} /></button>
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="font-hindi text-2xl text-gold-400 mb-1">बधाई हो! 🎉</h2>
            <p className="text-white/60 text-sm mb-4">{tier!.days} din ka challenge poora! Badge: <strong className="text-gold-300">{tier!.badge} {tier!.completionBadge}</strong></p>
            <div className="rounded-xl overflow-hidden" style={{ aspectRatio: '9/16', maxHeight: '360px' }}>
              <iframe src={`https://www.youtube.com/embed/${tier!.completionVideo}?autoplay=1`} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
            </div>
          </div>
        </div>
      )}

      {/* Reset confirm */}
      {confirmReset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="glass max-w-sm w-full p-7 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-white font-semibold mb-2">Challenge Reset?</h3>
            <p className="text-white/40 text-sm mb-2">Saari progress delete hogi.</p>
            <p className="text-gold-400 text-sm italic mb-5">"Haar se mat ghabrao — uthho, seekho, phir chalo" 🙏</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmReset(false)} className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/60 text-sm hover:bg-white/5 transition-all">Nahi</button>
              <button onClick={resetChallenge} className="flex-1 py-2.5 rounded-xl bg-red-800 hover:bg-red-700 text-white text-sm font-semibold transition-all">Reset</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Top nav */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm transition-colors">
            <ArrowLeft size={13} /> Ghar
          </Link>
          <button onClick={() => setConfirmReset(true)} className="flex items-center gap-1.5 text-xs text-red-400/50 hover:text-red-400 transition-colors">
            <RotateCcw size={11} /> Reset
          </button>
        </div>

        {/* ── TOP HUD ── */}
        <div className="glass p-5 mb-5">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Level badge with Aura Ring */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <AuraRing
                level={lv.num}
                color={lv.color}
                days={Math.min(currentDay - 1, tier!.days)}
                maxDays={tier!.days}
                xp={totalXP}
              />
              <div>
                <p className="font-hindi font-bold" style={{ color: lv.color }}>{lv.title}</p>
                <p className="text-white/35 text-xs">{lv.titleEn} — Level {lv.num}</p>
                <p className="text-white/20 text-[10px]">{totalXP} XP</p>
                <button onClick={() => setShowProfile(true)}
                  className="mt-1 text-[10px] px-2.5 py-0.5 rounded-full transition-all hover:opacity-100 opacity-60"
                  style={{ background: `${lv.color}22`, color: lv.color, border: `1px solid ${lv.color}44` }}>
                  🏅 Profile Card
                </button>
              </div>
            </div>

            {/* XP + stats */}
            <div className="flex-1 space-y-3">
              {/* XP bar */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-white/30">XP Progress</span>
                  <span style={{ color: lv.color }}>{totalXP} / {lvNext?.min ?? '∞'}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${lvPct}%`, background: `linear-gradient(90deg, ${lv.color}88, ${lv.color})`, boxShadow: `0 0 8px ${lv.color}` }} />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: `${Math.min(currentDay, tier!.days)}/${tier!.days}`, label: 'Day', icon: '📅', color: '#60a5fa' },
                  { val: streak > 0 ? String(streak) : '0', label: 'Streak 🔥', icon: '', color: '#fb923c' },
                  { val: `${pct}%`, label: 'Aaj', icon: '', color: pct === 100 ? '#34d399' : '#f59e0b' },
                  { val: String(todayP.namaJapCount), label: 'Jap', icon: '📿', color: '#c084fc' },
                ].map(s => (
                  <div key={s.label} className="text-center p-2 rounded-xl bg-white/4">
                    <p className="font-bold text-sm" style={{ color: s.color }}>{s.icon}{s.val}</p>
                    <p className="text-white/25 text-[9px]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[9px] text-white/25 mb-1">
              <span>Challenge Progress</span>
              <span>{Math.round((Math.min(currentDay - 1, tier!.days) / tier!.days) * 100)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min(((currentDay - 1) / tier!.days) * 100, 100)}%`,
                  background: `linear-gradient(90deg, ${tier!.glow}88, ${tier!.glow}, #fde68a)`,
                  boxShadow: `0 0 10px ${tier!.glow}`,
                }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── LEFT: Quests + Mala ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Daily Quests */}
            <div className="glass p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] text-white/25 uppercase tracking-widest">⚔️ Today's Quests</p>
                  <p className="font-hindi text-gold-400 font-semibold mt-0.5">आज के कार्य — Din {currentDay}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/35">{checkedCount}/{TASKS.length}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: pct === 100 ? 'rgba(52,211,153,0.2)' : 'rgba(245,158,11,0.15)', color: pct === 100 ? '#34d399' : '#f59e0b', border: `2px solid ${pct === 100 ? '#34d399' : '#f59e0b'}44` }}>
                    {pct}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {TASKS.map((task) => {
                  const checked = todayP.tasks[task.id] || false
                  return (
                    <button key={task.id} onClick={() => toggleTask(task.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 group ${
                        checked
                          ? 'border border-emerald-500/30'
                          : 'border border-white/8 hover:border-white/20 hover:bg-white/3'
                      }`}
                      style={checked ? { background: 'rgba(16,185,129,0.1)' } : {}}>
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${
                        checked ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40' : 'border-2 border-white/20 group-hover:border-white/40'
                      }`}>
                        {checked && <Check size={13} strokeWidth={3} className="text-white" />}
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-lg flex-shrink-0">{task.emoji}</span>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${checked ? 'text-emerald-300/60 line-through' : 'text-white/80'}`}>{task.label}</p>
                          <p className="font-hindi text-[10px] text-white/25">{task.hindi}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-white/20 flex-shrink-0">+{task.xp} XP</span>
                    </button>
                  )
                })}
              </div>

              {pct === 100 && (
                <div className="mt-4 p-3 rounded-xl text-center border border-emerald-500/30"
                  style={{ background: 'rgba(16,185,129,0.1)' }}>
                  <p className="text-emerald-300 font-hindi font-semibold">🏆 Aaj ke saare quest poore! +50 Bonus XP 🔥</p>
                </div>
              )}
            </div>

            {/* Mala Counter */}
            <div className="glass p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] text-white/25 uppercase tracking-widest">📿 Naam Jap Mala</p>
                  <p className="font-hindi text-gold-400 font-semibold mt-0.5">नाम जप — {TIERS[challenge.tierId].namaJapTarget} Target</p>
                </div>
                {todayP.namaJapCount >= TIERS[challenge.tierId].namaJapTarget && (
                  <span className="text-[10px] text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    ✓ Poori Mala
                  </span>
                )}
              </div>

              <div className={`transition-transform duration-75 ${tapFlash ? 'scale-105' : 'scale-100'}`}>
                <MalaSVG count={todayP.namaJapCount} target={TIERS[challenge.tierId].namaJapTarget} onTap={() => addJap(1)} />
              </div>

              <div className="flex items-center justify-center gap-4 mt-3">
                <button onClick={() => addJap(-10)}
                  className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:border-white/30 hover:text-white transition-all text-xs font-bold">
                  -10
                </button>
                <button onClick={() => addJap(-1)}
                  className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:border-white/30 hover:text-white transition-all">
                  <Minus size={14} />
                </button>
                <button onClick={() => addJap(1)}
                  className="w-16 h-16 rounded-full text-white font-black text-xl shadow-2xl transition-all active:scale-95 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ff7c1a)', boxShadow: '0 0 30px rgba(245,158,11,0.5)' }}>
                  +1
                </button>
                <button onClick={() => addJap(10)}
                  className="w-10 h-10 rounded-full border border-gold-500/40 flex items-center justify-center text-gold-400 hover:bg-gold-500/10 transition-all text-xs font-bold">
                  +10
                </button>
                <button onClick={() => addJap(108)}
                  className="w-10 h-10 rounded-full border border-gold-500/30 flex items-center justify-center text-[9px] text-gold-400/70 hover:bg-gold-500/10 transition-all font-bold">
                  +108
                </button>
              </div>
              <p className="text-center text-white/20 text-[10px] mt-3">Mala bead ko touch karo ya button dabao 🙏</p>
            </div>
          </div>

          {/* ── RIGHT: Enemy + Calendar + Achievements ── */}
          <div className="space-y-5">
            {/* Enemy battle */}
            <EnemyBattle currentDay={currentDay} tier={tier!} />

            {/* Calendar */}
            <div className="glass p-5">
              <p className="text-[10px] text-white/25 uppercase tracking-widest mb-3">📅 Progress Map</p>
              <div className="grid grid-cols-7 gap-1">
                {calDays.map(({ ds, checked, isTdy, isFuture, day }) => {
                  const full = checked >= 10, partial = checked >= 5, miss = !isFuture && !isTdy && checked < 5 && ds < today()
                  return (
                    <div key={ds} title={`Din ${day}`}
                      className={`aspect-square rounded-md flex items-center justify-center text-[9px] font-bold transition-all ${
                        isTdy ? 'ring-2 ring-gold-400 text-gold-300' :
                        isFuture ? 'text-white/15' :
                        full ? 'text-emerald-300' :
                        partial ? 'text-amber-300' :
                        miss ? 'text-red-400/50' : 'text-white/20'
                      }`}
                      style={{ background: isTdy ? 'rgba(245,158,11,0.2)' : full ? 'rgba(16,185,129,0.2)' : partial ? 'rgba(245,158,11,0.15)' : miss ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)' }}>
                      {isTdy ? '▸' : isFuture ? '·' : full ? '★' : partial ? '~' : day}
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-3 mt-2 flex-wrap">
                {[['rgba(16,185,129,0.2)', '★ Full'], ['rgba(245,158,11,0.15)', '~ Half'], ['rgba(239,68,68,0.15)', 'Miss']].map(([bg, label]) => (
                  <div key={label} className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: bg as string }} />
                    <span className="text-[9px] text-white/25">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="glass p-5">
              <p className="text-[10px] text-white/25 uppercase tracking-widest mb-3">🏆 Achievements</p>
              <div className="grid grid-cols-3 gap-2">
                {ACHIEVEMENTS.map(ach => {
                  const unlocked = unlockedAch.includes(ach.id)
                  return (
                    <div key={ach.id} title={`${ach.label}: ${ach.desc}\n+${ach.xp} XP`}
                      className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all ${
                        unlocked ? 'border border-gold-500/40' : 'border border-white/8 opacity-50'
                      }`}
                      style={{ background: unlocked ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)', boxShadow: unlocked ? '0 0 15px rgba(245,158,11,0.2)' : 'none' }}>
                      {unlocked
                        ? <><span className="text-xl">{ach.icon}</span><span className="text-[8px] text-gold-400/70 mt-0.5 text-center px-1 leading-tight">{ach.label}</span></>
                        : <><Lock size={14} className="text-white/20" /><span className="text-[8px] text-white/15 mt-0.5">?</span></>
                      }
                    </div>
                  )
                })}
              </div>
              <p className="text-center text-[10px] text-white/20 mt-2">{unlockedAch.length}/{ACHIEVEMENTS.length} unlocked</p>
            </div>
          </div>
        </div>

        {/* Maharaj Ji quote */}
        <div className="glass p-6 mt-5 flex items-center gap-4">
          <img src="/maharaj.png" alt="" className="w-12 h-12 rounded-full object-cover object-top border border-gold-500/30 flex-shrink-0" />
          <div>
            <p className="font-hindi text-gold-300 italic text-sm leading-relaxed">{QUOTES[currentDay % QUOTES.length]}</p>
            <p className="text-white/25 text-[10px] mt-1">— Premanad Ji Maharaj</p>
          </div>
        </div>
      </div>
    </div>
  )
}
