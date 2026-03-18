import { NextResponse } from 'next/server'

const FALLBACK_BLESSINGS = [
  'Beta, Prabhu ki nazar tumpar hai. Naam jap karte raho — sab theek hoga. Radhe Radhe 🙏',
  'Jahan bhi jao, Radha-Krishna ki chhaon mein raho. Unka pyaar kabhi kam nahi hota. Radhe Radhe.',
  'Mann ko shant rakhna seekho — bas Naam lo. Itna kaafi hai. Radhe Radhe 🙏',
  'Tumhari bhakti safal hogi. Prabhu sab dekhte hain, sab jaante hain. Radhe Radhe.',
  'Dukh mein bhi, sukh mein bhi — bas Prabhu ka naam lena mat chhodna. Radhe Radhe 🙏',
]

export async function POST() {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Tu Premanad Ji Maharaj hai. Ek bhakt ne aaj tere saath photo li hai. Usse ek chhota, dil se ashirwad de — sirf 1-2 lines, pure Hindi mein, bilkul natural. Koi drama nahi, koi list nahi. "Radhe Radhe 🙏" se khatam karo. Sirf ashirwad text do.`,
            }],
          }],
          generationConfig: { maxOutputTokens: 80, temperature: 0.95 },
        }),
      }
    )
    const data = await res.json()
    const blessing = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (blessing) return NextResponse.json({ blessing })
  } catch (e) {
    console.error('Gemini error:', e)
  }

  const blessing = FALLBACK_BLESSINGS[Math.floor(Math.random() * FALLBACK_BLESSINGS.length)]
  return NextResponse.json({ blessing })
}
