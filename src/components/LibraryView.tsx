import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Lock,
  Sparkles,
  Upload,
  Filter,
  CheckCircle2,
  Bookmark,
  FileText,
  Clock,
  ChevronRight,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  RotateCcw,
  ArrowUpDown,
  Send,
  User,
  PenTool,
  Check,
  Headphones,
  Play,
  Volume2,
  Plus,
} from 'lucide-react';
import { BookItem, UserProfile } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialBooks';
import { toMyanmarDigits } from '../utils/islamicTimes';
import { DailyHadith } from './DailyHadith';
import { LibrarySidebar } from './LibrarySidebar';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { isUserAdmin } from '../utils/auth';

interface LibraryViewProps {
  books: BookItem[];
  currentUser: UserProfile | null;
  onOpenBook: (book: BookItem) => void;
  onOpenUploadModal: () => void;
  onRequireAuth: (actionDescription: string) => void;
}

export type SearchScope = 'all' | 'title' | 'author';

// Helper to highlight matching search characters
function renderHighlight(text: string | null | undefined, query: string): React.ReactNode {
  if (!text) return '';
  const trimmed = query.trim();
  if (!trimmed) return text;

  try {
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    if (parts.length <= 1) return text;

    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark
              key={index}
              className="bg-amber-300 text-stone-950 font-bold px-0.5 rounded shadow-2xs"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  } catch (e) {
    return text;
  }
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  currentUser,
  onOpenBook,
  onOpenUploadModal,
  onRequireAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>('all');
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterMembership, setFilterMembership] = useState<'all' | 'free' | 'member'>('all');
  const [pageLengthFilter, setPageLengthFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [showOnlyUserUploads, setShowOnlyUserUploads] = useState(false);
  const [showOnlyTelegramBooks, setShowOnlyTelegramBooks] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'pages' | 'title'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: "/" to focus search, "Esc" to clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        if (searchQuery) {
          setSearchQuery('');
        } else {
          searchInputRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  // Compute book counts by category
  const bookCountsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of INITIAL_CATEGORIES) {
      if (cat.id === 'all') {
        counts[cat.id] = books.length;
      } else {
        counts[cat.id] = books.filter((b) => b.category === cat.id).length;
      }
    }
    return counts;
  }, [books]);

  // Compute telegram books count
  const telegramBooksCount = useMemo(() => {
    return books.filter((b) => Boolean(b.telegramChannel) || b.id.startsWith('tg-')).length;
  }, [books]);

  // Search match statistics (title vs author)
  const searchMatchCounts = useMemo(() => {
    if (!searchQuery.trim()) return { titleCount: 0, authorCount: 0 };
    const q = searchQuery.toLowerCase().trim();
    let titleCount = 0;
    let authorCount = 0;

    for (const b of books) {
      const matchTitle =
        Boolean(b.titleMm && b.titleMm.toLowerCase().includes(q)) ||
        Boolean(b.titleEn && b.titleEn.toLowerCase().includes(q)) ||
        Boolean(b.titleAr && b.titleAr.toLowerCase().includes(q));

      const matchAuthor =
        Boolean(b.authorMm && b.authorMm.toLowerCase().includes(q)) ||
        Boolean(b.authorAr && b.authorAr.toLowerCase().includes(q)) ||
        Boolean(b.uploaderName && b.uploaderName.toLowerCase().includes(q)) ||
        Boolean(b.telegramChannel && b.telegramChannel.toLowerCase().includes(q));

      if (matchTitle) titleCount++;
      if (matchAuthor) authorCount++;
    }

    return { titleCount, authorCount };
  }, [books, searchQuery]);

  // Check if any filter is currently active
  const isFilterActive = useMemo(() => {
    return (
      selectedCategory !== 'all' ||
      filterMembership !== 'all' ||
      pageLengthFilter !== 'all' ||
      showOnlyUserUploads ||
      showOnlyTelegramBooks ||
      selectedAuthorFilter !== null ||
      searchScope !== 'all' ||
      searchQuery.trim() !== ''
    );
  }, [
    selectedCategory,
    filterMembership,
    pageLengthFilter,
    showOnlyUserUploads,
    showOnlyTelegramBooks,
    selectedAuthorFilter,
    searchScope,
    searchQuery,
  ]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setFilterMembership('all');
    setPageLengthFilter('all');
    setShowOnlyUserUploads(false);
    setShowOnlyTelegramBooks(false);
    setSelectedAuthorFilter(null);
    setSearchScope('all');
    setSearchQuery('');
  };

  // Filter and sort books by title or author name
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Category filter
        if (selectedCategory !== 'all' && book.category !== selectedCategory) {
          return false;
        }

        // Membership filter
        if (filterMembership === 'free' && book.isMemberOnly) return false;
        if (filterMembership === 'member' && !book.isMemberOnly) return false;

        // Page length filter
        if (pageLengthFilter === 'short' && book.totalPages >= 40) return false;
        if (pageLengthFilter === 'medium' && (book.totalPages < 40 || book.totalPages > 70)) return false;
        if (pageLengthFilter === 'long' && book.totalPages <= 70) return false;

        // User uploads filter
        if (showOnlyUserUploads && !book.isUserUploaded) return false;

        // Telegram channel books filter
        if (showOnlyTelegramBooks && !book.telegramChannel && !book.id.startsWith('tg-')) return false;

        // Specific author filter
        if (
          selectedAuthorFilter &&
          !book.authorMm.toLowerCase().includes(selectedAuthorFilter.toLowerCase())
        ) {
          return false;
        }

        // Search text & scope filter (Title vs Author vs All)
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase().trim();

          const matchTitle =
            Boolean(book.titleMm && book.titleMm.toLowerCase().includes(q)) ||
            Boolean(book.titleEn && book.titleEn.toLowerCase().includes(q)) ||
            Boolean(book.titleAr && book.titleAr.toLowerCase().includes(q));

          const matchAuthor =
            Boolean(book.authorMm && book.authorMm.toLowerCase().includes(q)) ||
            Boolean(book.authorAr && book.authorAr.toLowerCase().includes(q)) ||
            Boolean(book.uploaderName && book.uploaderName.toLowerCase().includes(q)) ||
            Boolean(book.telegramChannel && book.telegramChannel.toLowerCase().includes(q));

          const matchDesc = Boolean(book.descriptionMm && book.descriptionMm.toLowerCase().includes(q));
          const matchCategory = Boolean(book.categoryMm && book.categoryMm.toLowerCase().includes(q));

          if (searchScope === 'title') {
            return matchTitle;
          }
          if (searchScope === 'author') {
            return matchAuthor;
          }
          // 'all' scope matches title, author, category, or description
          return matchTitle || matchAuthor || matchDesc || matchCategory;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.readCount - a.readCount;
        if (sortBy === 'pages') return b.totalPages - a.totalPages;
        if (sortBy === 'title') return a.titleMm.localeCompare(b.titleMm);
        return (b.publishedYear || '0').localeCompare(a.publishedYear || '0');
      });
  }, [
    books,
    selectedCategory,
    filterMembership,
    pageLengthFilter,
    showOnlyUserUploads,
    showOnlyTelegramBooks,
    selectedAuthorFilter,
    searchQuery,
    searchScope,
    sortBy,
  ]);

  const { playTrack, addToQueue } = useAudioPlayer();

  const handleBookClick = (book: BookItem) => {
    if (book.isMemberOnly && !currentUser) {
      onRequireAuth(
        `ဤ "${book.titleMm}" ${book.mediaType === 'audio' ? 'အသံဖိုင်ကို နားဆင်ရန်' : 'စာအုပ်ကို ဖတ်ရှုရန်'} မန်ဘာအကောင့်ဖြင့် ဝင်ရောက်ပေးပါ`
      );
      return;
    }
    // If it's an audio item with a stream URL, play it in the global streaming player
    if (book.audioUrl) {
      playTrack({
        id: book.id,
        titleMm: book.titleMm,
        titleAr: book.titleAr,
        speakerOrReciterMm: book.reciterOrSpeakerMm || book.authorMm,
        streamUrl: book.audioUrl,
        categoryMm: book.categoryMm,
        durationStr: book.audioDuration,
        coverGradient: book.coverColor,
      });
    }
    onOpenBook(book);
  };

  const selectedCategoryObj = INITIAL_CATEGORIES.find((c) => c.id === selectedCategory) || INITIAL_CATEGORIES[0];

  // In-progress reading book
  const inProgressBook = currentUser?.readingHistory?.[0]
    ? (books || []).find((b) => b.id === currentUser.readingHistory[0].bookId)
    : null;

  return (
    <div className="space-y-8">
      {/* Editorial Curatorial Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1e16] via-[#103024] to-[#164030] text-white p-6 sm:p-10 shadow-lg border border-emerald-800/70">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#f7d070_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative max-w-3xl space-y-4">
          <div className="text-xs uppercase tracking-widest text-amber-300/90 font-sans flex items-center gap-2">
            <span>အစ္စလာမ့် စာကြည့်တိုက်နှင့် သုတဘဏ်</span>
            <span aria-hidden="true">·</span>
            <span className="font-arabic text-sm">مكتبة الحكمة الإسلامية</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight text-balance">
            ဓမ္မအသိပညာ၊ ကျမ်းမြတ်ကုရ်အာန်နှင့် အစ္စလာမ့်စာပေများ
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-myanmar max-w-2xl">
            ကျမ်းမြတ်ကုရ်အာန် အနက်မြန်မာပြန် (သဖ်စီးရ်)၊ ဆွဟီးဟ်ဟဒီးစ်တော်များ၊ ဖိကာဟ်တရားတော်၊ တမန်တော်မြတ် အတ္ထုပ္ပတ္တိ (စီရသ်) နှင့် အစ္စလာမ့်စာအုပ်/PDF များကို စနစ်တကျ ကဏ္ဍခွဲခြား၍ လွတ်လပ်စွာ ရှာဖွေဖတ်ရှုနိုင်ပါသည်။
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {isUserAdmin(currentUser) ? (
              <button
                onClick={onOpenUploadModal}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs"
              >
                <Upload className="w-4 h-4 text-stone-950" />
                <span className="font-myanmar">အသံဖိုင် / စာအုပ် တင်မည်</span>
                <span className="text-[10px] bg-stone-950 text-amber-300 font-mono font-bold px-1.5 py-0.2 rounded">
                  ADMIN
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenUploadModal}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs"
              >
                <Upload className="w-4 h-4 text-stone-950" />
                <span className="font-myanmar">စာအုပ် / PDF အသစ်တင်မည်</span>
              </button>
            )}

            {inProgressBook && currentUser && (
              <button
                onClick={() => onOpenBook(inProgressBook)}
                className="px-4 py-2.5 bg-emerald-900/90 hover:bg-emerald-800 text-amber-200 border border-emerald-700/80 text-xs rounded-xl transition-colors flex items-center gap-2 font-myanmar"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  ဆက်လက်ဖတ်ရှုရန် ({toMyanmarDigits(currentUser.readingHistory[0].lastPage)}/
                  {toMyanmarDigits(inProgressBook.totalPages)})
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Daily Hadith Reflection Component */}
      <DailyHadith onExploreHadithCategory={() => setSelectedCategory('hadith')} />

      {/* Main Two-Column Layout: Filter Sidebar (Left) + Book Catalog (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* DESKTOP FILTER SIDEBAR */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
          <LibrarySidebar
            categories={INITIAL_CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            filterMembership={filterMembership}
            onSelectMembership={setFilterMembership}
            pageLengthFilter={pageLengthFilter}
            onSelectPageLength={setPageLengthFilter}
            showOnlyUserUploads={showOnlyUserUploads}
            onToggleUserUploads={setShowOnlyUserUploads}
            bookCountsByCategory={bookCountsByCategory}
            totalBooksCount={books.length}
            onResetFilters={handleResetFilters}
            isFilterActive={isFilterActive}
          />
        </div>

        {/* MOBILE SLIDE-OVER DRAWER MODAL */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />

            {/* Drawer Panel */}
            <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-200">
              <LibrarySidebar
                categories={INITIAL_CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                filterMembership={filterMembership}
                onSelectMembership={setFilterMembership}
                pageLengthFilter={pageLengthFilter}
                onSelectPageLength={setPageLengthFilter}
                showOnlyUserUploads={showOnlyUserUploads}
                onToggleUserUploads={setShowOnlyUserUploads}
                bookCountsByCategory={bookCountsByCategory}
                totalBooksCount={books.length}
                onResetFilters={handleResetFilters}
                isFilterActive={isFilterActive}
                isMobileDrawer={true}
                onCloseMobileDrawer={() => setIsMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* MAIN BOOK CATALOG CONTAINER (Right Column) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Top Search & Filter Controls Panel */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 space-y-3.5 shadow-2xs">
            {/* Primary Search Input Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-emerald-800 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    searchScope === 'title'
                      ? 'စာအုပ်အမည် သီးသန့် ရှာဖွေပါ (ဥပမာ- ဟဒီးစ်တော် ၄၀၊ ကုရ်အာန်၊ အွမ်ရဟ်)...'
                      : searchScope === 'author'
                      ? 'စာရေးဆရာ / ကျမ်းပြုဆရာ အမည်ဖြင့် ရှာဖွေပါ (ဥပမာ- အိမာမ် နဝဝီ၊ မော်လာနာ)...'
                      : 'စာအုပ်အမည် သို့မဟုတ် စာရေးဆရာဖြင့် ရှာဖွေပါ (ဥပမာ- ဟဒီးစ်၊ အိမာမ် နဝဝီ)...'
                  }
                  className="w-full pl-9 pr-24 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/40 focus:border-emerald-700 focus:bg-white font-myanmar transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      title="ရှာဖွေမှု ရှင်းလင်းမည် (Esc)"
                      className="w-5 h-5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center text-xs transition-colors"
                    >
                      ✕
                    </button>
                  ) : (
                    <kbd
                      title="ကီးဘုတ်မှ / နှိပ်၍ အမြန်ရှာနိုင်ပါသည်"
                      className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-stone-100 border border-stone-300 rounded"
                    >
                      /
                    </kbd>
                  )}
                </div>
              </div>

              {/* Action Controls: Mobile Drawer + Sort + View Mode */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Mobile Filter Drawer Trigger Button */}
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-emerald-950 text-white rounded-xl text-xs font-myanmar font-semibold shadow-xs hover:bg-emerald-900 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-300" />
                  <span>ကဏ္ဍစစ်ထုတ်ရန်</span>
                  {selectedCategory !== 'all' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  )}
                </button>

                {/* Sort Dropdown */}
                <div className="relative flex items-center">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="pl-2.5 pr-7 py-2 text-xs bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-myanmar cursor-pointer transition-colors"
                  >
                    <option value="popular">လူကြိုက်အများဆုံး</option>
                    <option value="newest">နောက်ဆုံးတင်ထားသော</option>
                    <option value="pages">စာမျက်နှာအရေအတွက်</option>
                    <option value="title">အက္ခရာစဉ်အလိုက်</option>
                  </select>
                </div>

                {/* View Mode Toggle (Grid vs List) */}
                <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    title="အကွက်လိုက် ပြသရန် (Grid View)"
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-emerald-950 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    title="စာရင်းလိုက် ပြသရန် (List View)"
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-emerald-950 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter by Title or Author Scope Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-1.5 p-1 bg-stone-100/90 rounded-xl border border-stone-200 text-xs font-myanmar">
                <span className="text-[11px] text-stone-500 font-medium px-2 hidden sm:inline">
                  ရှာဖွေမည့်နယ်ပယ်:
                </span>

                <button
                  type="button"
                  onClick={() => setSearchScope('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-medium ${
                    searchScope === 'all'
                      ? 'bg-white text-emerald-950 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-stone-500" />
                  <span>အားလုံး</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSearchScope('title')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-medium ${
                    searchScope === 'title'
                      ? 'bg-emerald-900 text-white shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <BookOpen className={`w-3.5 h-3.5 ${searchScope === 'title' ? 'text-amber-300' : 'text-stone-500'}`} />
                  <span>စာအုပ်အမည်ဖြင့်သာ</span>
                  {searchQuery && searchMatchCounts && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        searchScope === 'title'
                          ? 'bg-emerald-800 text-amber-200'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {toMyanmarDigits(searchMatchCounts.titleCount)}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSearchScope('author')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-medium ${
                    searchScope === 'author'
                      ? 'bg-amber-600 text-white shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <User className={`w-3.5 h-3.5 ${searchScope === 'author' ? 'text-white' : 'text-stone-500'}`} />
                  <span>စာရေးဆရာဖြင့်သာ</span>
                  {searchQuery && searchMatchCounts && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        searchScope === 'author'
                          ? 'bg-amber-700 text-white'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {toMyanmarDigits(searchMatchCounts.authorCount)}
                    </span>
                  )}
                </button>
              </div>

              {/* Status Indicator */}
              {searchQuery && (
                <div className="text-[11px] font-myanmar text-stone-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>
                    {searchScope === 'title'
                      ? 'စာအုပ်အမည် စစ်ထုတ်နေပါသည်'
                      : searchScope === 'author'
                      ? 'စာရေးဆရာ အမည် စစ်ထုတ်နေပါသည်'
                      : 'အားလုံး စစ်ထုတ်နေပါသည်'}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Search Suggestions (1-Click Title & Author Keywords) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100 text-xs font-myanmar">
              <span className="text-[11px] text-stone-400 font-medium shrink-0 flex items-center gap-1">
                <span>အမြန်ရှာဖွေရန်:</span>
              </span>

              {/* Title Samples */}
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                📖 အမည်:
              </span>
              {[
                'ဟဒီးစ်တော် ၄၀',
                'ကုရ်အာန်',
                'ဆရာသမားများကို',
                'ဆည်းပူးသင်ယူ',
                'အွမ်ရဟ်',
                'ဖိကာဟ်',
              ].map((titleKw) => (
                <button
                  key={titleKw}
                  type="button"
                  onClick={() => {
                    setSearchQuery(titleKw);
                    setSearchScope('title');
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] border transition-colors ${
                    searchQuery === titleKw && searchScope === 'title'
                      ? 'bg-emerald-900 text-white border-emerald-900 font-semibold shadow-2xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {titleKw}
                </button>
              ))}

              {/* Author Samples */}
              <span className="text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded font-medium ml-1">
                ✍️ စာရေးဆရာ:
              </span>
              {[
                'အိမာမ် နဝဝီ',
                'မော်လာနာ နူရ်မုဟမ္မဒ်',
                'မောင်လာနာ နဆီးမ်',
                'ယာကီးန်အုလ္လာဟ်',
                'ဒေါက်တာ ဇာကိရ်',
              ].map((authorKw) => (
                <button
                  key={authorKw}
                  type="button"
                  onClick={() => {
                    setSearchQuery(authorKw);
                    setSearchScope('author');
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] border transition-colors ${
                    searchQuery === authorKw && searchScope === 'author'
                      ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow-2xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {authorKw}
                </button>
              ))}
            </div>

            {/* Quick Horizontal Categories Carousel for Fast 1-Tap Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-stone-100">
              <span className="text-[11px] text-stone-400 font-myanmar shrink-0 mr-1 hidden sm:inline">
                ကဏ္ဍခွဲများ:
              </span>
              {INITIAL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id && !showOnlyTelegramBooks;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setShowOnlyTelegramBooks(false);
                    }}
                    className={`px-3 py-1 text-xs rounded-lg transition-all whitespace-nowrap shrink-0 font-myanmar flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-900 text-white font-medium shadow-xs ring-1 ring-emerald-700'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    <span>{cat.nameMm}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-emerald-800 text-amber-200' : 'bg-stone-200/80 text-stone-600'
                      }`}
                    >
                      {toMyanmarDigits(
                        cat.id === 'all'
                          ? books.length
                          : bookCountsByCategory[cat.id] || 0
                      )}
                    </span>
                  </button>
                );
              })}

              {/* Telegram Channel Books Quick Tab */}
              <button
                onClick={() => setShowOnlyTelegramBooks(!showOnlyTelegramBooks)}
                className={`px-3 py-1 text-xs rounded-lg transition-all whitespace-nowrap shrink-0 font-myanmar flex items-center gap-1.5 ${
                  showOnlyTelegramBooks
                    ? 'bg-[#0088cc] text-white font-semibold shadow-xs ring-1 ring-[#0077b5]'
                    : 'bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300'
                }`}
              >
                <Send className="w-3 h-3 -rotate-12 text-[#0088cc]" />
                <span>Telegram စာအုပ်များ</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    showOnlyTelegramBooks ? 'bg-sky-800 text-white' : 'bg-sky-200/80 text-sky-800'
                  }`}
                >
                  {toMyanmarDigits(telegramBooksCount)}
                </span>
              </button>
            </div>
          </div>

          {/* Active Filters Tag Bar & Results Count */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-myanmar bg-stone-50/80 px-4 py-2.5 rounded-xl border border-stone-200/80">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-stone-700 font-bold">
                ရလဒ် စုစုပေါင်း ({toMyanmarDigits(filteredBooks.length)}) အုပ်
              </span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-950 font-semibold px-2.5 py-1 rounded-md border border-emerald-300 shadow-2xs">
                  <span>
                    ရှာဖွေမှု: "{searchQuery}" (
                    {searchScope === 'title'
                      ? 'စာအုပ်အမည်'
                      : searchScope === 'author'
                      ? 'စာရေးဆရာ'
                      : 'အားလုံး'}
                    )
                  </span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="hover:text-emerald-700 font-mono ml-0.5 text-xs"
                    title="ရှာဖွေမှု ဖြုတ်ရန်"
                  >
                    ✕
                  </button>
                </span>
              )}

              {searchScope !== 'all' && !searchQuery && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-950 font-semibold px-2 py-0.5 rounded-md border border-amber-300">
                  <span>
                    စစ်ထုတ်မှု: {searchScope === 'title' ? 'စာအုပ်အမည်' : 'စာရေးဆရာ'}
                  </span>
                  <button
                    onClick={() => setSearchScope('all')}
                    className="hover:text-amber-700 font-mono ml-0.5 text-xs"
                    title="အားလုံးရှာဖွေမှုသို့ ပြောင်းရန်"
                  >
                    ✕
                  </button>
                </span>
              )}

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-950 font-semibold px-2 py-0.5 rounded-md border border-emerald-300">
                  <span>ကဏ္ဍ: {selectedCategoryObj.nameMm}</span>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="hover:text-emerald-700 font-mono ml-0.5 text-xs"
                    title="ကဏ္ဍစစ်ထုတ်မှု ဖြုတ်ရန်"
                  >
                    ✕
                  </button>
                </span>
              )}

              {filterMembership !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-950 font-semibold px-2 py-0.5 rounded-md border border-amber-300">
                  <span>{filterMembership === 'free' ? 'အခမဲ့ဖတ်ရှုခွင့်' : 'မန်ဘာသီးသန့်'}</span>
                  <button
                    onClick={() => setFilterMembership('all')}
                    className="hover:text-amber-700 font-mono ml-0.5 text-xs"
                    title="မန်ဘာစစ်ထုတ်မှု ဖြုတ်ရန်"
                  >
                    ✕
                  </button>
                </span>
              )}

              {pageLengthFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-stone-200 text-stone-800 font-semibold px-2 py-0.5 rounded-md">
                  <span>
                    {pageLengthFilter === 'short'
                      ? 'လက်ကမ်း (< ၄၀)'
                      : pageLengthFilter === 'medium'
                      ? 'အလယ်အလတ် (၄၀-၇၀)'
                      : 'ကျမ်းကြီးများ (> ၇၀)'}
                  </span>
                  <button
                    onClick={() => setPageLengthFilter('all')}
                    className="hover:text-stone-600 font-mono ml-0.5 text-xs"
                  >
                    ✕
                  </button>
                </span>
              )}

              {showOnlyUserUploads && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 font-semibold px-2 py-0.5 rounded-md border border-emerald-300">
                  <span>မိမိတင်ထားသော PDF</span>
                  <button
                    onClick={() => setShowOnlyUserUploads(false)}
                    className="hover:text-emerald-700 font-mono ml-0.5 text-xs"
                  >
                    ✕
                  </button>
                </span>
              )}

              {showOnlyTelegramBooks && (
                <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-900 font-semibold px-2 py-0.5 rounded-md border border-sky-300">
                  <span>Telegram စာအုပ်များ</span>
                  <button
                    onClick={() => setShowOnlyTelegramBooks(false)}
                    className="hover:text-sky-700 font-mono ml-0.5 text-xs"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>

            {isFilterActive && (
              <button
                onClick={handleResetFilters}
                className="text-emerald-800 hover:text-emerald-950 font-semibold hover:underline flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="w-3 h-3 text-emerald-700" />
                <span>အားလုံး ရှင်းလင်းရန်</span>
              </button>
            )}
          </div>

          {/* Audio Category Header Banner */}
          {selectedCategory === 'audio' && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isUserAdmin(currentUser)
                  ? 'bg-gradient-to-r from-violet-950 via-indigo-950 to-stone-900 text-white border-violet-800 shadow-md'
                  : 'bg-violet-50/80 border-violet-200 text-violet-950'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isUserAdmin(currentUser)
                        ? 'bg-amber-400 text-stone-950 font-bold'
                        : 'bg-violet-200 text-violet-900'
                    }`}
                  >
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-sm font-myanmar">
                        အစ္စလာမ့်တရားတော်များနှင့် ကုရ်အာန် အသံဖိုင် သုတဘဏ်
                      </h4>
                      {isUserAdmin(currentUser) && (
                        <span className="text-[10px] bg-amber-400 text-stone-950 font-mono font-bold px-1.5 py-0.2 rounded">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs font-myanmar mt-0.5 ${
                        isUserAdmin(currentUser) ? 'text-violet-200' : 'text-stone-600'
                      }`}
                    >
                      {isUserAdmin(currentUser)
                        ? 'သင်သည် Admin ဖြစ်သောကြောင့် မိမိထည့်သွင်းလိုသော အသံဖိုင်များနှင့် တရားတော်များကို စာကြည့်တိုက်သို့ တိုက်ရိုက် တင်သွင်းခွင့် ရရှိထားပါသည်။'
                        : 'ဤကဏ္ဍရှိ အသံဖိုင်များကို စီမံခန့်ခွဲသူ (Admin) မှ သီးသန့် တင်သွင်းထားပြီး မည်သူမဆို လွတ်လပ်စွာ ဖွင့်နားဆင်နိုင်ပါသည်။ (အသံဖိုင် တင်သွင်းခြင်းကို Admin သာ ဆောင်ရွက်ခွင့်ရှိပါသည်)'}
                    </p>
                  </div>
                </div>

                {isUserAdmin(currentUser) && (
                  <button
                    onClick={onOpenUploadModal}
                    className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs font-myanmar shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ အသံဖိုင် တင်မည်</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Book Catalog Results */}
          {filteredBooks.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-10 sm:p-14 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 font-myanmar">
                  {searchQuery
                    ? `"${searchQuery}" နှင့် ကိုက်ညီသော စာအုပ် (${
                        searchScope === 'title'
                          ? 'အမည်'
                          : searchScope === 'author'
                          ? 'ရေးဆရာ'
                          : ''
                      }) မတွေ့ရှိပါ`
                    : 'ရွေးချယ်ထားသော စစ်ထုတ်မှုနှင့် ကိုက်ညီသည့် စာအုပ် မတွေ့ရှိပါ'}
                </h3>
                <p className="text-xs text-stone-500 font-myanmar max-w-md mx-auto leading-relaxed">
                  {searchScope === 'title'
                    ? 'စာအုပ်အမည် စာလုံးပေါင်း မှန်ကန်မှုရှိမရှိ စစ်ဆေးပါ သို့မဟုတ် "စာရေးဆရာ" / "အားလုံး" သို့ ပြောင်းလဲရှာဖွေကြည့်ပါ။'
                    : searchScope === 'author'
                    ? 'စာရေးဆရာအမည် စာလုံးပေါင်း မှန်ကန်မှုရှိမရှိ စစ်ဆေးပါ သို့မဟုတ် "စာအုပ်အမည်" / "အားလုံး" သို့ ပြောင်းလဲရှာဖွေကြည့်ပါ။'
                    : 'အခြားသော အဓိကစာလုံးများ (ဥပမာ- ကုရ်အာန်၊ ဟဒီးစ်၊ ဖိကာဟ်၊ နမားဇ်) ဖြင့် စမ်းသပ်ရှာဖွေနိုင်ပါသည်။'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                {searchScope !== 'all' && (
                  <button
                    onClick={() => setSearchScope('all')}
                    className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-xs font-myanmar font-semibold text-white rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Search className="w-3.5 h-3.5 text-amber-300" />
                    <span>အားလုံးရှာဖွေမှုသို့ ပြောင်းမည်</span>
                  </button>
                )}
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-xs font-myanmar font-semibold text-stone-800 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>စစ်ထုတ်မှု အားလုံး ရှင်းလင်းရန်</span>
                </button>
                <button
                  onClick={onOpenUploadModal}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-xs font-myanmar font-semibold text-stone-950 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-stone-950" />
                  <span>စာအုပ်အသစ် တင်မည်</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const isLocked = book.isMemberOnly && !currentUser;
                const q = searchQuery.toLowerCase().trim();
                const isTitleMatch =
                  Boolean(q) &&
                  (Boolean(book.titleMm?.toLowerCase().includes(q)) ||
                    Boolean(book.titleEn?.toLowerCase().includes(q)) ||
                    Boolean(book.titleAr?.toLowerCase().includes(q)));
                const isAuthorMatch =
                  Boolean(q) &&
                  (Boolean(book.authorMm?.toLowerCase().includes(q)) ||
                    Boolean(book.authorAr?.toLowerCase().includes(q)) ||
                    Boolean(book.uploaderName?.toLowerCase().includes(q)));

                return (
                  <div
                    key={book.id}
                    className={`bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col group overflow-hidden ${
                      q && (isTitleMatch || isAuthorMatch)
                        ? 'border-emerald-700/60 ring-1 ring-emerald-600/30'
                        : 'border-stone-200 hover:border-emerald-700/60'
                    }`}
                  >
                    {/* Book Card Cover: Islamic Craftsmanship Styling */}
                    <div
                      onClick={() => handleBookClick(book)}
                      className={`h-48 cursor-pointer relative overflow-hidden bg-gradient-to-br ${book.coverColor} p-5 flex flex-col justify-between text-white transition-transform group-hover:scale-[1.01]`}
                    >
                      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]"></div>

                      {/* Book Top Info */}
                      <div className="relative z-10 flex items-start justify-between gap-2">
                        <span className="text-[11px] font-sans tracking-wide text-amber-200/90 font-medium truncate">
                          {book.categoryMm}
                        </span>
                        {book.mediaType === 'audio' || book.audioUrl ? (
                          <div
                            title="အသံဖိုင် / တရားဒေသနာ"
                            className="flex items-center gap-1 text-[10px] text-violet-200 bg-violet-950/90 px-2 py-0.5 rounded border border-violet-400/40 shadow-xs"
                          >
                            <Headphones className="w-3 h-3 text-amber-300" />
                            <span className="font-myanmar font-semibold">အသံဖိုင်</span>
                          </div>
                        ) : null}
                        {book.isMemberOnly && (
                          <div
                            title="သီးသန့် မန်ဘာဝင်ဖတ်ရှုခွင့်"
                            className="flex items-center gap-1 text-[10px] text-amber-300 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded border border-amber-400/30"
                          >
                            <Lock className="w-3 h-3 text-amber-300" />
                            <span className="font-myanmar">မန်ဘာသီးသန့်</span>
                          </div>
                        )}
                        {book.isUserUploaded && !book.audioUrl && (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-400/40">
                            <FileText className="w-3 h-3" />
                            <span className="font-myanmar">ကိုယ်ပိုင် PDF</span>
                          </div>
                        )}
                        {book.telegramChannel && (
                          <div
                            title={`Telegram Channel: ${book.telegramChannel}`}
                            className="flex items-center gap-1 text-[10px] text-sky-200 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-400/40"
                          >
                            <Send className="w-2.5 h-2.5 -rotate-12 text-[#229ED9]" />
                            <span className="font-mono truncate max-w-[110px]">{book.telegramChannel}</span>
                          </div>
                        )}
                      </div>

                      {/* Center Book Title in Arabic */}
                      {book.titleAr && (
                        <div className="relative z-10 text-center py-2">
                          <p className="font-arabic text-lg sm:text-xl text-amber-100/90 leading-snug drop-shadow-xs line-clamp-2">
                            {renderHighlight(book.titleAr, searchQuery)}
                          </p>
                        </div>
                      )}

                      {/* Book Bottom details */}
                      <div className="relative z-10 flex items-center justify-between text-[11px] text-stone-200 border-t border-white/20 pt-2 font-mono">
                        <span className="font-myanmar flex items-center gap-1">
                          {book.mediaType === 'audio' || book.audioUrl ? (
                            <>
                              <Clock className="w-3 h-3 text-amber-300" />
                              <span>{book.audioDuration ? `${book.audioDuration} မိနစ်` : 'အသံဖိုင်'}</span>
                            </>
                          ) : (
                            `${toMyanmarDigits(book.totalPages)} မျက်နှာ`
                          )}
                        </span>
                        <span className="font-myanmar">
                          {book.mediaType === 'audio' || book.audioUrl
                            ? `နားဆင်မှု ${toMyanmarDigits(book.readCount)} ကြိမ်`
                            : `ဖတ်ရှုမှု ${toMyanmarDigits(book.readCount)} ကြိမ်`}
                        </span>
                      </div>
                    </div>

                    {/* Book Card Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        {/* Match Indication Badges when Searching */}
                        {q && (isTitleMatch || isAuthorMatch) && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isTitleMatch && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-900 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded font-myanmar">
                                <BookOpen className="w-2.5 h-2.5 text-emerald-700" />
                                <span>ခေါင်းစဉ်ကိုက်ညီ</span>
                              </span>
                            )}
                            {isAuthorMatch && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-900 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded font-myanmar">
                                <User className="w-2.5 h-2.5 text-amber-700" />
                                <span>စာရေးဆရာကိုက်ညီ</span>
                              </span>
                            )}
                          </div>
                        )}

                        <h3
                          onClick={() => handleBookClick(book)}
                          className="font-serif text-base font-bold text-stone-900 hover:text-emerald-800 cursor-pointer line-clamp-2 leading-snug"
                        >
                          {renderHighlight(book.titleMm, searchQuery)}
                        </h3>

                        {/* Unboxed text metadata */}
                        <div className="flex items-center gap-2 text-xs text-stone-500 font-myanmar flex-wrap">
                          <span className="text-stone-700 font-medium">
                            {renderHighlight(book.authorMm, searchQuery)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {book.publishedYear
                              ? `${toMyanmarDigits(book.publishedYear)} ခုနှစ်`
                              : 'အစ္စလာမ့်စာပေ'}
                          </span>
                        </div>

                        <p className="text-xs text-stone-600 font-myanmar line-clamp-2 leading-relaxed pt-1">
                          {book.descriptionMm}
                        </p>
                      </div>

                      {/* Card Action Button */}
                      <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5">
                        <button
                          onClick={() => handleBookClick(book)}
                          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 font-myanmar ${
                            isLocked
                              ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                              : book.mediaType === 'audio' || book.audioUrl
                              ? 'bg-violet-900 text-white hover:bg-violet-800 shadow-xs'
                              : 'bg-emerald-900 text-white hover:bg-emerald-800 shadow-xs'
                          }`}
                        >
                          {isLocked ? (
                            <>
                              <Lock className="w-3.5 h-3.5 text-amber-700" />
                              <span>မန်ဘာဝင်ပြီး {book.mediaType === 'audio' ? 'နားဆင်ရန်' : 'ဖတ်ရှုရန်'}</span>
                            </>
                          ) : book.mediaType === 'audio' || book.audioUrl ? (
                            <>
                              <Play className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                              <span>ဖွင့်နားဆင်မည်</span>
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                              <span>စာအုပ်ဖွင့်ဖတ်မည်</span>
                            </>
                          )}
                        </button>

                        {(book.mediaType === 'audio' || book.audioUrl) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
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
                            className="py-2 px-2.5 bg-violet-50 hover:bg-violet-100 text-violet-900 border border-violet-200 hover:border-violet-400 rounded-xl text-xs font-myanmar font-semibold flex items-center gap-1 transition-colors shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5 text-violet-700" />
                            <span className="hidden sm:inline">တန်းစီမည်</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="space-y-3">
              {filteredBooks.map((book) => {
                const isLocked = book.isMemberOnly && !currentUser;
                const q = searchQuery.toLowerCase().trim();
                const isTitleMatch =
                  Boolean(q) &&
                  (Boolean(book.titleMm?.toLowerCase().includes(q)) ||
                    Boolean(book.titleEn?.toLowerCase().includes(q)) ||
                    Boolean(book.titleAr?.toLowerCase().includes(q)));
                const isAuthorMatch =
                  Boolean(q) &&
                  (Boolean(book.authorMm?.toLowerCase().includes(q)) ||
                    Boolean(book.authorAr?.toLowerCase().includes(q)) ||
                    Boolean(book.uploaderName?.toLowerCase().includes(q)));

                return (
                  <div
                    key={book.id}
                    className={`bg-white rounded-2xl border p-4 transition-all hover:shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
                      q && (isTitleMatch || isAuthorMatch)
                        ? 'border-emerald-700/60 ring-1 ring-emerald-600/30'
                        : 'border-stone-200 hover:border-emerald-700/60'
                    }`}
                  >
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {/* Swatch Cover Badge */}
                      <div
                        onClick={() => handleBookClick(book)}
                        className={`w-16 h-20 rounded-xl bg-gradient-to-br ${book.coverColor} p-2 text-white shrink-0 flex flex-col justify-between cursor-pointer shadow-xs group-hover:scale-105 transition-transform`}
                      >
                        <span className="text-[9px] text-amber-200 font-medium truncate">
                          {book.categoryMm}
                        </span>
                        {book.titleAr ? (
                          <p className="font-arabic text-xs text-center text-amber-100 line-clamp-1">
                            {book.titleAr}
                          </p>
                        ) : book.mediaType === 'audio' || book.audioUrl ? (
                          <Headphones className="w-5 h-5 mx-auto text-amber-300 animate-pulse" />
                        ) : (
                          <BookOpen className="w-4 h-4 mx-auto text-amber-200/80" />
                        )}
                        <span className="text-[9px] font-mono text-stone-200 text-right">
                          {book.mediaType === 'audio' || book.audioUrl
                            ? (book.audioDuration || 'Audio')
                            : `${toMyanmarDigits(book.totalPages)}p`}
                        </span>
                      </div>

                      {/* Content Details */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            onClick={() => handleBookClick(book)}
                            className="font-serif text-base font-bold text-stone-900 hover:text-emerald-800 cursor-pointer leading-snug"
                          >
                            {renderHighlight(book.titleMm, searchQuery)}
                          </h3>

                          {/* Match Tag when searching in List View */}
                          {q && (isTitleMatch || isAuthorMatch) && (
                            <div className="flex items-center gap-1">
                              {isTitleMatch && (
                                <span className="text-[10px] font-semibold text-emerald-900 bg-emerald-50 border border-emerald-300 px-1.5 py-0.2 rounded font-myanmar">
                                  ခေါင်းစဉ်ကိုက်ညီ
                                </span>
                              )}
                              {isAuthorMatch && (
                                <span className="text-[10px] font-semibold text-amber-900 bg-amber-50 border border-amber-300 px-1.5 py-0.2 rounded font-myanmar">
                                  စာရေးဆရာကိုက်ညီ
                                </span>
                              )}
                            </div>
                          )}

                          {book.mediaType === 'audio' || book.audioUrl ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-violet-50 text-violet-900 border border-violet-300 font-semibold px-2 py-0.5 rounded font-myanmar">
                              <Headphones className="w-3 h-3 text-violet-700" />
                              <span>အသံဖိုင်</span>
                            </span>
                          ) : null}
                          {book.isMemberOnly && (
                            <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-300 font-semibold px-2 py-0.5 rounded font-myanmar">
                              မန်ဘာသီးသန့်
                            </span>
                          )}
                          {book.isUserUploaded && !book.audioUrl && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-900 border border-emerald-300 font-semibold px-2 py-0.5 rounded font-myanmar">
                              ကိုယ်ပိုင် PDF
                            </span>
                          )}
                          {book.telegramChannel && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-sky-50 text-sky-900 border border-sky-300 font-semibold px-2 py-0.5 rounded font-mono">
                              <Send className="w-2.5 h-2.5 -rotate-12 text-[#0088cc]" />
                              <span>{book.telegramChannel}</span>
                            </span>
                          )}
                        </div>

                        {book.titleAr && (
                          <p className="font-arabic text-xs text-emerald-800 line-clamp-1">
                            {renderHighlight(book.titleAr, searchQuery)}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-stone-500 font-myanmar flex-wrap">
                          <span className="text-stone-700 font-medium">
                            {renderHighlight(book.reciterOrSpeakerMm || book.authorMm, searchQuery)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-800 font-medium">{book.categoryMm}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {book.mediaType === 'audio' || book.audioUrl
                              ? `ကြာချိန် ${book.audioDuration || 'အသံဖိုင်'}`
                              : `${toMyanmarDigits(book.totalPages)} မျက်နှာ`}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {book.mediaType === 'audio' || book.audioUrl
                              ? `နားဆင်မှု ${toMyanmarDigits(book.readCount)} ကြိမ်`
                              : `ဖတ်ရှုမှု ${toMyanmarDigits(book.readCount)} ကြိမ်`}
                          </span>
                        </div>

                        <p className="text-xs text-stone-600 font-myanmar line-clamp-2 leading-relaxed pt-0.5">
                          {book.descriptionMm}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 w-full sm:w-auto pt-2 sm:pt-0 flex items-center gap-2">
                      <button
                        onClick={() => handleBookClick(book)}
                        className={`w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 font-myanmar ${
                          isLocked
                            ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                            : book.mediaType === 'audio' || book.audioUrl
                            ? 'bg-violet-900 text-white hover:bg-violet-800 shadow-xs'
                            : 'bg-emerald-900 text-white hover:bg-emerald-800 shadow-xs'
                        }`}
                      >
                        {isLocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-amber-700" />
                            <span>မန်ဘာဝင်ပြီး {book.mediaType === 'audio' ? 'နားဆင်ရန်' : 'ဖတ်ရှုရန်'}</span>
                          </>
                        ) : book.mediaType === 'audio' || book.audioUrl ? (
                          <>
                            <Play className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                            <span>နားဆင်မည်</span>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                            <span>ဖတ်ရှုမည်</span>
                          </>
                        )}
                      </button>

                      {(book.mediaType === 'audio' || book.audioUrl) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
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
                          className="px-3 py-2 bg-violet-50 hover:bg-violet-100 text-violet-900 border border-violet-200 hover:border-violet-400 rounded-xl text-xs font-myanmar font-semibold flex items-center gap-1 transition-colors shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5 text-violet-700" />
                          <span>တန်းစီမည်</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
