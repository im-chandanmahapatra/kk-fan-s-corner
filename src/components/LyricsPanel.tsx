import React, { useEffect, useRef, useState } from 'react';
import { loadLyrics } from '../services/lyrics';

type Line = { time: number; text: string };
export function parseLrc(text: string): Line[] {
  const offset = Number(text.match(/\[offset:([+-]?\d+)\]/i)?.[1] || 0) / 1000;
  return text.split(/\r?\n/).flatMap(row => {
    const matches = [...row.matchAll(/\[(\d+):(\d{2})(?:[.:](\d{1,3}))?\]/g)];
    const words = row.replace(/\[[^\]]*\]/g, '').trim();
    return words ? matches.map(m => ({ time: Math.max(0, Number(m[1]) * 60 + Number(m[2]) + Number('0.' + (m[3] || '0')) + offset), text: words })) : [];
  }).sort((a, b) => a.time - b.time);
}

export function LyricsPanel({ videoId, currentTime, onSeek, songName, album, duration, artist = 'KK' }: {
  videoId?: string; currentTime: number; onSeek: (time: number) => void;
  songName: string; album: string; duration: number; artist?: string;
}) {
  const [lines, setLines] = useState<Line[]>([]);
  const [offset, setOffset] = useState(0);
  const [follow, setFollow] = useState(true);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('Finding lyrics…');
  const [plain, setPlain] = useState('');
  const [source, setSource] = useState<number | null>(null);
  const [retry, setRetry] = useState(0);
  const viewport = useRef<HTMLDivElement>(null);
  const activeLine = useRef<HTMLButtonElement>(null);
  const identity = useRef(videoId);
  const request = useRef<AbortController | null>(null);
  const imported = useRef(false);
  identity.current = videoId;
  const key = 'kk-lyrics-v2:' + videoId;
  useEffect(() => {
    const controller = new AbortController();
    request.current = controller;
    imported.current = false;
    let cancelled = false;
    setLines([]); setOffset(0); setFollow(true); setMessage(''); setPlain(''); setSource(null); setStatus('Finding lyrics…');
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (videoId && saved && Array.isArray(saved.lines) && saved.lines.length && saved.lines.every((l: Line) => Number.isFinite(l.time) && typeof l.text === 'string')) {
        setLines(saved.lines); setOffset(Number(saved.offset) || 0);
        setStatus('Your timed lyrics');
        return;
      }
    } catch { /* storage is optional */ }
    const timeout = setTimeout(() => controller.abort(), 15000);
    loadLyrics(songName, album, duration, controller.signal, artist).then(record => {
      if (cancelled || imported.current) return;
      if (!record) { setStatus('Lyrics are not available for this song yet.'); return; }
      setSource(record.id);
      if (record.instrumental) { setStatus('This recording is instrumental.'); return; }
      const parsed = record.syncedLyrics ? parseLrc(record.syncedLyrics) : [];
      if (videoId && parsed.length && Math.abs(record.duration - duration) <= 3) {
        setLines(parsed); setStatus('Timed lyrics · adjust timing if this video has an intro');
      } else {
        setPlain(record.plainLyrics || parsed.map(line => line.text).join('\n'));
        setStatus('Lyrics · timing for this video is unavailable');
      }
    }).catch(error => {
      if (!cancelled && !imported.current) setStatus(error.name === 'AbortError' ? 'Lyrics request timed out. Try again.' : error.message === 'Failed to fetch' ? 'Lyrics could not load. Check your connection and retry.' : error.message);
    }).finally(() => clearTimeout(timeout));
    return () => { cancelled = true; controller.abort(); clearTimeout(timeout); };
  }, [key, songName, album, duration, artist, retry]);
  const adjustedTime = currentTime + offset;
  let active = -1;
  lines.forEach((line, i) => { if (line.time <= adjustedTime) active = i; });
  useEffect(() => {
    const box = viewport.current, line = activeLine.current;
    if (follow && box && line) box.scrollTo({ top: box.scrollTop + line.getBoundingClientRect().top - box.getBoundingClientRect().top - box.clientHeight / 2 + line.clientHeight / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [active, follow]);
  function save(next: Line[], shift: number) {
    try { localStorage.setItem(key, JSON.stringify({ lines: next, offset: shift })); }
    catch { setMessage('Lyrics work for this session; browser storage is unavailable.'); }
  }
  return <section className="lyrics-panel">
    <div className="lyrics-tools">
      <button onClick={() => setRetry(n => n + 1)} aria-label="Retry automatic lyric lookup">Reload lyrics</button>
      <label className="lyrics-import">Import .lrc<input type="file" accept=".lrc,text/plain" disabled={!videoId} onChange={async event => {
        const file = event.target.files?.[0]; const requestedVideo = videoId;
        if (!file) return;
        if (file.size > 500000) { setMessage('Choose a lyric file smaller than 500 KB.'); return; }
        try {
          const parsed = parseLrc(await file.text());
          if (identity.current !== requestedVideo) return;
          if (!parsed.length) { setMessage('This file needs timestamped lyric lines.'); return; }
          imported.current = true; request.current?.abort();
          setLines(parsed); setPlain(''); setSource(null); setOffset(0); save(parsed, 0); setMessage(''); setStatus('Your timed lyrics');
        } catch { setMessage('Could not read this file.'); }
        event.target.value = '';
      }} /></label>
      {!!lines.length && <><button onClick={() => setFollow(!follow)} aria-pressed={follow}>Follow {follow ? 'on' : 'off'}</button>
        <label>Timing <input aria-label="Lyrics advance in seconds" type="number" min="-120" max="120" step="0.5" value={offset} onChange={e => {
          const shift = Math.max(-120, Math.min(120, Number(e.target.value) || 0)); setOffset(shift); save(lines, shift);
        }} />s</label></>}
    </div>
    {message && <p role="status">{message}</p>}
    <p className="lyrics-hint" role="status">{status}{source && <> · <a href={'https://lrclib.net/api/get/' + source} target="_blank" rel="noreferrer">LRCLIB</a></>}</p>
    {lines.length ? <>
      <p className="lyrics-hint">Lyrics late? Increase timing. Tap a line to seek.</p>
      <div ref={viewport} className="lyric-scroll" onWheel={() => setFollow(false)} onTouchMove={() => setFollow(false)}>
        {lines.map((line, i) => <button key={i} ref={i === active ? activeLine : undefined} className={i === active ? 'current-line' : ''} onClick={() => onSeek(Math.max(0, line.time - offset))}>{line.text}</button>)}
      </div>
    </> : plain ? <div className="plain-lyrics">{plain}</div> : <div className="lyrics-empty"><h2>{status.startsWith('Finding') ? 'Finding your song…' : 'Lyrics'}</h2><p>{status}</p></div>}
  </section>;
}
