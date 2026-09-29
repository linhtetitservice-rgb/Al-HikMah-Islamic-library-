import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  X,
  BookOpen,
  Heart,
  Quote,
  Shuffle,
  Sun,
} from 'lucide-react';
import { DAILY_WISDOM_LIST } from '../data/dailyWisdom';
import { UserProfile, WisdomItem } from '../types';
import { toMyanmarDigits } from '../utils/islamicTimes';

interface DailyWisdomProps {
  currentUser?: UserProfile | null;
  onClose?: () => void;
  isModal?: boolean;
}

export const DailyWisdom: React.FC<DailyWisdomProps> = ({
  currentUser,
  onClose,
  isModal = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    // Deterministic starting quote based on day of month
    const day = new Date().getDate();
    return day % DAILY_WISDOM_LIST.length;
  });
  const [copied, setCopied] = useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const currentWisdom: WisdomItem = DAILY_WISDOM_LIST[currentIndex] || DAILY_WISDOM_LIST[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % DAILY_WISDOM_LIST.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + DAILY_WISDOM_LIST.length) % DAILY_WISDOM_LIST.length);
  };

  const handleShuffle = () => {
    let next = Math.floor(Math.random() * DAILY_WISDOM_LIST.length);
    if (next === currentIndex && DAILY_WISDOM_LIST.length > 1) {
      next = (currentIndex + 1) % DAILY_WISDOM_LIST.length;
    }
    setCurrentIndex(next);
  };

  // Optional auto-rotation if enabled
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DAILY_WISDOM_LIST.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleCopy = () => {
    const textToCopy = `【 နေ့စဉ် အစ္စလာမ့် ဓမ္မဩဝါဒ (Daily Wisdom) 】\nခေါင်းစဉ်: ${currentWisdom.themeMm}\n\n${currentWisdom.quoteAr}\n\n"${currentWisdom.quoteMm}"\n\n— ${currentWisdom.sourceMm}\n\n💡 ဆင်ခြင်ဖွယ်ရာ:\n${currentWisdom.reflectionMm}\n\n- Al-Hikmah အစ္စလာမ့်စာကြည့်တိုက်`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const content = (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c241b] via-[#123628] to-[#184232] text-white p-6 sm:p-8 shadow-2xl border border-emerald-700/60 flex flex-col justify-between">
      {/* Decorative Islamic Geometric Lattice Background */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(#f7d070_1.5px,transparent_1.5px)] [background-size:16px_16px]" />

      {/* Top Banner Row */}
      <div className="relative z-10 flex items-start justify-between gap-4 border-b border-emerald-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-400/20 text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <span className="text-[11px] uppercase tracking-wider text-amber-300 font-sans font-semibold">
              အစ္စလာမ့် ဓမ္မဩဝါဒတော် (Daily Wisdom)
            </span>
            <span className="text-emerald-400 font-arabic text-xs hidden sm:inline">
              الحكمة اليومية
            </span>
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-bold text-white font-myanmar">
            {currentUser ? `အဆ္စလာမုအလိုင်းကုမ်၊ ${currentUser.name}` : 'မင်္ဂလာရှိသော နေ့ရက်ဖြစ်ပါစေ'}
          </h3>
          <p className="text-xs text-emerald-200/90 font-myanmar">
            {currentWisdom.themeMm}
          </p>
        </div>

        {/* Close Button if in modal */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white transition-colors"
            title="ပိတ်ရန်"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Quote Canvas */}
      <div className="relative z-10 py-6 space-y-5">
        {/* Arabic Matn Calligraphy */}
        <div className="p-4 sm:p-5 rounded-xl bg-black/25 backdrop-blur-xs border border-emerald-500/20 text-right space-y-1">
          <p className="font-arabic text-xl sm:text-2xl lg:text-3xl text-amber-200 leading-loose sm:leading-loose text-center">
            {currentWisdom.quoteAr}
          </p>
        </div>

        {/* Burmese Translation with editorial quotes */}
        <div className="relative pl-4 border-l-2 border-amber-400/80 py-1">
          <p className="font-serif text-base sm:text-lg text-white font-myanmar leading-relaxed">
            "{currentWisdom.quoteMm}"
          </p>
        </div>

        {/* ZERO-PILL METADATA: Unboxed text with subtle typographic separators */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-300 font-myanmar">
          <span className="text-amber-300 font-semibold">{currentWisdom.sourceMm}</span>
          <span aria-hidden="true">·</span>
          <span>
            {currentWisdom.sourceType === 'quran'
              ? 'ကျမ်းမြတ်ကုရ်အာန် အာယသ်တော်'
              : currentWisdom.sourceType === 'hadith'
              ? 'တမန်တော်မြတ် ﷺ ဟဒီးစ်တော်'
              : 'အစ္စလာမ့်ဓမ္မပညာရှင် ဩဝါဒ'}
          </span>
          <span aria-hidden="true">·</span>
          <span>ဩဝါဒအမှတ် ({toMyanmarDigits(currentIndex + 1)} / {toMyanmarDigits(DAILY_WISDOM_LIST.length)})</span>
        </div>

        {/* Practical Spiritual Reflection Callout */}
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-600/30 text-xs text-stone-200 font-myanmar leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <Heart className="w-3.5 h-3.5 text-amber-400" />
            <span>ယနေ့အတွက် နှလုံးသွင်းဆင်ခြင်ရန် (Spiritual Reflection):</span>
          </div>
          <p className="text-emerald-100/90 pl-5">
            {currentWisdom.reflectionMm}
          </p>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-10 pt-4 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 hover:text-white transition-colors border border-emerald-800"
            title="ရှေ့ ဩဝါဒ"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs text-emerald-300 font-mono px-1">
            {toMyanmarDigits(currentIndex + 1)} / {toMyanmarDigits(DAILY_WISDOM_LIST.length)}
          </span>

          <button
            onClick={handleNext}
            className="p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 hover:text-white transition-colors border border-emerald-800"
            title="နောက် ဩဝါဒ"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleShuffle}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 text-xs font-myanmar transition-colors border border-emerald-800 flex items-center gap-1"
            title="ကျပန်း ရွေးချယ်ဖတ်ရှုရန်"
          >
            <Shuffle className="w-3 h-3 text-amber-300" />
            <span className="hidden sm:inline">ကျပန်း</span>
          </button>
        </div>

        {/* Copy & Close Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-myanmar transition-colors flex items-center gap-1.5 border border-emerald-700/60"
            title="ဩဝါဒတော်ကို ကူးယူမျှဝေရန်"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-amber-300" />
                <span>ကူးယူပြီးပါပြီ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>ကူးယူမည်</span>
              </>
            )}
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold font-myanmar transition-colors shadow-xs"
            >
              စာကြည့်တိုက်သို့ ဝင်မည်
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl">
        {content}
      </div>
    </div>
  );
};
