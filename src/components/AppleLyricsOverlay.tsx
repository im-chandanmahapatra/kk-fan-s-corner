import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Compass, X, Music2 } from 'lucide-react';
import { KK_LYRICS_CATALOG, LyricLine, SongLyrics } from '../data/lyricsData';
import { soundEffects } from '../services/soundEffects';

interface AppleLyricsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  trackId: string;
  formattedTitle: string;
  currentTime: number;
  isPlaying: boolean;
  onSeek: (seconds: number) => void;
  dominantColor?: string;
  glowRgba?: string;
}

export const AppleLyricsOverlay: React.FC<AppleLyricsOverlayProps> = ({
  isOpen,
  onClose,
  trackId,
  formattedTitle,
  currentTime,
  isPlaying,
  onSeek,
  dominantColor = '#f59e0b',
  glowRgba = 'rgba(245, 158, 11, 0.35)',
}) => {
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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

  // Spring auto-scroll active lyric directly into vertical dead-center
  useEffect(() => {
    if (!isOpen || !autoScroll || !scrollContainerRef.current) return;
    const activeElem = lineRefs.current[activeIndex];
    if (activeElem) {
      activeElem.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, autoScroll, isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    <div
      className={`fixed inset-0 z-40 flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] select-none apple-glass-overlay ${
        isOpen
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Dynamic Background Ambient Light Blob */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[550px] rounded-full blur-[140px] pointer-events-none opacity-40 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${dominantColor} 0%, rgba(0,0,0,0) 70%)`,
        }}
      />

      {/* Top Header Bar */}
      <div className="relative z-10 max-w-5xl w-full mx-auto px-6 sm:px-12 pt-6 sm:pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shadow-sm">
            <Music2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-white/70 font-semibold">
                TIME-SYNCHRONIZED LYRICS
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                · {activeIndex + 1} of {lyrics.length}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate max-w-[260px] sm:max-w-md font-['Manrope']">
              {formattedTitle}
            </h3>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Auto-Scroll Toggle */}
          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all border cursor-pointer ${
              autoScroll
                ? 'bg-white/20 text-white border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                : 'bg-white/5 text-stone-400 border-white/10 hover:text-stone-200'
            }`}
            title={autoScroll ? 'Auto-scroll is following vocal playback' : 'Auto-scroll is paused'}
          >
            <Compass className={`w-3.5 h-3.5 ${autoScroll ? 'text-amber-300 animate-spin-slow' : ''}`} />
            <span className="hidden sm:inline">FOLLOW VOCALS</span>
            <span>{autoScroll ? 'ON' : 'OFF'}</span>
          </button>

          {/* Close Overlay Button */}
          <button
            type="button"
            onClick={() => {
              soundEffects.playMechanicalClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-stone-950 text-white/80 border border-white/15 flex items-center justify-center transition-all duration-200 spring-tap cursor-pointer shadow-md"
            title="Close Lyrics (Esc / L)"
            aria-label="Close Lyrics"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Lyrics Viewport with Mask-Fade-Edges (Aggressive Top & Bottom Fades) */}
      <div 
        ref={scrollContainerRef}
        className="relative z-10 w-full max-w-4xl mx-auto flex-1 overflow-y-auto px-6 sm:px-12 py-16 sm:py-24 mask-fade-edges scroll-smooth no-scrollbar"
        style={{
          scrollBehavior: 'smooth',
        }}
      >
        <div className="flex flex-col gap-6 sm:gap-10 py-24 sm:py-32">
          {lyrics.map((line: LyricLine, index: number) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={`${line.time}-${index}`}
                ref={(el) => {
                  lineRefs.current[index] = el;
                }}
                onClick={() => handleLineClick(line.time)}
                className={`group cursor-pointer select-none apple-lyric-line transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isActive ? 'apple-lyric-active' : 'apple-lyric-inactive'
                }`}
              >
                {/* Lyric Hindi Text in Heavy Bold Sans-Serif */}
                <p 
                  className={`font-['Manrope',sans-serif] font-extrabold tracking-tight leading-tight transition-all duration-300 ${
                    isActive 
                      ? 'text-2xl sm:text-4xl md:text-5xl text-white' 
                      : 'text-xl sm:text-3xl md:text-4xl text-white/70'
                  }`}
                  style={{
                    textShadow: isActive ? `0 0 25px rgba(255,255,255,0.75), 0 0 45px ${glowRgba}` : 'none',
                  }}
                >
                  {line.text}
                </p>

                {/* English Poetic Translation (Subtle Depth Detail) */}
                <div className="flex items-center gap-3 mt-1.5 sm:mt-2.5">
                  <span className={`text-xs sm:text-sm font-poetry italic transition-colors ${
                    isActive ? 'text-amber-200/90' : 'text-stone-500'
                  }`}>
                    {line.translation}
                  </span>
                  
                  {/* Timestamp Tag (visible on active or hover) */}
                  <span className={`text-[10px] font-mono transition-opacity ${
                    isActive ? 'text-white/60 opacity-100' : 'text-stone-500 opacity-0 group-hover:opacity-75'
                  }`}>
                    {formatSeconds(line.time)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Padding Clearance for the Floating Dynamic Island Player */}
      <div className="relative z-10 h-28 sm:h-32 pointer-events-none" />
    </div>
  );
};
