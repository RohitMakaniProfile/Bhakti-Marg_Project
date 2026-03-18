'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'

const EMOTIONS = [
  { emoji: '💔', label: 'Toota Hua Dil', sublabel: 'Heartbreak', query: 'heartbreak relationship pain loneliness dukh' },
  { emoji: '😢', label: 'Emotional Breakdown', sublabel: 'Rona chahte ho', query: 'emotional breakdown crying grief overwhelmed dukh ro raha' },
  { emoji: '😔', label: 'Akela Mehsoos', sublabel: 'Loneliness', query: 'loneliness akela isolated nobody understands me' },
  { emoji: '😤', label: 'Krodh & Gussa', sublabel: 'Anger', query: 'anger krodh frustration agitation irritation' },
  { emoji: '😰', label: 'Darr & Chinta', sublabel: 'Fear & Anxiety', query: 'fear anxiety worry chinta darr future uncertainty' },
  { emoji: '😞', label: 'Udaasi', sublabel: 'Depression', query: 'depression sadness darkness hopeless udas niraasha' },
  { emoji: '🙏', label: 'Bhakti Ka Raasta', sublabel: 'Spiritual Seeking', query: 'bhakti devotion how to pray connect with god spirituality' },
  { emoji: '🌸', label: 'Shanti Chahiye', sublabel: 'Seeking Peace', query: 'peace shanti calm mind restless inner peace tranquility' },
  { emoji: '👨‍👩‍👧', label: 'Rishton Ki Takleef', sublabel: 'Relationship Pain', query: 'relationship pain family problems misunderstanding rishta problem' },
  { emoji: '🎯', label: 'Jeene Ka Maksad', sublabel: 'Life Purpose', query: 'life purpose meaning what is the point why am I here goal' },
  { emoji: '😓', label: 'Stress & Thakan', sublabel: 'Exhaustion', query: 'stress exhaustion tired burnout thaka hua overworked' },
  { emoji: '🌙', label: 'Sukoon Nahi', sublabel: 'No inner rest', query: 'no peace restless mind sleep troubled thoughts overthinking' },
]

interface EmotionSelectorProps {
  onSearch: (query: string, emotionLabel: string) => void
  isLoading: boolean
}

export default function EmotionSelector({ onSearch, isLoading }: EmotionSelectorProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [customQuery, setCustomQuery] = useState('')

  const handleEmotionClick = (index: number) => {
    setSelected(index)
    onSearch(EMOTIONS[index].query, EMOTIONS[index].label)
  }

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (customQuery.trim()) {
      setSelected(null)
      onSearch(customQuery.trim(), customQuery.trim())
    }
  }

  return (
    <div className="space-y-6">
      {/* Custom search */}
      <form onSubmit={handleCustomSearch} className="flex gap-2">
        <input
          type="text"
          value={customQuery}
          onChange={e => setCustomQuery(e.target.value)}
          placeholder="Ya seedha likhein — jaise 'mujhe neend nahi aati'..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!customQuery.trim() || isLoading}
          className="px-4 py-2.5 bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-deep font-medium rounded-xl text-sm flex items-center gap-2 transition-colors"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          Dhundho
        </button>
      </form>

      {/* Emotion grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {EMOTIONS.map((emotion, i) => (
          <button
            key={i}
            onClick={() => !isLoading && handleEmotionClick(i)}
            disabled={isLoading}
            className={`glass-card p-3 text-center cursor-pointer transition-all duration-200 hover:scale-105 disabled:cursor-wait group ${
              selected === i
                ? 'border-gold-500 bg-gold-500/10 scale-105'
                : ''
            }`}
          >
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
              {emotion.emoji}
            </div>
            <div className="text-[11px] font-medium text-saffron-200 leading-tight">{emotion.label}</div>
            <div className="text-[9px] text-white/40 mt-0.5 leading-tight">{emotion.sublabel}</div>
            {isLoading && selected === i && (
              <div className="mt-1.5 flex justify-center">
                <Loader2 size={10} className="animate-spin text-gold-400" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
