import { NextRequest, NextResponse } from 'next/server'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

// Best Hindi female neural voice (Microsoft Edge)
const HINDI_VOICE = 'hi-IN-SwaraNeural'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text required' }, { status: 400 })
    }

    const tts = new MsEdgeTTS()
    await tts.setMetadata(HINDI_VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)

    const chunks: Buffer[] = []
    await new Promise<void>((resolve, reject) => {
      const { audioStream } = tts.toStream(text.slice(0, 3000))
      audioStream.on('data', (chunk: Buffer) => chunks.push(chunk))
      audioStream.on('end', resolve)
      audioStream.on('error', reject)
    })

    const audio = Buffer.concat(chunks)
    return new NextResponse(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('TTS error:', err)
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
  }
}
