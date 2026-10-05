export interface AudioTrack {
  id: string;
  titleMm: string;
  titleAr?: string;
  titleEn?: string;
  speakerOrReciterMm: string;
  streamUrl: string;
  categoryMm?: string;
  durationStr?: string;
  coverGradient?: string;
  isLiveStream?: boolean;
  sourceDescription?: string;
}

export interface AudioPlayerContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isPlayerVisible: boolean;
  isExpanded: boolean;
  isLooping: boolean;
  isShuffle: boolean;
  playlist: AudioTrack[];
  queue: AudioTrack[];
  currentTrackIndex: number;
  error: string | null;
  toastMessage: string | null;
  playTrack: (track: AudioTrack, customPlaylist?: AudioTrack[]) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  skip: (seconds: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  setIsExpanded: (expanded: boolean) => void;
  setIsPlayerVisible: (visible: boolean) => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  addToQueue: (track: AudioTrack, playNext?: boolean) => void;
  addMultipleToQueue: (tracks: AudioTrack[]) => void;
  removeFromQueue: (indexOrId: number | string) => void;
  clearQueue: () => void;
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
  playQueueItem: (index: number) => void;
  closePlayer: () => void;
  playCustomUrl: (url: string, title?: string, speaker?: string) => void;
  showToast: (message: string) => void;
}
