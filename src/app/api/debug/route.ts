import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // Test OpenRouter
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: 'Say OK' }],
        max_tokens: 5,
      }),
    })
    const data = await res.json()
    return Response.json({
      openrouter_status: res.status,
      openrouter_response: data?.choices?.[0]?.message?.content || data?.error,
      env_check: {
        openrouter_key: !!process.env.OPENROUTER_API_KEY,
        supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    })
  } catch (e: any) {
    return Response.json({ error: e.message })
  }
}
