'use client'

import { useState, useRef } from 'react'
import { Volume2, VolumeX, Loader2 } from 'lucide-react'

interface TTSButtonProps {
  text: string
  className?: string
}

export default function TTSButton({ text, className = '' }: TTSButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'playing'>('idle')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const stopAll = () => {
    audioRef.current?.pause()
    if (audioRef.current) audioRef.current.currentTime = 0
    window.speechSynthesis?.cancel()
    setState('idle')
  }

  const playWithFallback = (text: string) => {
    // Fallback: Web Speech API with Hindi voice
    if (!('speechSynthesis' in window)) { setState('idle'); return }
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    const hindi = voices.find(v => v.lang.startsWith('hi')) || voices.find(v => v.lang.includes('IN'))
    if (hindi) utter.voice = hindi
    utter.lang = 'hi-IN'
    utter.rate = 0.88
    utter.pitch = 1.0
    utter.onstart = () => setState('playing')
    utter.onend = () => setState('idle')
    utter.onerror = () => setState('idle')
    window.speechSynthesis.speak(utter)
    setState('playing')
  }

  const handleClick = async () => {
    if (state === 'playing' || state === 'loading') { stopAll(); return }

    setState('loading')
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!res.ok) throw new Error('TTS API failed')

      const blob = await res.blob()
      if (blob.size < 100) throw new Error('Empty audio')

      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio

      audio.oncanplaythrough = async () => {
        await audio.play()
        setState('playing')
      }
      audio.onended = () => { setState('idle'); URL.revokeObjectURL(url) }
      audio.onerror = () => { setState('idle'); URL.revokeObjectURL(url); playWithFallback(text) }
      audio.load()
    } catch {
      playWithFallback(text)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full transition-all ${
        state === 'playing'
          ? 'bg-saffron-500 text-white'
          : state === 'loading'
          ? 'bg-white/10 text-gold-400 opacity-70'
          : 'bg-white/10 text-gold-400 hover:bg-white/20'
      } ${className}`}
      title={state === 'playing' ? 'Rokein' : 'Suno'}
    >
      {state === 'loading' ? (
        <><Loader2 size={12} className="animate-spin" /><span>...</span></>
      ) : state === 'playing' ? (
        <><VolumeX size={12} /><span>Rokein</span></>
      ) : (
        <><Volume2 size={12} /><span>Suno</span></>
      )}
    </button>
  )
}
