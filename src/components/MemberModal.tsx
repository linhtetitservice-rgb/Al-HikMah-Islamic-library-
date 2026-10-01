import React, { useState } from 'react';
import {
  X,
  User,
  LogIn,
  UserPlus,
  Bookmark,
  Clock,
  Edit3,
  BookOpen,
  LogOut,
  ShieldCheck,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { BookItem, UserProfile } from '../types';
import { toMyanmarDigits } from '../utils/islamicTimes';
import { DailyWisdom } from './DailyWisdom';
import { signInWithGoogle } from '../services/firebase';

interface MemberModalProps {
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onClose: () => void;
  onOpenBookFromBookmark: (bookId: string, page: number) => void;
  books: BookItem[];
  promptMessage?: string;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onClose,
  onOpenBookFromBookmark,
  books,
  promptMessage,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'profile' | 'bookmarks' | 'history' | 'notes' | 'wisdom'>('profile');

  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'member' | 'student' | 'scholar'>('member');
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Handle Google Sign-In with Firebase
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSigningIn(true);
      setAuthError(null);
      const profile = await signInWithGoogle();
      if (profile) {
        onLogin(profile);
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setAuthError('Google ဖြင့် ဝင်ရောက်ခြင်း မအောင်မြင်ပါ။ ပြန်လည်ကြိုးစားပေးပါ');
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  // Handle Demo Quick Logins
  const handleQuickDemoLogin = (role: 'member' | 'student' | 'scholar') => {
    let demoUser: UserProfile;
    if (role === 'scholar') {
      demoUser = {
        id: 'user-scholar',
        name: 'မော်လာနာ ဦးဇော်မင်း',
        email: 'scholar.zaw@alhikmah.org',
        role: 'scholar',
        avatarInitials: 'ZM',
        joinDate: '၂၀၂၃ ခုနှစ်',
        bookmarks: [
          {
            bookId: 'book-1',
            bookTitle: 'ကုရ်အာန်ကျမ်းမြတ် အနက်မြန်မာပြန်',
            page: 2,
            chapterTitle: 'အာယသုလ် ကုရ်စီး',
            date: 'ယမန်နေ့',
          },
          {
            bookId: 'book-3',
            bookTitle: 'ဇကာသ်တရားတော် ပြည့်စုံသော လက်စွဲစာအုပ်',
            page: 1,
            chapterTitle: 'နိဆွာဗ် သတ်မှတ်ချက်',
            date: 'လွန်ခဲ့သော ၃ ရက်',
          },
        ],
        readingHistory: [
          {
            bookId: 'book-5',
            bookTitle: 'တမန်တော်မြတ် မုဟမ္မဒ်(ဆွ)၏ အတ္ထုပ္ပတ္တိ',
            lastPage: 2,
            totalPages: 64,
            lastReadDate: 'ယနေ့',
          },
        ],
        personalNotes: [
          {
            id: 'n-1',
            bookId: 'book-1',
            bookTitle: 'ကုရ်အာန်ကျမ်းမြတ် အနက်မြန်မာပြန်',
            page: 2,
            text: 'အာယသုလ်ကုရ်စီးသည် ကာကွယ်မှုအထွတ်အထိပ်ဖြစ်ကြောင်း ဟဒီးစ်တော်များ၌ လာရှိသည်။',
            createdAt: '၂၀၂၄-၀၉-၂၄',
          },
        ],
      };
    } else {
      demoUser = {
        id: 'user-student',
        name: 'ကိုအောင်ကိုလတ်',
        email: 'aungko@member.com',
        role: 'member',
        avatarInitials: 'AK',
        joinDate: '၂၀၂၄ ခုနှစ်',
        bookmarks: [
          {
            bookId: 'book-2',
            bookTitle: 'အခြေခံ အစ္စလာမ့် ဖိကာဟ်လက်စွဲ',
            page: 1,
            chapterTitle: 'သန့်ရှင်းမှု (သွဟာရသ်) နှင့် ဝုဇူ',
            date: 'ယမန်နေ့',
          },
        ],
        readingHistory: [
          {
            bookId: 'book-2',
            bookTitle: 'အခြေခံ အစ္စလာမ့် ဖိကာဟ်လက်စွဲ',
            lastPage: 2,
            totalPages: 48,
            lastReadDate: 'ယနေ့',
          },
        ],
        personalNotes: [],
      };
    }

    onLogin(demoUser);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const initials = (name || email.split('@')[0])
      .substring(0, 2)
      .toUpperCase();

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      role: selectedRole,
      avatarInitials: initials,
      joinDate: 'ယခုနှစ်',
      bookmarks: [],
      readingHistory: [],
      personalNotes: [],
    };

    onLogin(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center font-bold text-xs">
              {currentUser ? currentUser.avatarInitials : <User className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 font-myanmar">
                {currentUser ? currentUser.name : 'အသင်းဝင် မန်ဘာစနစ်'}
              </h3>
              <p className="text-xs text-stone-500 font-myanmar">
                {currentUser
                  ? `${currentUser.email} (${currentUser.role === 'scholar' ? 'ဓမ္မပညာရှင်' : 'အသင်းဝင်'})`
                  : 'အစ္စလာမ့်စာကြည့်တိုက် အဖွဲ့ဝင်အကောင့်'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt warning banner if triggered by a locked member book */}
        {promptMessage && !currentUser && (
          <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs font-myanmar flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{promptMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!currentUser ? (
            /* Authentication Form */
            <div className="space-y-6">
              {/* Google Sign-in with Firebase Database */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-emerald-800 font-semibold font-sans flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Firebase Cloud Database ဝင်ရောက်မှု:</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Firestore Auth</span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleSigningIn}
                  className="w-full py-3 px-4 rounded-xl border border-stone-300 hover:border-emerald-700 bg-white hover:bg-stone-50 text-stone-800 font-myanmar text-xs font-semibold shadow-xs flex items-center justify-center gap-3 transition-all disabled:opacity-60"
                >
                  {isGoogleSigningIn ? (
                    <>
                      <div className="w-4 h-4 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
                      <span>Google ဖြင့် ချိတ်ဆက်နေပါသည်...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                      <span>Google အကောင့်ဖြင့် တိုက်ရိုက်ဝင်ရောက်ရန် (Firebase Sync)</span>
                    </>
                  )}
                </button>

                {authError && (
                  <p className="text-xs text-red-600 font-myanmar text-center">{authError}</p>
                )}
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-stone-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] text-stone-400 font-myanmar">သို့မဟုတ် နမူနာအကောင့်များ</span>
              </div>

              {/* Quick 1-Click Demo Profiles */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold font-sans">
                  စမ်းသပ်အကောင့်ဖြင့် ချက်ချင်းဝင်ရောက်ရန် (Quick Login):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-myanmar">
                  <button
                    onClick={() => handleQuickDemoLogin('member')}
                    className="p-3 rounded-xl border border-stone-300 hover:border-emerald-700 bg-stone-50 hover:bg-emerald-50/50 text-left transition-colors flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-800 text-amber-200 flex items-center justify-center font-bold text-xs shrink-0">
                      AK
                    </div>
                    <div>
                      <div className="font-semibold text-stone-900">ကိုအောင်ကိုလတ်</div>
                      <div className="text-[11px] text-stone-500">သာမန် စာဖတ်သူ မန်ဘာ</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickDemoLogin('scholar')}
                    className="p-3 rounded-xl border border-stone-300 hover:border-emerald-700 bg-stone-50 hover:bg-emerald-50/50 text-left transition-colors flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-800 text-amber-100 flex items-center justify-center font-bold text-xs shrink-0">
                      ZM
                    </div>
                    <div>
                      <div className="font-semibold text-stone-900">မော်လာနာ ဦးဇော်မင်း</div>
                      <div className="text-[11px] text-stone-500">ဓမ္မပညာရှင် / Scholar</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-stone-200 w-full"></div>
                <span className="bg-white px-3 text-xs text-stone-400 font-myanmar">သို့မဟုတ်</span>
              </div>

              {/* Login / Register Toggle Tabs */}
              <div className="flex border-b border-stone-200 text-xs font-myanmar">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`pb-2.5 px-4 font-semibold transition-colors border-b-2 ${
                    authMode === 'login'
                      ? 'border-emerald-800 text-emerald-900'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  အကောင့်ဝင်ရန် (Login)
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`pb-2.5 px-4 font-semibold transition-colors border-b-2 ${
                    authMode === 'register'
                      ? 'border-emerald-800 text-emerald-900'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  အသစ်ဖွင့်ရန် (Sign Up)
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleCustomSubmit} className="space-y-4 text-xs font-myanmar">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      အမည်အပြည့်အစုံ
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ဥပမာ: ဦးမောင်မောင်"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    အီးမေးလ်လိပ်စာ
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    စကားဝှက် (Password)
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                {authMode === 'register' && (
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      အသင်းဝင်အဆင့် ရွေးချယ်ရန်
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as any)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    >
                      <option value="member">စာဖတ်သူ အသင်းဝင် (General Member)</option>
                      <option value="student">ကျမ်းစာလေ့လာသူ (Islamic Student)</option>
                      <option value="scholar">ဓမ္မဆရာ / ပညာရှင် (Islamic Scholar)</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {authMode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{authMode === 'login' ? 'အကောင့်ဝင်မည်' : 'မန်ဘာအဖြစ် စာရင်းသွင်းမည်'}</span>
                </button>
              </form>
            </div>
          ) : (
            /* Logged In Member Profile View */
            <div className="space-y-6">
              {/* Member Navigation Tabs */}
              <div className="flex border-b border-stone-200 text-xs font-myanmar overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`pb-2 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === 'profile'
                      ? 'border-emerald-800 text-emerald-900 font-semibold'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  ပရိုဖိုင်
                </button>
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`pb-2 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === 'bookmarks'
                      ? 'border-emerald-800 text-emerald-900 font-semibold'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  မှတ်သားထားသော စာမျက်နှာများ ({toMyanmarDigits(currentUser.bookmarks.length)})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-2 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === 'history'
                      ? 'border-emerald-800 text-emerald-900 font-semibold'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  ဖတ်ရှုမှတ်တမ်း ({toMyanmarDigits(currentUser.readingHistory.length)})
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`pb-2 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === 'notes'
                      ? 'border-emerald-800 text-emerald-900 font-semibold'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  မှတ်စုများ ({toMyanmarDigits(currentUser.personalNotes.length)})
                </button>
                <button
                  onClick={() => setActiveTab('wisdom')}
                  className={`pb-2 px-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'wisdom'
                      ? 'border-emerald-800 text-emerald-900 font-semibold'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>နေ့စဉ် ဓမ္မဩဝါဒ (Daily Wisdom)</span>
                </button>
              </div>

              {/* Tab 1: Profile Overview */}
              {activeTab === 'profile' && (
                <div className="space-y-4 text-xs font-myanmar">
                  {/* Daily Wisdom Spiritual Callout Card */}
                  <div
                    onClick={() => setActiveTab('wisdom')}
                    className="p-4 rounded-xl bg-gradient-to-r from-emerald-900 via-teal-950 to-emerald-950 text-white cursor-pointer hover:shadow-md transition-shadow space-y-2 border border-emerald-700/60"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>ယနေ့အတွက် အစ္စလာမ့် ဓမ္မဩဝါဒတော် (Daily Wisdom)</span>
                      </div>
                      <span className="text-[11px] text-emerald-300 underline font-myanmar">ဖတ်ရှုဆင်ခြင်ရန် →</span>
                    </div>
                    <p className="text-xs text-stone-200 font-myanmar leading-relaxed">
                      ကုရ်အာန်၊ ဟဒီးစ်တော်များနှင့် ဓမ္မပညာရှင်များ၏ အဖိုးတန်ဩဝါဒများကို လှည့်လည်ဖတ်ရှုပါ။
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">အဖွဲ့ဝင် အမည်:</span>
                      <span className="font-semibold text-stone-900">{currentUser.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">အီးမေးလ်:</span>
                      <span className="font-mono text-stone-800">{currentUser.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">အသင်းဝင် အဆင့်:</span>
                      <span className="font-semibold text-emerald-800">
                        {currentUser.role === 'scholar' ? 'ဓမ္မပညာရှင် (Mufti / Scholar)' : currentUser.role === 'admin' ? 'အက်ဒမင် (Administrator)' : 'သီးသန့် မန်ဘာ (Verified Member)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">ဒေတာဘေ့စ် စနစ်:</span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-900 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        <span>Firebase Cloud Database ချိတ်ဆက်ပြီး</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">ဝင်ရောက်သည့်ကာလ:</span>
                      <span className="text-stone-800">{currentUser.joinDate}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>မန်ဘာ သီးသန့် အခွင့်အရေးများ ရရှိပြီးပါပြီ</span>
                    </div>
                    <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                      သီးသန့်စာအုပ်များ၊ ဖိကာဟ်လက်စွဲများ၊ စာအုပ်မှတ်သားမှုနှင့် မှတ်စုသိမ်းဆည်းမှု လုပ်ဆောင်ချက်များကို ကန့်သတ်ချက်မရှိ ဖတ်ရှုခွင့် ရရှိထားပါသည်။
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Bookmarks */}
              {activeTab === 'bookmarks' && (
                <div className="space-y-3 text-xs font-myanmar">
                  {currentUser.bookmarks.length === 0 ? (
                    <div className="text-center py-8 text-stone-400">
                      <Bookmark className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                      <p>မှတ်သားထားသော စာမျက်နှာ မရှိသေးပါ</p>
                    </div>
                  ) : (
                    currentUser.bookmarks.map((bm, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          onOpenBookFromBookmark(bm.bookId, bm.page);
                          onClose();
                        }}
                        className="p-3 rounded-lg border border-stone-200 hover:border-emerald-700 hover:bg-stone-50 transition-colors cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <h4 className="font-semibold text-stone-900">{bm.bookTitle}</h4>
                          <div className="text-stone-500 flex items-center gap-2">
                            <span>{bm.chapterTitle}</span>
                            <span>·</span>
                            <span>စာမျက်နှာ {toMyanmarDigits(bm.page)}</span>
                          </div>
                        </div>
                        <button className="px-2.5 py-1 bg-emerald-900 text-white rounded text-[11px] shrink-0">
                          ဆက်လက်ဖတ်ရန်
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Reading History */}
              {activeTab === 'history' && (
                <div className="space-y-3 text-xs font-myanmar">
                  {currentUser.readingHistory.length === 0 ? (
                    <div className="text-center py-8 text-stone-400">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                      <p>ဖတ်ရှုမှတ်တမ်း မရှိသေးပါ</p>
                    </div>
                  ) : (
                    currentUser.readingHistory.map((hist, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          onOpenBookFromBookmark(hist.bookId, hist.lastPage);
                          onClose();
                        }}
                        className="p-3 rounded-lg border border-stone-200 hover:border-emerald-700 hover:bg-stone-50 transition-colors cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1 flex-1">
                          <h4 className="font-semibold text-stone-900">{hist.bookTitle}</h4>
                          <div className="text-stone-500 flex items-center gap-2">
                            <span>
                              စာမျက်နှာ {toMyanmarDigits(hist.lastPage)} / {toMyanmarDigits(hist.totalPages)}
                            </span>
                            <span>·</span>
                            <span>{hist.lastReadDate}</span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full max-w-xs h-1.5 bg-stone-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-700"
                              style={{ width: `${Math.round((hist.lastPage / hist.totalPages) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <button className="px-2.5 py-1 bg-emerald-900 text-white rounded text-[11px] shrink-0">
                          ဖတ်ရန်
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 4: Notes */}
              {activeTab === 'notes' && (
                <div className="space-y-3 text-xs font-myanmar">
                  {currentUser.personalNotes.length === 0 ? (
                    <div className="text-center py-8 text-stone-400">
                      <Edit3 className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                      <p>မှတ်စု မရှိသေးပါ</p>
                    </div>
                  ) : (
                    currentUser.personalNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 rounded-lg border border-stone-200 bg-stone-50 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-stone-500 text-[11px]">
                          <span className="font-semibold text-stone-800">{note.bookTitle}</span>
                          <span>စာမျက်နှာ {toMyanmarDigits(note.page)} ({note.createdAt})</span>
                        </div>
                        <p className="text-stone-900 leading-relaxed">{note.text}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 5: Daily Wisdom */}
              {activeTab === 'wisdom' && (
                <div className="space-y-4">
                  <DailyWisdom currentUser={currentUser} isModal={false} />
                </div>
              )}

              {/* Logout Button */}
              <div className="pt-4 border-t border-stone-200 flex justify-end">
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-myanmar transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>အကောင့်မှ ထွက်မည်</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
