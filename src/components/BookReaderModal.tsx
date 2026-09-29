import React, { useState, useEffect, useRef } from 'react';
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
  List,
  Sun,
  Moon,
  Coffee,
  Share2,
  Edit3,
  Check,
} from 'lucide-react';
import { BookItem, UserProfile } from '../types';
import { toMyanmarDigits } from '../utils/islamicTimes';

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
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [themeMode, setThemeMode] = useState<'paper' | 'white' | 'dark'>('paper');
  const [showToc, setShowToc] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [noteInput, setNoteInput] = useState<string>('');
  const [showNoteDrawer, setShowNoteDrawer] = useState<boolean>(false);
  const [noteSavedSuccess, setNoteSavedSuccess] = useState<boolean>(false);

  const totalPages = book.totalPages || book.chapters.length || 1;

  // Stable ref for onUpdateHistory to prevent dependency-driven re-render loops
  const onUpdateHistoryRef = useRef(onUpdateHistory);
  useEffect(() => {
    onUpdateHistoryRef.current = onUpdateHistory;
  });

  // Sync reading history only when book.id or currentPage genuinely changes
  useEffect(() => {
    onUpdateHistoryRef.current(book.id, currentPage);
  }, [book.id, currentPage]);

  // Check if current page is bookmarked
  const isBookmarked = currentUser?.bookmarks?.some(
    (b) => b.bookId === book.id && b.page === currentPage
  );

  // Find chapter for current page
  const currentChapter =
    book.chapters.find((ch) => ch.pageNumber === currentPage) ||
    book.chapters[Math.min(currentPage - 1, book.chapters.length - 1)] ||
    book.chapters[0];

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

  const toggleBookmark = () => {
    onUpdateBookmark(book.id, currentPage, currentChapter?.titleMm || `စာမျက်နှာ ${currentPage}`);
  };

  const handleSaveNote = () => {
    if (noteInput.trim()) {
      onAddNote(book.id, currentPage, noteInput.trim());
      setNoteInput('');
      setNoteSavedSuccess(true);
      setTimeout(() => setNoteSavedSuccess(false), 2000);
    }
  };

  // Theme styling configurations
  const themeClasses = {
    paper: 'bg-[#FBF9F5] text-stone-900 border-stone-200',
    white: 'bg-white text-stone-900 border-stone-200',
    dark: 'bg-[#18181B] text-stone-100 border-stone-800',
  };

  const contentBgClasses = {
    paper: 'bg-[#F7F4EE] border-stone-300 text-stone-900',
    white: 'bg-stone-50 border-stone-200 text-stone-900',
    dark: 'bg-[#222226] border-stone-700 text-stone-100',
  };

  const fontSizeClasses = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose',
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') handleNextPage();
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') handlePrevPage();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4">
      <div
        className={`w-full max-w-5xl h-[95vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden border transition-colors ${themeClasses[themeMode]}`}
      >
        {/* Reader Top Utility Bar */}
        <div className="px-4 py-3 border-b border-stone-300/60 flex items-center justify-between gap-3 shrink-0">
          {/* Left: Book Title & Chapter info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setShowToc(!showToc)}
              title="မာတိကာ (Table of Contents)"
              className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors shrink-0"
            >
              <List className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <h2 className="font-serif font-bold text-sm sm:text-base truncate">
                {book.titleMm}
              </h2>
              {currentChapter && (
                <p className="text-xs text-stone-500 dark:text-stone-400 font-myanmar truncate">
                  {currentChapter.titleMm}
                </p>
              )}
            </div>
          </div>

          {/* Right: Controls (Font size, Theme, Bookmark, Note, Close) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Font size segmented buttons */}
            <div className="hidden sm:flex items-center gap-1 p-0.5 rounded-lg bg-stone-200/60 dark:bg-stone-800 text-xs font-semibold">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-1 rounded transition-colors ${
                  fontSize === 'sm' ? 'bg-white dark:bg-stone-700 shadow-2xs' : 'text-stone-600 dark:text-stone-400'
                }`}
                title="စာလုံးသေး"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-1 rounded transition-colors ${
                  fontSize === 'base' ? 'bg-white dark:bg-stone-700 shadow-2xs' : 'text-stone-600 dark:text-stone-400'
                }`}
                title="စာလုံးပုံမှန်"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-1 rounded transition-colors ${
                  fontSize === 'lg' ? 'bg-white dark:bg-stone-700 shadow-2xs' : 'text-stone-600 dark:text-stone-400'
                }`}
                title="စာလုံးကြီး"
              >
                A+
              </button>
            </div>

            {/* Reading Theme selector */}
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

            {/* Close Modal button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-stone-200/80 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reader Center Canvas: Responsive Sidebar + Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Table of Contents Drawer */}
          {showToc && (
            <div className="w-64 sm:w-72 border-r border-stone-300/80 dark:border-stone-800 bg-stone-100/90 dark:bg-stone-900/90 backdrop-blur-md p-4 overflow-y-auto shrink-0 space-y-3 z-20">
              <div className="flex items-center justify-between pb-2 border-b border-stone-300 dark:border-stone-700">
                <span className="font-myanmar font-semibold text-xs text-stone-700 dark:text-stone-300">
                  မာတိကာ အခန်းများ
                </span>
                <button
                  onClick={() => setShowToc(false)}
                  className="text-stone-400 hover:text-stone-700 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1">
                {book.chapters.map((ch, idx) => (
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
                    <span className="font-mono text-stone-400">
                      {toMyanmarDigits(idx + 1)}.
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{ch.titleMm}</p>
                      {ch.titleAr && (
                        <p className="font-arabic text-[11px] text-stone-400 truncate">
                          {ch.titleAr}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Reading Text Column (Constrained to max-w-prose / 65-75ch as mandated by frontend-design skill) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
            <div className="w-full max-w-2xl space-y-6">
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
                    စာမျက်နှာ {toMyanmarDigits(currentPage)} / {toMyanmarDigits(totalPages)}
                  </div>
                </div>
              )}

              {/* PDF Viewer Embed if PDF URL is provided */}
              {book.pdfUrl ? (
                <div className="space-y-4">
                  <div className="aspect-[4/3] sm:aspect-[16/10] w-full rounded-xl overflow-hidden border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-900">
                    <iframe
                      src={book.pdfUrl}
                      title={book.titleMm}
                      className="w-full h-full border-none"
                    />
                  </div>
                  <p className="text-xs text-stone-500 text-center font-myanmar">
                    အထက်ပါ PDF Document ကို တိုက်ရိုက် ကြည့်ရှုနိုင်ပါသည်။
                  </p>
                </div>
              ) : (
                /* Editorial Reading Prose */
                <article
                  className={`font-myanmar whitespace-pre-line leading-relaxed ${fontSizeClasses[fontSize]}`}
                >
                  {currentChapter?.content ||
                    'ဤစာမျက်နှာအတွက် စာသားအပြည့်အစုံကို ပြင်ဆင်နေဆဲ ဖြစ်ပါသည်။'}
                </article>
              )}

              {/* Institutional Footnotes or Chapter Footer */}
              <div className="pt-8 border-t border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500 dark:text-stone-400 font-myanmar space-y-1">
                <p>ကျမ်းကိုး: {book.authorMm} · {book.titleMm}</p>
                <p>Al-Hikmah အစ္စလာမ့်စာကြည့်တိုက် သုတဘဏ်</p>
              </div>
            </div>
          </div>

          {/* Personal Notes Drawer */}
          {showNoteDrawer && (
            <div className="w-72 sm:w-80 border-l border-stone-300/80 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 p-4 flex flex-col justify-between shrink-0 z-20">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-300 dark:border-stone-700">
                  <span className="font-myanmar font-semibold text-xs text-stone-800 dark:text-stone-200">
                    စာမျက်နှာ {toMyanmarDigits(currentPage)} မှတ်စု
                  </span>
                  <button
                    onClick={() => setShowNoteDrawer(false)}
                    className="text-stone-400 hover:text-stone-700 text-xs"
                  >
                    ✕
                  </button>
                </div>

                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="ဤစာမျက်နှာနှင့် ပတ်သက်၍ သင်၏ မှတ်သားချက်၊ အတွေးအမြင်များကို ရေးမှတ်ထားပါ..."
                  className="w-full h-40 p-2.5 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-myanmar resize-none"
                />

                <button
                  onClick={handleSaveNote}
                  className="w-full py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold font-myanmar transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>မှတ်စုသိမ်းဆည်းမည်</span>
                </button>

                {noteSavedSuccess && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-myanmar flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>မှတ်စု သိမ်းဆည်းပြီးပါပြီ</span>
                  </p>
                )}

                {/* Existing notes for this book */}
                <div className="pt-3 border-t border-stone-300 dark:border-stone-700 space-y-2">
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

        {/* Reader Bottom Navigation Bar */}
        <div className="px-4 py-3 border-t border-stone-300/60 flex items-center justify-between gap-4 shrink-0 bg-stone-100/50 dark:bg-stone-900/50">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-myanmar font-medium disabled:opacity-40 disabled:pointer-events-none hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>ရှေ့စာမျက်နှာ</span>
          </button>

          {/* Reading Progress Indicator */}
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono font-medium">
              <span>{toMyanmarDigits(currentPage)}</span>
              <span className="text-stone-400 mx-1">/</span>
              <span>{toMyanmarDigits(totalPages)}</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-24 sm:w-40 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-emerald-800 dark:bg-emerald-500 transition-all duration-200"
                style={{ width: `${Math.round((currentPage / totalPages) * 100)}%` }}
              ></div>
            </div>
            <span className="text-[11px] text-stone-500 font-mono hidden sm:inline">
              {toMyanmarDigits(Math.round((currentPage / totalPages) * 100))}%
            </span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-900 text-white hover:bg-emerald-800 text-xs font-myanmar font-medium disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <span>နောက်စာမျက်နှာ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
