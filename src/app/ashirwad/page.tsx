'use client'

import { useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, Download, Share2, RefreshCw, FlipHorizontal } from 'lucide-react'
import FloatingMantras from '@/components/FloatingMantras'

export default function AshirwadPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [phase, setPhase] = useState<'start' | 'camera' | 'loading' | 'done'>('start')
  const [composited, setComposited] = useState<string | null>(null)
  const [blessing, setBlessing] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')

  const startCamera = useCallback(async (mode: 'user' | 'environment' = 'user') => {
    try {
      streamRef.current?.getTracks().forEach(t => t.stop())
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      })
      streamRef.current = s
      setFacingMode(mode)
      setPhase('camera')
      // Set srcObject after state update, in next tick
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = s
          videoRef.current.play().catch(() => {})
        }
      }, 50)
    } catch (err) {
      console.error('Camera error:', err)
      alert('Camera access nahi mila. Browser settings mein allow karo.')
    }
  }, [])

  const flipCamera = useCallback(() => {
    startCamera(facingMode === 'user' ? 'environment' : 'user')
  }, [facingMode, startCamera])

  // Core: send any dataUrl to Gemini and get composite back
  const sendToGemini = useCallback(async (userPhoto: string) => {
    setPhase('loading')
    try {
      const base64 = userPhoto.split(',')[1]
      const mimeType = userPhoto.split(';')[0].replace('data:', '')

      const res = await fetch('/api/ashirwad-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPhotoBase64: base64, mimeType }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'API failed')
      }

      const data = await res.json()
      setComposited(`data:${data.imageMimeType};base64,${data.imageBase64}`)
      if (data.caption) setBlessing(data.caption)

      fetch('/api/ashirwad-blessing', { method: 'POST' })
        .then(r => r.json())
        .then(d => { if (!data.caption) setBlessing(d.blessing) })
        .catch(() => {})

      setPhase('done')
    } catch (e) {
      console.error(e)
      setPhase('start')
      alert(`Kuch gadbad ho gayi: ${e instanceof Error ? e.message : 'Unknown error'}. Dobara try karo.`)
    }
  }, [])


  const capture = useCallback(async () => {
    if (!videoRef.current) return
    const video = videoRef.current

    // Capture frame — square crop from center
    const vw = video.videoWidth || 640
    const vh = video.videoHeight || 480
    const side = Math.min(vw, vh)
    const tmp = document.createElement('canvas')
    tmp.width = tmp.height = side
    const tc = tmp.getContext('2d')!
    const offsetX = (vw - side) / 2
    const offsetY = (vh - side) / 2
    if (facingMode === 'user') {
      tc.translate(side, 0)
      tc.scale(-1, 1)
    }
    tc.drawImage(video, offsetX, offsetY, side, side, 0, 0, side, side)
    const userPhoto = tmp.toDataURL('image/jpeg', 0.92)

    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null

    await sendToGemini(userPhoto)
  }, [facingMode, sendToGemini])

  const reset = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setPhase('start')
    setComposited(null)
    setBlessing(null)
  }, [])

  const download = () => {
    if (!composited) return
    const a = document.createElement('a')
    a.href = composited
    a.download = 'maharaj-ashirwad.jpg'
    a.click()
  }

  const shareWA = () => {
    const text = `🙏 Premanad Ji Maharaj ka Ashirwad!\n\n${blessing ?? 'Radhe Radhe'}\n\nbhaktimarg.app`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-temple flex flex-col items-center px-4 py-8">
      <FloatingMantras />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-hindi text-gold-300 text-xl font-semibold">Ashirwad Photo</h1>
            <p className="text-white/30 text-xs">Premanad Ji Maharaj ke saath selfie 🙏</p>
          </div>
        </div>

        {/* ── START ── */}
        {phase === 'start' && (
          <div className="flex flex-col items-center gap-7 py-10">
            {/* Maharaj Ji preview */}
            <div className="relative">
              <div className="absolute inset-0 blur-3xl opacity-50 scale-125"
                style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.7), transparent)' }} />
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-gold-500/60"
                style={{ boxShadow: '0 0 50px rgba(245,158,11,0.35)' }}>
                <img src="/maharaj-chat.jpeg" alt="Maharaj Ji"
                  className="w-full h-full object-cover" style={{ objectPosition: '50% 35%' }} />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-gold-400/70 font-hindi bg-[#080200]/80 px-3 py-1 rounded-full border border-gold-500/20">
                प्रेमानंद जी महाराज
              </div>
            </div>

            <div className="text-center px-4">
              <p className="font-hindi text-gold-300 text-lg font-semibold">Ashirwad lo Maharaj Ji se</p>
              <p className="text-white/35 text-sm mt-2 leading-relaxed">
                Apna camera kholo — Maharaj Ji ke saath photo aayegi.<br />
                Unka ashirwad aur pyaar tumhare saath.
              </p>
            </div>

            <button onClick={() => startCamera('user')}
              className="flex items-center gap-2.5 px-10 py-4 rounded-full text-white font-semibold text-base transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ff7c1a)', boxShadow: '0 0 30px rgba(245,158,11,0.45)' }}>
              <Camera size={18} /> Camera Kholo
            </button>


            <p className="text-white/20 text-xs text-center font-serif italic">
              🙏 Radhe Radhe — Prabhu ki kripa
            </p>
          </div>
        )}

        {/* ── CAMERA ── */}
        {phase === 'camera' && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black"
              style={{ aspectRatio: '1/1', border: '2px solid rgba(245,158,11,0.3)', boxShadow: '0 0 40px rgba(245,158,11,0.15)' }}>
              <video ref={videoRef} autoPlay playsInline muted
                className="w-full h-full object-cover"
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                onLoadedMetadata={() => { videoRef.current?.play().catch(() => {}) }} />

              {/* Vignette overlay */}
              <div className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(8,2,0,0.7) 100%)' }} />

              {/* Top hint */}
              <div className="absolute top-4 left-0 right-0 text-center">
                <span className="text-gold-400/80 text-xs bg-black/40 px-3 py-1 rounded-full font-hindi backdrop-blur-sm">
                  Apna chehra frame mein rakhein 🙏
                </span>
              </div>

              {/* Face guide circle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 rounded-full border-2 border-dashed opacity-30"
                  style={{ borderColor: 'rgba(245,158,11,0.8)' }} />
              </div>

              {/* Flip + Capture buttons */}
              <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-8">
                <button onClick={flipCamera}
                  className="w-12 h-12 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white/70 border border-white/15 hover:border-gold-500/40 transition-all">
                  <FlipHorizontal size={18} />
                </button>

                <button onClick={capture}
                  className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-gold-400 transition-all active:scale-90 hover:scale-105"
                  style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.4), rgba(8,2,0,0.6))', boxShadow: '0 0 30px rgba(245,158,11,0.5)' }}>
                  <Camera size={28} className="text-gold-300" />
                </button>

                <button onClick={reset}
                  className="w-12 h-12 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white/50 border border-white/10 transition-all">
                  <ArrowLeft size={18} />
                </button>
              </div>
            </div>

            <p className="text-center text-white/25 text-xs font-serif italic">
              Camera button press karo — Maharaj Ji ke saath photo aa jaayegi ✨
            </p>
          </div>
        )}

        {/* ── LOADING ── */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-5 py-20">
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 rounded-full border-2 border-gold-500/20" />
              <div className="absolute inset-0 rounded-full border-t-2 border-gold-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <img src="/maharaj-chat.jpeg" alt="" className="w-20 h-20 rounded-full object-cover" style={{ objectPosition: '50% 35%' }} />
              </div>
            </div>
            <p className="font-hindi text-gold-400 text-lg animate-pulse">Ashirwad taiyaar ho raha hai...</p>
            <p className="text-white/30 text-sm font-serif italic">Maharaj Ji photo mein aa rahe hain 🙏</p>
          </div>
        )}

        {/* ── DONE ── */}
        {phase === 'done' && composited && (
          <div className="space-y-5">
            {/* Result image */}
            <div className="rounded-2xl overflow-hidden"
              style={{ border: '2px solid rgba(245,158,11,0.4)', boxShadow: '0 0 50px rgba(245,158,11,0.2)' }}>
              <img src={composited} alt="Ashirwad Photo" className="w-full" />
            </div>

            {/* Blessing from Gemini */}
            {blessing ? (
              <div className="p-4 rounded-xl text-center"
                style={{ background: 'rgba(20,8,0,0.9)', border: '1px solid rgba(245,158,11,0.25)', boxShadow: '0 0 20px rgba(245,158,11,0.08)' }}>
                <p className="font-hindi text-gold-300 text-sm leading-relaxed">"{blessing}"</p>
                <p className="text-white/25 text-[10px] mt-2 font-serif italic">— Premanad Ji Maharaj</p>
              </div>
            ) : (
              <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(20,8,0,0.6)' }}>
                <div className="text-sm animate-pulse text-gold-500/50 font-hindi">Ashirwad aa raha hai...</div>
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button onClick={download}
                className="flex flex-col items-center gap-1.5 py-3.5 rounded-xl text-xs font-semibold text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ff7c1a)', boxShadow: '0 0 18px rgba(245,158,11,0.35)' }}>
                <Download size={18} />
                Download
              </button>

              <button onClick={shareWA}
                className="flex flex-col items-center gap-1.5 py-3.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                style={{ background: 'rgba(22,163,74,0.2)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.35)' }}>
                <Share2 size={18} />
                WhatsApp
              </button>

              <button onClick={reset}
                className="flex flex-col items-center gap-1.5 py-3.5 rounded-xl text-xs text-white/50 border border-white/10 transition-all hover:border-white/25 active:scale-95">
                <RefreshCw size={18} />
                Dobara
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
