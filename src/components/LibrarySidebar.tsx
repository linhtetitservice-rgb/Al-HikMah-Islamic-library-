import React from 'react';
import {
  BookOpen,
  BookMarked,
  Scale,
  Compass,
  Heart,
  Sparkles,
  Coins,
  Layers,
  Headphones,
  X,
  RotateCcw,
  Check,
  Lock,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { toMyanmarDigits } from '../utils/islamicTimes';

export interface LibrarySidebarProps {
  categories: Array<{ id: string; nameMm: string; nameEn: string }>;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  filterMembership: 'all' | 'free' | 'member';
  onSelectMembership: (filter: 'all' | 'free' | 'member') => void;
  pageLengthFilter: 'all' | 'short' | 'medium' | 'long';
  onSelectPageLength: (filter: 'all' | 'short' | 'medium' | 'long') => void;
  showOnlyUserUploads: boolean;
  onToggleUserUploads: (val: boolean) => void;
  bookCountsByCategory: Record<string, number>;
  totalBooksCount: number;
  onResetFilters: () => void;
  isFilterActive: boolean;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

// Category Icons & Metadata mapping
const CATEGORY_META: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    arLabel: string;
    descriptionMm: string;
    accentColor: string;
  }
> = {
  all: {
    icon: Layers,
    arLabel: 'جميع الكتب والمخطوطات',
    descriptionMm: 'စာအုပ်အားလုံး ကြည့်ရှုရန်',
    accentColor: 'text-stone-700',
  },
  audio: {
    icon: Headphones,
    arLabel: 'التلاوات والمحاضرات الصوتية',
    descriptionMm: 'ကုရ်အာန်နှင့် တရားတော် အသံဖိုင်များ',
    accentColor: 'text-violet-700',
  },
  quran: {
    icon: BookOpen,
    arLabel: 'التفسير وعلوم القرآن',
    descriptionMm: 'ကုရ်အာန်၊ သဖ်စီးရ်၊ အာယသ်တော်များ',
    accentColor: 'text-emerald-700',
  },
  hadith: {
    icon: BookMarked,
    arLabel: 'الحديث النبوي الشريف',
    descriptionMm: 'ဆွဟီးဟ်ဟဒီးစ်၊ သြဝါဒတော်များ',
    accentColor: 'text-blue-700',
  },
  fiqh: {
    icon: Scale,
    arLabel: 'الفقه الإسلامي والأحكام',
    descriptionMm: 'နမားဇ်၊ ဝုဇူ၊ နေ့စဉ် ဓမ္မသတ်ပညတ်',
    accentColor: 'text-amber-700',
  },
  seerah: {
    icon: Compass,
    arLabel: 'السيرة النبوية والتاريخ',
    descriptionMm: 'တမန်တော်မြတ်နှင့် သာဝကကြီးများ',
    accentColor: 'text-emerald-800',
  },
  akhlaq: {
    icon: Heart,
    arLabel: 'الأخلاق والآداب الإسلامية',
    descriptionMm: 'အကျင့်စာရိတ္တ၊ မိသားစုကျင့်ဝတ်',
    accentColor: 'text-rose-700',
  },
  duas: {
    icon: Sparkles,
    arLabel: 'الأذكار والأدعية المأثورة',
    descriptionMm: 'နေ့စဉ်ဒိုအာ၊ နံနက်ညနေ ဇိကိရ်များ',
    accentColor: 'text-teal-700',
  },
  zakat: {
    icon: Coins,
    arLabel: 'الزكاة والمعاملات المالية',
    descriptionMm: 'နိဆွာဗ်၊ စီးပွားရေးနှင့် အလှူဒါန',
    accentColor: 'text-yellow-700',
  },
};

export const LibrarySidebar: React.FC<LibrarySidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  filterMembership,
  onSelectMembership,
  pageLengthFilter,
  onSelectPageLength,
  showOnlyUserUploads,
  onToggleUserUploads,
  bookCountsByCategory,
  totalBooksCount,
  onResetFilters,
  isFilterActive,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  return (
    <aside
      className={`bg-white rounded-2xl border border-stone-200/90 shadow-xs flex flex-col ${
        isMobileDrawer ? 'p-5 h-full overflow-y-auto' : 'p-5 sticky top-20'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 text-amber-300 flex items-center justify-center shadow-xs">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-sm font-myanmar leading-tight">
              စာအုပ်ကဏ္ဍနှင့် စစ်ထုတ်မှု
            </h3>
            <span className="text-[11px] text-stone-500 font-arabic">تصنيفات الكتب والمراجع</span>
          </div>
        </div>

        {isMobileDrawer ? (
          <button
            onClick={onCloseMobileDrawer}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          isFilterActive && (
            <button
              onClick={onResetFilters}
              title="စစ်ထုတ်မှု အားလုံးကို မူလအတိုင်း ပြန်ထားရန်"
              className="flex items-center gap-1 text-[11px] text-amber-900 hover:text-amber-950 font-myanmar bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-amber-700" />
              <span>ပြန်လည်ရှင်းရန်</span>
            </button>
          )
        )}
      </div>

      {/* Main Categories Section */}
      <div className="py-4 space-y-2 border-b border-stone-100">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-500 font-myanmar uppercase tracking-wider px-1">
          <span>ဘာသာရပ် ကဏ္ဍများ</span>
          <span className="text-[10px] font-mono text-stone-400">
            ({toMyanmarDigits(totalBooksCount)} အုပ်)
          </span>
        </div>

        <nav className="space-y-1 pt-1" aria-label="Book Categories Navigation">
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat.id] || {
              icon: BookOpen,
              arLabel: cat.nameEn,
              descriptionMm: cat.nameMm,
              accentColor: 'text-emerald-700',
            };
            const Icon = meta.icon;
            const isSelected = selectedCategory === cat.id;
            const count =
              cat.id === 'all'
                ? totalBooksCount
                : bookCountsByCategory[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  if (isMobileDrawer && onCloseMobileDrawer) {
                    onCloseMobileDrawer();
                  }
                }}
                className={`w-full text-left rounded-xl px-3 py-2.5 transition-all flex items-center justify-between group relative ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-950 to-[#0e271d] text-white shadow-sm ring-1 ring-emerald-800'
                    : 'hover:bg-stone-50 text-stone-700 hover:text-stone-900'
                }`}
              >
                {/* Active Indicator Bar on left */}
                {isSelected && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-amber-400 rounded-r-md"></span>
                )}

                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-emerald-800/80 text-amber-300'
                        : 'bg-stone-100 text-stone-600 group-hover:bg-emerald-50 group-hover:text-emerald-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-myanmar truncate leading-tight ${
                        isSelected ? 'font-semibold text-white' : 'font-medium text-stone-800'
                      }`}
                    >
                      {cat.nameMm}
                    </p>
                    <span
                      className={`text-[10px] font-arabic block truncate leading-none mt-0.5 ${
                        isSelected ? 'text-amber-200/80' : 'text-stone-400 group-hover:text-stone-600'
                      }`}
                    >
                      {meta.arLabel}
                    </span>
                  </div>
                </div>

                {/* Count Badge */}
                <span
                  className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-emerald-800/90 text-amber-200'
                      : 'bg-stone-100 text-stone-500 group-hover:bg-stone-200 group-hover:text-stone-700'
                  }`}
                >
                  {toMyanmarDigits(count)}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Access / Membership Rights Filter */}
      <div className="py-4 space-y-2 border-b border-stone-100">
        <label className="text-xs font-semibold text-stone-500 font-myanmar uppercase tracking-wider block px-1">
          ဝင်ရောက်ဖတ်ရှုခွင့်
        </label>
        <div className="grid grid-cols-1 gap-1.5 font-myanmar text-xs">
          <button
            onClick={() => onSelectMembership('all')}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
              filterMembership === 'all'
                ? 'bg-stone-100 text-stone-900 font-semibold'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span>စာအုပ်အားလုံး</span>
            {filterMembership === 'all' && <Check className="w-3.5 h-3.5 text-emerald-800" />}
          </button>

          <button
            onClick={() => onSelectMembership('free')}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
              filterMembership === 'free'
                ? 'bg-stone-100 text-stone-900 font-semibold'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span>အခမဲ့ ဖတ်ရှုခွင့်ရှိသော</span>
            {filterMembership === 'free' && <Check className="w-3.5 h-3.5 text-emerald-800" />}
          </button>

          <button
            onClick={() => onSelectMembership('member')}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
              filterMembership === 'member'
                ? 'bg-stone-100 text-stone-900 font-semibold'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-amber-700" />
              <span>မန်ဘာသီးသန့် စာအုပ်များ</span>
            </span>
            {filterMembership === 'member' && <Check className="w-3.5 h-3.5 text-emerald-800" />}
          </button>
        </div>
      </div>

      {/* Page Length / Depth Filter */}
      <div className="py-4 space-y-2 border-b border-stone-100">
        <label className="text-xs font-semibold text-stone-500 font-myanmar uppercase tracking-wider block px-1">
          စာမျက်နှာ ပမာဏ
        </label>
        <div className="grid grid-cols-2 gap-1.5 font-myanmar text-xs">
          <button
            onClick={() => onSelectPageLength('all')}
            className={`px-2.5 py-1.5 rounded-lg border text-center transition-colors ${
              pageLengthFilter === 'all'
                ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-semibold'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            အားလုံး
          </button>
          <button
            onClick={() => onSelectPageLength('short')}
            className={`px-2.5 py-1.5 rounded-lg border text-center transition-colors ${
              pageLengthFilter === 'short'
                ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-semibold'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            လက်ကမ်း (&lt; ၄၀)
          </button>
          <button
            onClick={() => onSelectPageLength('medium')}
            className={`px-2.5 py-1.5 rounded-lg border text-center transition-colors ${
              pageLengthFilter === 'medium'
                ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-semibold'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            အလယ်အလတ် (၄၀-၇၀)
          </button>
          <button
            onClick={() => onSelectPageLength('long')}
            className={`px-2.5 py-1.5 rounded-lg border text-center transition-colors ${
              pageLengthFilter === 'long'
                ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-semibold'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            ကျမ်းကြီးများ (&gt; ၇၀)
          </button>
        </div>
      </div>

      {/* User Uploads Filter Switch */}
      <div className="pt-4 pb-2">
        <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-stone-50 transition-colors">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-xs font-myanmar text-stone-800 font-medium">
              မိမိတင်ထားသော PDF သီးသန့်
            </span>
          </div>
          <input
            type="checkbox"
            checked={showOnlyUserUploads}
            onChange={(e) => onToggleUserUploads(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 border-stone-300"
          />
        </label>
      </div>

      {/* Clear All Filters Button at bottom if active */}
      {isFilterActive && (
        <div className="pt-3 mt-2 border-t border-stone-100">
          <button
            onClick={onResetFilters}
            className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-myanmar font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
            <span>စစ်ထုတ်မှု အားလုံး ရှင်းလင်းရန်</span>
          </button>
        </div>
      )}
    </aside>
  );
};
