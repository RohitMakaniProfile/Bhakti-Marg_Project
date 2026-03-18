-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New Query)

-- Step 1: Enable pgvector extension
create extension if not exists vector;

-- Step 2: Create videos table
create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  youtube_id text unique not null,
  title text not null,
  description text,
  duration integer,
  thumbnail_url text,
  youtube_url text not null,
  published_at timestamptz,
  view_count bigint default 0,
  created_at timestamptz default now()
);

-- Step 3: Create transcript chunks table with vector embeddings
create table if not exists transcript_chunks (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references videos(id) on delete cascade,
  chunk_text text not null,
  chunk_index integer not null,
  embedding vector(384),
  created_at timestamptz default now()
);

-- Step 4: Create index for fast vector similarity search
create index if not exists transcript_chunks_embedding_idx
  on transcript_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Step 5: Create semantic search function
create or replace function search_transcripts(
  query_embedding vector(384),
  match_threshold float default 0.3,
  match_count int default 5
)
returns table (
  chunk_id uuid,
  video_id uuid,
  chunk_text text,
  similarity float,
  youtube_id text,
  title text,
  thumbnail_url text,
  youtube_url text,
  duration integer
)
language sql stable
as $$
  select
    tc.id as chunk_id,
    tc.video_id,
    tc.chunk_text,
    1 - (tc.embedding <=> query_embedding) as similarity,
    v.youtube_id,
    v.title,
    v.thumbnail_url,
    v.youtube_url,
    v.duration
  from transcript_chunks tc
  join videos v on tc.video_id = v.id
  where 1 - (tc.embedding <=> query_embedding) > match_threshold
  order by tc.embedding <=> query_embedding
  limit match_count;
$$;

-- Step 6: Search within a specific video
create or replace function search_video_transcript(
  query_embedding vector(384),
  target_video_id uuid,
  match_count int default 3
)
returns table (
  chunk_text text,
  similarity float
)
language sql stable
as $$
  select
    tc.chunk_text,
    1 - (tc.embedding <=> query_embedding) as similarity
  from transcript_chunks tc
  where tc.video_id = target_video_id
  order by tc.embedding <=> query_embedding
  limit match_count;
$$;
