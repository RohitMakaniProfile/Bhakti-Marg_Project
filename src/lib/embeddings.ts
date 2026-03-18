// Embeddings using OpenRouter API (openai/text-embedding-3-small)
// 1536 dimensions, multilingual support

import { openrouter } from './openrouter'

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openrouter.embeddings.create({
    model: 'openai/text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}
