import { NextRequest } from 'next/server'
import { generateEmbedding } from '@/lib/embeddings'
import { supabase } from '@/lib/supabase'
import { openrouter, CHAT_MODEL, VIDEO_CHAT_SYSTEM_PROMPT } from '@/lib/openrouter'

export async function POST(req: NextRequest) {
  try {
    const { messages, videoId, currentQuery } = await req.json()

    if (!messages || !videoId) {
      return new Response('Messages and videoId required', { status: 400 })
    }

    const query = currentQuery || messages[messages.length - 1]?.content || ''

    // Get relevant chunks from this specific video
    let contextText = ''
    try {
      const embedding = await generateEmbedding(query)
      const { data } = await supabase.rpc('search_video_transcript', {
        query_embedding: embedding,
        target_video_id: videoId,
        match_count: 4,
      })

      if (data && data.length > 0) {
        contextText = data.map((item: any) => item.chunk_text).join('\n\n---\n\n')
      }
    } catch (e) {
      console.error('Video context error:', e)
    }

    const systemWithContext = contextText
      ? `${VIDEO_CHAT_SYSTEM_PROMPT}\n\n## Video Transcript Context:\n\n${contextText}`
      : VIDEO_CHAT_SYSTEM_PROMPT

    const stream = await openrouter.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: systemWithContext },
        ...messages,
      ],
      stream: true,
      max_tokens: 400,
      temperature: 0.6,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || ''
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (e) {
          controller.error(e)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err) {
    console.error('Video chat error:', err)
    return new Response('Internal server error', { status: 500 })
  }
}
