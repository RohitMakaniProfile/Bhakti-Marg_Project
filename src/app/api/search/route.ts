import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Extract meaningful Hindi/English keywords from query
function extractKeywords(query: string): string[] {
  const stopWords = new Set(['ka','ki','ke','hai','hain','ko','se','mein','kya','aur','ya','tha','the','thi','aap','main','hum','tum','yeh','woh','ek','ho','karo'])
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))
    .slice(0, 6)
}

export async function POST(req: NextRequest) {
  try {
    const { query, matchCount = 6 } = await req.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query required' }, { status: 400 })
    }

    // ── 1. Try vector (semantic) search first ──
    try {
      const { generateEmbedding } = await import('@/lib/embeddings')
      const embedding = await generateEmbedding(query)

      const { data, error } = await supabase.rpc('search_transcripts', {
        query_embedding: embedding,
        match_threshold: 0.05,
        match_count: matchCount * 3,
      })

      if (!error && data && data.length > 0) {
        const seen = new Set<string>()
        const unique = data.filter((item: any) => {
          if (seen.has(item.video_id)) return false
          seen.add(item.video_id)
          return true
        })
        return NextResponse.json({ results: unique, method: 'vector' })
      }
    } catch (embErr) {
      console.warn('Vector search unavailable, falling back to text search:', embErr)
    }

    // ── 2. Fallback: keyword full-text search ──
    const keywords = extractKeywords(query)

    if (keywords.length === 0) {
      return NextResponse.json({ results: [] })
    }

    // Build OR filter: chunk_text ilike any keyword
    const orFilter = keywords.map(kw => `chunk_text.ilike.%${kw}%`).join(',')

    const { data: textData, error: textError } = await supabase
      .from('transcript_chunks')
      .select(`
        id,
        chunk_text,
        video_id,
        similarity:chunk_index,
        videos!inner (
          id,
          youtube_id,
          title,
          thumbnail_url,
          duration
        )
      `)
      .or(orFilter)
      .gt('chunk_index', 0)
      .limit(matchCount * 4)

    if (textError) {
      console.error('Text search error:', textError)
      return NextResponse.json({ results: [] })
    }

    // Score by number of keyword matches, dedup by video
    const scored = (textData || []).map((row: any) => ({
      ...row,
      score: keywords.filter(kw => row.chunk_text?.toLowerCase().includes(kw)).length,
    }))
    scored.sort((a: any, b: any) => b.score - a.score)

    const seen = new Set<string>()
    const unique = scored.filter((item: any) => {
      if (seen.has(item.video_id)) return false
      seen.add(item.video_id)
      return true
    }).slice(0, matchCount)

    return NextResponse.json({ results: unique, method: 'text' })
  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
