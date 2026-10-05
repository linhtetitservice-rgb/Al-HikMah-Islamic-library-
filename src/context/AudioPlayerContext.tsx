import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { AudioTrack, AudioPlayerContextType } from '../types/audio';
import { CURATED_STREAMING_STATIONS } from '../data/streamingStations';

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlist, setPlaylist] = useState<AudioTrack[]>(CURATED_STREAMING_STATIONS);
  const [queue, setQueue] = useState<AudioTrack[]>(() => {
    try {
      const savedQueue = localStorage.getItem('alhikmah_audio_queue');
      if (savedQueue) {
        return JSON.parse(savedQueue);
      }
    } catch (e) {
      console.warn('Failed to parse saved audio queue:', e);
    }
    return [];
  });
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRateState] = useState<number>(1);
  const [isPlayerVisible, setIsPlayerVisible] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync queue state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('alhikmah_audio_queue', JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to save audio queue:', e);
    }
  }, [queue]);

  const currentTrack = playlist[currentTrackIndex] || null;

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Play track implementation
  const playTrack = useCallback(
    (track: AudioTrack, customPlaylist?: AudioTrack[]) => {
      setError(null);
      setIsLoading(true);

      let activePlaylist = playlist;
      if (customPlaylist && customPlaylist.length > 0) {
        activePlaylist = customPlaylist;
        setPlaylist(customPlaylist);
      } else if (!activePlaylist.some((t) => t.id === track.id)) {
        activePlaylist = [track, ...activePlaylist];
        setPlaylist(activePlaylist);
      }

      const idx = activePlaylist.findIndex((t) => t.id === track.id);
      const targetIdx = idx >= 0 ? idx : 0;
      setCurrentTrackIndex(targetIdx);
      setIsPlayerVisible(true);

      if (audioRef.current) {
        audioRef.current.src = track.streamUrl;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.loop = isLooping;
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((e) => {
            console.warn('Playback request error:', e);
            setIsPlaying(false);
            setIsLoading(false);
            setError('အသံလွှင့်ဖိုင်ကို ဖွင့်ရန် ခွင့်ပြုချက် သို့မဟုတ် လိုင်း အခက်အခဲရှိနေပါသည်။');
          });
      }
    },
    [playlist, playbackRate, isLooping]
  );

  // Handle advancing to next track (Queue first, then playlist)
  const handleNextTrack = useCallback(() => {
    setQueue((prevQueue) => {
      if (prevQueue.length > 0) {
        const [nextItem, ...remainingQueue] = prevQueue;
        // Play the next queued item
        setTimeout(() => {
          playTrack(nextItem);
          showToast(`တန်းစီဇယားမှ "${nextItem.titleMm}" ကို စတင်ဖွင့်နေပါသည်`);
        }, 50);
        return remainingQueue;
      } else {
        // Fallback to playlist loop or shuffle
        if (playlist.length === 0) return prevQueue;

        let nextIdx = 0;
        if (isShuffle && playlist.length > 1) {
          nextIdx = Math.floor(Math.random() * playlist.length);
          if (nextIdx === currentTrackIndex) {
            nextIdx = (nextIdx + 1) % playlist.length;
          }
        } else {
          nextIdx = (currentTrackIndex + 1) % playlist.length;
        }

        const nextTrackItem = playlist[nextIdx];
        if (nextTrackItem) {
          setTimeout(() => {
            playTrack(nextTrackItem);
          }, 50);
        }
        return prevQueue;
      }
    });
  }, [playlist, currentTrackIndex, isShuffle, playTrack, showToast]);

  const handlePrevTrack = useCallback(() => {
    if (playlist.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    const prevItem = playlist[prevIdx];
    if (prevItem) {
      playTrack(prevItem);
    }
  }, [playlist, currentTrackIndex, playTrack]);

  // Keep a stable ref for onEnded to call the latest handleNextTrack
  const handleNextTrackRef = useRef(handleNextTrack);
  useEffect(() => {
    handleNextTrackRef.current = handleNextTrack;
  });

  // Initialize Audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onPlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    const onWaiting = () => {
      setIsLoading(true);
    };

    const onCanPlay = () => {
      setIsLoading(false);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      } else {
        setDuration(0);
      }
      setIsLoading(false);
    };

    const onEnded = () => {
      setIsPlaying(false);
      if (audio.loop) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleNextTrackRef.current();
      }
    };

    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      const err = audio.error;
      let msg = 'အသံဖိုင် ဖွင့်ရာတွင် အခက်အခဲရှိနေပါသည်။ လိုင်းချိတ်ဆက်မှု သို့မဟုတ် လင့်ခ်ကို စစ်ဆေးပါ။';
      if (err) {
        if (err.code === 2) msg = 'အင်တာနက်လိုင်း ချိတ်ဆက်မှု အခက်အခဲ ဖြစ်ပေါ်နေပါသည်။';
        if (err.code === 4) msg = 'ဤအသံဖိုင် လမ်းကြောင်း (URL) သို့မဟုတ် ရေဒီယိုလိုင်း ဖွင့်၍ မရနိုင်ပါ။';
      }
      setError(msg);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Update MediaSession for lock screen & system controls
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.titleMm,
        artist: currentTrack.speakerOrReciterMm,
        album: currentTrack.categoryMm || 'Al-Hikmah စာကြည့်တိုက် အသံလွှင့်ဌာန',
        artwork: [
          {
            src: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=512&q=80',
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        resume();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        pause();
      });
      navigator.mediaSession.setActionHandler('seekbackward', () => {
        skip(-10);
      });
      navigator.mediaSession.setActionHandler('seekforward', () => {
        skip(10);
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        handlePrevTrack();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        handleNextTrackRef.current();
      });
    }
  }, [currentTrack]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn('Resume error:', e);
          setError('ဖွင့်ရန် မဖြစ်နိုင်ပါ။ ပြန်လည်စမ်းသပ်ပါ။');
        });
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [isPlaying, pause, resume]);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    if (audioRef.current) {
      const nextTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, audioRef.current.duration || 999999));
      audioRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
    }
  }, []);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
      if (clamped === 0) {
        audioRef.current.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        audioRef.current.muted = false;
        setIsMuted(false);
      }
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const nextMuted = !isMuted;
      audioRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  }, [isMuted]);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.loop = next;
      }
      return next;
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  // --- QUEUE MANAGEMENT METHODS ---
  const addToQueue = useCallback(
    (track: AudioTrack, playNext = false) => {
      // If nothing is playing, play immediately
      if (!isPlaying && !currentTrack) {
        playTrack(track);
        showToast(`"${track.titleMm}" ကို ချက်ချင်း စတင်ဖွင့်နေပါသည်`);
        return;
      }

      setQueue((prev) => {
        // Prevent immediate duplicates right next to each other
        if (playNext) {
          showToast(`"${track.titleMm}" ကို နောက်တစ်ခုအဖြစ် ဖွင့်ရန် ထည့်သွင်းပြီးပါပြီ`);
          return [track, ...prev];
        } else {
          showToast(`"${track.titleMm}" ကို တန်းစီစာရင်း၏ နောက်ဆုံးတွင် ထည့်သွင်းပြီးပါပြီ`);
          return [...prev, track];
        }
      });
      setIsPlayerVisible(true);
    },
    [isPlaying, currentTrack, playTrack, showToast]
  );

  const addMultipleToQueue = useCallback(
    (tracks: AudioTrack[]) => {
      if (tracks.length === 0) return;
      setQueue((prev) => [...prev, ...tracks]);
      showToast(`အသံဖိုင် (${tracks.length}) ပုဒ်ကို တန်းစီဇယားသို့ ထည့်သွင်းပြီးပါပြီ`);
      setIsPlayerVisible(true);
    },
    [showToast]
  );

  const removeFromQueue = useCallback((indexOrId: number | string) => {
    setQueue((prev) => {
      if (typeof indexOrId === 'number') {
        return prev.filter((_, i) => i !== indexOrId);
      }
      return prev.filter((t) => t.id !== indexOrId);
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    showToast('တန်းစီစာရင်းအားလုံးကို ရှင်းလင်းပြီးပါပြီ');
  }, [showToast]);

  const moveQueueItem = useCallback((fromIndex: number, toIndex: number) => {
    setQueue((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length) {
        return prev;
      }
      const updated = [...prev];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);
      return updated;
    });
  }, []);

  const playQueueItem = useCallback(
    (index: number) => {
      setQueue((prev) => {
        if (index < 0 || index >= prev.length) return prev;
        const target = prev[index];
        const remaining = prev.filter((_, i) => i !== index);
        setTimeout(() => {
          playTrack(target);
          showToast(`"${target.titleMm}" ကို ဖွင့်နေပါသည်`);
        }, 50);
        return remaining;
      });
    },
    [playTrack, showToast]
  );

  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setIsPlayerVisible(false);
    setIsExpanded(false);
  }, []);

  // Quick helper to stream any custom URL provided by the user
  const playCustomUrl = useCallback(
    (url: string, title?: string, speaker?: string) => {
      if (!url || !url.trim()) return;

      const trimmedUrl = url.trim();
      const customTrack: AudioTrack = {
        id: `custom-stream-${Date.now()}`,
        titleMm: title?.trim() || 'တိုက်ရိုက် အသံလွှင့်ဖိုင် (Custom Audio Stream)',
        speakerOrReciterMm: speaker?.trim() || 'အစ္စလာမ့် ဓမ္မကထိက ဆရာတော်',
        streamUrl: trimmedUrl,
        categoryMm: 'အွန်လိုင်း အသံလွှင့်ဖိုင်',
        durationStr: 'အွန်လိုင်းလွှင့်',
        isLiveStream: trimmedUrl.includes('radio') || trimmedUrl.includes('stream') || !trimmedUrl.endsWith('.mp3'),
        coverGradient: 'from-amber-950 via-stone-900 to-indigo-950',
        sourceDescription: `တိုက်ရိုက်လင့်ခ်: ${trimmedUrl}`,
      };

      playTrack(customTrack);
    },
    [playTrack]
  );

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackRate,
        isPlayerVisible,
        isExpanded,
        isLooping,
        isShuffle,
        playlist,
        queue,
        currentTrackIndex,
        error,
        toastMessage,
        playTrack,
        pause,
        resume,
        togglePlay,
        seek,
        skip,
        nextTrack: handleNextTrack,
        prevTrack: handlePrevTrack,
        setVolume,
        toggleMute,
        setPlaybackRate,
        setIsExpanded,
        setIsPlayerVisible,
        toggleLoop,
        toggleShuffle,
        addToQueue,
        addMultipleToQueue,
        removeFromQueue,
        clearQueue,
        moveQueueItem,
        playQueueItem,
        closePlayer,
        playCustomUrl,
        showToast,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = (): AudioPlayerContextType => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
