import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bhakti Marg — Premanad Ji Maharaj',
  description: 'Spiritual guidance through the teachings of Premanad Ji Maharaj. Find peace, devotion, and divine wisdom.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased" style={{ background: '#080200' }}>

        {/* ── Top Navigation ── */}
        <nav className="nav-glass fixed top-0 left-0 right-0 z-40">
          {/* Gold top line */}
          <div className="h-px w-full"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.6) 30%, rgba(255,180,50,0.8) 50%, rgba(245,158,11,0.6) 70%, transparent 100%)' }} />

          <div className="flex items-center justify-between px-5 py-3">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-500 to-saffron-600 blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[#2a0f00] to-[#180800] border border-gold-500/40 flex items-center justify-center">
                  <span className="text-lg diya-flame">🕉️</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="font-display text-sm font-bold text-gold-shimmer leading-tight">Bhakti Marg</p>
                <p className="font-hindi text-[9px] text-gold-500/50 leading-none tracking-wider">॥ राधे राधे ॥</p>
              </div>
            </Link>

            {/* Center: Marquee quote */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-gold-500/40 font-hindi overflow-hidden max-w-xs">
              <span className="animate-pulse-slow text-gold-500/30">✦</span>
              <span className="truncate">"राधे राधे बोलने से ही मन शांत हो जाता है"</span>
              <span className="animate-pulse-slow text-gold-500/30">✦</span>
            </div>

            {/* Right: Nav links + Maharaj name */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href="/ashirwad"
                className="nav-link hidden md:flex items-center gap-1.5 text-xs text-white/40 hover:text-gold-300 px-3 py-1.5 rounded-full hover:bg-gold-500/8 transition-all">
                <span>🙏</span>
                <span className="hidden lg:inline">Ashirwad</span>
              </Link>
              <Link href="/reels"
                className="nav-link hidden md:flex items-center gap-1.5 text-xs text-white/40 hover:text-gold-300 px-3 py-1.5 rounded-full hover:bg-gold-500/8 transition-all">
                <span>▶</span>
                <span className="hidden lg:inline">Reels</span>
              </Link>
              <Link href="/activities"
                className="nav-link hidden sm:flex items-center gap-1.5 text-xs text-white/40 hover:text-gold-300 px-3 py-1.5 rounded-full hover:bg-gold-500/8 transition-all">
                <span>🕉️</span>
                <span className="hidden md:inline">Activities</span>
              </Link>
              <Link href="/challenge" className="challenge-nav-btn nav-link flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all">
                <span>🔱</span>
                <span className="hidden sm:inline">Challenge</span>
              </Link>
              <div className="hidden sm:block h-4 w-px bg-white/10" />
              <div className="hidden sm:flex items-center gap-1.5">
                <img src="/maharaj.png" alt="Maharaj Ji"
                  className="w-6 h-6 rounded-full object-cover object-top border border-gold-500/30"
                  style={{ filter: 'brightness(0.9)' }} />
                <span className="text-[10px] text-white/25 font-serif italic hidden lg:block">Premanad Ji Maharaj</span>
              </div>
            </div>
          </div>

          {/* Gold bottom line */}
          <div className="h-px w-full"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.12) 50%, transparent 100%)' }} />
        </nav>

        {/* Page content */}
        <div className="pt-14">
          {children}
        </div>
      </body>
    </html>
  )
}
