import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Compass,
  Clock,
  Printer,
  AlertTriangle,
  Sun,
  Moon,
  Info,
  ChevronLeft,
  ChevronRight,
  Wifi,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { CityLocation, HijriDateInfo, NetworkDateInfo } from '../types';
import {
  calculatePrayerTimes,
  getHijriDate,
  fetchLiveNetworkMonthlyCalendar,
  fetchLiveNetworkDate,
  MYANMAR_CITIES,
  MONTH_NAMES_MM,
  toMyanmarDigits,
} from '../utils/islamicTimes';

interface PrayerTimesModalProps {
  onClose: () => void;
  selectedCity: CityLocation;
  onSelectCity: (city: CityLocation) => void;
}

export const PrayerTimesModal: React.FC<PrayerTimesModalProps> = ({
  onClose,
  selectedCity,
  onSelectCity,
}) => {
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(0);
  const [asrMethod, setAsrMethod] = useState<'hanafi' | 'shafii'>('hanafi');
  const [scheduleRows, setScheduleRows] = useState<any[]>([]);
  const [isLoadingNet, setIsLoadingNet] = useState<boolean>(true);
  const [isNetVerified, setIsNetVerified] = useState<boolean>(false);
  const [networkDate, setNetworkDate] = useState<NetworkDateInfo | null>(null);

  // Fetch verified network date
  useEffect(() => {
    fetchLiveNetworkDate().then((nd) => {
      setNetworkDate(nd);
    });
  }, []);

  const baseYear = networkDate ? networkDate.year : new Date().getFullYear();
  const baseMonth = networkDate ? networkDate.month : new Date().getMonth() + 1;

  const targetDate = new Date(baseYear, baseMonth - 1 + selectedMonthOffset, 1);
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth() + 1;

  const loadCalendar = () => {
    setIsLoadingNet(true);
    fetchLiveNetworkMonthlyCalendar(selectedCity, targetYear, targetMonth, asrMethod)
      .then((rows) => {
        setScheduleRows(rows);
        setIsNetVerified(true);
        setIsLoadingNet(false);
      })
      .catch((err) => {
        console.error('Calendar load error:', err);
        setIsLoadingNet(false);
      });
  };

  useEffect(() => {
    loadCalendar();
  }, [selectedCity, selectedMonthOffset, asrMethod, baseYear, baseMonth]);

  const handlePrint = () => {
    window.print();
  };

  const todayRow = scheduleRows.find((r) => r.isToday);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-emerald-950 text-white shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif font-bold text-lg font-myanmar text-amber-200">
                နမားဇ်အချိန်ဇယားနှင့် နက္ခတ္တဆိုင်ရာ အချိန်များ
              </h3>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-emerald-300 font-myanmar flex-wrap">
              <span className="font-medium text-emerald-100">{selectedCity.nameMm} မြို့ ({selectedCity.nameEn})</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-amber-300 font-medium bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-800">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>Net အချိန်ဇယား (Karachi 18°/18° စံနှုန်း)</span>
              </span>
              {networkDate && (
                <>
                  <span>·</span>
                  <span className="text-emerald-300">
                    ယနေ့ရက်စွဲ: {toMyanmarDigits(networkDate.dateFormattedMm)}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadCalendar}
              title="အင်တာနက်မှ အချိန်ဇယား ပြန်လည်ရယူရန်"
              className="p-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-amber-200 text-xs transition-colors flex items-center gap-1 font-myanmar"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${isLoadingNet ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Net ချိန်ညှိရန်</span>
            </button>
            <button
              onClick={handlePrint}
              title="အချိန်ဇယား ပရင့်ထုတ်ရန်"
              className="p-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-amber-200 text-xs transition-colors flex items-center gap-1 font-myanmar"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">ပရင့်ထုတ်ရန်</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3 text-xs font-myanmar shrink-0">
          {/* City Selection */}
          <div className="flex items-center gap-2">
            <span className="text-stone-600 font-medium">တည်နေရာ:</span>
            <select
              value={selectedCity.id}
              onChange={(e) => {
                const c = MYANMAR_CITIES.find((item) => item.id === e.target.value);
                if (c) onSelectCity(c);
              }}
              className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              {MYANMAR_CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.nameMm} ({city.nameEn})
                </option>
              ))}
            </select>
          </div>

          {/* Month Switcher Controls */}
          <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-lg p-1 shadow-2xs">
            <button
              onClick={() => setSelectedMonthOffset((prev) => prev - 1)}
              className="p-1 hover:bg-stone-100 rounded text-stone-600 transition-colors"
              title="ရှေ့လသို့"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-semibold text-stone-900">
              {MONTH_NAMES_MM[targetMonth - 1]} {toMyanmarDigits(targetYear)}
            </span>

            <button
              onClick={() => setSelectedMonthOffset((prev) => prev + 1)}
              className="p-1 hover:bg-stone-100 rounded text-stone-600 transition-colors"
              title="နောက်လသို့"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {selectedMonthOffset !== 0 && (
              <button
                onClick={() => setSelectedMonthOffset(0)}
                className="px-2 py-0.5 ml-1 bg-emerald-100 text-emerald-900 hover:bg-emerald-200 rounded text-[11px] font-semibold transition-colors"
              >
                ယခုလ
              </button>
            )}
          </div>

          {/* Asr Calculation Method */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-600 font-medium">အဆွရ် စံနှုန်း:</span>
            <button
              onClick={() => setAsrMethod('hanafi')}
              className={`px-2.5 py-1 rounded transition-colors ${
                asrMethod === 'hanafi'
                  ? 'bg-emerald-900 text-white font-medium shadow-2xs'
                  : 'bg-white text-stone-700 border border-stone-300'
              }`}
            >
              ဟာနဖီ (အရိပ် ၂ ဆ)
            </button>
            <button
              onClick={() => setAsrMethod('shafii')}
              className={`px-2.5 py-1 rounded transition-colors ${
                asrMethod === 'shafii'
                  ? 'bg-emerald-900 text-white font-medium shadow-2xs'
                  : 'bg-white text-stone-700 border border-stone-300'
              }`}
            >
              ရှာဖိအီ (အရိပ် ၁ ဆ)
            </button>
          </div>
        </div>

        {/* Today's Highlight Summary Card if on current month */}
        {todayRow && (
          <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-800 text-white text-[11px] font-bold px-2 py-0.5 rounded font-myanmar">
                ယနေ့ အချိန်
              </span>
              <span className="font-semibold text-emerald-950 font-myanmar">
                {toMyanmarDigits(todayRow.day)} {MONTH_NAMES_MM[targetMonth - 1]} ({todayRow.dayNameMm}) · ဟိဂျ်ရီ: {toMyanmarDigits(todayRow.hijriDay)} {todayRow.hijriMonthMm}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-emerald-900 font-semibold flex-wrap">
              <span>စုဗဟ်: {toMyanmarDigits(todayRow.fajr)}</span>
              <span>·</span>
              <span>နေထွက်: {toMyanmarDigits(todayRow.sunrise)}</span>
              <span>·</span>
              <span>ဇဝါလ်: {toMyanmarDigits(todayRow.zawal)}</span>
              <span>·</span>
              <span>ဇုဟ်ရ်: {toMyanmarDigits(todayRow.dhuhr)}</span>
              <span>·</span>
              <span>အဆွရ်: {toMyanmarDigits(todayRow.asr)}</span>
              <span>·</span>
              <span>နေဝင်/ဝါဖြေ: {toMyanmarDigits(todayRow.sunset)}</span>
              <span>·</span>
              <span>အီရှာ: {toMyanmarDigits(todayRow.isha)}</span>
            </div>
          </div>
        )}

        {/* Makrooh Guidance Box */}
        <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-950 font-myanmar space-y-0.5 shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>အစ္စလာမ်တရားတော်အရ ဆွလာသ်ဖတ်ခြင်း မပြုရသော (မက္ကရူဟ်) အချိန် ၃ ချိန်:</span>
          </div>
          <p className="text-[11px] text-amber-900/90 leading-relaxed pl-5">
            (၁) နေစတင်ထွက်ချိန်မှ ၁၅-၂၀ မိနစ်ခန့်အထိ · (၂) နေ မွန်းတည့်တည့်ကျချိန် (ဇဝါလ်) · (၃) နေဝင်ခါနီး နေရောင်ဝါနီချိန် (အဆွရ် ကွာဇာဆွလာသ်မှလွဲ၍ မည်သည့်နမားဇ်မျှ ဖတ်ခွင့်မရှိပါ)
          </p>
        </div>

        {/* Schedule Table Container */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs font-myanmar border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-700 border-b border-stone-200 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="p-2.5">ရက်စွဲ (ခရစ်နှစ်)</th>
                  <th className="p-2.5">ဟိဂျ်ရီရက်</th>
                  <th className="p-2.5 text-center text-emerald-900">စုဗဟ် (ဖဂျရ်)</th>
                  <th className="p-2.5 text-center text-amber-800">နေထွက်</th>
                  <th className="p-2.5 text-center text-stone-600">မွန်းတည့် (ဇဝါလ်)</th>
                  <th className="p-2.5 text-center text-emerald-900">ဇုဟ်ရ်</th>
                  <th className="p-2.5 text-center text-emerald-900">အဆွရ်</th>
                  <th className="p-2.5 text-center text-amber-900">နေဝင် (ဝါဖြေ)</th>
                  <th className="p-2.5 text-center text-emerald-900">မဂ်ရိဗ်</th>
                  <th className="p-2.5 text-center text-emerald-900">အီရှာ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {scheduleRows.map((row) => (
                  <tr
                    key={row.day}
                    className={`transition-colors font-mono tabular-nums ${
                      row.isToday
                        ? 'bg-amber-100/80 font-bold text-stone-900 ring-2 ring-amber-400/60 ring-inset'
                        : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <td className="p-2.5 font-myanmar whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {row.isToday && (
                          <span className="text-[10px] bg-amber-500 text-amber-950 font-bold px-1.5 py-0.5 rounded">
                            ယနေ့
                          </span>
                        )}
                        <span>
                          {toMyanmarDigits(row.day)} ({row.dayNameMm})
                        </span>
                      </div>
                    </td>
                    <td className="p-2.5 font-myanmar whitespace-nowrap text-stone-600">
                      {toMyanmarDigits(row.hijriDay)} {row.hijriMonthMm}
                    </td>
                    <td className="p-2.5 text-center font-semibold text-emerald-900">
                      {toMyanmarDigits(row.fajr)}
                    </td>
                    <td className="p-2.5 text-center text-amber-800 bg-amber-50/40">
                      {toMyanmarDigits(row.sunrise)}
                    </td>
                    <td className="p-2.5 text-center text-stone-600 bg-stone-50/60">
                      {toMyanmarDigits(row.zawal)}
                    </td>
                    <td className="p-2.5 text-center text-emerald-900">
                      {toMyanmarDigits(row.dhuhr)}
                    </td>
                    <td className="p-2.5 text-center text-emerald-900">
                      {toMyanmarDigits(row.asr)}
                    </td>
                    <td className="p-2.5 text-center text-amber-900 bg-amber-50/50 font-semibold">
                      {toMyanmarDigits(row.sunset)}
                    </td>
                    <td className="p-2.5 text-center text-emerald-900">
                      {toMyanmarDigits(row.maghrib)}
                    </td>
                    <td className="p-2.5 text-center text-emerald-900">
                      {toMyanmarDigits(row.isha)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-3 border-t border-stone-200 bg-stone-50 text-[11px] text-stone-500 text-center font-myanmar shrink-0 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            ဤအချိန်ဇယားသည် အင်တာနက် Network (University of Islamic Sciences, Karachi 18°/18° စံနှုန်း) မှ တိုက်ရိုက်ရယူ၍ မြန်မာစံတော်ချိန် (UTC+06:30) ဖြင့် အတိအကျ တွက်ချက်ထားပါသည်။
          </span>
        </div>
      </div>
    </div>
  );
};
