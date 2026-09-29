import React from 'react';
import { BookOpen, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: 'library' | 'fatwa' | 'zakat' | 'prayer') => void;
  onOpenUploadModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTab,
  onOpenUploadModal,
}) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold text-white font-display">
                Al-Hikmah
              </span>
              <span className="font-myanmar text-amber-300 font-semibold">
                အစ္စလာမ့် စာကြည့်တိုက်
              </span>
            </div>
            <p className="text-xs text-stone-400 font-myanmar leading-relaxed max-w-md">
              ကျမ်းမြတ်ကုရ်အာန်၊ ဆွဟီးဟ်ဟဒီးစ်တော်များ၊ ဓမ္မသတ်ဖသ်ဝါများနှင့် ဇကာသ်တွက်ချက်မှုဆိုင်ရာ အစ္စလာမ့် ဗဟုသုတများကို မွတ်စလင်မ်အသိုက်အဝန်း လေ့လာဖတ်ရှုနိုင်ရန် စုစည်းထားရှိသော သုတဘဏ် ဖြစ်ပါသည်။
            </p>
            <div className="text-[11px] text-emerald-400 font-arabic">
              وَمَنْ يُؤْتَ الْحِكْمَةَ فَقَدْ أُوتِيَ خَيْرًا كَثِيرًا
            </div>
          </div>

          {/* Col 2: Services / Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-100 font-sans">
              အဓိက ကဏ္ဍများ
            </h4>
            <ul className="space-y-1.5 text-xs font-myanmar text-stone-400">
              <li>
                <button
                  onClick={() => onSelectTab('library')}
                  className="hover:text-amber-300 transition-colors"
                >
                  အစ္စလာမ့် စာအုပ်စင်
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('fatwa')}
                  className="hover:text-amber-300 transition-colors"
                >
                  ဒါရုလ် အိဖ်သာဟ် ဖသ်ဝါဌာန
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('zakat')}
                  className="hover:text-amber-300 transition-colors"
                >
                  ဇကာသ် တွက်ချက်သည့်စနစ်
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('prayer')}
                  className="hover:text-amber-300 transition-colors"
                >
                  နမားဇ် ၅ ကြိမ် အချိန်ဇယား
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Contribution */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-100 font-sans">
              စာအုပ်များ ပူးပေါင်းပါဝင်ခြင်း
            </h4>
            <p className="text-xs text-stone-400 font-myanmar leading-relaxed">
              သင့်ထံတွင် ရှိသော အစ္စလာမ့်ကျမ်းစာအုပ်များ၊ PDF စာအုပ်များကို တင်သွင်းမျှဝေနိုင်ပါသည်။
            </p>
            <button
              onClick={onOpenUploadModal}
              className="inline-block px-3 py-1.5 bg-emerald-950 border border-emerald-800 text-emerald-200 hover:text-white hover:bg-emerald-900 rounded text-xs font-myanmar transition-colors"
            >
              စာအုပ် / PDF တင်ရန်
            </button>
          </div>
        </div>

        {/* Quiet Copyright Row */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 font-myanmar">
          <p>© {new Date().getFullYear()} Al-Hikmah အစ္စလာမ့်စာကြည့်တိုက်နှင့် ဓမ္မသုတဘဏ်။ မူပိုင်ခွင့်များ ရယူထားပါသည်။</p>
          <div className="flex items-center gap-2 text-[11px] text-stone-400">
            <span>သန့်ရှင်းစင်ကြယ်သော ဓမ္မအသိပညာ ဖြန့်ဝေခြင်း</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
