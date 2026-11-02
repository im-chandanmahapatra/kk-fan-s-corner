import React, { useState } from 'react';
import { ListMusic, Maximize2, MicVocal, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { KKTrack } from '../data/kkData';

interface NostalgicPlayerProps {
  playbackError?: string;
  isPlaying: boolean;
  isBuffering: boolean;
  isSeeking: boolean;
  currentTime: number;
  duration: number;
  onSeekStart: () => void;
  onSeekChange: (seconds: number) => void;
  onSeekCommit: (seconds: number) => void;
  currentTrack: KKTrack;
  currentTrackIndex: number;
  playlist: KKTrack[];
  volume: number;
  onChangeVolume: (val: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onSelectTrackAtIndex: (index: number) => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  isTheatreMode: boolean;
  onToggleTheatreMode: () => void;
  showLyrics: boolean;
  onToggleLyrics: () => void;
}

const formatTime = (seconds: number) => {
  const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
};

/** A small, stable control deck: one clear seek bar and only listening controls. */
export const NostalgicPlayer: React.FC<NostalgicPlayerProps> = ({
  playbackError,
  isPlaying,
  isBuffering,
  isSeeking,
  currentTime,
  duration,
  onSeekStart,
  onSeekChange,
  onSeekCommit,
  currentTrack,
  currentTrackIndex,
  playlist,
  volume,
  onChangeVolume,
  isMuted,
  onToggleMute,
  onSelectTrackAtIndex,
  onTogglePlay,
  onNext,
  onPrev,
  isTheatreMode,
  onToggleTheatreMode,
  showLyrics,
  onToggleLyrics,
}) => {
  const [scrubValue, setScrubValue] = useState<number | null>(null);
  const [showQueue, setShowQueue] = useState(false);
  const activeTime = scrubValue ?? currentTime;
  const safeDuration = duration > 0 ? duration : currentTrack.approxDurationSec;
  const progress = safeDuration ? Math.min(100, Math.max(0, (activeTime / safeDuration) * 100)) : 0;
  const accent = currentTrack.ambientGlow.primary;
  const upNext = playlist.slice(currentTrackIndex + 1, currentTrackIndex + 5);

  const beginScrub = () => {
    setScrubValue(currentTime);
    onSeekStart();
  };

  const updateScrub = (value: number) => {
    setScrubValue(value);
    onSeekChange(value);
  };

  const commitScrub = (value: number) => {
    onSeekCommit(value);
    setScrubValue(null);
  };

  return (
    <>
      {showQueue && (
        <aside className="fixed bottom-[156px] right-4 z-50 w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-white/10 bg-[#111116]/95 p-3 shadow-2xl backdrop-blur-2xl">
          <div className="mb-2 flex items-center justify-between px-2 pt-1">
            <span className="text-[10px] font-mono font-semibold tracking-[0.18em] text-white/50">UP NEXT</span>
            <button type="button" onClick={() => setShowQueue(false)} className="text-xs text-white/55 hover:text-white">Close</button>
          </div>
          <div className="space-y-1">
            {upNext.length ? upNext.map((track, offset) => {
              const trackIndex = currentTrackIndex + offset + 1;
              return <button key={`${track.id}-${trackIndex}`} type="button" onClick={() => { onSelectTrackAtIndex(trackIndex); setShowQueue(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/10">
                <span className="w-5 text-right text-[10px] font-mono text-white/35">{trackIndex + 1}</span>
                <span className="min-w-0"><span className="block truncate text-sm text-white">{track.songName}</span><span className="block truncate text-[11px] text-white/45">{track.movieOrAlbum}</span></span>
              </button>;
            }) : <p className="px-3 py-5 text-center text-sm text-white/45">End of this playlist.</p>}
          </div>
        </aside>
      )}

      <section className="player-dock relative z-50" aria-label="Music player">
        {playbackError && <p className="playback-notice" role="status">{playbackError} <a href={`https://www.youtube.com/watch?v=${currentTrack.videoId}`} target="_blank" rel="noreferrer">Open on YouTube</a></p>}
        <div className="listening-deck">
          <div className="deck-track">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-[#17171d]" style={{ background: `linear-gradient(135deg, ${accent}, #17171d 78%)` }}>
              {currentTrack.artworkUrl && <img key={currentTrack.artworkUrl} src={currentTrack.artworkUrl} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-editorial text-lg leading-tight text-white sm:text-xl">{currentTrack.songName}</p>
              <p className="truncate text-[11px] text-white/52 sm:text-xs">{currentTrack.movieOrAlbum} <span className="text-white/25">•</span> {currentTrack.artist}</p>
            </div>
          </div>

          <div className="deck-seek group relative flex h-5 items-center">
            <div className="pointer-events-none absolute left-0 right-0 h-1.5 overflow-hidden rounded-full bg-white/12">
              <span className="block h-full rounded-full transition-[width] duration-100" style={{ width: `${progress}%`, backgroundColor: accent }} />
            </div>
            <input
              type="range"
              min="0"
              max={safeDuration || 1}
              step="0.1"
              value={activeTime}
              onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); beginScrub(); }}
              onKeyDown={() => scrubValue === null && beginScrub()}
              onChange={(event) => updateScrub(Number(event.target.value))}
              onPointerUp={(event) => commitScrub(Number((event.target as HTMLInputElement).value))}
              onPointerCancel={(event) => commitScrub(Number((event.target as HTMLInputElement).value))}
              onKeyUp={(event) => commitScrub(Number((event.target as HTMLInputElement).value))}
              onBlur={(event) => scrubValue !== null && commitScrub(Number((event.target as HTMLInputElement).value))}
              className="player-scrubber absolute inset-x-0 z-10 w-full"
              aria-label="Seek through current song"
              aria-valuetext={`${formatTime(activeTime)} of ${formatTime(safeDuration)}`}
            />
          </div>
          <div className="deck-time flex justify-between text-[10px] font-mono tabular-nums text-white/45">
            <span>{isSeeking ? `Seeking ${formatTime(activeTime)}` : formatTime(activeTime)}</span><span>{formatTime(safeDuration)}</span>
          </div>

          <div className="deck-actions">
            <div className="deck-volume">
              <button type="button" onClick={onToggleMute} className="player-icon-button hidden sm:inline-flex" aria-label={isMuted ? 'Unmute' : 'Mute'}>{isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
              <input type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={(event) => onChangeVolume(Number(event.target.value))} className="hidden w-20 accent-white sm:block" aria-label="Volume" />
            </div>

            <div className="deck-transport">
              <button type="button" onClick={onPrev} className="player-icon-button" aria-label="Previous song"><SkipBack className="h-4 w-4 fill-current" /></button>
              <button type="button" onClick={onTogglePlay} className="deck-play" aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isBuffering ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" /> : isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
              </button>
              <button type="button" onClick={onNext} className="player-icon-button" aria-label="Next song"><SkipForward className="h-4 w-4 fill-current" /></button>
            </div>

            <div className="deck-extras">
              <button type="button" onClick={onToggleLyrics} className={`player-icon-button ${showLyrics ? 'bg-white text-black' : ''}`} aria-label="Lyrics"><MicVocal className="h-4 w-4" /></button>
              <button type="button" onClick={onToggleTheatreMode} className={`player-icon-button ${isTheatreMode ? 'bg-white text-black' : ''}`} aria-label="Theatre mode"><Maximize2 className="h-4 w-4" /></button>
              <button type="button" onClick={() => setShowQueue((value) => !value)} className="player-icon-button" aria-label="Show up next" aria-expanded={showQueue}><ListMusic className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
