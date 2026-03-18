import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { count } = await supabase
      .from('transcript_chunks')
      .select('*', { count: 'exact', head: true })

    const total = count || 100
    const today = new Date()
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
    const offset = seed % total

    const { data } = await supabase
      .from('transcript_chunks')
      .select('id, chunk_text, video_id, videos(id, youtube_id, title, thumbnail_url)')
      .range(offset, offset)
      .single()

    return NextResponse.json({ pravachan: data })
  } catch {
    return NextResponse.json({ pravachan: null })
  }
}
