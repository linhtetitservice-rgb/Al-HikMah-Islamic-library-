import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Shuffle,
  Copy,
  Check,
  Share2,
  Calendar,
  BookOpen,
  Quote,
  Lightbulb,
  RotateCcw,
} from 'lucide-react';
import { DAILY_HADITHS } from '../data/dailyHadiths';
import { HadithItem } from '../types';
import { toMyanmarDigits } from '../utils/islamicTimes';

interface DailyHadithProps {
  onExploreHadithCategory?: () => void;
}

export const DailyHadith: React.FC<DailyHadithProps> = ({
  onExploreHadithCategory,
}) => {
  // Deterministic daily index based on Gregorian day of year
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const defaultDailyIndex = dayOfYear % DAILY_HADITHS.length;

  const [currentIndex, setCurrentIndex] = useState<number>(defaultDailyIndex);
  const [copied, setCopied] = useState<boolean>(false);
  const [showReflection, setShowReflection] = useState<boolean>(true);

  const currentHadith: HadithItem = DAILY_HADITHS[currentIndex] || DAILY_HADITHS[0];
  const isTodayHadith = currentIndex === defaultDailyIndex;

  // Shuffle to another random Hadith
  const handleShuffle = () => {
    let nextIndex = Math.floor(Math.random() * DAILY_HADITHS.length);
    if (nextIndex === currentIndex && DAILY_HADITHS.length > 1) {
      nextIndex = (currentIndex + 1) % DAILY_HADITHS.length;
    }
    setCurrentIndex(nextIndex);
  };

  // Reset to today's Hadith
  const handleResetToday = () => {
    setCurrentIndex(defaultDailyIndex);
  };

  // Copy Hadith
  const handleCopy = () => {
    const textToCopy = `【 နေ့စဉ် ဟဒီးစ်တော်နှင့် ဆင်ခြင်ဖွယ်ရာ 】\nခေါင်းစဉ်: ${currentHadith.topicMm}\n\n${currentHadith.hadithAr}\n\nမြန်မာပြန်:\n"${currentHadith.hadithMm}"\n\n- ဆင့်ပြန်သူ: ${currentHadith.narratorMm}\n- ကျမ်းကိုး: ${currentHadith.sourceBookMm} (${currentHadith.hadithNumber || ''})\n\n💡 ဓမ္မဆင်ခြင်ဖွယ်ရာ:\n${currentHadith.reflectionMm}\n\n- Al-Hikmah အစ္စလာမ့်စာကြည့်တိုက်`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FCFAF6] via-[#FAF7F0] to-[#F5F0E6] border border-amber-900/15 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Decorative subtle arabesque background corner */}
      <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.03] pointer-events-none bg-[radial-gradient(#123628_1.5px,transparent_1.5px)] [background-size:12px_12px]" />

      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-900/10 text-emerald-800 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-800" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-amber-900/80 font-sans font-semibold flex items-center gap-1.5">
              <span>နေ့စဉ် ဟဒီးစ်တော် သွန်သင်ချက်</span>
              <span aria-hidden="true">·</span>
              <span className="font-arabic text-xs">الحديث اليومي</span>
            </div>
            <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900 font-myanmar">
              {currentHadith.topicMm}
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!isTodayHadith && (
            <button
              onClick={handleResetToday}
              className="px-2.5 py-1 text-xs text-emerald-800 hover:text-emerald-950 font-myanmar hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 border border-emerald-200/80"
              title="ယနေ့အတွက် သတ်မှတ်ထားသော ဟဒီးစ်တော်သို့ ပြန်သွားရန်"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ယနေ့ ဟဒီးစ်</span>
            </button>
          )}

          <button
            onClick={handleShuffle}
            className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs font-myanmar whitespace-nowrap"
            title="အခြားသော ဟဒီးစ်တော်တစ်ပုဒ်ကို ဖတ်ရှုဆင်ခြင်ရန်"
          >
            <Shuffle className="w-3.5 h-3.5 text-emerald-800" />
            <span>အခြား ဟဒီးစ်တော်ဖတ်မည်</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 text-stone-600 hover:text-emerald-900 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg transition-colors shadow-2xs"
            title="ဟဒီးစ်တော်ကို ကူးယူမျှဝေရန်"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Hadith Content Area */}
      <div className="space-y-4">
        {/* Arabic Matn Text (Centered or Right-aligned with Classical Amiri font) */}
        <div className="p-4 sm:p-5 rounded-xl bg-white/80 border border-amber-900/10 text-right space-y-1">
          <p className="font-arabic text-xl sm:text-2xl text-emerald-950 leading-loose sm:leading-loose drop-shadow-2xs">
            {currentHadith.hadithAr}
          </p>
          {currentHadith.narratorAr && (
            <p className="font-arabic text-xs text-stone-500">
              {currentHadith.narratorAr}
            </p>
          )}
        </div>

        {/* Burmese Translation */}
        <div className="relative pl-4 border-l-2 border-emerald-700/60 py-1">
          <p className="font-serif text-base sm:text-lg text-stone-900 leading-relaxed font-myanmar">
            "{currentHadith.hadithMm}"
          </p>
        </div>

        {/* ZERO-PILL METADATA: Unboxed text with · separators */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-myanmar pt-1">
          <span className="text-stone-700 font-medium">ဆင့်ပြန်သူ: {currentHadith.narratorMm}</span>
          <span aria-hidden="true">·</span>
          <span>ကျမ်းကိုး: {currentHadith.sourceBookMm}</span>
          {currentHadith.hadithNumber && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-stone-600">[{currentHadith.hadithNumber}]</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span className="text-emerald-800 font-medium">ဆွဟီးဟ် (စစ်မှန်သော ဟဒီးစ်)</span>
        </div>
      </div>

      {/* Daily Reflection Callout Box */}
      <div className="p-4 rounded-xl bg-emerald-950/[0.04] border border-emerald-800/15 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-950 font-myanmar">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
            <span>ယနေ့အတွက် ဓမ္မဆင်ခြင်ဖွယ်ရာနှင့် သင်ခန်းစာ (Reflection & Practical Takeaway)</span>
          </div>

          <button
            onClick={() => setShowReflection(!showReflection)}
            className="text-[11px] text-stone-400 hover:text-stone-700 font-myanmar"
          >
            {showReflection ? 'ဝှက်ရန်' : 'ဖတ်ရန်'}
          </button>
        </div>

        {showReflection && (
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-myanmar pt-0.5">
            {currentHadith.reflectionMm}
          </p>
        )}
      </div>
    </section>
  );
};
