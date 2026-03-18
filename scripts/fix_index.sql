-- Run this in Supabase SQL Editor to fix the vector search index
-- (IVFFlat needs data to train on; HNSW works without pre-training)

DROP INDEX IF EXISTS transcript_chunks_embedding_idx;

CREATE INDEX transcript_chunks_embedding_idx
ON transcript_chunks USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Verify: check how many chunks we have
SELECT COUNT(*) as total_chunks FROM transcript_chunks;
SELECT COUNT(*) as total_videos FROM videos;


