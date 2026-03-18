import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { generateEmbedding } from '@/lib/embeddings'
import { supabase } from '@/lib/supabase'
import type { SearchResult } from '@/lib/supabase'

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

const QUESTIONS = [
  'Aap abhi kaisa feel kar rahe hain?',
  'Yeh feeling kab se hai?',
  'Kya aap bhagwan/prabhu mein vishwas rakhte hain?',
  'Abhi aapko sabse zyada kya chahiye?',
  'Maharaj Ji ki shiksha mein aapki sabse badi takleef kya hai?',
]

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json() as { answers: string[] }
    if (!Array.isArray(answers) || answers.length < 5) {
      return NextResponse.json({ error: 'Need 5 answers' }, { status: 400 })
    }

    const qa = QUESTIONS.map((q, i) => `Q${i + 1}: ${q}\nA: ${answers[i] ?? 'nahi bataya'}`).join('\n\n')

    const completion = await client.chat.completions.create({
      model: 'google/gemini-flash-1.5',
      messages: [{
        role: 'user',
        content: `Tu Premanad Ji Maharaj hai — param dayalu, gyan-sampann sant. Ek bhatak rahe bhakt ne apna dard share kiya:\n\n${qa}\n\nTumhara kaam:\n1. Ek "message" do — 2-3 sentences, seedha us vyakti ko, warm aur spiritual. Hindi/Hinglish mein. Guruji ki tarah — dil se, with love.\n2. Teen "keywords" do — English mein — jo Premanad Ji ke pravachans mein search karne ke liye best hon.\n\nSirf valid JSON return karo. Koi extra text nahi.\n{"message":"...","keywords":["...","...","..."]}`
      }],
      temperature: 0.85,
      max_tokens: 512,
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    let parsed: { message: string; keywords: string[] }
    try {
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      parsed = {
        message: 'Prabhu tumhare dard ko jaante hain. Unke naam ka sahara lo — shanti zaroor milegi. Radhe Radhe 🙏',
        keywords: [answers[3] ?? 'peace shanti', answers[0] ?? 'pain dard', 'naam jap meditation'],
      }
    }

    // Search for related videos using each keyword
    const searchPromises = parsed.keywords.slice(0, 3).map(async (kw: string) => {
      try {
        const embedding = await generateEmbedding(kw)
        const { data } = await supabase.rpc('search_transcripts', {
          query_embedding: embedding,
          match_threshold: 0.2,
          match_count: 4,
        })
        return (data ?? []) as SearchResult[]
      } catch { return [] }
    })

    const allResults = await Promise.all(searchPromises)
    const bestByVideo = new Map<string, SearchResult>()
    for (const item of allResults.flat()) {
      const existing = bestByVideo.get(item.video_id)
      if (!existing || item.similarity > existing.similarity) bestByVideo.set(item.video_id, item)
    }
    const videos = Array.from(bestByVideo.values())
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 6)

    return NextResponse.json({ message: parsed.message, keywords: parsed.keywords, videos })
  } catch (err) {
    console.error('Mirror API error:', err)
    return NextResponse.json({
      message: 'Radhe Radhe 🙏 Prabhu ki sharan mein sab theek hoga.',
      keywords: [],
      videos: [],
    })
  }
}
