import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Fetch a larger set and shuffle server-side for variety
    const { data, error } = await supabase
      .from('transcript_chunks')
      .select('id, chunk_text, chunk_index, video_id, videos(id, youtube_id, title, thumbnail_url, duration)')
      .gt('chunk_index', 0) // skip first chunk (often intro)
      .limit(60)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const items = (data || []).filter(r => {
      const text = r.chunk_text || ''
      return text.length > 80 && text.length < 600 // good length for a reel
    })

    // Shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]]
    }

    return NextResponse.json({ reels: items.slice(0, 20) })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
