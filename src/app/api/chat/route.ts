import { NextRequest } from 'next/server'
import { generateEmbedding } from '@/lib/embeddings'
import { supabase } from '@/lib/supabase'
import { openrouter, CHAT_MODEL, SPIRITUAL_SYSTEM_PROMPT } from '@/lib/openrouter'

export async function POST(req: NextRequest) {
  try {
    const { messages, currentQuery } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages required', { status: 400 })
    }

    // Get the last user message for context retrieval
    const query = currentQuery || messages[messages.length - 1]?.content || ''

    // Retrieve relevant transcript chunks for context
    let contextText = ''
    try {
      const embedding = await generateEmbedding(query)
      const { data } = await supabase.rpc('search_transcripts', {
        query_embedding: embedding,
        match_threshold: 0.2,
        match_count: 5,
      })

      if (data && data.length > 0) {
        contextText = data
          .map((item: any) => `[From: "${item.title}"]\n${item.chunk_text}`)
          .join('\n\n---\n\n')
      }
    } catch (e) {
      console.error('Context retrieval error:', e)
    }

    const systemWithContext = contextText
      ? `${SPIRITUAL_SYSTEM_PROMPT}\n\n## Relevant Teachings from Premanad Ji's Discourses:\n\n${contextText}`
      : SPIRITUAL_SYSTEM_PROMPT

    // Stream response from OpenRouter
    const stream = await openrouter.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: systemWithContext },
        ...messages,
      ],
      stream: true,
      max_tokens: 400,
      temperature: 0.65,
    })

    // Return as Server-Sent Events stream
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
    console.error('Chat error:', err)
    return new Response('Internal server error', { status: 500 })
  }
}
