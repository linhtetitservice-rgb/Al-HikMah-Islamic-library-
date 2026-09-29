import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { BookItem, UserProfile } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialBooks';
import { toMyanmarDigits } from '../utils/islamicTimes';
import { DailyHadith } from './DailyHadith';

interface LibraryViewProps {
  books: BookItem[];
  currentUser: UserProfile | null;
  onOpenBook: (book: BookItem) => void;
  onOpenUploadModal: () => void;
  onRequireAuth: (actionDescription: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  currentUser,
  onOpenBook,
  onOpenUploadModal,
  onRequireAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterMembership, setFilterMembership] = useState<'all' | 'free' | 'member'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'pages'>('popular');

  // Filter books
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

        // Search text
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchTitle = book.titleMm.toLowerCase().includes(q);
          const matchAr = book.titleAr?.toLowerCase().includes(q) || false;
          const matchAuthor = book.authorMm.toLowerCase().includes(q);
          const matchDesc = book.descriptionMm.toLowerCase().includes(q);
          const matchCategory = book.categoryMm.toLowerCase().includes(q);
          return matchTitle || matchAr || matchAuthor || matchDesc || matchCategory;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.readCount - a.readCount;
        if (sortBy === 'pages') return b.totalPages - a.totalPages;
        return (b.publishedYear || '0').localeCompare(a.publishedYear || '0');
      });
  }, [books, selectedCategory, filterMembership, searchQuery, sortBy]);

  const handleBookClick = (book: BookItem) => {
    if (book.isMemberOnly && !currentUser) {
      onRequireAuth(`ဤ "${book.titleMm}" စာအုပ်ကို ဖတ်ရှုရန် မန်ဘာအကောင့်ဖြင့် ဝင်ရောက်ပေးပါ`);
      return;
    }
    onOpenBook(book);
  };

  // Find book in reading progress
  const inProgressBook = currentUser?.readingHistory?.[0]
    ? books.find((b) => b.id === currentUser.readingHistory[0].bookId)
    : null;

  return (
    <div className="space-y-10">
      {/* Editorial Curatorial Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c241b] via-[#123628] to-[#184433] text-white p-6 sm:p-10 shadow-lg border border-emerald-800/60">
        {/* Subtle geometric pattern overlay */}
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
            ကျမ်းမြတ်ကုရ်အာန် အနက်မြန်မာပြန်၊ ဆွဟီးဟ်ဟဒီးစ်တော်များ၊ နေ့စဉ်ဘဝဖိကာဟ်တရားတော်၊ ဇကာသ်လက်စွဲနှင့် အစ္စလာမ့်စာအုပ်/PDF များကို အွန်လိုင်းတွင် စနစ်တကျ ရှာဖွေဖတ်ရှုနိုင်ပါသည်။
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenUploadModal}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <Upload className="w-4 h-4 text-stone-950" />
              <span className="font-myanmar">စာအုပ် / PDF အသစ်တင်မည်</span>
            </button>

            {inProgressBook && currentUser && (
              <button
                onClick={() => onOpenBook(inProgressBook)}
                className="px-4 py-2 bg-emerald-900/80 hover:bg-emerald-800 text-amber-200 border border-emerald-700/80 text-xs rounded-lg transition-colors flex items-center gap-2 font-myanmar"
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

      {/* Search and Interactive Filter Bar */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="စာအုပ်အမည်၊ ကျမ်းပြုဆရာ၊ အကြောင်းအရာ ရှာဖွေရန်..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/40 focus:border-emerald-700 font-myanmar shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 font-mono"
              >
                ✕
              </button>
            )}
          </div>

          {/* Secondary Controls: Membership Filter & Sort */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Membership Segmented Controls (Interactive buttons conforming to Zero-Pill rule) */}
            <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg text-xs font-myanmar">
              <button
                onClick={() => setFilterMembership('all')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  filterMembership === 'all'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                အားလုံး
              </button>
              <button
                onClick={() => setFilterMembership('free')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  filterMembership === 'free'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                အခမဲ့ဖတ်ရှုခွင့်
              </button>
              <button
                onClick={() => setFilterMembership('member')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  filterMembership === 'member'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                မန်ဘာသီးသန့်
              </button>
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-myanmar shadow-2xs"
            >
              <option value="popular">လူကြိုက်အများဆုံး</option>
              <option value="newest">နောက်ဆုံးတင်ထားသော</option>
              <option value="pages">စာမျက်နှာအရေအတွက်</option>
            </select>
          </div>
        </div>

        {/* Category Tabs (Segmented functional buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {INITIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap shrink-0 font-myanmar ${
                selectedCategory === cat.id
                  ? 'bg-emerald-900 text-white font-medium shadow-xs'
                  : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              {cat.nameMm}
            </button>
          ))}
        </div>
      </section>

      {/* Book Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between text-xs text-stone-500 font-myanmar">
          <span>
            တွေ့ရှိသော စာအုပ် စုစုပေါင်း ({toMyanmarDigits(filteredBooks.length)}) အုပ်
          </span>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-emerald-800 hover:underline"
            >
              ကဏ္ဍအားလုံး ပြန်ကြည့်ရန်
            </button>
          )}
        </div>

        {filteredBooks.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-base font-semibold text-stone-800 font-myanmar">
              ရှာဖွေမှုနှင့် ကိုက်ညီသော စာအုပ် မတွေ့ရှိပါ
            </h3>
            <p className="text-xs text-stone-500 font-myanmar max-w-sm mx-auto">
              အခြားသော သော့ချက်စကားလုံး သို့မဟုတ် ကဏ္ဍကို ရွေးချယ်ရှာဖွေကြည့်ပါ သို့မဟုတ် သင်ကိုယ်တိုင် စာအုပ်/PDF တင်သွင်းဖတ်ရှုနိုင်ပါသည်။
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setFilterMembership('all');
              }}
              className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-xs font-myanmar text-stone-800 rounded-lg transition-colors"
            >
              ရှာဖွေမှု ပြန်လည်ရှင်းလင်းရန်
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => {
              const isLocked = book.isMemberOnly && !currentUser;

              return (
                <div
                  key={book.id}
                  className="bg-white rounded-xl border border-stone-200 hover:border-emerald-700/60 transition-all hover:shadow-md flex flex-col group overflow-hidden"
                >
                  {/* Book Card Cover: Islamic Craftsmanship Styling with Fallback Container */}
                  <div
                    onClick={() => handleBookClick(book)}
                    className={`h-48 cursor-pointer relative overflow-hidden bg-gradient-to-br ${book.coverColor} p-5 flex flex-col justify-between text-white transition-transform group-hover:scale-[1.01]`}
                  >
                    {/* Arabesque geometric lattice background watermark */}
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]"></div>

                    {/* Book Top Info */}
                    <div className="relative z-10 flex items-start justify-between gap-2">
                      <span className="text-[11px] font-sans tracking-wide text-amber-200/90 font-medium truncate">
                        {book.categoryMm}
                      </span>
                      {book.isMemberOnly && (
                        <div
                          title="သီးသန့် မန်ဘာဝင်ဖတ်ရှုခွင့်"
                          className="flex items-center gap-1 text-[10px] text-amber-300 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded border border-amber-400/30"
                        >
                          <Lock className="w-3 h-3 text-amber-300" />
                          <span className="font-myanmar">မန်ဘာသီးသန့်</span>
                        </div>
                      )}
                      {book.isUserUploaded && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-400/40">
                          <FileText className="w-3 h-3" />
                          <span className="font-myanmar">ကိုယ်ပိုင် PDF</span>
                        </div>
                      )}
                    </div>

                    {/* Center Book Title in Arabic if present */}
                    {book.titleAr && (
                      <div className="relative z-10 text-center py-2">
                        <p className="font-arabic text-lg sm:text-xl text-amber-100/90 leading-snug drop-shadow-xs line-clamp-2">
                          {book.titleAr}
                        </p>
                      </div>
                    )}

                    {/* Book Bottom details */}
                    <div className="relative z-10 flex items-center justify-between text-[11px] text-stone-200 border-t border-white/20 pt-2">
                      <span className="font-myanmar">{toMyanmarDigits(book.totalPages)} မျက်နှာ</span>
                      <span className="font-myanmar">
                        ဖတ်ရှုမှု {toMyanmarDigits(book.readCount)} ကြိမ်
                      </span>
                    </div>
                  </div>

                  {/* Book Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <h3
                        onClick={() => handleBookClick(book)}
                        className="font-serif text-base font-bold text-stone-900 hover:text-emerald-800 cursor-pointer line-clamp-2 leading-snug"
                      >
                        {book.titleMm}
                      </h3>

                      {/* ZERO-PILL METADATA DISCIPLINE: Unboxed text with · separators */}
                      <div className="flex items-center gap-2 text-xs text-stone-500 font-myanmar flex-wrap">
                        <span className="text-stone-700 font-medium">{book.authorMm}</span>
                        <span aria-hidden="true">·</span>
                        <span>{book.publishedYear ? `${toMyanmarDigits(book.publishedYear)} ခုနှစ်` : 'အစ္စလာမ့်စာပေ'}</span>
                      </div>

                      <p className="text-xs text-stone-600 font-myanmar line-clamp-2 leading-relaxed pt-1">
                        {book.descriptionMm}
                      </p>
                    </div>

                    {/* Card Action Button */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <button
                        onClick={() => handleBookClick(book)}
                        className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 font-myanmar ${
                          isLocked
                            ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                            : 'bg-emerald-900 text-white hover:bg-emerald-800'
                        }`}
                      >
                        {isLocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-amber-700" />
                            <span>မန်ဘာဝင်ပြီး ဖတ်ရှုရန်</span>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                            <span>စာအုပ်ဖွင့်ဖတ်မည်</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
