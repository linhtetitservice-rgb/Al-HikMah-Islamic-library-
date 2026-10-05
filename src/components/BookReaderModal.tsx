import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileText,
  BookOpen,
  List,
  Sun,
  Moon,
  Coffee,
  Share2,
  Edit3,
  Check,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Download,
  Headphones,
  Music,
  Radio,
  Plus,
  Layers,
  Upload,
  Link as LinkIcon,
  Compass,
} from 'lucide-react';
import { BookItem, BookChapter, UserProfile } from '../types';
import { toMyanmarDigits } from '../utils/islamicTimes';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { OnlinePdfReader } from './OnlinePdfReader';

interface BookReaderModalProps {
  book: BookItem;
  currentUser: UserProfile | null;
  onClose: () => void;
  onUpdateBookmark: (bookId: string, page: number, chapterTitle: string) => void;
  onAddNote: (bookId: string, page: number, noteText: string) => void;
  onUpdateHistory: (bookId: string, page: number) => void;
}

export const BookReaderModal: React.FC<BookReaderModalProps> = ({
  book,
  currentUser,
  onClose,
  onUpdateBookmark,
  onAddNote,
  onUpdateHistory,
}) => {
  // Determine starting page from user reading history if available
  const existingHistory = currentUser?.readingHistory?.find((h) => h.bookId === book.id);
  const initialPage = existingHistory ? existingHistory.lastPage : 1;

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [jumpPageText, setJumpPageText] = useState<string>(String(initialPage));
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [themeMode, setThemeMode] = useState<'paper' | 'white' | 'dark'>('paper');
  const [showToc, setShowToc] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [noteInput, setNoteInput] = useState<string>('');
  const [showNoteDrawer, setShowNoteDrawer] = useState<boolean>(false);
  const [noteSavedSuccess, setNoteSavedSuccess] = useState<boolean>(false);

  // Online PDF Reader Mode State
  const [readerMode, setReaderMode] = useState<'pdf' | 'text'>(() => {
    return Boolean(book.pdfUrl) ? 'pdf' : 'text';
  });
  const [activePdfUrl, setActivePdfUrl] = useState<string>(book.pdfUrl || '');
  const [pdfInputUrl, setPdfInputUrl] = useState<string>('');

  // Audio Player State
  const isAudioBook = book.mediaType === 'audio' || Boolean(book.audioUrl);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDurationSec, setAudioDurationSec] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const { addToQueue } = useAudioPlayer();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Safely ensure chapters array exists and is never undefined
  const chapters: BookChapter[] = useMemo(() => {
    if (book.chapters && Array.isArray(book.chapters) && book.chapters.length > 0) {
      return book.chapters;
    }
    return [
      {
        id: 'ch-1',
        titleMm: 'မိတ်ဆက်နှင့် အမှာစာ',
        titleAr: book.titleAr || undefined,
        pageNumber: 1,
        content: book.descriptionMm || `${book.titleMm} စာအုပ်၏ မိတ်ဆက်အကျဉ်းချုပ် ဖြစ်ပါသည်။`,
      },
      {
        id: 'ch-2',
        titleMm: 'အဓိက တရားဒေသနာနှင့် အကြောင်းအရာ',
        pageNumber: Math.max(2, Math.min(book.totalPages || 2, 2)),
        content: book.descriptionMm
          ? `${book.descriptionMm}\n\nဤစာအုပ်အား Al-Hikmah စာကြည့်တိုက်တွင် ဖတ်ရှုလေ့လာနိုင်ပါသည်။`
          : 'ဤစာအုပ်၏ အဓိက အနှစ်ချုပ်များကို စတင်ဖတ်ရှုနိုင်ပါသည်။',
      },
    ];
  }, [book]);

  const totalPages = book.totalPages || chapters.length || 1;

  // Stable ref for onUpdateHistory
  const onUpdateHistoryRef = useRef(onUpdateHistory);
  useEffect(() => {
    onUpdateHistoryRef.current = onUpdateHistory;
  });

  useEffect(() => {
    onUpdateHistoryRef.current(book.id, currentPage);
    setJumpPageText(String(currentPage));
  }, [book.id, currentPage]);

  // Handle local PDF file upload
  const handleLocalPdfFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setActivePdfUrl(url);
      setReaderMode('pdf');
    }
  };

  const handleCustomPdfUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pdfInputUrl.trim()) {
      setActivePdfUrl(pdfInputUrl.trim());
      setReaderMode('pdf');
      setPdfInputUrl('');
    }
  };

  const loadSamplePdf = () => {
    setActivePdfUrl('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf');
    setReaderMode('pdf');
  };

  // Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setAudioCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setAudioDurationSec(audio.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setAudioCurrentTime(0);
    };
    const onError = () => {
      setAudioError('အသံလွှင့်ဖိုင်ကို ဖွင့်ရန် အခက်အခဲရှိနေပါသည်။ လိုင်းချိတ်ဆက်မှု စစ်ဆေးပါ။');
      setIsPlaying(false);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => {
        console.warn('Audio play failed:', e);
        setAudioError('အသံဖိုင် ဖွင့်ရန် ခွင့်ပြုချက် လိုအပ်နေပါသည်။');
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setAudioCurrentTime(target);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const next = Math.max(0, Math.min(audioRef.current.currentTime + seconds, audioDurationSec || 99999));
      audioRef.current.currentTime = next;
      setAudioCurrentTime(next);
    }
  };

  const handleChangeSpeed = (spd: number) => {
    setPlaybackRate(spd);
    if (audioRef.current) {
      audioRef.current.playbackRate = spd;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMuted = !isMuted;
      audioRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const formatAudioTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Check if current page is bookmarked
  const isBookmarked = currentUser?.bookmarks?.some(
    (b) => b.bookId === book.id && b.page === currentPage
  );

  // Find chapter for current page
  const currentChapter =
    chapters.find((ch: BookChapter) => ch.pageNumber === currentPage) ||
    chapters[Math.min(currentPage - 1, chapters.length - 1)] ||
    chapters[0];

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageText, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    } else {
      setJumpPageText(String(currentPage));
    }
  };

  const toggleBookmark = () => {
    onUpdateBookmark(book.id, currentPage, currentChapter?.titleMm || `စာမျက်နှာ ${currentPage}`);
  };

  const handleSaveNote = () => {
    if (noteInput.trim()) {
      onAddNote(book.id, currentPage, noteInput.trim());
      setNoteInput('');
      setNoteSavedSuccess(true);
      setTimeout(() => setNoteSavedSuccess(false), 2500);
    }
  };

  // Styling maps
  const fontSizeClasses = {
    sm: 'text-sm sm:text-base leading-relaxed',
    base: 'text-base sm:text-lg leading-loose',
    lg: 'text-lg sm:text-xl leading-loose',
    xl: 'text-xl sm:text-2xl leading-loose font-medium',
  };

  const themeClasses = {
    paper: 'bg-[#FBF9F5] text-stone-900 border-amber-900/20',
    white: 'bg-white text-stone-900 border-stone-200',
    dark: 'bg-[#18181b] text-stone-100 border-stone-800',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4">
      <div
        className={`w-full ${
          isFullScreen ? 'h-full max-w-none rounded-none' : 'max-w-6xl h-[94vh] rounded-2xl'
        } flex flex-col shadow-2xl overflow-hidden border transition-all ${themeClasses[themeMode]}`}
      >
        {/* Hidden Audio Tag if audio available */}
        {book.audioUrl && (
          <audio
            ref={audioRef}
            src={book.audioUrl}
            preload="metadata"
          />
        )}

        {/* Top Header Control Bar */}
        <div className="px-4 py-2.5 border-b border-stone-300/80 dark:border-stone-800 flex items-center justify-between gap-2 shrink-0 bg-stone-100/70 dark:bg-stone-900/80">
          <div className="flex items-center gap-2 min-w-0">
            {/* Table of contents toggle */}
            <button
              onClick={() => setShowToc(!showToc)}
              title="မာတိကာဖွင့်ရန်"
              className={`p-1.5 rounded-lg border transition-colors ${
                showToc
                  ? 'bg-emerald-900 text-amber-200 border-emerald-800'
                  : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {isAudioBook ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold font-myanmar bg-violet-100 dark:bg-violet-900/60 text-violet-800 dark:text-violet-200 px-2 py-0.5 rounded-full shrink-0">
                    <Headphones className="w-3 h-3" />
                    အသံဖိုင်
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold font-myanmar bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                    <FileText className="w-3 h-3" />
                    စာအုပ်
                  </span>
                )}
                <h1 className="font-serif font-bold text-xs sm:text-sm truncate font-myanmar">
                  {book.titleMm}
                </h1>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 truncate font-myanmar">
                {book.reciterOrSpeakerMm ? `ရွတ်ဖတ်/ဟောကြားသူ: ${book.reciterOrSpeakerMm}` : book.authorMm}
              </p>
            </div>
          </div>

          {/* Reader Controls Toolbar */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* View Mode Switcher: PDF vs Text Reader */}
            {!isAudioBook && (
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-stone-200/80 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-myanmar">
                <button
                  onClick={() => setReaderMode('pdf')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all font-semibold ${
                    readerMode === 'pdf'
                      ? 'bg-violet-900 text-white shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                  title="PDF စာရွက်များအတိုင်း တစ်မျက်နှာချင်း အွန်လိုင်းဖတ်ရှုရန်"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">PDF စာရွက်မုဒ်</span>
                  <span className="sm:hidden">PDF</span>
                </button>
                <button
                  onClick={() => setReaderMode('text')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all font-semibold ${
                    readerMode === 'text'
                      ? 'bg-emerald-900 text-white shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                  title="စာအုပ်စာသားမုဒ်ဖြင့် အခန်းအလိုက် ဖတ်ရှုရန်"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">စာသားမုဒ်</span>
                  <span className="sm:hidden">Text</span>
                </button>
              </div>
            )}

            {/* Font size selector (Active in text mode) */}
            {readerMode === 'text' && (
              <div className="hidden sm:flex items-center gap-1 p-0.5 rounded-lg bg-stone-200/60 dark:bg-stone-800 text-xs">
                <button
                  onClick={() => setFontSize('sm')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    fontSize === 'sm' ? 'bg-white dark:bg-stone-700 shadow-2xs' : 'text-stone-600 dark:text-stone-400'
                  }`}
                  title="စာလုံးသေး"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize('base')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    fontSize === 'base' ? 'bg-white dark:bg-stone-700 shadow-2xs' : 'text-stone-600 dark:text-stone-400'
                  }`}
                  title="စာလုံးပုံမှန်"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('lg')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    fontSize === 'lg' ? 'bg-white dark:bg-stone-700 shadow-2xs' : 'text-stone-600 dark:text-stone-400'
                  }`}
                  title="စာလုံးကြီး"
                >
                  A+
                </button>
              </div>
            )}

            {/* Reading Theme selector (for text mode) */}
            {readerMode === 'text' && (
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-stone-200/60 dark:bg-stone-800">
                <button
                  onClick={() => setThemeMode('paper')}
                  title="စက္ကူနွေးရောင် (Sepia Paper)"
                  className={`p-1.5 rounded transition-colors ${
                    themeMode === 'paper' ? 'bg-[#FBF9F5] text-amber-900 shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setThemeMode('white')}
                  title="အဖြူရောင် (Clean White)"
                  className={`p-1.5 rounded transition-colors ${
                    themeMode === 'white' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setThemeMode('dark')}
                  title="ညဘက်အမှောင် (Dark Ink)"
                  className={`p-1.5 rounded transition-colors ${
                    themeMode === 'dark' ? 'bg-stone-700 text-stone-100 shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Bookmark button */}
            <button
              onClick={toggleBookmark}
              title={isBookmarked ? 'မှတ်သားပြီးသား' : 'ဤစာမျက်နှာကို မှတ်သားရန်'}
              className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-xs font-myanmar ${
                isBookmarked
                  ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-semibold'
                  : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-amber-600 fill-amber-500" />
              ) : (
                <Bookmark className="w-4 h-4 text-stone-500" />
              )}
              <span className="hidden md:inline">
                {isBookmarked ? 'မှတ်သားပြီး' : 'မှတ်သားမည်'}
              </span>
            </button>

            {/* Note Drawer Toggle */}
            <button
              onClick={() => setShowNoteDrawer(!showNoteDrawer)}
              title="မှတ်စုတို ရေးသားရန်"
              className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors text-stone-700 dark:text-stone-300"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              title={isFullScreen ? 'ပုံမှန်ပြန်ထားရန်' : 'မျက်နှာပြင်အပြည့်'}
              className="hidden sm:inline-flex p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors text-stone-700 dark:text-stone-300"
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Modal button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-stone-200/80 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Table of contents Drawer */}
          {showToc && (
            <div className="w-64 sm:w-72 border-r border-stone-300/80 dark:border-stone-800 bg-stone-100/90 dark:bg-stone-900/90 p-4 overflow-y-auto shrink-0 z-20 animate-in slide-in-from-left duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-stone-300 dark:border-stone-700 mb-3">
                <span className="font-serif font-bold text-sm font-myanmar">ကျမ်းစာ မာတိကာ</span>
                <button
                  onClick={() => setShowToc(false)}
                  className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                {chapters.map((ch: BookChapter) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setCurrentPage(ch.pageNumber);
                      setShowToc(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs font-myanmar transition-colors flex items-start gap-2 ${
                      currentPage === ch.pageNumber
                        ? 'bg-emerald-900 text-amber-200 font-semibold'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span className="text-[10px] opacity-70 shrink-0 font-mono mt-0.5">
                      {toMyanmarDigits(ch.pageNumber)}.
                    </span>
                    <span className="truncate">{ch.titleMm}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MAIN CONTENT AREA */}
          {!isAudioBook && readerMode === 'pdf' ? (
            /* ONLINE PDF CANVAS READER (PAGE BY PAGE) */
            activePdfUrl ? (
              <div className="flex-1 w-full h-full flex flex-col p-1 sm:p-2 bg-stone-900">
                <OnlinePdfReader
                  pdfUrl={activePdfUrl}
                  initialPage={currentPage}
                  bookTitle={book.titleMm}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    onUpdateHistoryRef.current(book.id, p);
                  }}
                  onClose={onClose}
                />
              </div>
            ) : (
              /* PDF CONNECTOR CARD IF NO PDF URL YET */
              <div className="flex-1 overflow-y-auto p-6 sm:p-12 flex items-center justify-center">
                <div className="max-w-lg w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-xl">
                  <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 flex items-center justify-center mx-auto border border-violet-200 dark:border-violet-800">
                    <FileText className="w-8 h-8" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-white font-myanmar">
                      အွန်လိုင်း PDF စာဖတ်စနစ် (Online PDF Reader)
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-myanmar leading-relaxed">
                      ဤစာအုပ်အား PDF စာမျက်နှာများအတိုင်း တစ်ရွက်ချင်း လှန်ဖတ်နိုင်ရန် စက်ထဲမှ PDF ဖိုင် ရွေးချယ်နိုင်သလို အွန်လိုင်း PDF Link လည်း ထည့်သွင်းဖတ်ရှုနိုင်ပါသည်။
                    </p>
                  </div>

                  {/* Method 1: Local PDF File Input */}
                  <div className="pt-2">
                    <label className="block p-3 border-2 border-dashed border-violet-300 hover:border-violet-600 dark:border-violet-800 rounded-2xl cursor-pointer bg-violet-50/40 dark:bg-violet-950/20 transition-all text-xs font-myanmar">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleLocalPdfFile}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 text-violet-950 dark:text-violet-200 font-semibold">
                        <Upload className="w-4 h-4 text-violet-700 dark:text-violet-400" />
                        <span>စက်ထဲမှ PDF ဖိုင် ရွေးချယ်ဖတ်ရှုမည်</span>
                      </div>
                      <span className="text-[11px] text-stone-500 mt-1 block">
                        ဖုန်း သို့မဟုတ် ကွန်ပျူတာရှိ PDF ကို တိုက်ရိုက်ဆွဲတင်ဖတ်နိုင်ပါသည်
                      </span>
                    </label>
                  </div>

                  {/* Method 2: Enter URL */}
                  <form onSubmit={handleCustomPdfUrlSubmit} className="space-y-2 pt-1 text-left">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 font-myanmar">
                      သို့မဟုတ် အွန်လိုင်း PDF လင့်ခ် (URL) ထည့်သွင်းပါ
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/islamic-book.pdf"
                        value={pdfInputUrl}
                        onChange={(e) => setPdfInputUrl(e.target.value)}
                        className="flex-1 p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-violet-600"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-violet-900 hover:bg-violet-800 text-white rounded-xl text-xs font-semibold font-myanmar"
                      >
                        ဖွင့်ဖတ်မည်
                      </button>
                    </div>
                  </form>

                  {/* Quick Sample or Switch to Text */}
                  <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-center gap-2 text-xs font-myanmar">
                    <button
                      type="button"
                      onClick={loadSamplePdf}
                      className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 rounded-xl font-semibold hover:bg-amber-100 transition-colors"
                    >
                      📄 နမူနာ PDF ဖြင့် စမ်းသပ်ဖွင့်ဖတ်မည်
                    </button>
                    <button
                      type="button"
                      onClick={() => setReaderMode('text')}
                      className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-xl transition-colors"
                    >
                      📖 စာအုပ် စာသားမုဒ်သို့ ပြောင်းမည်
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* EDITORIAL TEXT / AUDIO READER MODE */
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
              <div className="w-full max-w-2xl space-y-6">
                {/* DEDICATED AUDIO PLAYER CARD IF AUDIO MEDIA */}
                {isAudioBook && (
                  <div className="bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-xl border border-violet-800/40 space-y-5">
                    {/* Top Bar inside Audio Player */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-amber-300 shadow-inner">
                          <Headphones className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-violet-300 font-myanmar uppercase tracking-wider flex items-center gap-1.5">
                            <Radio className="w-3 h-3 text-emerald-400" />
                            အသံဖိုင် တရားဒေသနာတော်
                          </div>
                          <h3 className="font-serif font-bold text-base sm:text-lg text-white font-myanmar leading-tight">
                            {book.titleMm}
                          </h3>
                          <p className="text-xs text-stone-300 font-myanmar mt-0.5">
                            {book.reciterOrSpeakerMm || book.authorMm}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {book.audioUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              addToQueue({
                                id: book.id,
                                titleMm: book.titleMm,
                                titleAr: book.titleAr,
                                speakerOrReciterMm: book.reciterOrSpeakerMm || book.authorMm,
                                streamUrl: book.audioUrl || '',
                                categoryMm: book.categoryMm,
                                durationStr: book.audioDuration,
                                coverGradient: book.coverColor,
                              });
                            }}
                            title="တန်းစီစာရင်း (Queue) သို့ ထည့်မည်"
                            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-violet-800 text-stone-200 transition-colors flex items-center gap-1 text-xs font-myanmar"
                          >
                            <Plus className="w-3.5 h-3.5 text-amber-300" />
                            <span className="hidden sm:inline">တန်းစီမည်</span>
                          </button>
                        )}

                        {book.audioUrl && (
                          <a
                            href={book.audioUrl}
                            download={`${book.titleMm}.mp3`}
                            target="_blank"
                            rel="noreferrer"
                            title="အသံဖိုင် Download ရယူရန်"
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 transition-colors shrink-0"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Animated Waveform Simulation */}
                    <div className="flex items-end justify-center gap-1.5 h-10 px-2 py-1 bg-black/20 rounded-xl overflow-hidden">
                      {[40, 70, 25, 90, 60, 30, 85, 45, 100, 65, 35, 80, 50, 95, 30, 75, 40, 85, 60, 45, 90, 30].map(
                        (h, i) => (
                          <div
                            key={i}
                            className={`w-1.5 rounded-full transition-all duration-300 ${
                              isPlaying
                                ? 'bg-gradient-to-t from-violet-500 to-amber-300 animate-pulse'
                                : 'bg-violet-800/40'
                            }`}
                            style={{
                              height: isPlaying ? `${Math.max(15, (h * (0.6 + Math.sin(i))) % 100)}%` : '20%',
                              animationDelay: `${i * 70}ms`,
                            }}
                          />
                        )
                      )}
                    </div>

                    {/* Progress Seeker Slider */}
                    <div className="space-y-1.5">
                      <input
                        type="range"
                        min={0}
                        max={audioDurationSec || 100}
                        value={audioCurrentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-violet-900/60 rounded-lg appearance-none cursor-pointer accent-amber-300"
                      />
                      <div className="flex justify-between text-[11px] font-mono text-violet-300">
                        <span>{formatAudioTime(audioCurrentTime)}</span>
                        <span>
                          {audioDurationSec
                            ? formatAudioTime(audioDurationSec)
                            : book.audioDuration || '00:00'}
                        </span>
                      </div>
                    </div>

                    {/* Main Playback Control Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      {/* Speed Selector */}
                      <div className="flex items-center gap-1 bg-white/10 rounded-lg p-0.5 text-[10px] font-mono">
                        {[0.75, 1, 1.25, 1.5].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => handleChangeSpeed(spd)}
                            className={`px-1.5 py-0.5 rounded transition-colors ${
                              playbackRate === spd
                                ? 'bg-amber-300 text-stone-950 font-bold'
                                : 'text-stone-300 hover:text-white'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>

                      {/* Central Play / Skip Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleSkip(-10)}
                          title="၁၀ စက္ကန့် နောက်ဆုတ်"
                          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        <button
                          onClick={togglePlayAudio}
                          title={isPlaying ? 'ရပ်တန့်မည်' : 'ဖွင့်မည်'}
                          className="w-12 h-12 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center justify-center shadow-lg transition-transform active:scale-95"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 fill-stone-950" />
                          ) : (
                            <Play className="w-5 h-5 fill-stone-950 ml-0.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleSkip(10)}
                          title="၁၀ စက္ကန့် ရှေ့တိုး"
                          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Volume / Mute Control */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={toggleMute}
                          className="p-1 text-stone-300 hover:text-white"
                          title={isMuted ? 'အသံဖွင့်မည်' : 'အသံပိတ်မည်'}
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
                          onChange={handleVolumeChange}
                          className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-300 hidden sm:inline-block"
                        />
                      </div>
                    </div>

                    {audioError && (
                      <p className="text-xs text-rose-300 text-center font-myanmar bg-rose-950/40 p-2 rounded-lg border border-rose-800">
                        {audioError}
                      </p>
                    )}
                  </div>
                )}

                {/* Chapter Header */}
                {currentChapter && (
                  <div className="border-b border-stone-300/80 dark:border-stone-700 pb-4 space-y-2 text-center">
                    {currentChapter.titleAr && (
                      <h3 className="font-arabic text-2xl sm:text-3xl text-emerald-900 dark:text-emerald-300">
                        {currentChapter.titleAr}
                      </h3>
                    )}
                    <h2 className="font-serif text-xl sm:text-2xl font-bold font-myanmar">
                      {currentChapter.titleMm}
                    </h2>
                    <div className="text-xs text-stone-500 font-myanmar">
                      {isAudioBook
                        ? 'အသံဖိုင် မိတ်ဆက်နှင့် ရှင်းလင်းချက်စာသား'
                        : `စာမျက်နှာ ${toMyanmarDigits(currentPage)} / ${toMyanmarDigits(totalPages)}`}
                    </div>
                  </div>
                )}

                {/* Editorial Reading Prose */}
                <article
                  className={`font-myanmar whitespace-pre-line leading-relaxed ${fontSizeClasses[fontSize]}`}
                >
                  {currentChapter?.content ||
                    'ဤစာမျက်နှာအတွက် စာသားအပြည့်အစုံကို ပြင်ဆင်နေဆဲ ဖြစ်ပါသည်။'}
                </article>

                {/* Institutional Footnotes */}
                <div className="pt-8 border-t border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500 dark:text-stone-400 font-myanmar space-y-1">
                  <p>
                    {isAudioBook ? 'အသံဖိုင် ရွတ်ဖတ်/ဟောကြားသူ' : 'ကျမ်းကိုး'}:{' '}
                    {book.reciterOrSpeakerMm || book.authorMm} · {book.titleMm}
                  </p>
                  <p>Al-Hikmah အစ္စလာမ့်စာကြည့်တိုက် သုတဘဏ်</p>
                </div>
              </div>
            </div>
          )}

          {/* Personal Notes Drawer */}
          {showNoteDrawer && (
            <div className="w-72 sm:w-80 border-l border-stone-300/80 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 p-4 flex flex-col justify-between shrink-0 z-20">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-300 dark:border-stone-700">
                  <span className="font-serif font-bold text-xs sm:text-sm font-myanmar">
                    ကိုယ်ပိုင်မှတ်စုတို (Notes)
                  </span>
                  <button
                    onClick={() => setShowNoteDrawer(false)}
                    className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-stone-500 font-myanmar">
                  စာမျက်နှာ {toMyanmarDigits(currentPage)} အတွက် မှတ်စု
                </div>

                <textarea
                  rows={4}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="ဤစာမျက်နှာနှင့် ပတ်သက်သည့် အမှတ်ရဖွယ် ဓမ္မအသိ သို့မဟုတ် မှတ်စု ရေးသားရန်..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-myanmar focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />

                <button
                  onClick={handleSaveNote}
                  className="w-full py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold font-myanmar transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>မှတ်စု သိမ်းဆည်းမည်</span>
                </button>

                {noteSavedSuccess && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-myanmar text-center animate-pulse">
                    မှတ်စုကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ
                  </p>
                )}

                {/* Existing Notes for this book */}
                <div className="pt-2 border-t border-stone-300 dark:border-stone-800 space-y-2">
                  <span className="text-[11px] text-stone-500 font-myanmar">
                    ယခင်မှတ်စုများ ({currentUser?.personalNotes?.filter((n) => n.bookId === book.id).length || 0})
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {currentUser?.personalNotes
                      ?.filter((n) => n.bookId === book.id)
                      .map((note) => (
                        <div
                          key={note.id}
                          className="p-2 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-myanmar space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] text-stone-400">
                            <span>စာမျက်နှာ {toMyanmarDigits(note.page)}</span>
                            <span>{note.createdAt}</span>
                          </div>
                          <p className="text-stone-800 dark:text-stone-200">{note.text}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar (Active in Text Reader Mode for Multi-page Books) */}
        {!isAudioBook && readerMode === 'text' && totalPages > 1 && (
          <div className="px-4 py-2.5 border-t border-stone-300/80 dark:border-stone-800 flex items-center justify-between gap-3 shrink-0 bg-stone-100/60 dark:bg-stone-900/60 flex-wrap text-xs font-myanmar">
            {/* Prev Page Button */}
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors ${
                currentPage <= 1
                  ? 'opacity-40 cursor-not-allowed border-stone-300 dark:border-stone-700'
                  : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 hover:bg-stone-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>ယခင်စာမျက်နှာ</span>
            </button>

            {/* Direct Page Jump & Slider */}
            <div className="flex items-center gap-2">
              <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5">
                <span className="text-stone-500">စာမျက်နှာ</span>
                <input
                  type="text"
                  value={jumpPageText}
                  onChange={(e) => setJumpPageText(e.target.value)}
                  onBlur={() => setJumpPageText(String(currentPage))}
                  className="w-10 px-1 py-0.5 text-center rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono text-xs font-bold"
                />
                <span className="text-stone-500">
                  / {toMyanmarDigits(totalPages)}
                </span>
                <button
                  type="submit"
                  className="px-2 py-0.5 bg-emerald-900 text-white rounded text-[11px] font-semibold"
                >
                  သွားမည်
                </button>
              </form>

              {/* Slider for large books */}
              <input
                type="range"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="w-24 sm:w-36 h-1 bg-stone-300 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-700 hidden sm:inline-block"
              />
            </div>

            {/* Next Page Button */}
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors ${
                currentPage >= totalPages
                  ? 'opacity-40 cursor-not-allowed border-stone-300 dark:border-stone-700'
                  : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>ရှေ့သို့</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
