import { NextRequest } from 'next/server'
import { CHAT_MODEL, SPIRITUAL_SYSTEM_PROMPT } from '@/lib/openrouter'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages required', { status: 400 })
    }

    // Call OpenRouter directly with streaming
    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://bhakti-marg.vercel.app',
        'X-Title': 'Bhakti Marg - Premanad Ji Maharaj',
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: [
          { role: 'system', content: SPIRITUAL_SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
        max_tokens: 400,
        temperature: 0.65,
      }),
    })

    if (!orRes.ok) {
      const err = await orRes.text()
      console.error('OpenRouter error:', err)
      return new Response('OpenRouter error', { status: 500 })
    }

    // Pipe the SSE stream from OpenRouter, converting to our format
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        const reader = orRes.body!.getReader()
        const decoder = new TextDecoder()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6).trim()
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                controller.close()
                return
              }
              try {
                const parsed = JSON.parse(data)
                const text = parsed.choices?.[0]?.delta?.content || ''
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
                }
              } catch (_) {}
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
