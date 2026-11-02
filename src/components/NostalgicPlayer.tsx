import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KKTrack } from '../data/kkData';
import { soundEffects } from '../services/soundEffects';

const AmberCheckmark: React.FC = () => (
  <svg 
    viewBox="0 0 24 24" 
    className="w-3.5 h-3.5 text-amber-400 shrink-0 stroke-current stroke-[2.5] fill-none"
    style={{ filter: 'drop-shadow(0 0 5px rgba(245, 158, 11, 0.55))' }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

interface NostalgicPlayerProps {
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

// SaaS-Grade Tooltip Component with 200ms delay & spring physics pop-in
interface SaaSTooltipProps {
  label: string;
  children: React.ReactNode;
}

const SaaSTooltip: React.FC<SaaSTooltipProps> = ({ label, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div 
          className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none saas-tooltip px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-wider text-stone-200 whitespace-nowrap shadow-xl"
          style={{
            animation: 'revealUp 0.22s var(--spring-bounce) forwards',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export const NostalgicPlayer: React.FC<NostalgicPlayerProps> = ({
  isPlaying,
  isBuffering,
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
  const [tapeHiss, setTapeHiss] = useState<boolean>(false);
  const [showQueue, setShowQueue] = useState<boolean>(false);
  const [showSleepTimer, setShowSleepTimer] = useState<boolean>(false);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [sleepTimerInitial, setSleepTimerInitial] = useState<number | null>(null);
  const [sleepTimerMode, setSleepTimerMode] = useState<string | null>(null);
  const [isCustomOpen, setIsCustomOpen] = useState<boolean>(false);
  const [customInputMinutes, setCustomInputMinutes] = useState<string>('20');
  const [fadeStatus, setFadeStatus] = useState<string | null>(null);

  const baseVolumeRef = useRef<number>(volume);
  const isFadingRef = useRef<boolean>(false);
  const sleepTimerMenuRef = useRef<HTMLDivElement | null>(null);

  // Close Sleep Timer popover on click outside or on Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSleepTimer &&
        sleepTimerMenuRef.current &&
        !sleepTimerMenuRef.current.contains(event.target as Node)
      ) {
        setShowSleepTimer(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showSleepTimer) {
        setShowSleepTimer(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSleepTimer]);

  // Sync user volume preference while not in active fade window
  useEffect(() => {
    if (!isFadingRef.current) {
      baseVolumeRef.current = volume;
    }
  }, [volume]);

  // Active Sleep Timer Countdown & Graceful Audio Fade-Out Engine
  useEffect(() => {
    if (sleepTimerRemaining === null) return;

    if (sleepTimerRemaining <= 0) {
      // Countdown complete: pause playback and restore base volume
      if (isPlaying) {
        onTogglePlay();
      }
      onChangeVolume(baseVolumeRef.current);
      isFadingRef.current = false;
      setFadeStatus('Audio stopped peacefully.');
      setTimeout(() => setFadeStatus(null), 3500);
      setSleepTimerRemaining(null);
      setSleepTimerInitial(null);
      setSleepTimerMode(null);
      return;
    }

    const interval = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null || prev <= 0) return null;
        const next = prev - 1;

        // Gracefully fade volume over the final 15 seconds (or 50% of duration if timer is brief)
        const fadeWindow = Math.min(15, sleepTimerInitial ? Math.max(5, Math.floor(sleepTimerInitial * 0.4)) : 15);
        if (next <= fadeWindow && next > 0) {
          isFadingRef.current = true;
          const factor = (next - 1) / fadeWindow; // smoothly scales from 1.0 down to 0.0
          const attenuatedVolume = Math.max(0, Math.round(baseVolumeRef.current * factor));
          onChangeVolume(attenuatedVolume);
          setFadeStatus(`Fading audio (${next}s)`);
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerRemaining, sleepTimerInitial, isPlaying, onTogglePlay, onChangeVolume]);

  const handleStartSleepTimer = (seconds: number, modeName: string) => {
    soundEffects.playMechanicalClick();
    if (isFadingRef.current) {
      onChangeVolume(baseVolumeRef.current);
      isFadingRef.current = false;
    }
    baseVolumeRef.current = volume;
    setSleepTimerInitial(seconds);
    setSleepTimerRemaining(seconds);
    setSleepTimerMode(modeName);
    setFadeStatus(null);
  };

  const handleCancelSleepTimer = () => {
    soundEffects.playMechanicalClick();
    if (isFadingRef.current) {
      onChangeVolume(baseVolumeRef.current);
      isFadingRef.current = false;
    }
    setSleepTimerRemaining(null);
    setSleepTimerInitial(null);
    setSleepTimerMode(null);
    setFadeStatus(null);
  };

  const formatTimerCountdown = (secs: number) => {
    if (secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${h}h ${remM.toString().padStart(2, '0')}m`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const volumePercent = isMuted ? 0 : Math.min(100, Math.max(0, volume));

  const handleTapeHissToggle = () => {
    const next = !tapeHiss;
    setTapeHiss(next);
    soundEffects.setTapeHiss(next, 0.035);
  };

  const auraColor = currentTrack.ambientGlow ? currentTrack.ambientGlow.glowRgba : 'rgba(245, 158, 11, 0.45)';
  const themeAccent = currentTrack.ambientGlow ? currentTrack.ambientGlow.primary : '#fbbf24';

  return (
    <>
      {/* Sleek Glassmorphism 'Up Next' Tracklist Drawer */}
      {showQueue && (
        <div className="fixed bottom-32 sm:bottom-36 right-4 sm:right-8 z-50 w-[calc(100vw-32px)] sm:w-[420px] max-h-[480px] rounded-[24px] floating-widget-glass p-5 shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-3 duration-200 border border-white/10">
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
                style={{
                  backgroundColor: `${themeAccent}25`,
                  border: `1px solid ${themeAccent}50`,
                  color: themeAccent,
                }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-mono tracking-widest text-stone-200 font-bold uppercase block">
                  UP NEXT · PLAYLIST
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {playlist.length} Master Recordings
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowQueue(false)}
              className="w-8 h-8 flex items-center justify-center text-xs text-stone-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Close tracklist drawer"
            >
              ✕
            </button>
          </div>

          <div className="overflow-y-auto space-y-1.5 pr-1 flex-1 mask-fade-edges">
            {playlist.map((track, idx) => {
              const isActive = idx === (currentTrackIndex % playlist.length);
              const isUpNext = idx === ((currentTrackIndex + 1) % playlist.length);

              return (
                <button
                  key={`${track.id}-${idx}`}
                  type="button"
                  onClick={() => {
                    soundEffects.playMechanicalClick();
                    onSelectTrackAtIndex(idx);
                    setShowQueue(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center justify-between group border ${
                    isActive
                      ? 'bg-gradient-to-r from-white/10 to-transparent border-amber-500/40 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.15)] scale-[1.01]'
                      : 'hover:bg-white/5 text-stone-300 border-transparent hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`font-mono text-xs w-6 tabular-nums text-center ${
                      isActive ? 'font-bold' : 'text-stone-500 group-hover:text-stone-300'
                    }`} style={{ color: isActive ? themeAccent : undefined }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    <div className="min-w-0 truncate">
                      <p className={`text-xs sm:text-sm font-semibold truncate font-['Manrope'] tracking-wide ${
                        isActive ? 'font-bold drop-shadow' : 'text-stone-200 group-hover:text-white transition-colors'
                      }`}>
                        {track.formattedTitle}
                      </p>
                      <p className="text-[11px] text-stone-400 truncate font-['Manrope'] mt-0.5">
                        {track.artist} · <span className="opacity-80">{track.year}</span>
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isActive ? (
                      <span 
                        className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 shadow-sm"
                        style={{
                          backgroundColor: `${themeAccent}20`,
                          borderColor: `${themeAccent}60`,
                          color: themeAccent,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: themeAccent }} />
                        PLAYING
                      </span>
                    ) : isUpNext ? (
                      <span className="text-[9px] font-mono text-stone-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        NEXT
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}



      {/* 1. DYNAMIC FLOATING ISLAND ARCHITECTURE (Detached from bottom, centered 920px pill) */}
      <div className="fixed bottom-6 inset-x-0 mx-auto px-4 w-full max-w-[920px] z-50 pointer-events-auto">
        <div className="relative rounded-[26px] sm:rounded-[28px] floating-widget-glass px-6 sm:px-8 py-3.5 sm:py-4 transition-all duration-300 group">
          {/* 3. AMBIENT AURA EXTRACTION (Apple Music Style 1.5s Crossfade) */}
          <div 
            className="absolute -inset-1 rounded-[26px] sm:rounded-[28px] blur-2xl pointer-events-none transition-all duration-1500 ease-in-out"
            style={{
              backgroundColor: isPlaying ? auraColor : 'transparent',
              opacity: isPlaying ? 0.85 : 0,
            }}
          />

          {/* 2. PREMIUM FULL-WIDTH SCRUBBER: Razor-thin 2px track with luminous fill & hidden-until-hover thumb */}
          <div className="relative w-full flex flex-col mb-3.5 sm:mb-4">
            <div className="relative w-full h-3 flex items-center group/scrubber cursor-pointer">
              {/* 2px Background Track */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[2px] bg-white/10 rounded-full pointer-events-none overflow-hidden">
                {/* Luminous Fill Line matching Track Ambient Accent */}
                <div 
                  className="h-full shadow-[0_0_12px_currentColor] transition-all duration-150"
                  style={{ 
                    width: `${progressPercent}%`,
                    backgroundColor: themeAccent,
                    color: themeAccent,
                  }}
                />
              </div>

              {/* Range Input with hidden thumb by default, 8px glowing dot on hover */}
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.5"
                value={currentTime}
                onMouseDown={onSeekStart}
                onTouchStart={onSeekStart}
                onChange={(e) => onSeekChange(Number(e.target.value))}
                onMouseUp={(e) => onSeekCommit(Number((e.target as HTMLInputElement).value))}
                onTouchEnd={(e) => onSeekCommit(Number((e.target as HTMLInputElement).value))}
                aria-label="Audio scrubber"
                className="dribbble-scrubber w-full z-10"
              />
            </div>

            {/* Timecode Indicators */}
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 tabular-nums -mt-0.5 px-0.5 select-none">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* STRICT THREE-COLUMN CONTROL ROW */}
          <div className="flex items-center justify-between w-full relative z-10 gap-3 sm:gap-6">
            {/* LEFT SECTION (Metadata): flex: 1 and justify-start. Cleanly stacked with no wrapping */}
            <div className="flex-1 flex items-center justify-start gap-3 min-w-0 pr-2">
              {/* Equalizer Frequency Box */}
              <div 
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/60 border border-white/10 flex items-end justify-center gap-[3px] p-2.5 shrink-0 shadow-inner overflow-hidden"
                title={isPlaying ? 'Live Audio Frequency Visualizer' : 'Audio Paused'}
              >
                <span 
                  className={`w-[2.5px] rounded-full transition-all duration-300 ${isPlaying ? 'animate-eq-1' : 'h-[2px]'}`}
                  style={{ backgroundColor: themeAccent }}
                />
                <span 
                  className={`w-[2.5px] rounded-full transition-all duration-300 ${isPlaying ? 'animate-eq-2' : 'h-[2px]'}`}
                  style={{ backgroundColor: themeAccent }}
                />
                <span 
                  className={`w-[2.5px] rounded-full transition-all duration-300 ${isPlaying ? 'animate-eq-3' : 'h-[2px]'}`}
                  style={{ backgroundColor: themeAccent }}
                />
                <span 
                  className={`w-[2.5px] rounded-full transition-all duration-300 ${isPlaying ? 'animate-eq-4' : 'h-[2px]'}`}
                  style={{ backgroundColor: themeAccent }}
                />
              </div>

              {/* Title & Artist - Cleanly stacked with no wrapping */}
              <div className="min-w-0 flex flex-col justify-center overflow-hidden">
                <h4 className="font-['Manrope'] font-bold text-white text-xs sm:text-sm tracking-tight truncate whitespace-nowrap leading-snug">
                  {currentTrack.formattedTitle}
                </h4>
                <p className="font-['Manrope'] text-stone-400 text-[11px] truncate whitespace-nowrap leading-tight mt-0.5">
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            {/* CENTER SECTION (Controls): flex: none / shrink-0, perfectly centered Play/Pause, Next, Prev */}
            <div className="shrink-0 flex-none flex items-center justify-center gap-2 sm:gap-3 px-1 sm:px-2">
              {/* Previous Track Button */}
              <SaaSTooltip label="Previous (←)">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playGearRatchet();
                    onPrev();
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 select-none cursor-pointer"
                  style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
                  aria-label="Previous Track"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current">
                    <path d="M19 20L9 12l10-8v16zM7 4H5v16h2V4z" />
                  </svg>
                </button>
              </SaaSTooltip>

              {/* Perfectly Circular, Prominent Play/Pause Button */}
              <SaaSTooltip label={isPlaying ? 'Pause (Spacebar)' : 'Play (Spacebar)'}>
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playMechanicalClick(isPlaying);
                    onTogglePlay();
                  }}
                  className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full shrink-0 aspect-square flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-lg ${
                    isPlaying
                      ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-[0_0_24px_rgba(245,158,11,0.6)] hover:shadow-[0_0_32px_rgba(245,158,11,0.85)] scale-100'
                      : 'bg-white hover:bg-stone-100 text-stone-950 shadow-[0_0_20px_rgba(255,255,255,0.45)]'
                  }`}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isBuffering ? (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 animate-spin fill-none stroke-current stroke-2">
                      <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeLinecap="round" />
                    </svg>
                  ) : isPlaying ? (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current ml-0.5">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              </SaaSTooltip>

              {/* Next Track Button */}
              <SaaSTooltip label="Next (→)">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playGearRatchet();
                    onNext();
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 select-none cursor-pointer"
                  style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
                  aria-label="Next Track"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current">
                    <path d="M5 4l10 8-10 8V4zm12 0h2v16h-2V4z" />
                  </svg>
                </button>
              </SaaSTooltip>
            </div>

            {/* RIGHT SECTION (Toggles/Volume): flex: 1 and justify-end to push Lyrics, Theatre, Volume to edge */}
            <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3 min-w-0 pl-2">
              {/* 2. APPLE MUSIC LYRICS QUOTATION ICON TOGGLE */}
              <SaaSTooltip label={showLyrics ? 'Close Lyrics (L)' : 'Lyrics (L)'}>
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playMechanicalClick();
                    onToggleLyrics();
                  }}
                  className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer shrink-0 ${
                    showLyrics
                      ? 'bg-white text-stone-950 font-bold shadow-[0_0_20px_rgba(255,255,255,0.7)] scale-105'
                      : 'text-white/60 hover:text-white hover:scale-110 active:scale-95'
                  }`}
                  style={{ transitionTimingFunction: 'var(--spring-apple)' }}
                  aria-label="Toggle Lyrics Overlay"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current">
                    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                  </svg>
                </button>
              </SaaSTooltip>

              {/* 2. IMMERSIVE THEATRE MODE TOGGLE ICON */}
              <SaaSTooltip label={isTheatreMode ? 'Exit Theatre (T)' : 'Theatre Mode (T)'}>
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playMechanicalClick();
                    onToggleTheatreMode();
                  }}
                  className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer shrink-0 ${
                    isTheatreMode
                      ? 'bg-amber-400 text-stone-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                      : 'text-white/60 hover:text-white hover:scale-110 active:scale-95'
                  }`}
                  style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
                  aria-label="Toggle Theatre Mode"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current">
                    <path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V8h14v10z" />
                  </svg>
                </button>
              </SaaSTooltip>

              {/* Volume Slider */}
              <div className="hidden md:flex items-center gap-2 group/volume relative shrink-0">
                <SaaSTooltip label={isMuted ? 'Unmute (M)' : 'Mute (M)'}>
                  <button
                    type="button"
                    onClick={onToggleMute}
                    className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
                    aria-label="Mute / Unmute"
                  >
                    {isMuted ? (
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-red-400">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                      </svg>
                    )}
                  </button>
                </SaaSTooltip>

                <div className="relative w-16 lg:w-20 h-3 flex items-center">
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[2px] bg-white/10 rounded-full pointer-events-none overflow-hidden">
                    <div 
                      className="h-full transition-all duration-150"
                      style={{ 
                        width: `${volumePercent}%`,
                        backgroundColor: themeAccent,
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => onChangeVolume(Number(e.target.value))}
                    aria-label="Volume slider"
                    className="dribbble-scrubber w-full z-10"
                  />
                </div>
              </div>

              {/* Sleep Timer Contextual Popover (MacOS/Apple Music Style) */}
              <div className="relative shrink-0" ref={sleepTimerMenuRef}>
                <SaaSTooltip label={sleepTimerRemaining !== null ? `Sleep Timer: ${formatTimerCountdown(sleepTimerRemaining)}` : 'Sleep Timer'}>
                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playMechanicalClick();
                      setShowSleepTimer((prev) => !prev);
                      if (showQueue) setShowQueue(false);
                    }}
                    className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer relative shrink-0 ${
                      sleepTimerRemaining !== null
                        ? 'bg-amber-400 text-stone-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                        : showSleepTimer
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'text-white/60 hover:text-white hover:scale-110 active:scale-95'
                    }`}
                    style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
                    aria-label="Toggle Sleep Timer"
                    aria-expanded={showSleepTimer}
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current">
                      <path d="M12.3 2a10 10 0 0 0-1.9 20 10 10 0 0 0 8.5-4.8 1 1 0 0 0-.9-1.5 8 8 0 1 1-6.6-13.2 1 1 0 0 0 .9-.5z" />
                    </svg>
                    {sleepTimerRemaining !== null && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-300 rounded-full animate-ping" />
                    )}
                  </button>
                </SaaSTooltip>

                {/* Buttery-Smooth Framer Motion Apple-Grade Popover */}
                <AnimatePresence>
                  {showSleepTimer && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 6 }}
                      transition={{
                        type: 'spring',
                        damping: 24,
                        stiffness: 380,
                        mass: 0.8,
                      }}
                      style={{
                        transformOrigin: 'bottom right',
                        backdropFilter: 'blur(48px) saturate(200%)',
                        WebkitBackdropFilter: 'blur(48px) saturate(200%)',
                        backgroundColor: 'rgba(15, 15, 20, 0.85)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 255, 255, 0.15)',
                      }}
                      className="absolute bottom-full right-0 mb-3 w-[240px] sm:w-[260px] p-1.5 z-50 flex flex-col select-none text-stone-200"
                    >
                      {/* Active Fade Notice (if running) */}
                      {fadeStatus && (
                        <div className="px-3 py-1 mb-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono text-amber-300 flex items-center justify-between animate-pulse">
                          <span>{fadeStatus}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        </div>
                      )}

                      {/* 1. Off / Cancel Option */}
                      <button
                        type="button"
                        onClick={() => {
                          soundEffects.playMechanicalClick();
                          if (sleepTimerRemaining !== null) {
                            handleCancelSleepTimer();
                          }
                          setShowSleepTimer(false);
                          setIsCustomOpen(false);
                        }}
                        className="w-full text-left py-2.5 px-4 text-xs font-['Manrope'] font-medium text-stone-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between cursor-pointer group"
                      >
                        <span className={sleepTimerRemaining === null ? 'text-white font-semibold' : 'text-stone-300'}>
                          Off
                        </span>
                        {sleepTimerRemaining === null ? (
                          <AmberCheckmark />
                        ) : (
                          <span className="text-[10px] font-mono text-amber-400 font-semibold tabular-nums">
                            {formatTimerCountdown(sleepTimerRemaining)}
                          </span>
                        )}
                      </button>

                      {/* Subtle Separator */}
                      <div className="my-1 border-t border-white/10 mx-2" />

                      {/* 2. Unboxed Presets List */}
                      {[
                        { label: '15 minutes', seconds: 15 * 60, id: '15' },
                        { label: '30 minutes', seconds: 30 * 60, id: '30' },
                        { label: '45 minutes', seconds: 45 * 60, id: '45' },
                        { label: '1 hour', seconds: 60 * 60, id: '60' },
                      ].map((preset) => {
                        const isSelected = sleepTimerMode === preset.id && sleepTimerRemaining !== null;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              handleStartSleepTimer(preset.seconds, preset.id);
                              setShowSleepTimer(false);
                              setIsCustomOpen(false);
                            }}
                            className="w-full text-left py-2.5 px-4 text-xs font-['Manrope'] font-medium text-stone-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between cursor-pointer group"
                          >
                            <span className={isSelected ? 'text-white font-semibold' : 'text-stone-300'}>
                              {preset.label}
                            </span>
                            {isSelected && <AmberCheckmark />}
                          </button>
                        );
                      })}

                      {/* 3. When track ends */}
                      {(() => {
                        const isTrackSelected = sleepTimerMode === 'track' && sleepTimerRemaining !== null;
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              const trackRemaining = Math.max(10, Math.floor(duration - currentTime));
                              handleStartSleepTimer(trackRemaining, 'track');
                              setShowSleepTimer(false);
                              setIsCustomOpen(false);
                            }}
                            className="w-full text-left py-2.5 px-4 text-xs font-['Manrope'] font-medium text-stone-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className={isTrackSelected ? 'text-white font-semibold' : 'text-stone-300'}>
                                When track ends
                              </span>
                              <span className="text-[10px] text-stone-500 font-mono truncate">
                                ~{formatTime(Math.max(0, duration - currentTime))}
                              </span>
                            </div>
                            {isTrackSelected && <AmberCheckmark />}
                          </button>
                        );
                      })()}

                      {/* Subtle Separator */}
                      <div className="my-1 border-t border-white/10 mx-2" />

                      {/* 4. Custom Time Option with Smooth Inline Expansion */}
                      {(() => {
                        const isCustomActive = sleepTimerMode?.startsWith('custom-') && sleepTimerRemaining !== null;
                        return (
                          <>
                            <button
                              type="button"
                              onClick={() => setIsCustomOpen((prev) => !prev)}
                              className="w-full text-left py-2.5 px-4 text-xs font-['Manrope'] font-medium text-stone-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between cursor-pointer group"
                            >
                              <span className={isCustomActive ? 'text-white font-semibold' : 'text-stone-300'}>
                                {isCustomActive
                                  ? `Custom (${sleepTimerMode?.replace('custom-', '')} mins)`
                                  : 'Custom time...'}
                              </span>
                              {isCustomActive && !isCustomOpen && <AmberCheckmark />}
                            </button>

                            <AnimatePresence>
                              {isCustomOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                  className="overflow-hidden px-2 pt-1 pb-1.5"
                                >
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      const mins = parseInt(customInputMinutes, 10);
                                      if (mins && mins > 0) {
                                        handleStartSleepTimer(mins * 60, `custom-${mins}`);
                                        setShowSleepTimer(false);
                                        setIsCustomOpen(false);
                                      }
                                    }}
                                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 focus-within:border-amber-400/50 transition-colors"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="number"
                                        min="1"
                                        max="360"
                                        value={customInputMinutes}
                                        onChange={(e) => setCustomInputMinutes(e.target.value)}
                                        className="w-12 bg-white/5 border border-white/15 focus:border-amber-400/60 rounded px-1.5 py-1 text-center font-mono text-xs text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder="20"
                                        autoFocus
                                      />
                                      <span className="text-[11px] font-mono text-stone-400">mins</span>
                                    </div>

                                    <button
                                      type="submit"
                                      className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 px-3 py-1 rounded-md bg-amber-400/10 hover:bg-amber-400/20 active:scale-95 transition-all cursor-pointer border border-amber-400/20"
                                    >
                                      Start
                                    </button>
                                  </form>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Up Next Drawer Toggle */}
              <SaaSTooltip label="Up Next Playlist">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playMechanicalClick();
                    setShowQueue(!showQueue);
                    if (showSleepTimer) setShowSleepTimer(false);
                  }}
                  className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all duration-200 select-none cursor-pointer shrink-0 ${
                    showQueue
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'text-white/60 hover:text-white hover:scale-110 active:scale-95'
                  }`}
                  style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
                  aria-label="Toggle Up Next playlist"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current">
                    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z" />
                  </svg>
                </button>
              </SaaSTooltip>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
