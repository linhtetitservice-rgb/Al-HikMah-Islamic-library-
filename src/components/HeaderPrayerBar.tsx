import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Compass,
  AlertCircle,
  Calendar,
  ChevronDown,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Volume2,
  VolumeX,
  Wifi,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import {
  calculatePrayerTimes,
  getHijriDate,
  fetchLiveNetworkPrayerData,
  fetchLiveNetworkDate,
  NetworkPrayerResponse,
  MYANMAR_CITIES,
  toMyanmarDigits,
} from '../utils/islamicTimes';
import { CityLocation, HijriDateInfo, PrayerTimeItem } from '../types';

interface HeaderPrayerBarProps {
  onOpenPrayerModal: () => void;
  selectedCity: CityLocation;
  onSelectCity: (city: CityLocation) => void;
}

export const HeaderPrayerBar: React.FC<HeaderPrayerBarProps> = ({
  onOpenPrayerModal,
  selectedCity,
  onSelectCity,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [networkClockOffset, setNetworkClockOffset] = useState<number>(0);
  const [hijriOffset, setHijriOffset] = useState<number>(0);
  const [asrMethod, setAsrMethod] = useState<'hanafi' | 'shafii'>('hanafi');
  const [showCityDropdown, setShowCityDropdown] = useState<boolean>(false);
  const [isSyncingNet, setIsSyncingNet] = useState<boolean>(false);
  const [netResponse, setNetResponse] = useState<NetworkPrayerResponse | null>(() => {
    // Try restoring immediately from localStorage cache to prevent flicker
    const cached = localStorage.getItem(`alhikmah_verified_prayer_${selectedCity.id}_1_0`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Live clock tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date(Date.now() + networkClockOffset));
    }, 1000);
    return () => clearInterval(timer);
  }, [networkClockOffset]);

  // Fetch live network prayer times & network date
  const loadNetworkPrayerData = () => {
    setIsSyncingNet(true);
    fetchLiveNetworkPrayerData(selectedCity, asrMethod, hijriOffset)
      .then((res) => {
        setNetResponse(res);
        if (res.networkTimestamp) {
          setNetworkClockOffset(res.networkTimestamp - Date.now());
        }
        setIsSyncingNet(false);
      })
      .catch((err) => {
        console.error('Network sync error:', err);
        setIsSyncingNet(false);
      });
  };

  useEffect(() => {
    loadNetworkPrayerData();
  }, [selectedCity, asrMethod, hijriOffset]);

  // Use network-based data if available, fallback to astronomical calculation
  const hijri: HijriDateInfo = netResponse
    ? netResponse.hijri
    : getHijriDate(currentTime, hijriOffset);
  const prayerData = netResponse
    ? netResponse.prayerData
    : calculatePrayerTimes(selectedCity, currentTime, asrMethod);

  // Current Myanmar time formatted
  const myanmarTimeFormatted = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('my-MM', {
        timeZone: 'Asia/Yangon',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(currentTime);
    } catch (e) {
      const h = currentTime.getHours();
      const m = currentTime.getMinutes();
      const s = currentTime.getSeconds();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${toMyanmarDigits(String(h12).padStart(2, '0'))}:${toMyanmarDigits(String(m).padStart(2, '0'))}:${toMyanmarDigits(String(s).padStart(2, '0'))} ${ampm}`;
    }
  }, [currentTime]);

  // Current Gregorian Date in Burmese
  const gregorianDateFormatted = useMemo(() => {
    if (netResponse?.networkDate?.formattedMm) {
      return netResponse.networkDate.formattedMm;
    }
    const dayNames = ['တနင်္ဂနွေ', 'တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး', 'ကြာသပတေး', 'သောကြာ', 'စနေ'];
    const monthNames = [
      'ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်',
      'ဇူလိုင်', 'သြဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'
    ];
    return `${toMyanmarDigits(currentTime.getFullYear())} ခုနှစ်၊ ${monthNames[currentTime.getMonth()]}လ (${toMyanmarDigits(currentTime.getDate())}) ရက်၊ ${dayNames[currentTime.getDay()]}နေ့`;
  }, [netResponse, currentTime]);

  // Check if current time is in Makrooh window
  const currentHHMM = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Yangon',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(currentTime);
      const h = parts.find((p) => p.type === 'hour')?.value || '00';
      const m = parts.find((p) => p.type === 'minute')?.value || '00';
      return `${h}:${m}`;
    } catch (e) {
      return `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
    }
  }, [currentTime]);

  const activeMakrooh = prayerData.makroohTimes.find(
    (m) => currentHHMM >= m.start && currentHHMM <= m.end
  );

  return (
    <div className="bg-[#0e271d] text-emerald-100 border-b border-emerald-900/60 text-xs selection:bg-emerald-700 selection:text-white">
      {/* Top Utility Strip: Hijri Date (السلامي تاریخ), Gregorian Date, Network Status & Controls */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-y-2 border-b border-emerald-900/40">
        {/* Left: Dual Dates (Hijri Date & Network Gregorian Date) */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Hijri Date (التاريخ الإسلامي) */}
          <div className="flex items-center gap-1.5 font-medium text-amber-300 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-amber-500/30 shadow-2xs">
            <Moon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-arabic text-sm tracking-wide">التاريخ الإسلامي:</span>
            <span className="font-myanmar font-semibold text-amber-200">
              {toMyanmarDigits(hijri.day)} {hijri.monthNameMm} {toMyanmarDigits(hijri.year)} ဟိဂျ်ရီ
            </span>
            <span className="text-emerald-400/80 font-arabic text-xs hidden md:inline">
              ({hijri.monthNameAr})
            </span>
          </div>

          {/* Hijri Lunar Sight adjustment */}
          <div className="flex items-center gap-1 text-[11px] text-emerald-300/80 bg-emerald-950/70 rounded px-1.5 py-0.5 border border-emerald-800/60">
            <span className="font-myanmar">လခြမ်းစံ:</span>
            <button
              onClick={() => setHijriOffset((prev) => prev - 1)}
              title="ဟိဂျ်ရီရက် ၁ ရက် လျှော့ရန်"
              className="px-1 hover:text-amber-300 transition-colors font-mono font-bold"
            >
              -၁
            </button>
            <span className="text-emerald-500">|</span>
            <button
              onClick={() => setHijriOffset((prev) => prev + 1)}
              title="ဟိဂျ်ရီရက် ၁ ရက် တိုးရန်"
              className="px-1 hover:text-amber-300 transition-colors font-mono font-bold"
            >
              +၁
            </button>
          </div>

          {/* Verified Network Gregorian Date */}
          <div className="flex items-center gap-1.5 text-emerald-200 font-myanmar bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
            <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-emerald-400 font-medium">ခရစ်နှစ်:</span>
            <span className="text-emerald-100 font-semibold">{gregorianDateFormatted}</span>
          </div>

          {/* Live Myanmar Time */}
          <div className="flex items-center gap-1.5 text-amber-300/90 font-myanmar bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] text-emerald-400">စံတော်ချိန်:</span>
            <span className="font-semibold text-amber-200 tabular-nums">{myanmarTimeFormatted}</span>
          </div>

          {hijri.islamicEvent && (
            <span className="text-[11px] text-amber-300 font-myanmar bg-amber-950/70 border border-amber-600/60 rounded px-2 py-0.5 animate-pulse flex items-center gap-1">
              <span>★</span>
              <span>{hijri.islamicEvent}</span>
            </span>
          )}
        </div>

        {/* Right: Network Status, Countdown & Settings */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Live Network Sync Status & Refresh Button */}
          <button
            onClick={loadNetworkPrayerData}
            title="အင်တာနက် (Network) မှ အချိန်ဇယားနှင့် နေ့ရက်ကို တိုက်ရိုက် ပြန်လည်ချိန်ညှိရန်"
            className="flex items-center gap-1.5 text-[11px] bg-emerald-950 hover:bg-emerald-900/90 px-2.5 py-1 rounded border border-emerald-700/80 text-emerald-200 transition-colors shadow-2xs"
          >
            <Wifi className={`w-3.5 h-3.5 ${netResponse?.isFromNetwork ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="font-myanmar hidden xl:inline">Net အချိန်ဇယား:</span>
            <span className="font-myanmar font-semibold text-amber-300">
              {netResponse?.isFromNetwork ? 'Network ချိန်ညှိပြီး' : 'ချိန်ညှိဆဲ'}
            </span>
            <RefreshCw className={`w-3 h-3 text-amber-300 ${isSyncingNet ? 'animate-spin' : ''}`} />
          </button>

          {/* Next Prayer Countdown Notice */}
          <div className="flex items-center gap-1.5 text-emerald-200 font-myanmar bg-emerald-950/70 px-2 py-1 rounded border border-emerald-800/60">
            <span className="text-emerald-400">လာမည့် နမားဇ်:</span>
            <span className="font-bold text-amber-300">{prayerData.nextPrayer.nameMm}</span>
            <span className="text-emerald-300 font-mono text-[11px]">
              ({toMyanmarDigits(prayerData.nextPrayer.time)})
            </span>
            <span className="text-amber-400 font-medium text-[11px]">
              {prayerData.nextPrayer.minutesRemaining >= 60
                ? `${toMyanmarDigits(Math.floor(prayerData.nextPrayer.minutesRemaining / 60))} နာရီ ${toMyanmarDigits(prayerData.nextPrayer.minutesRemaining % 60)} မိနစ်အလို`
                : `${toMyanmarDigits(prayerData.nextPrayer.minutesRemaining)} မိနစ်အလို`}
            </span>
          </div>

          {/* City Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="flex items-center gap-1.5 bg-emerald-950 hover:bg-emerald-900 px-2 py-1 rounded border border-emerald-800 text-emerald-100 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-myanmar">{selectedCity.nameMm}</span>
              <ChevronDown className="w-3 h-3 text-emerald-400" />
            </button>

            {showCityDropdown && (
              <div className="absolute right-0 mt-1 w-44 bg-[#0d221a] border border-emerald-800 rounded-md shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] text-emerald-400 uppercase tracking-wider font-semibold border-b border-emerald-800/50">
                  မြန်မာနိုင်ငံ မြို့ကြီးများ
                </div>
                {MYANMAR_CITIES.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      onSelectCity(city);
                      setShowCityDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 font-myanmar hover:bg-emerald-800/60 flex items-center justify-between text-xs ${
                      selectedCity.id === city.id ? 'text-amber-300 bg-emerald-900/40 font-medium' : 'text-emerald-200'
                    }`}
                  >
                    <span>{city.nameMm}</span>
                    <span className="text-[10px] text-emerald-400/80">{city.nameEn}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hanafi / Shafi'i Asr Toggle */}
          <button
            onClick={() => setAsrMethod(asrMethod === 'hanafi' ? 'shafii' : 'hanafi')}
            title="အဆွရ်တွက်ချက်မှု မဇ်ဟဗ်စံနှုန်း ပြောင်းရန်"
            className="text-[11px] bg-emerald-950 hover:bg-emerald-900 px-2 py-1 rounded border border-emerald-800 text-emerald-300"
          >
            {asrMethod === 'hanafi' ? 'ဟာနဖီ (Hanafi)' : 'ရှာဖိအီ (Shafi\'i)'}
          </button>

          {/* Full Schedule Modal Trigger */}
          <button
            onClick={onOpenPrayerModal}
            className="flex items-center gap-1 text-[11px] bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-2.5 py-1 rounded transition-colors shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-950" />
            <span className="font-myanmar">ဇယားအပြည့်စုံ</span>
          </button>
        </div>
      </div>

      {/* Makrooh Prohibited Window Alert Banner (if currently in makrooh time) */}
      {activeMakrooh && (
        <div className="bg-red-950/90 text-red-200 border-b border-red-800/70 px-4 py-1.5 text-center font-myanmar text-xs flex items-center justify-center gap-2 animate-pulse">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            သတိပြုရန်: လက်ရှိအချိန်သည် <strong>မက္ကရူဟ် (ဆွလာသ်ဖတ်ခြင်း ပညတ်မထားသော) အချိန်</strong> ဖြစ်ပါသည်: {activeMakrooh.reasonMm} ({toMyanmarDigits(activeMakrooh.start)} - {toMyanmarDigits(activeMakrooh.end)})
          </span>
        </div>
      )}

      {/* 5 Daily Prayers + Sunrise, Sunset, Zawal Grid Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-between min-w-[760px] gap-2">
          {/* Fajr */}
          <div className="flex-1 bg-emerald-950/70 border border-emerald-800/60 rounded-lg p-2 flex flex-col items-center justify-center hover:border-amber-400/50 transition-colors">
            <span className="text-[10px] text-emerald-400 font-arabic">الفجر</span>
            <span className="font-myanmar font-medium text-emerald-200 text-xs">စုဗဟ် (ဖဂျရ်)</span>
            <span className="font-mono text-amber-300 text-sm font-semibold tracking-wider">
              {toMyanmarDigits(prayerData.fajr)}
            </span>
          </div>

          {/* Sunrise (နေထွက်) */}
          <div className="flex-1 bg-amber-950/30 border border-amber-800/50 rounded-lg p-2 flex flex-col items-center justify-center hover:border-amber-400/50 transition-colors">
            <span className="text-[10px] text-amber-400 font-arabic">الشروق</span>
            <span className="font-myanmar font-medium text-amber-200 text-xs">နေထွက်ချိန်</span>
            <span className="font-mono text-amber-300 text-sm font-semibold tracking-wider">
              {toMyanmarDigits(prayerData.sunrise)}
            </span>
          </div>

          {/* Solar Noon / Zawal (မွန်းတည့်ချိန်) */}
          <div className="flex-1 bg-stone-900/70 border border-stone-700/70 rounded-lg p-2 flex flex-col items-center justify-center hover:border-amber-400/50 transition-colors">
            <span className="text-[10px] text-stone-400 font-arabic">الزوال / الاستواء</span>
            <span className="font-myanmar font-medium text-stone-300 text-xs">မွန်းတည့် (ဇဝါလ်)</span>
            <span className="font-mono text-stone-200 text-sm font-semibold tracking-wider">
              {toMyanmarDigits(prayerData.solarNoon)}
            </span>
          </div>

          {/* Dhuhr */}
          <div className="flex-1 bg-emerald-950/70 border border-emerald-800/60 rounded-lg p-2 flex flex-col items-center justify-center hover:border-amber-400/50 transition-colors">
            <span className="text-[10px] text-emerald-400 font-arabic">الظهر</span>
            <span className="font-myanmar font-medium text-emerald-200 text-xs">ဇုဟ်ရ်</span>
            <span className="font-mono text-amber-300 text-sm font-semibold tracking-wider">
              {toMyanmarDigits(prayerData.dhuhr)}
            </span>
          </div>

          {/* Asr */}
          <div className="flex-1 bg-emerald-950/70 border border-emerald-800/60 rounded-lg p-2 flex flex-col items-center justify-center hover:border-amber-400/50 transition-colors">
            <span className="text-[10px] text-emerald-400 font-arabic">العصر</span>
            <span className="font-myanmar font-medium text-emerald-200 text-xs">အဆွရ်</span>
            <span className="font-mono text-amber-300 text-sm font-semibold tracking-wider">
              {toMyanmarDigits(prayerData.asr)}
            </span>
          </div>

          {/* Sunset / Iftar (နေဝင်) */}
          <div className="flex-1 bg-amber-950/40 border border-amber-700/60 rounded-lg p-2 flex flex-col items-center justify-center hover:border-amber-400/50 transition-colors">
            <span className="text-[10px] text-amber-400 font-arabic">الغروب (الإفطار)</span>
            <span className="font-myanmar font-medium text-amber-200 text-xs">နေဝင် (ဝါဖြေ)</span>
            <span className="font-mono text-amber-300 text-sm font-semibold tracking-wider">
              {toMyanmarDigits(prayerData.sunset)}
            </span>
          </div>

          {/* Maghrib */}
          <div className="flex-1 bg-emerald-950/70 border border-emerald-800/60 rounded-lg p-2 flex flex-col items-center justify-center hover:border-amber-400/50 transition-colors">
            <span className="text-[10px] text-emerald-400 font-arabic">المغرب</span>
            <span className="font-myanmar font-medium text-emerald-200 text-xs">မဂ်ရိဗ်</span>
            <span className="font-mono text-amber-300 text-sm font-semibold tracking-wider">
              {toMyanmarDigits(prayerData.maghrib)}
            </span>
          </div>

          {/* Isha */}
          <div className="flex-1 bg-emerald-950/70 border border-emerald-800/60 rounded-lg p-2 flex flex-col items-center justify-center hover:border-amber-400/50 transition-colors">
            <span className="text-[10px] text-emerald-400 font-arabic">العشاء</span>
            <span className="font-myanmar font-medium text-emerald-200 text-xs">အီရှာ</span>
            <span className="font-mono text-amber-300 text-sm font-semibold tracking-wider">
              {toMyanmarDigits(prayerData.isha)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
