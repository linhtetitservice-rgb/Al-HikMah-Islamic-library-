import React, { useState } from 'react';
import {
  X,
  Send,
  CheckCircle,
  Copy,
  ExternalLink,
  BookOpen,
  Sparkles,
  RefreshCw,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { BookItem } from '../types/index.ts';

interface TelegramSyncModalProps {
  onClose: () => void;
  onBookSynced: (newBook: BookItem) => void;
  onOpenBook: (book: BookItem) => void;
}

export const TelegramSyncModal: React.FC<TelegramSyncModalProps> = ({
  onClose,
  onBookSynced,
  onOpenBook,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [latestCreatedBook, setLatestCreatedBook] = useState<BookItem | null>(null);

  // Custom simulation test fields
  const [customTitle, setCustomTitle] = useState('အစ္စလာမ့် သာသနာရေးရာ နေ့စဉ်ကျင့်ဝတ် လက်စွဲတော်');
  const [customAuthor, setCustomAuthor] = useState('မော်လာနာ နူရ်မုဟမ္မဒ်');
  const [customCategory, setCustomCategory] = useState('fiqh');
  const [customChannel, setCustomChannel] = useState('@alhikmahislby');
  const [customFileName, setCustomFileName] = useState('ဆရာသမားများကို_ရိုသေလေးစားခြင်း.pdf');
  const [customPages, setCustomPages] = useState('48');
  const [customDescription, setCustomDescription] = useState(
    'ဤစာအုပ်သည် နေ့စဉ် အိဗာဒသ်၊ သန့်ရှင်းရေးနှင့် နမားဇ်ဆိုင်ရာ အရေးကြီး စည်းမျဉ်းများကို မြန်မာဘာသာဖြင့် အသေးစိတ် ရှင်းလင်းထားသော လက်စွဲစာအုပ် ဖြစ်ပါသည်။'
  );

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/telegram/webhook`
    : 'https://ais-dev-uuzkpketym55o5efwdqcd5-406118784449.asia-east1.run.app/api/telegram/webhook';

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleManualSyncNow = async () => {
    setIsSyncing(true);
    setSuccessMessage(null);
    try {
      const res = await fetch('/api/telegram/sync-updates', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        if (data.importedCount > 0 && Array.isArray(data.books)) {
          setSuccessMessage(`Telegram Channel မှ စာအုပ် (${data.importedCount}) အုပ် အောင်မြင်စွာ ရောက်ရှိလာပါပြီ!`);
          data.books.forEach((b: BookItem) => onBookSynced(b));
          if (data.books[0]) setLatestCreatedBook(data.books[0]);
        } else {
          setSuccessMessage('Telegram Channel မှ တင်ထားသော စာအုပ်အသစ်များ အားလုံး စာကြည့်တိုက်သို့ ရောက်ရှိပြီးဖြစ်ပါသည် (Up to date)');
        }
      } else {
        setSuccessMessage(data.error || 'Telegram မှ ဆွဲယူမှု မအောင်မြင်ပါ');
      }
    } catch (err: any) {
      setSuccessMessage('ဆာဗာနှင့် ချိတ်ဆက်မှု မအောင်မြင်ပါ');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSimulatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/telegram/simulate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: customTitle,
          author: customAuthor,
          category: customCategory,
          channelName: customChannel,
          fileName: customFileName,
          pages: parseInt(customPages, 10) || 30,
          description: customDescription,
        }),
      });

      const data = await res.json();
      if (data.success && data.book) {
        setSuccessMessage('Telegram Channel မှ စာအုပ်အသစ် အောင်မြင်စွာ ရောက်ရှိလာပြီး Web စာကြည့်တိုက်သို့ ပေါင်းထည့်ပြီးပါပြီ!');
        setLatestCreatedBook(data.book);
        onBookSynced(data.book);
      } else {
        setSuccessMessage(data.error || 'စမ်းသပ်တင်သွင်းမှု မအောင်မြင်ပါ');
      }
    } catch (err: any) {
      console.error(err);
      setSuccessMessage('ဆာဗာနှင့် ချိတ်ဆက်မှု မအောင်မြင်ပါ');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#229ED9] via-[#0088cc] to-[#176a9c] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
              <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg font-myanmar tracking-tight">
                  Telegram Channel စာအုပ်များ ချိတ်ဆက်ခြင်း
                </h3>
                <span className="px-2 py-0.5 bg-white/25 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Live Webhook
                </span>
              </div>
              <p className="text-xs text-white/90 font-myanmar">
                Telegram Channel တွင် စာအုပ်တင်တိုင်း Web Library ပေါ်သို့ Realtime တိုက်ရိုက်ရောက်ရှိစေမည့်စနစ်
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-stone-800 text-xs font-myanmar">
          {/* Status Banner */}
          <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-3 text-sky-950">
            <div className="w-2.5 h-2.5 rounded-full bg-[#229ED9] animate-ping mt-1 shrink-0"></div>
            <div className="space-y-1">
              <div className="font-semibold text-xs flex items-center gap-1.5">
                <span>Webhook & Realtime Sync စနစ် အသင့်ဖြစ်နေပါသည်</span>
                <span className="text-[10px] bg-sky-200/80 text-sky-900 px-1.5 py-0.5 rounded font-mono">
                  HTTP 200 Ready
                </span>
              </div>
              <p className="text-[11px] text-sky-800/90 leading-relaxed">
                သင်၏ Telegram Channel (@alhikmahislby) ထဲသို့ PDF/စာအုပ် ပို့လိုက်သည်နှင့် Cloud SQL နှင့် Firebase ပေါ်သို့ အလိုအလျောက် ရောက်ရှိပြီး Web တွင် စာဖတ်သူများ ချက်ချင်း ဖတ်ရှုနိုင်ပါမည်။
              </p>
            </div>
          </div>

          {/* 1-Tap Sync Now from Telegram Bot */}
          <div className="bg-gradient-to-r from-[#176a9c] to-[#0088cc] p-4 rounded-xl text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="font-bold text-sm flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Telegram Channel မှ စာအုပ်များ ဆွဲယူစစ်ဆေးမည်</span>
              </div>
              <p className="text-[11px] text-white/90">
                Channel တွင် တင်ထားပြီး Web ပေါ် မရောက်သေးသော စာအုပ်များကို ချက်ချင်း Sync ပြုလုပ်ပါမည်။
              </p>
            </div>
            <button
              type="button"
              onClick={handleManualSyncNow}
              disabled={isSyncing}
              className="px-4 py-2 bg-white hover:bg-amber-100 text-sky-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-sky-800' : 'text-sky-800'}`} />
              <span>{isSyncing ? 'ဆွဲယူနေပါသည်...' : 'အခုချက်ချင်း ဆွဲယူမည် (Sync Now)'}</span>
            </button>
          </div>

          {/* Webhook URL Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700">
              Telegram Bot Webhook URL (ချိတ်ဆက်ရန် လိပ်စာ):
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 font-mono text-[11px] text-stone-700 break-all select-all">
                {webhookUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'ကူးပြီး' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* 3 Step Setup Guide */}
          <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/70 space-y-3">
            <div className="font-semibold text-stone-900 text-xs flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0088cc]" />
              <span>အဆင့် (၃) ဆင့်ဖြင့် အလွယ်တကူ စတင်ချိတ်ဆက်နည်း:</span>
            </div>
            <div className="space-y-2.5 text-[11px] text-stone-700 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#229ED9] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  ၁
                </span>
                <div>
                  <strong className="text-stone-900">Telegram Bot တစ်ခု ဖွင့်ပါ:</strong> Telegram တွင်{' '}
                  <span className="font-mono text-sky-800 font-bold">@BotFather</span> သို့ သွား၍{' '}
                  <code className="bg-stone-200 px-1 py-0.5 rounded text-[10px]">/newbot</code> ဖြင့် မိမိ Bot တစ်ခု ဖန်တီးပါ။
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#229ED9] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  ၂
                </span>
                <div>
                  <strong className="text-stone-900">မိမိ Channel တွင် Bot အား Admin ခန့်ပါ:</strong> မိမိ၏ စာအုပ်များ တင်မည့် Telegram Channel ၏ Administrators စာရင်းတွင် ဖွင့်ထားသော Bot အား Post Messages အခွင့်အရေး ပေးထားပါ။
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#229ED9] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  ၃
                </span>
                <div>
                  <strong className="text-stone-900">Webhook ချိတ်ဆက်ပါ:</strong> အထက်ပါ Webhook URL အား BotFather သို့မဟုတ် Webhook API ဖြင့် ချိန်ညှိလိုက်သည်နှင့် Channel တွင် စာအုပ်တင်တိုင်း Web သို့ အလိုအလျောက် ရောက်ရှိလာပါမည်။
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Test Simulator */}
          <div className="border border-sky-200 bg-sky-50/40 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>လက်တွေ့ စမ်းသပ်ကြည့်ရှုခြင်း (Simulate Channel Post)</span>
              </div>
              <span className="text-[11px] text-[#0088cc] font-medium">တိုက်ရိုက်စမ်းသပ်ရန်</span>
            </div>

            <p className="text-[11px] text-stone-600 leading-relaxed">
              Bot မဖွင့်ရသေးမီ သို့မဟုတ် စမ်းသပ်လိုပါက အောက်ပါခလုတ်ကို နှိပ်ပြီး Telegram Channel မှ စာအုပ်တစ်အုပ် ပေးပို့မှုပုံစံအတိုင်း Web ပေါ်သို့ ချက်ချင်း ရောက်ရှိလာပုံကို လက်တွေ့ စမ်းသပ်ကြည့်နိုင်ပါသည်-
            </p>

            <form onSubmit={handleSimulatePost} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    စာအုပ်အမည် (Book Title)
                  </label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0088cc]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    စာရေးသူ (Author)
                  </label>
                  <input
                    type="text"
                    required
                    value={customAuthor}
                    onChange={(e) => setCustomAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0088cc]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    ကဏ္ဍ (Category)
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0088cc]"
                  >
                    <option value="fiqh">ဖိကာဟ်နှင့် တရားတော်</option>
                    <option value="quran">ကုရ်အာန်နှင့် သဖ်စီးရ်</option>
                    <option value="hadith">ဟဒီးစ်တော်များ</option>
                    <option value="seerah">တမန်တော်မြတ် သမိုင်း</option>
                    <option value="dua">ဒုအာနှင့် ဇိကိရ်</option>
                    <option value="general">အထွေထွေ အစ္စလာမ့်စာပေ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Telegram Channel အမည်
                  </label>
                  <input
                    type="text"
                    value={customChannel}
                    onChange={(e) => setCustomChannel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0088cc]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    PDF ဖိုင်အမည်
                  </label>
                  <input
                    type="text"
                    value={customFileName}
                    onChange={(e) => setCustomFileName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0088cc]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="w-full py-2.5 px-4 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Telegram Channel မှ စာအုပ်ကို Web သို့ ဆွဲယူတင်သွင်းနေပါသည်...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 -rotate-12" />
                    <span>Telegram Channel မှ စာအုပ်တစ်အုပ် စမ်းသပ်ပေးပို့မည် (Simulate Channel Post)</span>
                  </>
                )}
              </button>
            </form>

            {/* Success Feedback Banner */}
            {successMessage && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{successMessage}</span>
                </div>
                {latestCreatedBook && (
                  <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between">
                    <span className="font-semibold text-xs text-emerald-900 truncate">
                      📖 {latestCreatedBook.titleMm}
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenBook(latestCreatedBook);
                      }}
                      className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0 shadow-xs"
                    >
                      <span>စာအုပ်ဖတ်မည်</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs font-myanmar">
          <div className="text-stone-500 text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Cloud SQL & Firebase Sync Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-lg transition-colors"
          >
            ပိတ်မည်
          </button>
        </div>
      </div>
    </div>
  );
};
