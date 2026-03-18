"""
Bhakti Marg - YouTube Data Pipeline
- YouTube Data API v3  → reliable video listing
- youtube-transcript-api → fast transcript (if captions exist)
- ElevenLabs Scribe v2  → Hindi STT fallback (downloads audio, transcribes)

Run: python3 scripts/fetch_videos.py
"""

import os, sys, time, re, glob, tempfile
from pathlib import Path

# Load .env.local
env_path = Path(__file__).parent.parent / '.env.local'
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, val = line.split('=', 1)
                os.environ.setdefault(key.strip(), val.strip())

import requests
import yt_dlp
from pytubefix import YouTube as PyTube
from youtube_transcript_api import YouTubeTranscriptApi
from sentence_transformers import SentenceTransformer
from supabase import create_client

# ── Config ────────────────────────────────────────────────────────────────────
YOUTUBE_API_KEY    = os.environ['YOUTUBE_API_KEY']
ELEVENLABS_API_KEY = os.environ['ELEVENLABS_API_KEY']
SUPABASE_URL       = os.environ.get('SUPABASE_URL') or os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY       = os.environ.get('SUPABASE_ANON_KEY') or os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
CHANNEL_HANDLE     = 'BhajanMarg'
MAX_VIDEOS         = 100
MAX_DURATION_SEC   = 600
CHUNK_SIZE         = 400
YT_BASE            = 'https://www.googleapis.com/youtube/v3'
EL_STT_URL         = 'https://api.elevenlabs.io/v1/speech-to-text'

print("🙏 Jai Shri Radhe! Starting Bhakti Marg data pipeline...")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("\n📦 Loading multilingual embedding model...")
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
print("   Model ready! (384 dims, Hindi + English)\n")


# ── YouTube Data API v3 ───────────────────────────────────────────────────────

def yt_get(endpoint, params):
    params['key'] = YOUTUBE_API_KEY
    r = requests.get(f'{YT_BASE}/{endpoint}', params=params, timeout=15)
    r.raise_for_status()
    return r.json()

def get_uploads_playlist():
    data = yt_get('channels', {'part': 'contentDetails', 'forHandle': CHANNEL_HANDLE})
    return data['items'][0]['contentDetails']['relatedPlaylists']['uploads']

def get_playlist_video_ids(playlist_id, max_results=300):
    ids, page_token = [], None
    while len(ids) < max_results:
        params = {'part': 'contentDetails', 'playlistId': playlist_id,
                  'maxResults': min(50, max_results - len(ids))}
        if page_token:
            params['pageToken'] = page_token
        data = yt_get('playlistItems', params)
        ids += [i['contentDetails']['videoId'] for i in data.get('items', [])]
        page_token = data.get('nextPageToken')
        if not page_token:
            break
    return ids

def get_video_details(video_ids):
    videos = []
    for i in range(0, len(video_ids), 50):
        batch = video_ids[i:i+50]
        data = yt_get('videos', {'part': 'snippet,contentDetails', 'id': ','.join(batch)})
        for item in data.get('items', []):
            vid_id = item['id']
            sn = item['snippet']
            dur = parse_duration(item['contentDetails']['duration'])
            thumb = (sn.get('thumbnails', {}).get('high', {}).get('url') or
                     f'https://img.youtube.com/vi/{vid_id}/hqdefault.jpg')
            videos.append({
                'youtube_id': vid_id,
                'title': sn.get('title', ''),
                'description': sn.get('description', '')[:500],
                'duration': dur,
                'thumbnail_url': thumb,
                'youtube_url': f'https://www.youtube.com/watch?v={vid_id}',
                'published_at': sn.get('publishedAt'),
            })
    return videos

def parse_duration(iso):
    m = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso)
    if not m:
        return 0
    return int(m.group(1) or 0)*3600 + int(m.group(2) or 0)*60 + int(m.group(3) or 0)


# ── Transcript: Method 1 — youtube-transcript-api (fast, free) ───────────────

def get_transcript_yta(youtube_id):
    """Try to get Hindi/English captions via youtube-transcript-api."""
    try:
        api = YouTubeTranscriptApi()
        tlist = list(api.list(youtube_id))
        # Prioritise Hindi
        ordered = sorted(tlist, key=lambda t: 0 if t.language_code.startswith('hi') else 1)
        for t in ordered:
            try:
                text = ' '.join(
                    s.text if hasattr(s, 'text') else s.get('text', '')
                    for s in t.fetch()
                ).strip()
                if text:
                    return text
            except Exception:
                continue
    except Exception:
        pass
    return None


# ── Transcript: Method 2 — ElevenLabs Scribe v2 (audio download + STT) ───────

def download_audio(youtube_id, out_dir):
    """Download audio using pytubefix (no n-challenge needed)."""
    url = f'https://www.youtube.com/watch?v={youtube_id}'
    try:
        yt = PyTube(url)
        stream = yt.streams.filter(only_audio=True).order_by('abr').last()
        if not stream:
            return None
        path = stream.download(output_path=out_dir, filename='audio')
        return path if os.path.exists(path) else None
    except Exception as e:
        return None


