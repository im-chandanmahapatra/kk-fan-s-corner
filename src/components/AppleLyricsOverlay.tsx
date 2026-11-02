import React from 'react';
import { X } from 'lucide-react';
import { LyricsPanel } from './LyricsPanel';
export function AppleLyricsOverlay(props: {
  isOpen: boolean; onClose: () => void; trackId: string; videoId?: string;
  songName: string; album: string; duration: number; artist: string;
  formattedTitle: string; currentTime: number; isPlaying: boolean;
  onSeek: (seconds: number) => void; dominantColor?: string; glowRgba?: string;
}) {
  if (!props.isOpen) return null;
  return <section className="lyrics-overlay" aria-label="Song lyrics">
    <header><h2>{props.formattedTitle}</h2><button onClick={props.onClose} aria-label="Close lyrics"><X /></button></header>
    <LyricsPanel key={props.videoId} videoId={props.videoId} currentTime={props.currentTime} onSeek={props.onSeek} songName={props.songName} album={props.album} artist={props.artist} duration={props.duration} />
  </section>;
}
