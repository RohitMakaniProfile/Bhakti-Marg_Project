'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, type Video } from '@/lib/supabase'
import ChatInterface from '@/components/ChatInterface'
import { ArrowLeft, Clock, ExternalLink } from 'lucide-react'
import Link from 'next/link'

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VideoPage() {
  const params = useParams()
  const videoId = params.id as string

  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!videoId) return
    fetchVideo()
  }, [videoId])

  const fetchVideo = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single()

      if (error || !data) {
        setError('Video nahi mili.')
      } else {
        setVideo(data)
      }
    } catch (e) {
      setError('Kuch error aaya.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-float mb-4">🕉️</div>
          <p className="text-gold-400 animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <div className="text-4xl mb-3">🙏</div>
          <p className="text-white/60 mb-4">{error || 'Video nahi mili'}</p>
          <Link href="/" className="text-gold-400 hover:text-gold-300 text-sm flex items-center gap-2 justify-center">
            <ArrowLeft size={14} /> Wapas jayein
          </Link>
        </div>
      </div>
    )
  }

  const youtubeEmbedId = video.youtube_id

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-deep/80 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-white/50 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-medium text-saffron-100 truncate">{video.title}</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40 flex-shrink-0">
          <Clock size={12} />
          {formatDuration(video.duration)}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Video */}
          <div className="lg:w-[55%] space-y-4">
            {/* YouTube embed */}
            <div className="aspect-video rounded-xl overflow-hidden shadow-2xl shadow-black/50">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeEmbedId}?rel=0&modestbranding=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            {/* Video info */}
            <div className="glass-card p-4">
              <h2 className="text-base font-medium text-saffron-100 mb-2 leading-snug">
                {video.title}
              </h2>
              {video.description && (
                <p className="text-sm text-white/40 leading-relaxed line-clamp-3">
                  {video.description}
                </p>
              )}
              <a
                href={video.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <ExternalLink size={12} />
                YouTube par dekho
              </a>
            </div>
          </div>

          {/* Right: Chat */}
          <div className="lg:w-[45%]">
            <div className="glass-card h-[600px] flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 bg-saffron-900/20 flex-shrink-0">
                <h3 className="text-sm font-semibold text-gold-400">
                  💬 Is Pravachan se baat karein
                </h3>
                <p className="text-xs text-white/30 mt-0.5">
                  Is video ke baare mein kuch bhi puchh sakte ho
                </p>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatInterface
                  endpoint="/api/video-chat"
                  extraBody={{ videoId: video.id }}
                  welcomeMessage={`Radhe Radhe 🙏\n\nIs pravachan mein jo bola gaya hai — uspe koi bhi sawaal puchho. Koi baat samajh nahi aayi, ya aur gehraai mein jaana chahte ho — sab bol sakte ho.`}
                  placeholder="Is video ke baare mein puchhen..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
