import React, { useEffect, useState } from 'react';
import { Disc3, Heart } from 'lucide-react';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import { soundEffects } from './services/soundEffects';
import { NostalgicPlayer } from './components/NostalgicPlayer';
import { SpatialAlbumArt } from './components/SpatialAlbumArt';
import { AppleLyricsOverlay } from './components/AppleLyricsOverlay';
import { ConcertAtmosphere } from './components/ConcertAtmosphere';
import { TheatreStage } from './components/TheatreStage';
import { AnimatedBackdrop } from './components/AnimatedBackdrop';
import { KK_PLAYLIST_ID } from './data/kkData';

export default function App() {
  const [isTheatreMode, setIsTheatreMode] = useState<boolean>(false);
  const [showTributeModal, setShowTributeModal] = useState<boolean>(false);
  const [showLyrics, setShowLyrics] = useState<boolean>(false);
  const [isDawnMode, setIsDawnMode] = useState<boolean>(false);

  const {
    isPlaying,
    playbackError,
    isBuffering,
    isSeeking,
    currentTime,
    duration,
    currentTrack,
    currentTrackIndex,
    playlist,
    volume,
    isMuted,
    togglePlay,
    onSeekStart,
    onSeekChange,
    onSeekCommit,
    seekTo,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    playTrackAtIndex,
  } = useYouTubePlayer(KK_PLAYLIST_ID);


  // Dynamic Premium Favicon & Document Title
  useEffect(() => {
    document.title = 'KK | Timeless Melodies';

    const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="#0c0c10" stroke="url(#gold)" stroke-width="2.5"/>
      <circle cx="32" cy="32" r="23" fill="none" stroke="rgba(251,191,36,0.3)" stroke-width="1" stroke-dasharray="4 2"/>
      <circle cx="32" cy="32" r="16" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <circle cx="32" cy="32" r="10" fill="url(#gold)"/>
      <circle cx="32" cy="32" r="3" fill="#0c0c10"/>
    </svg>`;
    const faviconUrl = `data:image/svg+xml,${encodeURIComponent(faviconSvg.trim())}`;

    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.href = faviconUrl;
  }, []);

  // Global Keyboard Shortcuts (Space = Play/Pause, Arrows = Navigation, L = Lyrics, T = Theatre, M = Mute, Esc = Close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes((e.target as HTMLElement)?.tagName) || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      if (e.key === 'Escape') {
        if (showTributeModal) {
          setShowTributeModal(false);
          return;
        }
        if (showLyrics) {
          setShowLyrics(false);
          return;
        }
        if (isTheatreMode) {
          setIsTheatreMode(false);
          return;
        }
      }

      if (e.code === 'Space') {
        e.preventDefault();
        soundEffects.playMechanicalClick(isPlaying);
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        soundEffects.playGearRatchet();
        nextTrack();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        soundEffects.playGearRatchet();
        prevTrack();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        soundEffects.playMechanicalClick();
        setShowLyrics((prev) => !prev);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        soundEffects.playMechanicalClick();
        setIsTheatreMode((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, togglePlay, nextTrack, prevTrack, toggleMute, showTributeModal, showLyrics, isTheatreMode]);

  return (
    <div className="listening-app bg-[#07070a] text-stone-100 font-['Manrope',sans-serif]">
      {/* Hidden YouTube IFrame Audio Engine with Playlist Architecture */}
      <div 
        id="yt-audio-container" 
        className="fixed -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Cinematic Dark Mesh Gradient & Dynamic Ambient Aura Crossfade */}
      <ConcertAtmosphere 
        isPlaying={isPlaying} 
        rainMode="off"
        ambientGlow={currentTrack.ambientGlow}
        isTheatreMode={isTheatreMode}
      />

      {/* Top Bar Navigation (Ultra-Minimalist SaaS Header) */}
      <header className="sticky top-0 z-30 console-surface px-4 sm:px-10 py-3.5 border-b border-amber-500/15 reveal-header">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Wordmark in Playfair Display */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-300/40">
              <Disc3 className={`w-4 h-4 text-stone-950 ${isPlaying ? 'animate-spin-vinyl' : ''}`} />
            </div>
            <span className="text-base sm:text-xl font-bold tracking-tight text-white font-editorial whitespace-nowrap">
              KK Fan&apos;s Corner
            </span>
          </div>

          {/* Action Cluster */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Ambient Tribute / About Modal Trigger */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playMechanicalClick();
                setShowTributeModal(true);
              }}
              title="About KK Memorial Tribute"
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-black/60 text-stone-300 hover:text-amber-300 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              aria-label="About KK Memorial Tribute"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-amber-400" />
            </button>

            {/* Master Play Button */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playMechanicalClick(isPlaying);
                togglePlay();
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)] active:scale-95 whitespace-nowrap spring-tap cursor-pointer"
            >
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              <kbd className="hidden sm:inline-block text-[10px] bg-amber-700/50 px-1.5 py-0.5 rounded text-amber-100 font-mono font-normal">
                SPACE
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {isTheatreMode ? (
        <TheatreStage
          duration={duration}
          currentTrack={currentTrack}
          currentTime={currentTime}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onSeek={seekTo}
        />
      ) : (
        <main className="home-stage relative z-10">
          <section
            className="home-scene relative overflow-hidden border border-white/10"
          >
            <AnimatedBackdrop isDawnMode={isDawnMode} onChangeMode={setIsDawnMode} ambientGlow={currentTrack.ambientGlow} />
            <div className="scene-heading absolute left-4 right-4 z-10 mx-auto max-w-3xl text-center">
              <p className="text-[10px] sm:text-xs font-mono tracking-[0.25em] text-white/65 uppercase mb-2 select-none">In Eternal Honor of Krishnakumar Kunnath</p>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-editorial drop-shadow-lg leading-tight">KK Fan&apos;s Corner</h1>
              <p className="mt-2 text-xs sm:text-sm text-white/65">{isDawnMode ? 'First light, old memories.' : 'A quiet sky for timeless melodies.'}</p>
            </div>
            <div className="corner-art absolute bottom-5 right-5 z-10">
              <SpatialAlbumArt currentTrack={currentTrack} isPlaying={isPlaying} onTogglePlay={togglePlay} showLyrics={showLyrics} />
            </div>
          </section>
        </main>
      )}

      {/* 2. THE AMBIENT TRIBUTE MODAL */}
      {showTributeModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowTributeModal(false)}
        >
          <div 
            className="max-w-lg w-full rounded-[28px] floating-widget-glass p-7 sm:p-10 border border-amber-500/30 shadow-[0_30px_70px_rgba(0,0,0,0.9)] relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle Gold Backing Glow */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowTributeModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-stone-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              aria-label="Close tribute modal"
            >
              ✕
            </button>

            {/* Content */}
            <div className="text-center relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                <Heart className="w-6 h-6 fill-current" />
              </div>

              <span className="text-[10px] font-mono tracking-[0.25em] text-amber-400 uppercase font-bold block mb-1">
                MEMORIAL ARCHIVE
              </span>

              <h3 className="text-2xl sm:text-3xl font-bold text-white font-editorial mb-2 tracking-tight">
                In Eternal Honor of Krishnakumar Kunnath
              </h3>
              <p className="text-xs font-mono text-stone-400 mb-4">
                1968 – 2022
              </p>

              <p className="font-poetry italic text-base sm:text-xl text-amber-200/95 leading-relaxed mb-4">
                &ldquo;Awaaz aisi jo seedha dil ko chhoo le... Har farewell ka aakhri aansu, aur har dosti ka pehla geet.&rdquo;
              </p>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-['Manrope'] mb-6">
                KK gave us companionship on rainy midnight walks, tears on graduation afternoons, courage during first love, and quiet healing in heartbreak. This tribute reproduces the authentic analog warmth and concert acoustics of an era that will forever resonate in our hearts.
              </p>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono text-stone-500">
                <span>MASTER SOURCE: YOUTUBE / PLe-t6JCkeEZE</span>
                <span>·</span>
                <span>SYNCHRONIZED TELEPROMPTER</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. APPLE-GRADE FULL-VIEWPORT GLASS LYRICS OVERLAY */}
      <AppleLyricsOverlay
        artist={currentTrack.artist}
        songName={currentTrack.songName}
        album={currentTrack.movieOrAlbum}
        duration={duration}
        isOpen={showLyrics}
        onClose={() => setShowLyrics(false)}
        trackId={currentTrack.id}
        videoId={currentTrack.videoId}
        formattedTitle={currentTrack.formattedTitle}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onSeek={seekTo}
        dominantColor={currentTrack.ambientGlow.primary}
        glowRgba={currentTrack.ambientGlow.glowRgba}
      />

      {/* ULTRA-PREMIUM DYNAMIC ISLAND AUDIO CONSOLE WITH UP NEXT DRAWER */}
      <NostalgicPlayer
        playbackError={playbackError}
        isPlaying={isPlaying}
        isBuffering={isBuffering}
        isSeeking={isSeeking}
        currentTime={currentTime}
        duration={duration}
        onSeekStart={onSeekStart}
        onSeekChange={onSeekChange}
        onSeekCommit={onSeekCommit}
        currentTrack={currentTrack}
        currentTrackIndex={currentTrackIndex}
        playlist={playlist}
        volume={volume}
        onChangeVolume={setVolume}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onSelectTrackAtIndex={playTrackAtIndex}
        onTogglePlay={togglePlay}
        onNext={nextTrack}
        onPrev={prevTrack}
        isTheatreMode={isTheatreMode}
        onToggleTheatreMode={() => setIsTheatreMode(!isTheatreMode)}
        showLyrics={showLyrics}
        onToggleLyrics={() => setShowLyrics(!showLyrics)}
      />
    </div>
  );
}
