'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Clock, MessageCircle } from 'lucide-react'

interface VideoCardProps {
  video: {
    video_id?: string
    id?: string
    youtube_id: string
    title: string
    thumbnail_url: string | null
    youtube_url: string
    duration: number
    similarity?: number
    chunk_text?: string
  }
  showSnippet?: boolean
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VideoCard({ video, showSnippet = true }: VideoCardProps) {
  const [imgError, setImgError] = useState(false)
  const videoId = video.video_id || video.id
  const thumbnail = video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`

  return (
    <div className="glass-card sacred-border group overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-saffron-900/30">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {!imgError ? (
          <img
            src={thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-saffron-800 to-maroon flex items-center justify-center">
            <span className="text-5xl om-glow">🕉️</span>
          </div>
        )}

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
          <Clock size={10} />
          {formatDuration(video.duration)}
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 bg-saffron-500 rounded-full flex items-center justify-center shadow-lg shadow-saffron-900">
            <Play size={20} fill="white" className="text-white ml-1" />
          </div>
        </div>

        {/* Similarity badge */}
        {video.similarity !== undefined && (
          <div className="absolute top-2 left-2 bg-gold-500/90 text-deep text-xs font-semibold px-2 py-0.5 rounded-full">
            {Math.round(video.similarity * 100)}% match
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-saffron-100 line-clamp-2 leading-snug mb-2">
          {video.title}
        </h3>

        {showSnippet && video.chunk_text && (
          <p className="text-xs text-saffron-300/70 line-clamp-2 mb-3 italic font-light leading-relaxed">
            "...{video.chunk_text.slice(0, 120)}..."
          </p>
        )}

        <div className="flex gap-2">
          <a
            href={video.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-lg transition-colors"
          >
            <Play size={11} fill="white" />
            YouTube
          </a>
          {videoId && (
            <Link
              href={`/video/${videoId}`}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-saffron-600 hover:bg-saffron-500 text-white py-1.5 rounded-lg transition-colors"
            >
              <MessageCircle size={11} />
              Chat
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
