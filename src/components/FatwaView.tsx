import React, { useState, useMemo } from 'react';
import {
  Search,
  BookMarked,
  CheckCircle,
  HelpCircle,
  Send,
  Share2,
  Copy,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  FileCheck,
  Calendar,
  Eye,
  Check,
} from 'lucide-react';
import { FatwaItem, UserProfile } from '../types';
import { FATWA_CATEGORIES } from '../data/initialFatwas';
import { toMyanmarDigits } from '../utils/islamicTimes';

interface FatwaViewProps {
  fatwas: FatwaItem[];
  currentUser: UserProfile | null;
  onSubmitQuestion: (question: {
    title: string;
    category: string;
    questionText: string;
    name: string;
  }) => void;
}

export const FatwaView: React.FC<FatwaViewProps> = ({
  fatwas,
  currentUser,
  onSubmitQuestion,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFatwaId, setExpandedFatwaId] = useState<string | null>(fatwas[0]?.id || null);
  const [showAskModal, setShowAskModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Ask Question Form State
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionCategory, setQuestionCategory] = useState('ibadah');
  const [questionBody, setQuestionBody] = useState('');
  const [askerName, setAskerName] = useState(currentUser?.name || '');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const filteredFatwas = useMemo(() => {
    return fatwas.filter((fatwa) => {
      if (selectedCategory !== 'all' && fatwa.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          fatwa.titleMm.toLowerCase().includes(q) ||
          fatwa.questionMm.toLowerCase().includes(q) ||
          fatwa.answerMm.toLowerCase().includes(q) ||
          fatwa.fatwaNumber.toLowerCase().includes(q) ||
          fatwa.categoryMm.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [fatwas, selectedCategory, searchQuery]);

  const handleCopyFatwa = (fatwa: FatwaItem) => {
    const textToCopy = `【 ဖသ်ဝါ အမှတ်: ${fatwa.fatwaNumber} 】\nမေးခွန်း: ${fatwa.titleMm}\n\nအဖြေတော်: ${fatwa.answerMm}\n\nကျမ်းကိုး: ${fatwa.referencesMm.join(', ')}\nဒါရုလ် အိဖ်သာဟ် - Al-Hikmah`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(fatwa.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionTitle.trim() || !questionBody.trim()) return;

    onSubmitQuestion({
      title: questionTitle.trim(),
      category: questionCategory,
      questionText: questionBody.trim(),
      name: askerName.trim() || 'မေးမြန်းသူ',
    });

    setSubmissionSuccess(true);
    setTimeout(() => {
      setSubmissionSuccess(false);
      setShowAskModal(false);
      setQuestionTitle('');
      setQuestionBody('');
    }, 2000);
  };

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <section className="rounded-2xl bg-gradient-to-br from-[#132d22] to-[#1d4635] text-white p-6 sm:p-8 border border-emerald-800/80 shadow-md">
        <div className="max-w-3xl space-y-3">
          <div className="text-xs uppercase tracking-widest text-amber-300 font-sans flex items-center gap-2">
            <span>ဒါရုလ် အိဖ်သာဟ် ဖသ်ဝါဌာန</span>
            <span aria-hidden="true">·</span>
            <span className="font-arabic text-sm">دار الإفتاء والبحوث الشرعية</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight">
            တရားတော်ဆိုင်ရာ ဓမ္မသတ်နှင့် ဖသ်ဝါများ
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm font-myanmar leading-relaxed">
            ကျမ်းမြတ်ကုရ်အာန်၊ ဆွဟီးဟ်ဟဒီးစ်တော်များနှင့် အတည်ပြုပြဋ္ဌာန်းထားသော ဖိကာဟ်ကျမ်းကြီးများမှ စစ်မှန်သော အကိုးအကားများဖြင့် ဖြေကြားထားသည့် ဖသ်ဝါများကို စုစည်းဖော်ပြထားပါသည်။
          </p>

          <div className="pt-2">
            <button
              onClick={() => setShowAskModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs font-myanmar"
            >
              <HelpCircle className="w-4 h-4 text-stone-950" />
              <span>မေးခွန်းမေးမြန်းရန် (Ask a Fatwa)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Search and Category Filter */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ဖသ်ဝါမေးခွန်း၊ အမှတ်၊ သော့ချက်စကားလုံး ရှာရန်..."
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

          <div className="text-xs text-stone-500 font-myanmar">
            ဖသ်ဝါ စုစုပေါင်း ({toMyanmarDigits(filteredFatwas.length)}) ခု
          </div>
        </div>

        {/* Category Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FATWA_CATEGORIES.map((cat) => (
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

      {/* Fatwa Cards List */}
      <section className="space-y-4">
        {filteredFatwas.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-2">
            <FileCheck className="w-8 h-8 text-stone-300 mx-auto" />
            <h3 className="text-sm font-semibold text-stone-800 font-myanmar">
              ဤကဏ္ဍတွင် ဖသ်ဝါ မတွေ့ရှိပါ
            </h3>
            <p className="text-xs text-stone-500 font-myanmar">
              အခြားကဏ္ဍကို ရွေးချယ်ပါ သို့မဟုတ် ဓမ္မသတ်ဌာနသို့ မေးခွန်းတိုက်ရိုက် မေးမြန်းနိုင်ပါသည်။
            </p>
          </div>
        ) : (
          filteredFatwas.map((fatwa) => {
            const isExpanded = expandedFatwaId === fatwa.id;

            return (
              <div
                key={fatwa.id}
                className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-emerald-700/60 transition-colors shadow-2xs"
              >
                {/* Fatwa Header Row */}
                <div
                  onClick={() => setExpandedFatwaId(isExpanded ? null : fatwa.id)}
                  className="p-5 cursor-pointer flex items-start justify-between gap-4 hover:bg-stone-50/70 transition-colors"
                >
                  <div className="space-y-2 flex-1">
                    {/* ZERO-PILL METADATA: Clean text with · separator */}
                    <div className="flex items-center gap-2 text-xs text-stone-500 font-myanmar flex-wrap">
                      <span className="font-mono text-emerald-800 font-semibold">
                        {fatwa.fatwaNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-stone-700">{fatwa.categoryMm}</span>
                      <span aria-hidden="true">·</span>
                      <span>{fatwa.dateMm}</span>
                    </div>

                    <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 leading-snug">
                      {fatwa.titleMm}
                    </h3>

                    {!isExpanded && (
                      <p className="text-xs text-stone-600 font-myanmar line-clamp-2 leading-relaxed">
                        {fatwa.answerMm}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    <span className="text-xs text-stone-400 font-myanmar hidden sm:inline">
                      {isExpanded ? 'အကျဉ်းချုံ့ရန်' : 'အပြည့်အစုံဖတ်ရန်'}
                    </span>
                    <div className="p-1 rounded-full bg-stone-100 text-stone-600">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Fatwa Details */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-stone-100 space-y-5 bg-stone-50/40">
                    {/* Full Question Box */}
                    <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-950 font-myanmar">
                        <HelpCircle className="w-4 h-4 text-amber-700" />
                        <span>မေးခွန်း: {fatwa.questioner}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-stone-800 font-myanmar leading-relaxed">
                        {fatwa.questionMm}
                      </p>
                    </div>

                    {/* Official Shariah Ruling Answer */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider font-sans">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>ဖသ်ဝါ ဓမ္မသတ် ဆုံးဖြတ်ချက် (Ruling)</span>
                      </div>

                      {fatwa.answerAr && (
                        <div className="p-3 bg-white rounded-lg border border-stone-200 text-right">
                          <p className="font-arabic text-base sm:text-lg text-emerald-950 leading-loose">
                            {fatwa.answerAr}
                          </p>
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-stone-800 font-myanmar leading-loose whitespace-pre-line bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                        {fatwa.answerMm}
                      </p>
                    </div>

                    {/* References and Citations (ဟဝါလာ ကျမ်းကိုးများ) */}
                    <div className="p-3.5 rounded-lg bg-stone-100 border border-stone-200 space-y-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-600 font-sans">
                        ကျမ်းကိုး အထောက်အထားများ (Hawalah References):
                      </span>
                      <ul className="space-y-1 text-xs text-stone-700 font-myanmar">
                        {fatwa.referencesMm.map((ref, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-700 font-mono">[{idx + 1}]</span>
                            <span>{ref}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bottom Metadata & Copy Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-stone-500 font-myanmar border-t border-stone-200">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-stone-700">ထုတ်ပြန်သည့်ဌာန:</span>
                        <span>{fatwa.muftiOrBoard}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyFatwa(fatwa)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 transition-colors"
                        >
                          {copiedId === fatwa.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-medium">ကူးယူပြီးပါပြီ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>ဖသ်ဝါ ကူးယူရန်</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 font-myanmar">
                  ဓမ္မသတ်ဌာနသို့ မေးခွန်းမေးမြန်းရန်
                </h3>
                <p className="text-xs text-stone-500 font-myanmar">
                  သင်သိရှိလိုသော သာသနာ့စည်းမျဉ်းများကို မေးမြန်းနိုင်ပါသည်။
                </p>
              </div>
              <button
                onClick={() => setShowAskModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm"
              >
                ✕
              </button>
            </div>

            {submissionSuccess ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-semibold text-stone-800 font-myanmar">
                  မေးခွန်းကို လက်ခံရရှိပြီး ဖြစ်ပါသည်
                </h4>
                <p className="text-xs text-stone-600 font-myanmar">
                  မုဖ်သီ ဆရာတော်ကြီးများ စိစစ်ပြီးပါက ဖသ်ဝါမှတ်တမ်းတွင် ထည့်သွင်း အကြောင်းကြားပေးပါမည်။
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuestion} className="space-y-3.5 text-xs font-myanmar">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    မေးမြန်းသူ အမည်
                  </label>
                  <input
                    type="text"
                    required
                    value={askerName}
                    onChange={(e) => setAskerName(e.target.value)}
                    placeholder="ဥပမာ: မောင်မောင် (ရန်ကုန်)"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    မေးခွန်း ကဏ္ဍ
                  </label>
                  <select
                    value={questionCategory}
                    onChange={(e) => setQuestionCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="ibadah">အိဗာဒသ် (နမားဇ်၊ သန့်ရှင်းမှု)</option>
                    <option value="roza">ဥပုသ်သီလနှင့် ရမ်ဇာန်</option>
                    <option value="zakat">ဇကာသ်နှင့် စီးပွားရေး/အတိုး</option>
                    <option value="nikah">နိကာဟ်နှင့် မိသားစုရေးရာ</option>
                    <option value="medical">ဆေးဝါးနှင့် ခေတ်ပေါ်ပြဿနာများ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    မေးခွန်း ခေါင်းစဉ် အကျဉ်း
                  </label>
                  <input
                    type="text"
                    required
                    value={questionTitle}
                    onChange={(e) => setQuestionTitle(e.target.value)}
                    placeholder="ဥပမာ: သွားနုတ်ပြီးနောက် သွေးထွက်နေစဉ် နမားဇ်ဖတ်ခွင့်ရှိပါသလား"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    မေးခွန်း အသေးစိတ်
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={questionBody}
                    onChange={(e) => setQuestionBody(e.target.value)}
                    placeholder="ဖြစ်ရပ်အခြေအနေကို ရှင်းလင်းစွာ ဖော်ပြပေးပါ..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAskModal(false)}
                    className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    ပယ်ဖျက်မည်
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>မေးခွန်း ပေးပို့မည်</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
