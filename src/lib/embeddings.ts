// Embeddings using @xenova/transformers (free, local, multilingual)
// Same model as the Python pipeline: paraphrase-multilingual-MiniLM-L12-v2
// Supports Hindi + English, 384 dimensions

let pipeline: any = null
let isLoading = false

async function getEmbeddingPipeline() {
  if (pipeline) return pipeline
  if (isLoading) {
    // Wait for it to finish loading
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return pipeline
  }

  isLoading = true
  try {
    // Dynamic import to avoid issues with Next.js SSR
    const { pipeline: createPipeline, env } = await import('@xenova/transformers')

    // Configure model cache directory
    env.cacheDir = './.cache/xenova'
    env.allowLocalModels = false

    pipeline = await createPipeline(
      'feature-extraction',
      'Xenova/paraphrase-multilingual-MiniLM-L12-v2'
    )
    console.log('✅ Embedding model loaded')
  } finally {
    isLoading = false
  }

  return pipeline
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const pipe = await getEmbeddingPipeline()
  const output = await pipe(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data) as number[]
}
