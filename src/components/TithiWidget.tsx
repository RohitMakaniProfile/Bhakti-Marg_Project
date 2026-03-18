'use client'

const EKADASHI_2026 = [
  { date: '2026-01-11', name: 'Putrada Ekadashi',   paksha: 'Shukla' },
  { date: '2026-01-25', name: 'Shattila Ekadashi',  paksha: 'Krishna' },
  { date: '2026-02-09', name: 'Jaya Ekadashi',      paksha: 'Shukla' },
  { date: '2026-02-24', name: 'Vijaya Ekadashi',    paksha: 'Krishna' },
  { date: '2026-03-11', name: 'Amalaki Ekadashi',   paksha: 'Shukla' },
  { date: '2026-03-25', name: 'Papmochani Ekadashi',paksha: 'Krishna' },
  { date: '2026-04-09', name: 'Kamada Ekadashi',    paksha: 'Shukla' },
  { date: '2026-04-24', name: 'Varuthini Ekadashi', paksha: 'Krishna' },
  { date: '2026-05-09', name: 'Mohini Ekadashi',    paksha: 'Shukla' },
  { date: '2026-05-23', name: 'Apara Ekadashi',     paksha: 'Krishna' },
  { date: '2026-06-07', name: 'Nirjala Ekadashi',   paksha: 'Shukla' },
  { date: '2026-06-22', name: 'Yogini Ekadashi',    paksha: 'Krishna' },
  { date: '2026-07-07', name: 'Devshayani Ekadashi',paksha: 'Shukla' },
  { date: '2026-07-21', name: 'Kamika Ekadashi',    paksha: 'Krishna' },
  { date: '2026-08-05', name: 'Shravana Putrada',   paksha: 'Shukla' },
  { date: '2026-08-20', name: 'Aja Ekadashi',       paksha: 'Krishna' },
]

const TITHI_NAMES = [
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima/Amavasya',
]

const MOON_EMOJIS = ['🌑','🌒','🌒','🌓','🌓','🌔','🌔','🌕','🌕','🌖','🌖','🌗','🌗','🌘','🌘']

function getMoonPhase(date: Date) {
  const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime()
  const LUNAR_CYCLE = 29.530588853 * 24 * 3600 * 1000
  const elapsed = date.getTime() - KNOWN_NEW_MOON
  const phase = ((elapsed % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE
  const phaseDay = phase / (24 * 3600 * 1000) // 0–29.53
  const tithiNum = Math.floor(phaseDay / (LUNAR_CYCLE / (24 * 3600 * 1000) / 30)) + 1
  const tithi = Math.min(Math.max(tithiNum, 1), 30)
  const paksha = tithi <= 15 ? 'Shukla' : 'Krishna'
  const tithiInPaksha = tithi <= 15 ? tithi : tithi - 15
  const moonIdx = Math.floor((phaseDay / 29.53) * 15)
  return {
    tithi, paksha, tithiInPaksha,
    tithiName: TITHI_NAMES[(tithiInPaksha - 1) % TITHI_NAMES.length],
    moonEmoji: MOON_EMOJIS[Math.min(moonIdx, 14)],
    phaseDay,
  }
}

function getSadhana(tithi: number, todayStr: string): string {
  const isEka = EKADASHI_2026.some(e => e.date === todayStr)
  if (isEka) return 'Nirjala vrat ya phalahar. Naam jap sabse adhik karein. Sattvic aur pavitra din hai aaj 🙏'
  const t = tithi % 30
  if (t === 15) return 'Purnima hai — bhakti ka sabse shubh din. Raat mein jaag ke naam jap karein. Radhe Radhe 🌕'
  if (t === 0 || t === 30) return 'Amavasya hai — pitra tarpan karein. Maun ka abhyas karein. Sattvic rahein 🌑'
  if (t === 4 || t === 19) return 'Chaturthi — Ganesh ji ki pooja karein. Obstacles door honge.'
  return 'Brahma Muhurta mein uthein. Pranayama + Naam Jap. Sattvic bhojan lo. Radhe Radhe 🌸'
}

export default function TithiWidget() {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const moon = getMoonPhase(now)

  const todayEkadashi = EKADASHI_2026.find(e => e.date === todayStr)
  const upcoming = EKADASHI_2026.find(e => {
    const diff = (new Date(e.date).getTime() - now.getTime()) / 86400000
    return diff > 0 && diff <= 3
  })

  const sadhana = getSadhana(moon.tithi, todayStr)

  return (
    <div className="relative overflow-hidden rounded-2xl"
      style={{ background: 'rgba(8,2,0,0.92)', border: '1px solid rgba(245,158,11,0.12)' }}>
      <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)' }} />

      <div className="p-4">
        {/* Moon + Tithi */}
        <div className="flex items-center gap-3 mb-3">
          <div className="text-3xl animate-float2" style={{ filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.4))' }}>
            {moon.moonEmoji}
          </div>
          <div>
            <p className="font-hindi text-gold-300 text-sm font-semibold">{moon.tithiName}</p>
            <p className="text-white/30 text-[10px]">{moon.paksha} Paksha · Tithi {moon.tithiInPaksha}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] text-white/20 uppercase tracking-wider">Aaj ki Tithi</p>
            <p className="text-[10px] text-white/15">{now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
          </div>
        </div>

        {/* Ekadashi highlight */}
        {todayEkadashi && (
          <div className="mb-3 px-3 py-2 rounded-xl flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(180,60,0,0.15))', border: '1px solid rgba(245,158,11,0.4)' }}>
            <span className="text-lg">🌟</span>
            <div>
              <p className="text-gold-300 text-xs font-bold">Aaj Ekadashi hai!</p>
              <p className="text-gold-400/60 text-[10px]">{todayEkadashi.name}</p>
            </div>
          </div>
        )}

        {/* Upcoming Ekadashi warning */}
        {!todayEkadashi && upcoming && (
          <div className="mb-3 px-3 py-1.5 rounded-xl flex items-center gap-2 bg-white/4 border border-white/8">
            <span className="text-sm">⏰</span>
            <p className="text-white/40 text-[10px]">
              {Math.ceil((new Date(upcoming.date).getTime() - now.getTime()) / 86400000)} din mein — {upcoming.name}
            </p>
          </div>
        )}

        {/* Sadhana recommendation */}
        <div className="border-t border-white/6 pt-3">
          <p className="text-[9px] uppercase tracking-widest text-white/20 mb-1.5">🙏 Aaj ki Sadhana</p>
          <p className="text-white/45 text-[11px] leading-relaxed">{sadhana}</p>
        </div>
      </div>
    </div>
  )
}
