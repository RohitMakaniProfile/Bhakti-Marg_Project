import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Video = {
  id: string
  youtube_id: string
  title: string
  description: string | null
  duration: number
  thumbnail_url: string | null
  youtube_url: string
  published_at: string | null
  created_at: string
}

export type TranscriptChunk = {
  id: string
  video_id: string
  chunk_text: string
  chunk_index: number
}

export type SearchResult = {
  chunk_id: string
  video_id: string
  chunk_text: string
  similarity: number
  youtube_id: string
  title: string
  thumbnail_url: string | null
  youtube_url: string
  duration: number
}
