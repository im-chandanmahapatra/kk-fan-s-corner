import { useState, useEffect, useRef, useCallback } from 'react';
import { PLAYLIST_TRACKS as KK_TRACKS, KK_PLAYLIST_ID, KKTrack, findCuratedTrack, formatRawYouTubeTitle } from '../data/kkData';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function useYouTubePlayer(playlistId = KK_PLAYLIST_ID) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(KK_TRACKS[0].approxDurationSec);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [currentTrack, setCurrentTrack] = useState<KKTrack>(KK_TRACKS[0]);
  const [volume, setVolumeState] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isApiReady, setIsApiReady] = useState<boolean>(false);
  const [tapeCounter, setTapeCounter] = useState<number>(1);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [rawVideoTitle, setRawVideoTitle] = useState<string>('');
  const [playbackError, setPlaybackError] = useState('');

  const playerRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const pendingPlayRef = useRef<boolean>(false);
  const lastIndexRef = useRef<number>(0);

  // Sync active track details whenever index or raw title updates
  const syncTrackFromPlayer = useCallback((forcedIndex?: number) => {
    if (!playerRef.current) return;

    let pIndex = typeof forcedIndex === 'number' ? forcedIndex : 0;
    if (typeof playerRef.current.getPlaylistIndex === 'function') {
      const idx = playerRef.current.getPlaylistIndex();
      if (typeof idx === 'number' && idx >= 0) {
        pIndex = idx;
      }
    }

    let videoTitle = '';
    let activeVideoId = '';
    if (typeof playerRef.current.getVideoData === 'function') {
      const data = playerRef.current.getVideoData();
      if (data && data.title) {
        videoTitle = data.title;
        setRawVideoTitle(videoTitle);
      }
      if (data?.video_id) {
        activeVideoId = data.video_id;
      }
    }

    // YouTube can emit an empty payload while replacing the active video.
    if (!activeVideoId && !videoTitle) return;
    // Format into strict 'Song Name — Movie/Album'
    const formattedMeta = formatRawYouTubeTitle(videoTitle, pIndex);
    const matchedCurated = KK_TRACKS.find(track => track.videoId === activeVideoId) ?? findCuratedTrack(videoTitle);
    const indexedFallback = KK_TRACKS[pIndex % KK_TRACKS.length];

    const videoId = activeVideoId || matchedCurated?.videoId || indexedFallback.videoId;
    const updatedTrack: KKTrack = {
      // Never attach lyrics by playlist position. The title must identify a
      // curated song; otherwise the track gets an unknown id and shows no lyrics.
      ...(matchedCurated ?? indexedFallback),
      id: matchedCurated?.id ?? `unmatched-${activeVideoId || pIndex}`,
      songName: matchedCurated?.songName ?? formattedMeta.songName,
      movieOrAlbum: matchedCurated?.movieOrAlbum ?? formattedMeta.movieOrAlbum,
      formattedTitle: matchedCurated?.formattedTitle ?? formattedMeta.formattedTitle,
      videoId,
      // A YouTube thumbnail is the reliable fallback artwork for every playlist item.
      // It prevents a stale poster when the user changes tracks, while allowing a
      // future curated movie-poster URL to replace it per track.
      artworkUrl: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : (matchedCurated?.artworkUrl ?? indexedFallback.artworkUrl),
    };

    setCurrentTrackIndex(pIndex);
    lastIndexRef.current = pIndex;
    setCurrentTrack(updatedTrack);

    // Refresh duration
    if (typeof playerRef.current.getDuration === 'function') {
      const dur = playerRef.current.getDuration();
      if (typeof dur === 'number' && dur > 0) {
        setDuration(dur);
      }
    }
  }, []);

  // Initialize YouTube IFrame API with playlist configuration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setupPlayer = () => {
      const container = document.getElementById('yt-audio-container');
      if (!container || playerRef.current) return;

      try {
        playerRef.current = new window.YT.Player('yt-audio-container', {
          videoId: KK_TRACKS[0].videoId,
          height: '100',
          width: '100',
          playerVars: {
            listType: 'playlist',
            list: playlistId,
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              setIsApiReady(true);
              try {
                event.target.setVolume(volume);
                syncTrackFromPlayer();

                if (pendingPlayRef.current) {
                  pendingPlayRef.current = false;
                  event.target.playVideo();
                }
              } catch (err) {
                console.warn('YT playlist onReady warning:', err);
              }
            },
            onStateChange: (event: any) => {
              // YouTube Player State Values:
              // -1: unstarted (often signals new track loaded)
              //  0: ended (auto-advance triggered)
              //  1: playing
              //  2: paused
              //  3: buffering
              //  5: video cued
              const state = event.data;

              // Check if playlist track changed on any state transition
              if (playerRef.current && typeof playerRef.current.getPlaylistIndex === 'function') {
                const currentIdx = playerRef.current.getPlaylistIndex();
                if (typeof currentIdx === 'number' && currentIdx !== lastIndexRef.current) {
                  syncTrackFromPlayer(currentIdx);
                  setCurrentTime(0);
                }
              }

              if (state === 1) {
                setPlaybackError('');
                // PLAYING
                setIsPlaying(true);
                setIsBuffering(false);
                syncTrackFromPlayer();
              } else if (state === 2) {
                // PAUSED
                setIsPlaying(false);
                setIsBuffering(false);
              } else if (state === 3) {
                // BUFFERING
                setIsBuffering(true);
              } else if (state === 0) {
                // ENDED: Auto-advance to next playlist video seamlessly
                setIsBuffering(false);
                if (playerRef.current && typeof playerRef.current.nextVideo === 'function') {
                  try {
                    playerRef.current.nextVideo();
                  } catch {
                    handleNextTrack();
                  }
                } else {
                  handleNextTrack();
                }
              } else if (state === -1 || state === 5) {
                syncTrackFromPlayer();
                setIsBuffering(false);
              }
            },
            onError: (err: any) => {
              console.warn('YouTube playback error code:', err.data);
              setIsPlaying(false);
              setIsBuffering(false);
              setPlaybackError([101, 150].includes(err.data) ? 'This recording cannot play in embedded players.' : 'YouTube could not play this recording.');
            },
          },
        });
      } catch (e) {
        console.warn('Failed to initialize YouTube IFrame Player with playlist:', e);
      }
    };

    if (window.YT && window.YT.Player) {
      setupPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        setupPlayer();
      };

      if (!document.getElementById('yt-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }
    }
  }, [playlistId, volume, syncTrackFromPlayer]);

  // Lag-free polling (200ms) for real-time progress bar synchronization
  useEffect(() => {
    if (isPlaying && !isSeeking) {
      timerRef.current = window.setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            const time = playerRef.current.getCurrentTime();
            const dur = playerRef.current.getDuration();
            if (typeof time === 'number' && !isNaN(time) && !isSeeking) {
              setCurrentTime(time);
            }
            if (typeof dur === 'number' && dur > 0) {
              setDuration(dur);
            }

            // Detect background track advancement if getPlaylistIndex changed
            if (typeof playerRef.current.getPlaylistIndex === 'function') {
              const idx = playerRef.current.getPlaylistIndex();
              if (typeof idx === 'number' && idx >= 0 && idx !== lastIndexRef.current) {
                syncTrackFromPlayer(idx);
                setCurrentTime(0);
              }
            }
          } catch {
            // Keep the last confirmed time: invented time drifts from vocals.
          }
        }

        // Tape mechanical counter
        setTapeCounter((prev) => (prev >= 999 ? 0 : prev + 1));
      }, 200);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, isSeeking, currentTrack, syncTrackFromPlayer]);

  const play = useCallback(() => {
    setPlaybackError('');
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      try {
        playerRef.current.playVideo();
      } catch (err) {
        console.warn('playVideo invocation:', err);
      }
    } else {
      pendingPlayRef.current = true;
    }
  }, []);

  const pause = useCallback(() => {
    pendingPlayRef.current = false;
    setIsPlaying(false);
    setIsBuffering(false);
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      try {
        playerRef.current.pauseVideo();
      } catch (err) {
        console.warn('pauseVideo invocation:', err);
      }
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Smooth Drag-to-Seek Handlers
  const onSeekStart = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const onSeekChange = useCallback((newTime: number) => {
    setCurrentTime(newTime);
  }, []);

  const onSeekCommit = useCallback((newTime: number) => {
    setIsSeeking(false);
    setCurrentTime(newTime);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(newTime, true);
        if (isPlaying) {
          playerRef.current.playVideo();
        }
      } catch (err) {
        console.warn('onSeekCommit error:', err);
      }
    }
  }, [isPlaying]);

  const setVolume = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(100, newVol));
    setVolumeState(clamped);
    setIsMuted(clamped === 0);
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(clamped);
        if (clamped > 0 && typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
        }
      } catch (err) {
        console.warn('setVolume invocation:', err);
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      if (playerRef.current && typeof playerRef.current.unMute === 'function') {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume || 80);
      }
    } else {
      setIsMuted(true);
      if (playerRef.current && typeof playerRef.current.mute === 'function') {
        playerRef.current.mute();
      }
    }
  }, [isMuted, volume]);

  const handleNextTrack = useCallback(() => {
    setPlaybackError('');
    setCurrentTime(0);
    if (playerRef.current && typeof playerRef.current.nextVideo === 'function') {
      try {
        playerRef.current.nextVideo();
        syncTrackFromPlayer();
        return;
      } catch (err) {
        console.warn('nextVideo failed, falling back:', err);
      }
    }

    // Fallback: cycle local index and seek
    setCurrentTrackIndex((prev) => {
      const nextIndex = (prev + 1) % KK_TRACKS.length;
      lastIndexRef.current = nextIndex;
      setCurrentTrack(KK_TRACKS[nextIndex]);
      if (playerRef.current && typeof playerRef.current.playVideoAt === 'function') {
        try {
          playerRef.current.playVideoAt(nextIndex);
        } catch {
          // ignore
        }
      }
      return nextIndex;
    });
  }, [syncTrackFromPlayer]);

  const handlePrevTrack = useCallback(() => {
    setPlaybackError('');
    setCurrentTime(0);
    if (playerRef.current && typeof playerRef.current.previousVideo === 'function') {
      try {
        playerRef.current.previousVideo();
        syncTrackFromPlayer();
        return;
      } catch (err) {
        console.warn('previousVideo failed, falling back:', err);
      }
    }

    setCurrentTrackIndex((prev) => {
      const prevIndex = (prev - 1 + KK_TRACKS.length) % KK_TRACKS.length;
      lastIndexRef.current = prevIndex;
      setCurrentTrack(KK_TRACKS[prevIndex]);
      if (playerRef.current && typeof playerRef.current.playVideoAt === 'function') {
        try {
          playerRef.current.playVideoAt(prevIndex);
        } catch {
          // ignore
        }
      }
      return prevIndex;
    });
  }, [syncTrackFromPlayer]);

  const playTrackAtIndex = useCallback((index: number) => {
    setPlaybackError('');
    const validIndex = Math.max(0, Math.min(index, KK_TRACKS.length - 1));
    setCurrentTrackIndex(validIndex);
    lastIndexRef.current = validIndex;
    setCurrentTrack(KK_TRACKS[validIndex]);
    setDuration(KK_TRACKS[validIndex].approxDurationSec);
    setCurrentTime(0);

    if (playerRef.current && typeof playerRef.current.playVideoAt === 'function') {
      try {
        playerRef.current.playVideoAt(validIndex);
      } catch (err) {
        console.warn('playVideoAt invocation:', err);
      }
    }
  }, []);

  const selectTrackById = useCallback((trackId: string) => {
    const idx = KK_TRACKS.findIndex((t) => t.id === trackId);
    if (idx !== -1) {
      playTrackAtIndex(idx);
    }
  }, [playTrackAtIndex]);

  const resetTapeCounter = useCallback(() => {
    setTapeCounter(0);
  }, []);

  return {
    isPlaying,
    isBuffering,
    isSeeking,
    currentTime,
    duration,
    currentTrack,
    currentTrackIndex,
    rawVideoTitle,
    playbackError,
    playlist: KK_TRACKS,
    volume,
    isMuted,
    isApiReady,
    tapeCounter,
    togglePlay,
    play,
    pause,
    seekTo: onSeekCommit,
    onSeekStart,
    onSeekChange,
    onSeekCommit,
    setVolume,
    toggleMute,
    nextTrack: handleNextTrack,
    prevTrack: handlePrevTrack,
    playTrackAtIndex,
    selectTrackById,
    resetTapeCounter,
  };
}
