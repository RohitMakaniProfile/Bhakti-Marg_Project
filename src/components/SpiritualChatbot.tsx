'use client'

import { useState } from 'react'
import { X, ChevronRight } from 'lucide-react'
import ChatInterface from './ChatInterface'

export default function SpiritualChatbot() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* ── Floating trigger button ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-50 group flex flex-col items-center gap-2"
        >
          {/* Outer glow rings */}
          <div className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-gold-500 to-saffron-600 blur-xl opacity-40 animate-pulse-slow" />
          <div className="absolute w-24 h-24 rounded-full border border-gold-400/30 animate-ping" style={{ animationDuration: '2.5s' }} />

          {/* Main button */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gold-400/60 shadow-2xl shadow-saffron-900/70 group-hover:scale-110 transition-transform duration-300"
            style={{ background: 'linear-gradient(135deg, #b8860b, #ff7c1a, #800020)' }}>
            <img src="/maharaj-chat.jpeg" alt="Maharaj Ji"
              className="w-full h-full object-cover"
              style={{ objectPosition: '50% 55%', filter: 'brightness(0.95)' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="bg-[#150800] border border-gold-500/30 text-gold-300 text-xs px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
              <span className="font-hindi">Maharaj Ji se baat karein</span>
              <ChevronRight size={10} />
            </div>
          </div>
        </button>
      )}

      {/* ── Side panel overlay ── */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        style={{ background: isOpen ? 'rgba(0,0,0,0.6)' : 'transparent' }}
        onClick={() => setIsOpen(false)}
      />

      {/* ── Main chat panel ── */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[60] flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: 'min(440px, 100vw)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Panel background */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, #120600 0%, #0a0300 40%, #080200 100%)',
          borderLeft: '1px solid rgba(245,158,11,0.2)',
        }} />

        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(180,70,0,0.35) 0%, transparent 100%)' }} />

        {/* ── HEADER ── */}
        <div className="relative flex-shrink-0">
          {/* Hero image strip */}
          <div className="relative h-48 overflow-hidden">
            <img src="/maharaj-chat.jpeg" alt="Premanad Ji Maharaj"
              className="w-full h-full object-cover"
              style={{ objectPosition: '50% 40%', filter: 'brightness(0.5) saturate(1.4)' }} />

            {/* Gradient overlay */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(180deg, rgba(8,2,0,0.3) 0%, rgba(8,2,0,0.9) 100%)'
            }} />

            {/* Background Krishna/Radha collage */}
            <div className="absolute top-0 right-0 bottom-0 w-1/3 overflow-hidden opacity-30">
              <img src="/radha.png" alt="" className="w-full h-full object-cover" style={{ filter: 'blur(2px)' }} />
            </div>

            {/* Close button */}
            <button onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white/60 hover:text-white transition-all border border-white/10">
              <X size={14} />
            </button>

            {/* Header content */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 flex items-end gap-4">
              {/* Round avatar */}
              <div className="relative w-14 h-14 flex-shrink-0 mb-1">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-400 to-saffron-500 animate-pulse-slow blur-sm" />
                <div className="maharaj-frame w-14 h-14" style={{ animation: 'none', background: 'linear-gradient(135deg, #f59e0b, #ff7c1a, #fde68a)' }}>
                  <img src="/maharaj-chat.jpeg" alt="Maharaj Ji" className="w-full h-full object-cover" style={{ objectPosition: '50% 55%' }} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="font-hindi text-gold-300 text-lg font-semibold leading-tight">प्रेमानंद जी महाराज</h2>
                <p className="text-white/40 text-xs font-serif italic mt-0.5">Premanad Ji Maharaj</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <span className="text-emerald-400/80 text-[10px]">Pravachan AI — Sadasiv Upasthit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative border */}
          <div className="relative h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.7), rgba(255,140,0,0.5), rgba(245,158,11,0.7), transparent)' }}>
            <div className="absolute inset-0 blur-sm"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)' }} />
          </div>

          {/* Sub-header */}
          <div className="relative px-5 py-3 flex items-center gap-3"
            style={{ background: 'rgba(180,60,0,0.12)' }}>
            <div className="text-lg">🙏</div>
            <div className="flex-1">
              <p className="text-xs text-white/50 font-serif italic leading-relaxed">
                Apna dard, sawaal ya bhavna share karein
              </p>
            </div>
            <div className="flex gap-1">
              {['/radha.png', '/krishna-rukmini.jpg'].map((img, i) => (
                <div key={i} className="w-6 h-6 rounded-full overflow-hidden border border-gold-500/30 flex-shrink-0">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.15), transparent)' }} />
        </div>

        {/* ── CHAT BODY ── */}
        <div className="relative flex-1 overflow-hidden">
          <ChatInterface
            endpoint="/api/chat"
            welcomeMessage={`Radhe Radhe 🙏\n\nSuno... jo bhi mann mein chal raha hai, yahan bol sakte ho. Dukh ho, sawaal ho, kuch samajh nahi aa raha — sab theek hai.\n\nPrabhu ki sharan mein koi akela nahi hota.`}
            placeholder="Apni takleef ya sawaal likhein..."
          />
        </div>
      </div>
    </>
  )
}
