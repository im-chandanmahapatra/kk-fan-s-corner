import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Music, 
  Compass, 
  Play, 
  Maximize2, 
  Minimize2
} from 'lucide-react';
import { KK_LYRICS_CATALOG, LyricLine, SongLyrics } from '../data/lyricsData';
import { soundEffects } from '../services/soundEffects';

interface SynchronizedLyricsProps {
  trackId: string;
  formattedTitle?: string;
  currentTime: number;
  isPlaying: boolean;
  onSeek: (seconds: number) => void;
  isTheatreMode?: boolean;
  onToggleTheatreMode?: () => void;
}

export const SynchronizedLyrics: React.FC<SynchronizedLyricsProps> = ({
  trackId,
  formattedTitle,
  currentTime,
  isPlaying,
  onSeek,
  isTheatreMode = false,
  onToggleTheatreMode,
}) => {
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  const currentSongLyrics: SongLyrics | undefined = useMemo(() => {
    return KK_LYRICS_CATALOG[trackId] || KK_LYRICS_CATALOG['khuda-jaane'] || KK_LYRICS_CATALOG['yaaron'];
  }, [trackId]);

  const lyrics = currentSongLyrics?.lyrics || [];

  const activeIndex = useMemo(() => {
    if (!lyrics.length) return 0;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        return i;
      }
    }
    return 0;
  }, [lyrics, currentTime]);

  useEffect(() => {
    if (!autoScroll || !containerRef.current) return;
    const activeElem = lineRefs.current[activeIndex];
    if (activeElem) {
      activeElem.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, autoScroll]);

  const handleLineClick = (lineTime: number) => {
    soundEffects.playMechanicalClick();
    onSeek(lineTime);
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section className={`relative mx-auto px-2 sm:px-4 select-none transition-all duration-700 ease-in-out ${
      isTheatreMode ? 'my-3 sm:my-6 max-w-5xl' : 'my-4 sm:my-8 max-w-4xl lg:max-w-5xl'
    }`}>
      {/* Background Warm Tungsten Halo */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
        isTheatreMode ? 'w-[95%] h-[520px] bg-amber-500/15 opacity-90' : 'w-[90%] h-[480px] bg-amber-500/10 opacity-75'
      }`} />

      {/* Synchronized Lyrics Container with Multi-Layered Console Glass */}
      <div className={`relative rounded-3xl console-surface border shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-700 ease-in-out flex flex-col ${
        isTheatreMode 
          ? 'h-[75vh] min-h-[580px] max-h-[820px] border-amber-400/40 shadow-[0_25px_70px_rgba(245,158,11,0.15)]' 
          : isExpanded 
          ? 'h-[78vh] min-h-[620px] max-h-[860px] border-amber-500/25' 
          : 'h-[62vh] min-h-[500px] max-h-[720px] border-amber-500/20'
      }`}>
        {/* Teleprompter Top Navigation Header */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 border-b border-white/10 bg-black/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-amber-300 shadow-sm transition-colors ${
              isTheatreMode ? 'bg-amber-500/25 border-amber-400/50' : 'bg-amber-500/15 border-amber-500/30'
            }`}>
              <Music className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 font-mono">
                  {isTheatreMode ? 'THEATRE IMMERSION STAGE' : 'SYNCHRONIZED TELEPROMPTER'}
                </span>
                <span className="text-[10px] font-mono text-stone-400 border border-white/10 px-1.5 py-0.2 rounded">
                  {activeIndex + 1} / {lyrics.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-amber-200/95 font-['Manrope'] truncate max-w-[200px] sm:max-w-md">
                {formattedTitle || `${currentSongLyrics.title} — ${currentSongLyrics.movie}`}
              </p>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoScroll(!autoScroll)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all border cursor-pointer ${
                autoScroll
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-white/5 text-stone-400 border-white/10 hover:text-stone-200'
              }`}
              title={autoScroll ? 'Auto-scroll is tracking playback' : 'Auto-scroll is paused'}
            >
              <Compass className={`w-3.5 h-3.5 ${autoScroll ? 'animate-spin-slow text-amber-400' : ''}`} />
              <span className="hidden sm:inline">AUTO-SCROLL</span>
              <span>{autoScroll ? 'ON' : 'OFF'}</span>
            </button>

            {onToggleTheatreMode && (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playMechanicalClick();
                  onToggleTheatreMode();
                }}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  isTheatreMode 
                    ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]' 
                    : 'text-stone-400 hover:text-white hover:bg-white/10 border-white/10'
                }`}
                title={isTheatreMode ? 'Exit Theatre Mode (T)' : 'Enter Theatre Mode (T)'}
                aria-label="Toggle Theatre Mode"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V8h14v10z" />
                </svg>
              </button>
            )}

            {!isTheatreMode && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                title={isExpanded ? 'Collapse lyric viewport' : 'Expand full teleprompter'}
                aria-label="Toggle teleprompter size"
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Lyric Stream with AGGRESSIVE 20%-80% MASK-IMAGE EDGE FADE and Generous Vertical Rest */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto px-5 sm:px-14 py-20 sm:py-28 space-y-6 sm:space-y-8 scroll-smooth scroll-spring focus:outline-none mask-fade-edges"
          tabIndex={0}
          aria-label="Synchronized song lyrics list"
        >
          {lyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;

            return (
              <div
                key={line.time}
                ref={(el) => {
                  lineRefs.current[idx] = el;
                }}
                onClick={() => handleLineClick(line.time)}
                role="button"
                tabIndex={0}
                className={`group cursor-pointer rounded-2xl p-4 sm:p-6 transition-all duration-500 relative flex items-start gap-4 sm:gap-6 border origin-left ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/5 to-transparent border-amber-400/50 shadow-[0_10px_40px_rgba(245,158,11,0.25)] opacity-100 scale-100 z-10'
                    : isPast
                    ? 'border-transparent opacity-25 scale-[0.90] blur-[0.4px] hover:opacity-70 hover:scale-[0.95] hover:blur-none'
                    : 'border-transparent opacity-25 scale-[0.90] blur-[0.4px] hover:opacity-70 hover:scale-[0.95] hover:blur-none'
                }`}
              >
                {/* Timestamp & Play Affordance */}
                <div className="shrink-0 flex items-center gap-1.5 pt-1.5">
                  <span className={`text-[10px] sm:text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded transition-colors ${
                    isActive
                      ? 'text-amber-300 bg-amber-950/90 border border-amber-500/40 font-bold'
                      : 'text-stone-500 group-hover:text-stone-300'
                  }`}>
                    {formatSeconds(line.time)}
                  </span>
                  <Play className={`w-3 h-3 text-amber-400 transition-opacity ${
                    isActive ? 'opacity-100 fill-current' : 'opacity-0 group-hover:opacity-60'
                  }`} />
                </div>

                {/* Lyrics Poetry Block (Massive and Luminous when active) */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-editorial transition-all duration-500 tracking-tight leading-tight ${
                      isActive
                        ? 'text-3xl sm:text-5xl lg:text-6xl font-bold text-white drop-shadow-[0_0_40px_rgba(245,158,11,0.85)]'
                        : 'text-xl sm:text-3xl lg:text-4xl text-stone-400 font-medium group-hover:text-amber-200/90'
                    }`}
                  >
                    {line.text}
                  </p>

                  {/* Poetic English Translation */}
                  {line.translation && (
                    <p
                      className={`font-poetry italic transition-all duration-500 leading-relaxed ${
                        isActive
                          ? 'text-sm sm:text-lg text-amber-300 font-medium mt-2 sm:mt-3 opacity-100 drop-shadow-sm'
                          : 'text-xs sm:text-base text-stone-500 mt-1 opacity-0 group-hover:opacity-75 max-h-0 group-hover:max-h-12 overflow-hidden'
                      }`}
                    >
                      {line.translation}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Teleprompter Footer */}
        <div className="px-5 sm:px-8 py-2.5 bg-black/60 border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px] text-stone-500 font-mono">
          <span>CLICK ANY LINE TO INSTANTLY JUMP TO VERSE</span>
          <span className="text-amber-400/80 uppercase">
            LIVE SYNC
          </span>
        </div>
      </div>
    </section>
  );
};
