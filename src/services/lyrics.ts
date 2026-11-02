export interface LyricsRecord {
  id: number; trackName: string; artistName: string; albumName: string;
  duration: number; instrumental: boolean; plainLyrics: string | null; syncedLyrics: string | null;
}
export const normalize = (value: string) => value.toLowerCase().replace(/\([^)]*\)|\[[^\]]*\]/g, '').replace(/[^a-z0-9]/g, '').replace(/aa/g, 'a').replace(/ee/g, 'i');
export function rankLyrics(records: LyricsRecord[], title: string, album: string, duration: number, expectedArtist = 'KK') {
  const name = normalize(title);
  return records.filter(record => {
    const candidate = normalize(record.trackName);
    const artist = normalize(record.artistName);
    return (candidate === name || candidate === name + 'from' + normalize(album)) &&
      (expectedArtist.split(',').some(name => artist.includes(normalize(name.trim()))) || normalize(record.albumName) === normalize(album)) &&
      !/remix|karaoke|tribute|lofi|cover|reprise/i.test(record.trackName) &&
      Boolean(record.syncedLyrics || record.plainLyrics || record.instrumental);
  }).sort((a, b) => {
    const score = (r: LyricsRecord) => (Math.abs(r.duration - duration) <= 3 ? 100 : 0) + (normalize(r.albumName) === normalize(album) ? 20 : 0) + (r.syncedLyrics ? 10 : 0) - Math.min(60, Math.abs(r.duration - duration));
    return score(b) - score(a);
  })[0];
}
let blockedUntil = 0;
// Pinned catalog matches avoid expensive title searches for these common songs.
// These are provider record IDs, not a claim that each YouTube edit is aligned.
const catalogRecords: Record<string, number> = {
  [normalize('Dil Ibaadat') + ':' + normalize('Tum Mile')]: 27799934,
  [normalize('Khuda Jaane') + ':' + normalize('Bachna Ae Haseeno')]: 6844574,
};
export async function loadLyrics(title: string, album: string, duration: number, signal: AbortSignal, artist = 'KK'): Promise<LyricsRecord | null> {
  const key = 'kk-auto-lyrics-v1:' + normalize(title);
  let records: LyricsRecord[] | undefined;
  try {
    const cached = JSON.parse(localStorage.getItem(key) || 'null');
    if (cached && Date.now() - cached.time < 7 * 86400000 && Array.isArray(cached.records)) records = cached.records;
  } catch { /* storage is optional */ }
  if (!records) {
    if (Date.now() < blockedUntil) throw new Error('Lyrics service is busy. Please try again shortly.');
    const params = new URLSearchParams({ track_name: title, artist_name: artist.split(',')[0].trim() });
    const catalogId = catalogRecords[normalize(title) + ':' + normalize(album)];
    const options = {
      signal, headers: { 'Lrclib-Client': 'KK Fans Corner/1.0 (personal localhost app)' },
    };
    let response = await fetch(catalogId ? `https://lrclib.net/api/get/${catalogId}` : 'https://lrclib.net/api/search?' + params, options);
    if (catalogId && response.status === 404) response = await fetch('https://lrclib.net/api/search?' + params, options);
    if (response.status === 429 || response.status === 503) {
      const raw = response.headers.get('Retry-After') || '60';
      const seconds = Number(raw);
      const delay = Number.isFinite(seconds) ? seconds * 1000 : Math.max(60000, Date.parse(raw) - Date.now());
      blockedUntil = Date.now() + delay + Math.random() * 1000;
      throw new Error('Lyrics service is busy. Please try again shortly.');
    }
    if (!response.ok) throw new Error('Could not load lyrics. Please try again.');
    const payload = await response.json();
    const data = Array.isArray(payload) ? payload : payload && typeof payload.id === 'number' ? [payload] : null;
    if (!Array.isArray(data)) throw new Error('Unexpected lyrics response.');
    records = data.filter(r => typeof r.trackName === 'string' && typeof r.artistName === 'string' && typeof r.albumName === 'string' && Number.isFinite(r.duration));
    try { localStorage.setItem(key, JSON.stringify({ time: Date.now(), records })); } catch { /* optional */ }
  }
  return rankLyrics(records!, title, album, duration, artist) ?? null;
}