def transcribe_elevenlabs(audio_path):
    """Send audio file to ElevenLabs Scribe v2 and return transcript text."""
    headers = {'xi-api-key': ELEVENLABS_API_KEY}
    with open(audio_path, 'rb') as f:
        resp = requests.post(
            EL_STT_URL,
            headers=headers,
            files={'file': (os.path.basename(audio_path), f)},
            data={
                'model_id': 'scribe_v2',
                'language_code': 'hi',          # Hindi
                'timestamps_granularity': 'none',
                'diarize': 'false',
            },
            timeout=120,
        )
    resp.raise_for_status()
    return resp.json().get('text', '').strip()


def get_transcript_elevenlabs(youtube_id, duration_sec):
    """Download audio and transcribe with ElevenLabs Scribe v2."""
    print(f"     🎙️  Downloading audio for STT (~{duration_sec//60}m)...")
    with tempfile.TemporaryDirectory() as tmpdir:
        audio_path = download_audio(youtube_id, tmpdir)
        if not audio_path:
            return None
        size_mb = os.path.getsize(audio_path) / 1024 / 1024
        print(f"     📤 Sending to ElevenLabs Scribe v2 ({size_mb:.1f} MB)...")
        try:
            text = transcribe_elevenlabs(audio_path)
            return text if text else None
        except Exception as e:
            print(f"     ❌ ElevenLabs error: {e}")
            return None


# ── Combined transcript fetch ─────────────────────────────────────────────────

def get_transcript(youtube_id, duration_sec):
    # Try fast method first
    text = get_transcript_yta(youtube_id)
    if text:
        return text, 'captions'
    # Fallback to ElevenLabs STT
    text = get_transcript_elevenlabs(youtube_id, duration_sec)
    if text:
        return text, 'elevenlabs'
    return None, None


# ── Database helpers ──────────────────────────────────────────────────────────

def video_exists(youtube_id):
    res = supabase.table('videos').select('id').eq('youtube_id', youtube_id).execute()
    return len(res.data) > 0

def chunk_text(text):
    words = text.split()
    return [' '.join(words[i:i+CHUNK_SIZE]) for i in range(0, len(words), CHUNK_SIZE)
            if len(' '.join(words[i:i+CHUNK_SIZE])) > 50]

def process_video(video):
    yid = video['youtube_id']
    if video_exists(yid):
        return 'skipped'

    transcript, method = get_transcript(yid, video['duration'])
    if not transcript:
        return 'no_transcript'

    words = len(transcript.split())
    print(f"     📝 {words} words  [{method}]")

    res = supabase.table('videos').insert({
        'youtube_id':    yid,
        'title':         video['title'],
        'description':   video['description'],
        'duration':      int(video['duration']),
        'thumbnail_url': video['thumbnail_url'],
        'youtube_url':   video['youtube_url'],
        'published_at':  video.get('published_at'),
    }).execute()

    if not res.data:
        return 'no_transcript'

    db_id = res.data[0]['id']
    chunks = chunk_text(transcript)
    print(f"     📦 {len(chunks)} chunks — embedding...")

    embeddings = model.encode(chunks, batch_size=32, show_progress_bar=False)
    rows = [{'video_id': db_id, 'chunk_text': c, 'chunk_index': i, 'embedding': e.tolist()}
            for i, (c, e) in enumerate(zip(chunks, embeddings))]

    for i in range(0, len(rows), 50):
        supabase.table('transcript_chunks').insert(rows[i:i+50]).execute()

    print(f"     ✅ Stored!")
    return 'stored'


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print(f"🎬 Fetching @{CHANNEL_HANDLE} channel...")
    playlist_id = get_uploads_playlist()

    print("   Fetching video IDs...")
    all_ids = get_playlist_video_ids(playlist_id, max_results=300)

    print(f"   Fetching video details for {len(all_ids)} videos...")
    all_videos = get_video_details(all_ids)

    videos = [v for v in all_videos if 0 < v['duration'] < MAX_DURATION_SEC][:MAX_VIDEOS]
    print(f"   ✅ {len(videos)} videos under 10 min\n")

    stored = skipped = no_transcript = 0

    for i, v in enumerate(videos):
        d = v['duration']
        print(f"[{i+1}/{len(videos)}] {v['title'][:65]}...")
        print(f"     {d//60}m {d%60}s | {v['youtube_id']}")

        result = process_video(v)
        if result == 'stored':
            stored += 1
        elif result == 'skipped':
            skipped += 1
            print("     ⏭️  Already in DB")
        else:
            no_transcript += 1
            print("     ⚠️  Skipped (no transcript)")

        time.sleep(0.5)

    print(f"\n{'='*55}")
    print(f"🎉 Complete!")
    print(f"   ✅ Stored:          {stored}")
    print(f"   ⏭️  Already in DB:  {skipped}")
    print(f"   ⚠️  No transcript:  {no_transcript}")
    print(f"\n🙏 Radhe Radhe!")


if __name__ == '__main__':
    main()
