import { NextRequest, NextResponse } from 'next/server'
import { generateEmbedding } from '@/lib/embeddings'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { query, matchCount = 6 } = await req.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query required' }, { status: 400 })
    }

    // Generate embedding for the search query
    const embedding = await generateEmbedding(query)

    // Semantic search in Supabase
    const { data, error } = await supabase.rpc('search_transcripts', {
      query_embedding: embedding,
      match_threshold: 0.05,
      match_count: matchCount * 3,
    })

    if (error) {
      console.error('Supabase search error:', error)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    // Deduplicate by video_id (keep the best matching chunk per video)
    const seen = new Set<string>()
    const unique = (data || []).filter((item: any) => {
      if (seen.has(item.video_id)) return false
      seen.add(item.video_id)
      return true
    })

    return NextResponse.json({ results: unique })
  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
