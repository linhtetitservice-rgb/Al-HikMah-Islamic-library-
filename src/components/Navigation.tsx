import React from 'react';
import { BookOpen, Upload, User, LogIn, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface NavigationProps {
  activeTab: 'library' | 'fatwa' | 'zakat' | 'prayer';
  onSelectTab: (tab: 'library' | 'fatwa' | 'zakat' | 'prayer') => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenUploadModal: () => void;
  onOpenDailyWisdom?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onOpenAuthModal,
  onOpenUploadModal,
  onOpenDailyWisdom,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single element brand wordmark */}
        <button
          onClick={() => onSelectTab('library')}
          className="text-left font-serif text-xl sm:text-2xl font-bold tracking-tight text-emerald-950 flex items-center gap-2"
        >
          <span className="font-display">Al-Hikmah</span>
          <span className="font-myanmar text-base sm:text-lg font-semibold text-emerald-800">
            စာကြည့်တိုက်
          </span>
        </button>

        {/* Zone 2: 4 clean text navigation links with subtle underline/active state */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => onSelectTab('library')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 font-myanmar ${
              activeTab === 'library'
                ? 'border-emerald-700 text-emerald-900 font-semibold'
                : 'border-transparent text-stone-600 hover:text-emerald-900 hover:border-stone-300'
            }`}
          >
            စာအုပ်စင်
          </button>

          <button
            onClick={() => onSelectTab('fatwa')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 font-myanmar ${
              activeTab === 'fatwa'
                ? 'border-emerald-700 text-emerald-900 font-semibold'
                : 'border-transparent text-stone-600 hover:text-emerald-900 hover:border-stone-300'
            }`}
          >
            ဖသ်ဝါဌာန
          </button>

          <button
            onClick={() => onSelectTab('zakat')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 font-myanmar ${
              activeTab === 'zakat'
                ? 'border-emerald-700 text-emerald-900 font-semibold'
                : 'border-transparent text-stone-600 hover:text-emerald-900 hover:border-stone-300'
            }`}
          >
            ဇကာသ်တွက်စက်
          </button>

          <button
            onClick={() => onSelectTab('prayer')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 font-myanmar ${
              activeTab === 'prayer'
                ? 'border-emerald-700 text-emerald-900 font-semibold'
                : 'border-transparent text-stone-600 hover:text-emerald-900 hover:border-stone-300'
            }`}
          >
            နမားဇ်ပြက္ခဒိန်
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {currentUser && onOpenDailyWisdom && (
            <button
              onClick={onOpenDailyWisdom}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="ယနေ့အတွက် အစ္စလာမ့် ဓမ္မဩဝါဒတော်ကို ဖတ်ရှုရန်"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-myanmar hidden md:inline">ဓမ္မဩဝါဒ</span>
            </button>
          )}

          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-myanmar hidden sm:inline">စာအုပ်တင်ရန်</span>
            <span className="font-myanmar sm:hidden">တင်ရန်</span>
          </button>

          {currentUser ? (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-800 text-amber-200 text-[10px] font-semibold flex items-center justify-center">
                {currentUser.avatarInitials}
              </div>
              <span className="font-myanmar hidden sm:inline max-w-[100px] truncate">
                {currentUser.name}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-myanmar">မန်ဘာဝင်ရန်</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile subnav tabs */}
      <div className="md:hidden flex items-center justify-around border-t border-stone-200/80 px-2 py-1.5 bg-stone-50 text-xs font-myanmar">
        <button
          onClick={() => onSelectTab('library')}
          className={`px-2 py-1 rounded transition-colors ${
            activeTab === 'library' ? 'bg-emerald-900 text-white font-medium' : 'text-stone-600'
          }`}
        >
          စာအုပ်စင်
        </button>
        <button
          onClick={() => onSelectTab('fatwa')}
          className={`px-2 py-1 rounded transition-colors ${
            activeTab === 'fatwa' ? 'bg-emerald-900 text-white font-medium' : 'text-stone-600'
          }`}
        >
          ဖသ်ဝါဌာန
        </button>
        <button
          onClick={() => onSelectTab('zakat')}
          className={`px-2 py-1 rounded transition-colors ${
            activeTab === 'zakat' ? 'bg-emerald-900 text-white font-medium' : 'text-stone-600'
          }`}
        >
          ဇကာသ်
        </button>
        <button
          onClick={() => onSelectTab('prayer')}
          className={`px-2 py-1 rounded transition-colors ${
            activeTab === 'prayer' ? 'bg-emerald-900 text-white font-medium' : 'text-stone-600'
          }`}
        >
          နမားဇ်အချိန်
        </button>
      </div>
    </header>
  );
};
