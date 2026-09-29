import React, { useState, useMemo } from 'react';
import {
  Coins,
  Scale,
  DollarSign,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Printer,
  Copy,
  Info,
  Check,
  TrendingUp,
} from 'lucide-react';
import { toMyanmarDigits } from '../utils/islamicTimes';

export const ZakatCalculator: React.FC = () => {
  // Currency mode
  const [currency, setCurrency] = useState<'MMK' | 'USD'>('MMK');

  // Metal Prices per gram (or per Kyat-thar for Myanmar)
  // Default Myanmar Market rates:
  // 1 Kyat-thar = 16.33 grams. 1 gram gold ~ 355,000 MMK.
  // 1 gram silver ~ 5,500 MMK.
  const [goldRatePerGram, setGoldRatePerGram] = useState<number>(355000);
  const [silverRatePerGram, setSilverRatePerGram] = useState<number>(5500);

  // Nisab basis selection: Silver is standard for mixed cash/merchandise
  const [nisabBasis, setNisabBasis] = useState<'silver' | 'gold'>('silver');

  // Asset inputs
  const [goldGrams, setGoldGrams] = useState<string>('0');
  const [silverGrams, setSilverGrams] = useState<string>('0');
  const [cashInHand, setCashInHand] = useState<string>('0');
  const [bankBalance, setBankBalance] = useState<string>('0');
  const [businessStock, setBusinessStock] = useState<string>('0');
  const [investments, setInvestments] = useState<string>('0');
  const [loansReceivable, setLoansReceivable] = useState<string>('0');

  // Liabilities
  const [debtsDue, setDebtsDue] = useState<string>('0');
  const [payablesDue, setPayablesDue] = useState<string>('0');

  // Copy state
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Parsed calculations
  const parsedGoldGrams = parseFloat(goldGrams) || 0;
  const parsedSilverGrams = parseFloat(silverGrams) || 0;
  const parsedCash = parseFloat(cashInHand) || 0;
  const parsedBank = parseFloat(bankBalance) || 0;
  const parsedStock = parseFloat(businessStock) || 0;
  const parsedInvestments = parseFloat(investments) || 0;
  const parsedLoans = parseFloat(loansReceivable) || 0;

  const parsedDebts = parseFloat(debtsDue) || 0;
  const parsedPayables = parseFloat(payablesDue) || 0;

  // Values in currency
  const goldValue = parsedGoldGrams * goldRatePerGram;
  const silverValue = parsedSilverGrams * silverRatePerGram;
  const totalLiquidCash = parsedCash + parsedBank;

  const totalAssets =
    goldValue + silverValue + totalLiquidCash + parsedStock + parsedInvestments + parsedLoans;
  const totalLiabilities = parsedDebts + parsedPayables;
  const netWealth = Math.max(0, totalAssets - totalLiabilities);

  // Nisab thresholds:
  // Gold Nisab = 87.48 grams
  // Silver Nisab = 612.36 grams
  const goldNisabValue = 87.48 * goldRatePerGram;
  const silverNisabValue = 612.36 * silverRatePerGram;

  const activeNisabThreshold = nisabBasis === 'silver' ? silverNisabValue : goldNisabValue;
  const isNisabReached = netWealth >= activeNisabThreshold;

  // 2.5% Zakat
  const zakatDue = isNisabReached ? netWealth * 0.025 : 0;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  const currencySymbol = currency === 'MMK' ? 'ကျပ်' : 'USD ($)';

  const handleCopySummary = () => {
    const summaryText = `【 အစ္စလာမ့် ဇကာသ် (Zakat) တွက်ချက်မှု ရလဒ် 】
- စုစုပေါင်း ဇကာသ်သက်ရောက်သော ပိုင်ဆိုင်မှု: ${formatMoney(totalAssets)} ${currencySymbol}
- နှုတ်ပယ်ရမည့် တာဝန်ကြွေးမြီ: ${formatMoney(totalLiabilities)} ${currencySymbol}
- အသားတင် စည်းစိမ် (Net Wealth): ${formatMoney(netWealth)} ${currencySymbol}
- သတ်မှတ် နိဆွာဗ် (Nisab - ${nisabBasis === 'silver' ? 'ငွေစံနှုန်း 612.36g' : 'ရွှေစံနှုန်း 87.48g'}): ${formatMoney(activeNisabThreshold)} ${currencySymbol}
- နိဆွာဗ် ပြည့်မြောက်မှု: ${isNisabReached ? 'ပြည့်မြောက်ပါသည် (ဝါဂျိဗ်)' : 'မပြည့်မြောက်သေးပါ'}
★ ပေးဆောင်ရမည့် ဇကာသ် (၂.၅%): ${formatMoney(zakatDue)} ${currencySymbol}
- Al-Hikmah Zakat Calculator`;

    navigator.clipboard.writeText(summaryText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-10">
      {/* Banner */}
      <section className="rounded-2xl bg-gradient-to-br from-[#1b3022] to-[#254d37] text-white p-6 sm:p-8 border border-emerald-800 shadow-md">
        <div className="max-w-3xl space-y-3">
          <div className="text-xs uppercase tracking-widest text-amber-300 font-sans flex items-center gap-2">
            <span>အစ္စလာမ့် ဇကာသ် တွက်ချက်မှုစနစ်</span>
            <span aria-hidden="true">·</span>
            <span className="font-arabic text-sm">حاسبة الزكاة الشرعية</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight">
            တရားတော်နှင့်အညီ ဇကာသ် တိကျစွာ တွက်ချက်ခြင်း
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm font-myanmar leading-relaxed">
            ရွှေ၊ ငွေ၊ ငွေသား၊ ဘဏ်အပ်ငွေ၊ စီးပွားရေးကုန်ပစ္စည်းနှင့် ရင်းနှီးမြှုပ်နှံမှုများအပေါ် နိဆွာဗ် (Nisab) စံနှုန်းဖြင့် စိစစ်၍ မဖြစ်မနေ ပေးဆောင်ရမည့် ၂.၅% (၄၀ ပုံ ၁ ပုံ) ဇကာသ်ပမာဏကို တွက်ချက်ပေးပါသည်။
          </p>
        </div>
      </section>

      {/* Main Grid: Inputs vs Calculation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Metal Price Settings Card */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h2 className="font-serif font-bold text-stone-900 text-sm sm:text-base font-myanmar flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>၁။ ရွှေနှင့် ငွေ ပေါက်စျေး စံနှုန်းများ သတ်မှတ်ရန်</span>
              </h2>

              <div className="flex items-center gap-1 p-0.5 bg-stone-100 rounded-lg text-xs font-mono">
                <button
                  onClick={() => setCurrency('MMK')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    currency === 'MMK' ? 'bg-white text-stone-900 font-bold shadow-2xs' : 'text-stone-500'
                  }`}
                >
                  MMK (ကျပ်)
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    currency === 'USD' ? 'bg-white text-stone-900 font-bold shadow-2xs' : 'text-stone-500'
                  }`}
                >
                  USD ($)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-myanmar">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  ရွှေ ၁ ဂရမ် ပေါက်စျေး ({currencySymbol})
                </label>
                <input
                  type="number"
                  value={goldRatePerGram}
                  onChange={(e) => setGoldRatePerGram(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
                <span className="text-[10px] text-stone-500 pt-0.5 block">
                  (၁ ကျပ်သား = ၁၆.၃၃ ဂရမ် / ရွှေနိဆွာဗ် = ၈၇.၄၈ ဂရမ်)
                </span>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  ငွေ ၁ ဂရမ် ပေါက်စျေး ({currencySymbol})
                </label>
                <input
                  type="number"
                  value={silverRatePerGram}
                  onChange={(e) => setSilverRatePerGram(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
                <span className="text-[10px] text-stone-500 pt-0.5 block">
                  (ငွေနိဆွာဗ် = ၆၁၂.၃၆ ဂရမ် / ၅၂.၅ တိုလာ)
                </span>
              </div>
            </div>

            {/* Nisab Basis Toggle */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap text-xs font-myanmar">
              <span className="text-stone-600">နိဆွာဗ် အခြေပြုစံနှုန်း:</span>
              <div className="flex items-center gap-1 p-0.5 bg-stone-100 rounded-lg">
                <button
                  onClick={() => setNisabBasis('silver')}
                  className={`px-3 py-1 rounded transition-colors ${
                    nisabBasis === 'silver' ? 'bg-emerald-900 text-white font-medium shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  ငွေစံနှုန်း (Silver Nisab - ပညာရှင်များ အကြံပြု)
                </button>
                <button
                  onClick={() => setNisabBasis('gold')}
                  className={`px-3 py-1 rounded transition-colors ${
                    nisabBasis === 'gold' ? 'bg-emerald-900 text-white font-medium shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  ရွှေစံနှုန်း (Gold Nisab)
                </button>
              </div>
            </div>
          </div>

          {/* Asset Values Card */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4 shadow-2xs">
            <h2 className="font-serif font-bold text-stone-900 text-sm sm:text-base font-myanmar flex items-center gap-2 pb-3 border-b border-stone-200">
              <Scale className="w-4 h-4 text-emerald-700" />
              <span>၂။ ဇကာသ် သက်ရောက်သော ပိုင်ဆိုင်မှုများ ထည့်သွင်းရန်</span>
            </h2>

            <div className="space-y-3.5 text-xs font-myanmar">
              {/* Gold Grams */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="font-semibold text-stone-800">
                    ရွှေထည်နှင့် ရတနာများ (ဂရမ်ဖြင့်)
                  </label>
                  <p className="text-[11px] text-stone-500">
                    ဝတ်ဆင်/သိမ်းဆည်းထားသော ရွှေထည်၊ ရွှေချောင်းများ
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={goldGrams}
                    onChange={(e) => setGoldGrams(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 pr-12 border border-stone-300 rounded-lg text-stone-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 text-right"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                    ဂရမ်
                  </span>
                </div>
              </div>

              {/* Silver Grams */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="font-semibold text-stone-800">
                    ငွေထည်များ (ဂရမ်ဖြင့်)
                  </label>
                  <p className="text-[11px] text-stone-500">
                    ငွေထည်၊ ငွေဒင်္ဂါး၊ ငွေချောင်းများ
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={silverGrams}
                    onChange={(e) => setSilverGrams(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 pr-12 border border-stone-300 rounded-lg text-stone-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 text-right"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                    ဂရမ်
                  </span>
                </div>
              </div>

              {/* Cash in Hand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="font-semibold text-stone-800">
                    လက်ဝယ်ရှိ ငွေသား
                  </label>
                  <p className="text-[11px] text-stone-500">
                    အိမ်၊ ရုံး၊ အိတ်ကပ်အတွင်း လက်ဝယ်ငွေသား
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={cashInHand}
                    onChange={(e) => setCashInHand(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 pr-12 border border-stone-300 rounded-lg text-stone-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 text-right"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                    {currencySymbol}
                  </span>
                </div>
              </div>

              {/* Bank Balance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="font-semibold text-stone-800">
                    ဘဏ်အပ်ငွေနှင့် စုငွေစာရင်းများ
                  </label>
                  <p className="text-[11px] text-stone-500">
                    Current/Savings အပ်ငွေများ
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={bankBalance}
                    onChange={(e) => setBankBalance(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 pr-12 border border-stone-300 rounded-lg text-stone-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 text-right"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                    {currencySymbol}
                  </span>
                </div>
              </div>

              {/* Business Merchandise */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="font-semibold text-stone-800">
                    ရောင်းကုန်ပစ္စည်းလက်ကျန် (ကုန်စည်တန်ဖိုး)
                  </label>
                  <p className="text-[11px] text-stone-500">
                    ရောင်းချရန် ရည်ရွယ်ထားသော လက်ကျန်ကုန်ပစ္စည်း လက်ကားတန်ဖိုး
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={businessStock}
                    onChange={(e) => setBusinessStock(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 pr-12 border border-stone-300 rounded-lg text-stone-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 text-right"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                    {currencySymbol}
                  </span>
                </div>
              </div>

              {/* Shares & Investments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="font-semibold text-stone-800">
                    အစုရှယ်ယာနှင့် ရင်းနှီးမြှုပ်နှံမှုများ
                  </label>
                  <p className="text-[11px] text-stone-500">
                    အရောင်းအဝယ် စတော့ရှယ်ယာများ သို့မဟုတ် ရရှိလာသော အမြတ်ဝေစု
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={investments}
                    onChange={(e) => setInvestments(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 pr-12 border border-stone-300 rounded-lg text-stone-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 text-right"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                    {currencySymbol}
                  </span>
                </div>
              </div>

              {/* Loans Receivable */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="font-semibold text-stone-800">
                    ပြန်ရရန် သေချာသော ချေးငွေများ
                  </label>
                  <p className="text-[11px] text-stone-500">
                    အခြားသူထံ ချေးထားပြီး ပြန်ရရန် သေချာသည့် ငွေ
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={loansReceivable}
                    onChange={(e) => setLoansReceivable(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 pr-12 border border-stone-300 rounded-lg text-stone-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 text-right"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                    {currencySymbol}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Deductible Liabilities Card */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4 shadow-2xs">
            <h2 className="font-serif font-bold text-stone-900 text-sm sm:text-base font-myanmar flex items-center gap-2 pb-3 border-b border-stone-200">
              <TrendingUp className="w-4 h-4 text-rose-700 rotate-180" />
              <span>၃။ နှုတ်ပယ်ရမည့် တာဝန်များနှင့် ပေးရန်ရှိသော ကြွေးမြီများ</span>
            </h2>

            <div className="space-y-3.5 text-xs font-myanmar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="font-semibold text-stone-800">
                    ချက်ချင်းပေးဆပ်ရန်ရှိသော အကြွေးများ
                  </label>
                  <p className="text-[11px] text-stone-500">
                    ကာလတို ပေးဆပ်ရမည့် ကြွေးမြီအရင်း
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={debtsDue}
                    onChange={(e) => setDebtsDue(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 pr-12 border border-stone-300 rounded-lg text-stone-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 text-right"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                    {currencySymbol}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="font-semibold text-stone-800">
                    ပေးရန်ရှိသော ကုန်ပစ္စည်းဖိုးနှင့် ဘေလ်များ
                  </label>
                  <p className="text-[11px] text-stone-500">
                    ယခုလအတွင်း မဖြစ်မနေ ပေးချေရမည့် ဝန်ထမ်းလစာ/ကုန်ကြွေးများ
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={payablesDue}
                    onChange={(e) => setPayablesDue(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 pr-12 border border-stone-300 rounded-lg text-stone-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 text-right"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                    {currencySymbol}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Summary Column: Result Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          <div className="bg-[#12281e] text-white rounded-2xl p-6 sm:p-7 border border-emerald-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-4">
              <div>
                <span className="text-[11px] font-sans uppercase tracking-widest text-amber-300">
                  တွက်ချက်မှု ရလဒ်
                </span>
                <h3 className="font-serif text-xl font-bold font-myanmar text-white">
                  ဇကာသ် စိစစ်ချက်
                </h3>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-xs font-myanmar font-semibold border ${
                  isNisabReached
                    ? 'bg-emerald-950 text-emerald-200 border-emerald-500/80'
                    : 'bg-stone-900 text-stone-300 border-stone-700'
                }`}
              >
                {isNisabReached ? 'နိဆွာဗ် ပြည့်မြောက်ပါသည်' : 'နိဆွာဗ် မပြည့်သေးပါ'}
              </div>
            </div>

            {/* Financial Breakdown Rows (Tabular numerals as required) */}
            <div className="space-y-3 text-xs font-myanmar">
              <div className="flex items-center justify-between text-emerald-200/90">
                <span>စုစုပေါင်း ဇကာသ်သက်ရောက်သော ပိုင်ဆိုင်မှု:</span>
                <span className="font-mono tabular-nums text-sm font-semibold text-white">
                  {formatMoney(totalAssets)} {currencySymbol}
                </span>
              </div>

              <div className="flex items-center justify-between text-rose-300/90">
                <span>နှုတ်ပယ်ရမည့် တာဝန်ကြွေးမြီ:</span>
                <span className="font-mono tabular-nums text-sm font-semibold">
                  - {formatMoney(totalLiabilities)} {currencySymbol}
                </span>
              </div>

              <div className="pt-2 border-t border-emerald-900 flex items-center justify-between text-white">
                <span className="font-semibold">အသားတင် ပိုင်ဆိုင်မှု (Net Wealth):</span>
                <span className="font-mono tabular-nums text-base font-bold text-amber-200">
                  {formatMoney(netWealth)} {currencySymbol}
                </span>
              </div>

              <div className="flex items-center justify-between text-emerald-300/80 pt-1 text-[11px]">
                <span>
                  သတ်မှတ် နိဆွာဗ် (Nisab - {nisabBasis === 'silver' ? 'ငွေ 612.36g' : 'ရွှေ 87.48g'}):
                </span>
                <span className="font-mono tabular-nums">
                  {formatMoney(activeNisabThreshold)} {currencySymbol}
                </span>
              </div>
            </div>

            {/* Big Zakat Amount Display */}
            <div className="bg-emerald-950/90 border border-emerald-700/80 rounded-xl p-5 text-center space-y-1.5">
              <span className="text-xs uppercase tracking-wider text-amber-300 font-myanmar">
                ပေးဆောင်ရမည့် ဇကာသ် (၂.၅%)
              </span>
              <div className="font-mono tabular-nums text-3xl sm:text-4xl font-bold text-amber-300">
                {formatMoney(zakatDue)}
              </div>
              <span className="text-xs text-emerald-300 font-myanmar block">
                {currencySymbol} (၁၀၀ လျှင် ၂ ကျပ်ခွဲ)
              </span>
            </div>

            {/* Status Explanatory Note */}
            <div className="text-xs text-stone-300 leading-relaxed font-myanmar bg-black/30 p-3.5 rounded-lg border border-white/10 space-y-1">
              <p>
                {isNisabReached
                  ? 'အသင်၏ အသားတင်စည်းစိမ်သည် နိဆွာဗ်စံနှုန်းထက် ကျော်လွန်နေပြီး အစ္စလာမ့်ပြက္ခဒိန် ၁ နှစ် (ဟောလ်) ပြည့်မြောက်ပါက အထက်ပါ ၂.၅% ဇကာသ်ကို ဆင်းရဲသားဒုက္ခသည်များအား မဖြစ်မနေ ထုတ်ဝေလှူဒါန်းရမည် ဖြစ်ပါသည်။'
                  : 'လက်ရှိ အသားတင်စည်းစိမ်သည် နိဆွာဗ်စံနှုန်းသို့ မရောက်ရှိသေးပါသဖြင့် ဇကာသ်ပေးဆောင်ရန် မဖြစ်မနေ တာဝန်မသက်ရောက်သေးပါ။ သို့သော် သာမန် နဖိလ် ဆွဒကာ အလှူဒါန်းများ ပြုလုပ်နိုင်ပါသည်။'}
              </p>
            </div>

            {/* Action Buttons: Copy / Reset */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleCopySummary}
                className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-lg text-xs font-myanmar transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-stone-950" />
                    <span>ကူးယူပြီးပါပြီ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-stone-950" />
                    <span>ရလဒ် ကူးယူသိမ်းဆည်းရန်</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setGoldGrams('0');
                  setSilverGrams('0');
                  setCashInHand('0');
                  setBankBalance('0');
                  setBusinessStock('0');
                  setInvestments('0');
                  setLoansReceivable('0');
                  setDebtsDue('0');
                  setPayablesDue('0');
                }}
                className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-myanmar transition-colors"
              >
                ပြန်လည်သတ်မှတ်
              </button>
            </div>
          </div>

          {/* Quick Guidance on Zakat Beneficiaries */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3 text-xs font-myanmar shadow-2xs">
            <h4 className="font-semibold text-stone-900 font-serif text-sm">
              ဇကာသ် ရထိုက်သူ ၈ မျိုး (ကျမ်းမြတ်ကုရ်အာန် ၉:၆၀)
            </h4>
            <ul className="space-y-1.5 text-stone-600 list-disc list-inside">
              <li>အခြေခံစားဝတ်နေရေး မပြည့်စုံသော ဆင်းရဲသားများ (ဖုကွာရာ)</li>
              <li>လုံးဝဥစ္စာမဲ့ ချို့ငဲ့သူများ (မစာကီးန်)</li>
              <li>မလွှဲမရှောင်သာ အကြွေးဝန်ပိနေသူများ (ဃာရိမီးန်)</li>
              <li>ခရီးသွားရင်း ရိက္ခာငွေကြေး ပြတ်တောက်သွားသူများ (အိဗ်နုစ်စဗီးလ်)</li>
              <li>အလ္လာဟ်အရှင်မြတ်၏ လမ်းစဉ်တော် သာသနာ့အကျိုးဆောင်များ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
