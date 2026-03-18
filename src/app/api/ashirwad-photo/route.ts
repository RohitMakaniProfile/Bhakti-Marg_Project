import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const GEMINI_KEY = process.env.GEMINI_API_KEY!

export async function POST(req: NextRequest) {
  try {
    const { userPhotoBase64, mimeType = 'image/jpeg' } = await req.json()

    if (!userPhotoBase64) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 })
    }

    // Read Maharaj Ji's real photo from public folder
    const maharajPath = path.join(process.cwd(), 'public', 'Selfie.png')
    const maharajBase64 = fs.readFileSync(maharajPath).toString('base64')

    // Call Gemini 2.0 Flash with image generation
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a world-class photo compositor. Create ONE unified, seamless photograph that looks like it was taken in a single moment — NOT two photos pasted together.

PEOPLE:
- FIRST IMAGE = young male devotee. Keep his EXACT real face, skin tone, features, clothing. Do NOT change or stylize him.
- SECOND IMAGE = Premanad Ji Maharaj (holy saint, yellow robes, green garlands, tilak, joyful bearded face). Keep his EXACT real appearance.

CRITICAL SCENE — make it feel REAL and CONNECTED:
- The devotee is sitting slightly in FRONT and to the LEFT, in a humble/respectful posture, turned slightly toward Maharaj Ji
- Maharaj Ji is seated behind/beside on the RIGHT, turned toward the devotee, his raised hands extended in blessing OVER the devotee
- They are CLEARLY interacting — Maharaj Ji is joyfully blessing THIS specific person
- Their bodies should overlap slightly at the edges — showing they share the same physical space
- Matching perspective, depth, and scale — Maharaj Ji slightly larger as the guru figure
- SAME lighting falls on both — warm golden temple light from above hitting BOTH faces naturally

BACKGROUND:
- Grand golden temple interior, divine light rays beaming down on them together
- Soft rose petals, warm bokeh — everything in ONE unified scene

OUTPUT MUST LOOK: Like a photographer captured both people sitting together in the same room at the same moment. Photorealistic. No cartoon. No illustration. One cohesive scene where both people are clearly present together.`,
                },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: userPhotoBase64,
                  },
                },
                {
                  inlineData: {
                    mimeType: 'image/png',
                    data: maharajBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
            temperature: 1,
          },
        }),
      },
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('Gemini error:', err)
      return NextResponse.json({ error: 'Gemini API failed', detail: err }, { status: 500 })
    }

    const data = await res.json()

    // Extract the generated image from response
    const parts = data.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData?.mimeType?.startsWith('image/'))
    const textPart = parts.find((p: { text?: string }) => p.text)

    if (!imagePart) {
      console.error('No image in Gemini response:', JSON.stringify(data).slice(0, 500))
      return NextResponse.json({ error: 'No image generated' }, { status: 500 })
    }

    return NextResponse.json({
      imageBase64: imagePart.inlineData.data,
      imageMimeType: imagePart.inlineData.mimeType,
      caption: textPart?.text ?? null,
    })
  } catch (e) {
    console.error('ashirwad-photo error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
