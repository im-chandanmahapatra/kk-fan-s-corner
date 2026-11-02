import React, { useEffect, useState } from 'react';
import { Music2, Pause, Play } from 'lucide-react';
import { KKTrack } from '../data/kkData';

interface SpatialAlbumArtProps {
  currentTrack: KKTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  showLyrics: boolean;
}

/** Normal mode uses only a small cropped artwork tile; vinyl belongs to Theatre Mode. */
export const SpatialAlbumArt: React.FC<SpatialAlbumArtProps> = ({ currentTrack, isPlaying, onTogglePlay, showLyrics }) => {
  const [artworkFailed, setArtworkFailed] = useState(false);
  const hasArtwork = Boolean(currentTrack.artworkUrl) && !artworkFailed;

  useEffect(() => setArtworkFailed(false), [currentTrack.artworkUrl]);

  return (
    <button
      type="button"
      onClick={onTogglePlay}
      className={`group relative block h-40 w-40 overflow-hidden rounded-[22px] border border-white/15 bg-[#15151b] text-left shadow-[0_18px_40px_rgba(0,0,0,0.5)] transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_22px_48px_rgba(0,0,0,0.68)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:h-48 sm:w-48 ${showLyrics ? 'pointer-events-none opacity-30' : ''}`}
      aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
    >
      {hasArtwork ? (
        <img src={currentTrack.artworkUrl} alt={`${currentTrack.movieOrAlbum} artwork`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" onError={() => setArtworkFailed(true)} />
      ) : (
        <div className="flex h-full w-full items-start justify-center pt-5 text-white/60" style={{ background: `linear-gradient(135deg, ${currentTrack.ambientGlow.primary}, #15151b 75%)` }}>
          <Music2 aria-hidden="true" className="h-8 w-8" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-transparent" />
      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-editorial text-lg leading-tight text-white">{currentTrack.songName}</p>
          <p className="truncate text-[10px] text-white/65">{currentTrack.movieOrAlbum}</p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur">
          {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />}
        </span>
      </div>
    </button>
  );
};
