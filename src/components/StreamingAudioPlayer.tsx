import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Headphones,
  Maximize2,
  Minimize2,
  X,
  ListMusic,
  Link as LinkIcon,
  Radio,
  Repeat,
  Shuffle,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { toMyanmarDigits } from '../utils/islamicTimes';
import { CURATED_STREAMING_STATIONS } from '../data/streamingStations';
import { BookItem, UserProfile } from '../types';
import { isUserAdmin } from '../utils/auth';

interface StreamingAudioPlayerProps {
  currentUser?: UserProfile | null;
  onAddBookToLibrary?: (book: BookItem) => void;
}

export const StreamingAudioPlayer: React.FC<StreamingAudioPlayerProps> = ({
  currentUser,
  onAddBookToLibrary,
}) => {
  const isAdmin = isUserAdmin(currentUser);
  const {
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
    error,
    toastMessage,
    togglePlay,
    seek,
    skip,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
    setPlaybackRate,
    setIsExpanded,
    toggleLoop,
    toggleShuffle,
    addToQueue,
    removeFromQueue,
    clearQueue,
    moveQueueItem,
    playQueueItem,
    closePlayer,
    playTrack,
    playCustomUrl,
  } = useAudioPlayer();

  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'stations'>('queue');
  const [showCustomUrlModal, setShowCustomUrlModal] = useState<boolean>(false);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [customTitleInput, setCustomTitleInput] = useState<string>('');
  const [customSpeakerInput, setCustomSpeakerInput] = useState<string>('');
  const [saveToLibrary, setSaveToLibrary] = useState<boolean>(false);

  if (!isPlayerVisible || !currentTrack) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    const effectiveTitle = customTitleInput.trim() || 'တိုက်ရိုက် အသံလွှင့်ဖိုင် (Custom Audio Stream)';
    const effectiveSpeaker = customSpeakerInput.trim() || 'အစ္စလာမ့် ဓမ္မကထိက ဆရာတော်';
    const effectiveUrl = customUrlInput.trim();

    // If Admin elected to save this audio to the community library
    if (isAdmin && saveToLibrary && onAddBookToLibrary) {
      const newAudioBook: BookItem = {
        id: `custom-audio-${Date.now()}`,
        titleMm: effectiveTitle,
        authorMm: effectiveSpeaker,
        reciterOrSpeakerMm: effectiveSpeaker,
        category: 'audio',
        categoryMm: 'အသံဖိုင်နှင့် တရားတော်များ',
        descriptionMm: `ဤအသံဖိုင်သည် စီမံခန့်ခွဲသူ (Admin) မှ ထည့်သွင်းထားသော တိုက်ရိုက် အသံလွှင့်ဖိုင် ဖြစ်ပါသည်။ လင့်ခ်: ${effectiveUrl}`,
        coverColor: 'from-violet-900 to-indigo-950',
        totalPages: 1,
        isMemberOnly: false,
        language: 'my',
        isUserUploaded: true,
        publishedYear: new Date().getFullYear().toString(),
        readCount: 1,
        rating: 5.0,
        mediaType: 'audio',
        audioUrl: effectiveUrl,
        audioDuration: 'အွန်လိုင်းလွှင့်',
        chapters: [
          {
            id: `ch-stream-${Date.now()}`,
            titleMm: effectiveTitle,
            pageNumber: 1,
            content: `${effectiveTitle}\n\nဟောကြား/ရွတ်ဖတ်သူ: ${effectiveSpeaker}\n\nအသံဖိုင်ကို တိုက်ရိုက် နားဆင်နိုင်ပါသည်။`,
          },
        ],
      };
      onAddBookToLibrary(newAudioBook);
    }

    playCustomUrl(effectiveUrl, effectiveTitle, effectiveSpeaker);
    setCustomUrlInput('');
    setCustomTitleInput('');
    setCustomSpeakerInput('');
    setSaveToLibrary(false);
    setShowCustomUrlModal(false);
  };

  const isLive = currentTrack.isLiveStream || duration === 0 || !isFinite(duration);

  return (
    <>
      {/* FLOATING TOAST NOTIFICATION FOR QUEUE ACTIONS */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="bg-stone-900/95 backdrop-blur-md text-amber-200 border border-amber-500/40 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-myanmar">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-stone-100">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. PERSISTENT FLOATING BOTTOM AUDIO BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-2 sm:px-4 pb-2 sm:pb-3 pointer-events-none">
        <div className="max-w-6xl mx-auto pointer-events-auto bg-stone-950/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-stone-800/90 p-3 sm:px-5 sm:py-3.5 transition-all">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left: Track Information & Artwork */}
            <div className="flex items-center gap-3 w-full sm:w-1/3 min-w-0">
              <div
                onClick={() => {
                  setShowDrawer(true);
                  setActiveTab('queue');
                }}
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                  currentTrack.coverGradient || 'from-violet-900 to-indigo-950'
                } flex items-center justify-center text-amber-300 shadow-md shrink-0 border border-white/10 relative overflow-hidden cursor-pointer group`}
                title="တန်းစီဇယား ကြည့်ရှုရန် နှိပ်ပါ"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                ) : isLive ? (
                  <Radio className="w-6 h-6 text-emerald-400 animate-pulse" />
                ) : (
                  <Headphones className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
                )}
                {isPlaying && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-400 animate-pulse" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {isLive ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-700/60 px-1.5 py-0.2 rounded font-mono shrink-0 animate-pulse">
                      ● LIVE
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-300/90 font-myanmar truncate">
                      {currentTrack.categoryMm || 'အသံလွှင့်ဖိုင်'}
                    </span>
                  )}
                  {queue.length > 0 && (
                    <span
                      onClick={() => {
                        setShowDrawer(true);
                        setActiveTab('queue');
                      }}
                      className="cursor-pointer inline-flex items-center gap-1 text-[9px] font-bold bg-violet-950/90 text-violet-300 border border-violet-700/60 px-1.5 py-0.2 rounded-full font-myanmar hover:bg-violet-900"
                      title="တန်းစီစာရင်းထဲတွင် ရှိသော အသံဖိုင်များ"
                    >
                      တန်းစီ: {toMyanmarDigits(queue.length)} ပုဒ်
                    </span>
                  )}
                </div>
                <h4
                  onClick={() => {
                    setShowDrawer(true);
                    setActiveTab('queue');
                  }}
                  className="font-serif font-bold text-xs sm:text-sm text-stone-100 truncate font-myanmar leading-tight mt-0.5 cursor-pointer hover:text-amber-300 transition-colors"
                >
                  {currentTrack.titleMm}
                </h4>
                <p className="text-[11px] text-stone-400 truncate font-myanmar mt-0.5">
                  {currentTrack.speakerOrReciterMm}
                </p>
              </div>
            </div>

            {/* Center: Playback Controls & Timeline Slider */}
            <div className="flex flex-col items-center w-full sm:w-5/12 gap-1.5">
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                {/* Shuffle Button */}
                <button
                  onClick={toggleShuffle}
                  title={isShuffle ? 'ကျပန်းဖွင့်ခြင်း ပိတ်မည်' : 'ကျပန်းဖွင့်မည် (Shuffle)'}
                  className={`p-1.5 rounded-lg transition-colors hidden sm:inline-flex ${
                    isShuffle ? 'text-amber-300 bg-white/10' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>

                {/* Prev Track */}
                <button
                  onClick={prevTrack}
                  title="ယခင်အသံဖိုင်"
                  className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {/* Skip -10s */}
                <button
                  onClick={() => skip(-10)}
                  title="၁၀ စက္ကန့် နောက်ဆုတ်"
                  className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Main Play / Pause Button */}
                <button
                  onClick={togglePlay}
                  title={isPlaying ? 'ရပ်တန့်မည်' : 'ဖွင့်မည်'}
                  disabled={isLoading}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 fill-stone-950" />
                  ) : (
                    <Play className="w-5 h-5 fill-stone-950 ml-0.5" />
                  )}
                </button>

                {/* Skip +10s */}
                <button
                  onClick={() => skip(10)}
                  title="၁၀ စက္ကန့် ရှေ့တိုး"
                  className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Next Track (Queue or playlist next) */}
                <button
                  onClick={nextTrack}
                  title="နောက်အသံဖိုင် (သို့မဟုတ် Queue ထဲမှ)"
                  className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors relative"
                >
                  <SkipForward className="w-4 h-4" />
                  {queue.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                </button>

                {/* Loop Button */}
                <button
                  onClick={toggleLoop}
                  title={isLooping ? 'တစ်ပုဒ်တည်း ပြန်ဖွင့်ခြင်း ပိတ်မည်' : 'တစ်ပုဒ်တည်း ပြန်ဖွင့်မည် (Loop)'}
                  className={`p-1.5 rounded-lg transition-colors hidden sm:inline-flex ${
                    isLooping ? 'text-amber-300 bg-white/10' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                </button>

                {/* Playback speed menu */}
                <div className="relative hidden sm:inline-block">
                  <select
                    value={playbackRate}
                    onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                    title="အသံအမြန်နှုန်း (Playback Speed)"
                    className="bg-stone-900 border border-stone-700 text-stone-300 text-[10px] rounded px-1.5 py-0.5 font-mono focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                  >
                    <option value="0.75">0.75x</option>
                    <option value="1">1.0x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2.0x</option>
                  </select>
                </div>
              </div>

              {/* Progress Bar (Scrubber) */}
              <div className="w-full flex items-center gap-2 text-[10px] font-mono text-stone-400">
                <span className="w-10 text-right">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  disabled={isLive}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-50 disabled:cursor-default"
                />
                <span className="w-10">
                  {isLive ? 'LIVE' : formatTime(duration) || currentTrack.durationStr || '--:--'}
                </span>
              </div>
            </div>

            {/* Right: Audio Extra Actions, Queue Drawer, Volume & Tools */}
            <div className="flex items-center justify-end gap-2 w-full sm:w-1/3">
              {/* Queue Button with Counter Badge */}
              <button
                onClick={() => {
                  setShowDrawer(true);
                  setActiveTab('queue');
                }}
                title="တန်းစီစာရင်းနှင့် အသံဖိုင် စာရင်း (Queue & Playlist)"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  showDrawer && activeTab === 'queue'
                    ? 'bg-amber-400 text-stone-950 border-amber-300 font-bold shadow-md'
                    : queue.length > 0
                    ? 'bg-violet-900/70 hover:bg-violet-900 text-violet-200 border-violet-700/80 shadow-xs'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="font-myanmar hidden md:inline">တန်းစီဇယား</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/40 font-bold">
                  {toMyanmarDigits(queue.length)}
                </span>
              </button>

              {/* Add Custom Stream URL button */}
              <button
                onClick={() => setShowCustomUrlModal(true)}
                title="အသံလွှင့် URL ထည့်သွင်းရန် (Add Stream URL)"
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-myanmar bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg border border-stone-700 transition-colors"
              >
                <LinkIcon className="w-3 h-3 text-amber-300" />
                <span className="hidden lg:inline">Stream URL</span>
              </button>

              {/* Volume Slider & Mute Toggle */}
              <div className="hidden lg:flex items-center gap-1.5 pl-1 border-l border-stone-800">
                <button
                  onClick={toggleMute}
                  title={isMuted ? 'အသံဖွင့်မည်' : 'အသံပိတ်မည်'}
                  className="p-1 text-stone-400 hover:text-stone-200"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Close Player */}
              <button
                onClick={closePlayer}
                title="အသံလွှင့်စက် ပိတ်မည်"
                className="p-2 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Error Banner inside player if any */}
          {error && (
            <div className="mt-2 p-2 bg-rose-950/70 border border-rose-800 text-rose-200 rounded-xl text-xs font-myanmar flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setShowCustomUrlModal(true)}
                className="text-[11px] underline text-amber-300 shrink-0"
              >
                အခြား URL ထည့်မည်
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. SLIDING DRAWER: QUEUE & PLAYLIST MANAGEMENT */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs p-2 sm:p-4">
          <div className="bg-stone-900 border border-stone-800 text-white rounded-2xl w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header with Tabs */}
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-stone-800/80 p-1 rounded-xl border border-stone-700">
                  <button
                    onClick={() => setActiveTab('queue')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-myanmar flex items-center gap-1.5 transition-all ${
                      activeTab === 'queue'
                        ? 'bg-amber-400 text-stone-950 shadow-xs'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>တန်းစီဇယား (Queue)</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        activeTab === 'queue' ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-700 text-stone-300'
                      }`}
                    >
                      {toMyanmarDigits(queue.length)}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('stations')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-myanmar flex items-center gap-1.5 transition-all ${
                      activeTab === 'stations'
                        ? 'bg-amber-400 text-stone-950 shadow-xs'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>အသံလွှင့်ဌာနများ</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowDrawer(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content for TAB 1: QUEUE */}
            {activeTab === 'queue' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Now Playing Banner */}
                <div className="p-4 bg-gradient-to-r from-violet-950/70 via-indigo-950/50 to-stone-950/70 border-b border-stone-800">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider font-myanmar flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    လက်ရှိ ဖွင့်နေဆဲ (Now Playing)
                  </span>
                  <div className="flex items-center gap-3 mt-2">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${
                        currentTrack.coverGradient || 'from-violet-900 to-indigo-950'
                      } flex items-center justify-center text-amber-300 shrink-0 border border-white/20`}
                    >
                      <Headphones className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-serif font-bold text-sm text-stone-100 truncate font-myanmar">
                        {currentTrack.titleMm}
                      </h4>
                      <p className="text-xs text-stone-400 truncate font-myanmar mt-0.5">
                        {currentTrack.speakerOrReciterMm}
                      </p>
                    </div>
                    <button
                      onClick={togglePlay}
                      className="w-9 h-9 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center justify-center shrink-0 shadow-sm"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-stone-950" />
                      ) : (
                        <Play className="w-4 h-4 fill-stone-950 ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Queue Controls Bar */}
                <div className="px-4 py-2.5 bg-stone-950/40 border-b border-stone-800 flex items-center justify-between text-xs font-myanmar">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-300">
                      နောက်တွင် ဖွင့်မည့် အသံဖိုင်များ ({toMyanmarDigits(queue.length)})
                    </span>
                  </div>

                  {queue.length > 0 && (
                    <button
                      onClick={clearQueue}
                      className="text-stone-400 hover:text-rose-400 flex items-center gap-1 text-[11px] transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>အားလုံးရှင်းမည်</span>
                    </button>
                  )}
                </div>

                {/* Queue Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {queue.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-500">
                        <Layers className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif font-bold text-sm text-stone-300 font-myanmar">
                          တန်းစီဇယားတွင် အသံဖိုင် မရှိသေးပါ
                        </h4>
                        <p className="text-xs text-stone-500 font-myanmar max-w-xs">
                          စာအုပ်စင် သို့မဟုတ် အသံလွှင့်ဌာနများမှ "တန်းစီစာရင်းသို့ ထည့်မည်" ကို နှိပ်၍ အသံဖိုင်များကို စီတန်းထားနိုင်ပါသည်။
                        </p>
                      </div>

                      {/* Quick Add Recommendations */}
                      <div className="pt-2 w-full space-y-1.5">
                        <span className="text-[11px] text-amber-300 font-semibold font-myanmar">
                          နမူနာ အသံဖိုင်များကို တန်းစီဇယားသို့ ထည့်သွင်းရန်:
                        </span>
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {CURATED_STREAMING_STATIONS.slice(1, 4).map((station) => (
                            <button
                              key={station.id}
                              onClick={() => addToQueue(station)}
                              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 rounded-lg text-xs font-myanmar flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3 h-3 text-amber-400" />
                              <span className="truncate max-w-[140px]">{station.titleMm}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    queue.map((item, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        className="p-3 bg-stone-800/60 hover:bg-stone-800 border border-stone-700/70 rounded-xl flex items-center justify-between gap-3 group transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-stone-500 text-xs font-mono w-4 text-center shrink-0">
                            {index + 1}
                          </span>
                          <div
                            className={`w-9 h-9 rounded-lg bg-gradient-to-br ${
                              item.coverGradient || 'from-violet-900 to-indigo-950'
                            } flex items-center justify-center text-amber-300 text-xs font-bold shrink-0 border border-white/10`}
                          >
                            <Headphones className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-serif font-bold text-xs text-stone-100 truncate font-myanmar">
                              {item.titleMm}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-stone-400 font-myanmar mt-0.5">
                              <span className="truncate">{item.speakerOrReciterMm}</span>
                              {item.durationStr && (
                                <>
                                  <span>·</span>
                                  <span className="font-mono">{item.durationStr}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons: Reorder, Play now, Remove */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Move Up */}
                          <button
                            onClick={() => moveQueueItem(index, index - 1)}
                            disabled={index === 0}
                            title="အပေါ်သို့ ရွှေ့မည်"
                            className="p-1 text-stone-400 hover:text-white disabled:opacity-20 disabled:hover:text-stone-400 transition-colors"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>

                          {/* Move Down */}
                          <button
                            onClick={() => moveQueueItem(index, index + 1)}
                            disabled={index === queue.length - 1}
                            title="အောက်သို့ ရွှေ့မည်"
                            className="p-1 text-stone-400 hover:text-white disabled:opacity-20 disabled:hover:text-stone-400 transition-colors"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>

                          {/* Play Now */}
                          <button
                            onClick={() => playQueueItem(index)}
                            title="ယခု ချက်ချင်းဖွင့်မည်"
                            className="p-1 text-amber-400 hover:text-amber-300 transition-colors ml-1"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </button>

                          {/* Remove */}
                          <button
                            onClick={() => removeFromQueue(index)}
                            title="တန်းစီစာရင်းမှ ဖယ်ထုတ်မည်"
                            className="p-1 text-stone-500 hover:text-rose-400 transition-colors ml-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Content for TAB 2: ALL STATIONS & RECITATIONS */}
            {activeTab === 'stations' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 bg-stone-950/40 border-b border-stone-800 flex items-center justify-between gap-2">
                  <span className="text-xs text-stone-400 font-myanmar">
                    နားဆင်လိုသော အသံဖိုင် သို့မဟုတ် တန်းစီဇယားသို့ ထည့်သွင်းပါ
                  </span>
                  <button
                    onClick={() => {
                      setShowCustomUrlModal(true);
                      setShowDrawer(false);
                    }}
                    className="py-1 px-2.5 bg-violet-900/60 hover:bg-violet-900 text-violet-200 rounded-lg text-[11px] font-myanmar flex items-center gap-1 transition-colors border border-violet-700/60"
                  >
                    <Plus className="w-3 h-3 text-amber-300" />
                    <span>Stream URL ထည့်မည်</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {playlist.map((track, idx) => {
                    const isCurrent = currentTrack.id === track.id;
                    return (
                      <div
                        key={track.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-amber-400/10 border-amber-400/50 text-white ring-1 ring-amber-400/30'
                            : 'bg-stone-800/40 hover:bg-stone-800 border-stone-800 text-stone-300'
                        }`}
                      >
                        <div
                          onClick={() => {
                            playTrack(track);
                            setShowDrawer(false);
                          }}
                          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-mono shrink-0 bg-gradient-to-br ${
                              track.coverGradient || 'from-violet-900 to-indigo-950'
                            }`}
                          >
                            {isCurrent && isPlaying ? (
                              <div className="flex items-end gap-0.5 h-4">
                                <span className="w-1 bg-amber-300 h-full animate-bounce" />
                                <span className="w-1 bg-amber-300 h-2/3 animate-bounce [animation-delay:0.1s]" />
                                <span className="w-1 bg-amber-300 h-4/5 animate-bounce [animation-delay:0.2s]" />
                              </div>
                            ) : (
                              <span className="text-stone-300 font-bold">{idx + 1}</span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              {track.isLiveStream && (
                                <span className="text-[9px] bg-rose-950 text-rose-300 px-1 py-0.2 rounded font-mono">
                                  LIVE
                                </span>
                              )}
                              <h4 className="font-serif font-bold text-xs truncate font-myanmar text-stone-100">
                                {track.titleMm}
                              </h4>
                            </div>
                            <p className="text-[11px] text-stone-400 truncate font-myanmar mt-0.5">
                              {track.speakerOrReciterMm}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Add to Queue Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToQueue(track);
                            }}
                            title="တန်းစီစာရင်းသို့ ထည့်မည်"
                            className="p-1.5 rounded-lg bg-stone-700/60 hover:bg-violet-900 text-stone-300 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-myanmar"
                          >
                            <Plus className="w-3.5 h-3.5 text-amber-300" />
                            <span className="hidden sm:inline">တန်းစီမည်</span>
                          </button>

                          {/* Play Now */}
                          <button
                            onClick={() => {
                              playTrack(track);
                              setShowDrawer(false);
                            }}
                            title="ချက်ချင်းဖွင့်မည်"
                            className="p-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 transition-colors"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ADD CUSTOM STREAM URL MODAL */}
      {showCustomUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-stone-900 border border-stone-800 text-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-violet-900/60 text-amber-300">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-stone-100 font-myanmar">
                    အသံလွှင့် URL တိုက်ရိုက် ထည့်သွင်းနားဆင်ရန်
                  </h3>
                  <p className="text-[11px] text-stone-400 font-myanmar">
                    အစ္စလာမ့်တရားတော် MP3 သို့မဟုတ် 24/7 Quran Radio လင့်ခ်များ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomUrlModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCustomUrlSubmit} className="space-y-3.5 text-xs font-myanmar">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  အသံဖိုင် / Stream URL လိပ်စာ *
                </label>
                <input
                  type="url"
                  required
                  placeholder="ဥပမာ: https://example.com/lecture.mp3 သို့မဟုတ် radio stream"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  ခေါင်းစဉ် (Title)
                </label>
                <input
                  type="text"
                  placeholder="ဥပမာ: သောကြာနေ့ ဂျုမုအဟ် တရားဒေသနာတော်"
                  value={customTitleInput}
                  onChange={(e) => setCustomTitleInput(e.target.value)}
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  ဟောကြားသူ / ရွတ်ဖတ်သူ (Speaker / Reciter)
                </label>
                <input
                  type="text"
                  placeholder="ဥပမာ: ဆရာတော် မောင်လာနာ..."
                  value={customSpeakerInput}
                  onChange={(e) => setCustomSpeakerInput(e.target.value)}
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              {/* Sample URLs quick select */}
              <div className="pt-2 border-t border-stone-800 space-y-1.5">
                <span className="text-[11px] text-stone-400">စမ်းသပ်ဖွင့်ကြည့်ရန် နမူနာလိုင်းများ:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomUrlInput('https://qurango.net/radio/mishary_alafasi');
                      setCustomTitleInput('၂၄ နာရီ တိုက်ရိုက် ကုရ်အာန် အသံလွှင့်ရေဒီယို');
                      setCustomSpeakerInput('ကာရီ မစ်ရှာရီ ရာရှစ်ဒ် အလ်-အာဖာစီ');
                    }}
                    className="px-2 py-1 bg-stone-800 hover:bg-stone-700 rounded text-[10px] text-stone-300"
                  >
                    📻 24/7 Quran Radio (Live)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomUrlInput('https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/036.mp3');
                      setCustomTitleInput('စူရဟ် ယာစီးန် (Surah Yasin)');
                      setCustomSpeakerInput('ကာရီ မစ်ရှာရီ ရာရှစ်ဒ် အလ်-အာဖာစီ');
                    }}
                    className="px-2 py-1 bg-stone-800 hover:bg-stone-700 rounded text-[10px] text-stone-300"
                  >
                    📖 Surah Yasin (MP3)
                  </button>
                </div>
              </div>

              {/* Admin Save to Library Option */}
              {isAdmin && onAddBookToLibrary && (
                <div className="flex items-center gap-2 p-2.5 bg-violet-950/70 border border-violet-800 rounded-xl">
                  <input
                    type="checkbox"
                    id="save-to-library-checkbox"
                    checked={saveToLibrary}
                    onChange={(e) => setSaveToLibrary(e.target.checked)}
                    className="rounded text-amber-400 focus:ring-amber-400 cursor-pointer"
                  />
                  <label
                    htmlFor="save-to-library-checkbox"
                    className="text-amber-200 text-xs font-myanmar cursor-pointer select-none font-semibold flex items-center gap-1.5"
                  >
                    <span>🌟 စာကြည့်တိုက်သို့ အသံဖိုင်အဖြစ် သိမ်းဆည်းတင်သွင်းမည်</span>
                    <span className="text-[9px] bg-amber-400 text-stone-950 px-1.5 py-0.2 rounded font-mono font-bold">
                      ADMIN
                    </span>
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowCustomUrlModal(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl"
                >
                  ပယ်ဖျက်မည်
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-stone-950" />
                  <span>စတင်နားဆင်မည်</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
