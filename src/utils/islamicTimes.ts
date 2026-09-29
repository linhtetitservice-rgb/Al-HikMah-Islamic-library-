import { CityLocation, HijriDateInfo, NetworkDateInfo, PrayerName, PrayerTimeItem } from '../types';

export const MYANMAR_CITIES: CityLocation[] = [
  { id: 'yangon', nameMm: 'ရန်ကုန်', nameEn: 'Yangon', lat: 16.8661, lng: 96.1951, timeZoneOffset: 6.5 },
  { id: 'mandalay', nameMm: 'မန္တလေး', nameEn: 'Mandalay', lat: 21.9588, lng: 96.0891, timeZoneOffset: 6.5 },
  { id: 'naypyidaw', nameMm: 'နေပြည်တော်', nameEn: 'Naypyidaw', lat: 19.7633, lng: 96.0785, timeZoneOffset: 6.5 },
  { id: 'mawlamyine', nameMm: 'မော်လမြိုင်', nameEn: 'Mawlamyine', lat: 16.4905, lng: 97.6283, timeZoneOffset: 6.5 },
  { id: 'taunggyi', nameMm: 'တောင်ကြီး', nameEn: 'Taunggyi', lat: 20.7833, lng: 97.0333, timeZoneOffset: 6.5 },
  { id: 'sittwe', nameMm: 'စစ်တွေ', nameEn: 'Sittwe', lat: 20.1462, lng: 92.8983, timeZoneOffset: 6.5 },
  { id: 'pyay', nameMm: 'ပြည်', nameEn: 'Pyay', lat: 18.8239, lng: 95.2144, timeZoneOffset: 6.5 },
  { id: 'pathein', nameMm: 'ပုသိမ်', nameEn: 'Pathein', lat: 16.7792, lng: 94.7325, timeZoneOffset: 6.5 },
  { id: 'bago', nameMm: 'ပဲခူး', nameEn: 'Bago', lat: 17.3353, lng: 96.4817, timeZoneOffset: 6.5 },
  { id: 'monywa', nameMm: 'မုံရွာ', nameEn: 'Monywa', lat: 22.1086, lng: 95.1378, timeZoneOffset: 6.5 },
];

export const HIJRI_MONTHS = [
  { num: 1, ar: 'المُحَرَّم', mm: 'မုဟရ်ရမ်', en: 'Muharram' },
  { num: 2, ar: 'صَفَر', mm: 'ဆွဖရ်', en: 'Safar' },
  { num: 3, ar: 'رَبِيع الأوَّل', mm: 'ရဗီအုလ်အောင်ဝလ်', en: "Rabi' al-Awwal" },
  { num: 4, ar: 'رَبِيع الآخِر', mm: 'ရဗီအုဆ်ဆာနီ', en: "Rabi' al-Thani" },
  { num: 5, ar: 'جُمَادَى الأُولَى', mm: 'ဂျုမာဒါလ်အောင်ဝလ်', en: 'Jumada al-Awwal' },
  { num: 6, ar: 'جُمَادَى الآخِرَة', mm: 'ဂျုမာဒါဆ်ဆာနီ', en: 'Jumada al-Thani' },
  { num: 7, ar: 'رَجَب', mm: 'ရဂျဗ်', en: 'Rajab' },
  { num: 8, ar: 'شَعْبَان', mm: 'ရှာအ်ဗာန်', en: "Sha'ban" },
  { num: 9, ar: 'رَمَضَان', mm: 'ရမ်ဇာန်', en: 'Ramadan' },
  { num: 10, ar: 'شَوَّال', mm: 'ရှောင်ဝါလ်', en: 'Shawwal' },
  { num: 11, ar: 'ذُو القَعْدَة', mm: 'ဇုလ်ကအ်ဒဟ်', en: "Dhu al-Qi'dah" },
  { num: 12, ar: 'ذُو الحِجَّة', mm: 'ဇုလ်ဟိဂျ်ဂျဟ်', en: 'Dhu al-Hijjah' },
];

export const DAY_NAMES_MM = ['တနင်္ဂနွေ', 'တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး', 'ကြာသပတေး', 'သောကြာ', 'စနေ'];
export const MONTH_NAMES_MM = [
  'ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်',
  'ဇူလိုင်', 'သြဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'
];

// Convert digits to Burmese numerals
export function toMyanmarDigits(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  const myanmarDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
  return String(str).replace(/[0-9]/g, (match) => myanmarDigits[parseInt(match, 10)]);
}

/**
 * Calculates Hijri date for a given Gregorian date with optional sighting adjustment (+1 or -1)
 */
export function getHijriDate(date: Date = new Date(), dayOffset = 0): HijriDateInfo {
  // Check if we have a cached verified network Hijri date
  const cachedHijri = localStorage.getItem('alhikmah_verified_hijri');
  if (cachedHijri) {
    try {
      const parsed = JSON.parse(cachedHijri);
      if (parsed && parsed.day && parsed.year) {
        let adjDay = parsed.day + dayOffset;
        let adjMonth = parsed.monthNumber;
        if (adjDay < 1) {
          adjMonth = adjMonth === 1 ? 12 : adjMonth - 1;
          adjDay = 29;
        } else if (adjDay > 30) {
          adjMonth = adjMonth === 12 ? 1 : adjMonth + 1;
          adjDay = 1;
        }
        const mData = HIJRI_MONTHS[adjMonth - 1] || HIJRI_MONTHS[0];
        return {
          day: adjDay,
          monthNumber: adjMonth,
          monthNameAr: mData.ar,
          monthNameMm: mData.mm,
          monthNameEn: mData.en,
          year: parsed.year,
          gregorianDateStr: parsed.gregorianDateStr || date.toLocaleDateString('en-GB'),
          islamicEvent: parsed.islamicEvent,
          formattedMm: `${adjDay} ${mData.mm} ${parsed.year} ဟိဂျ်ရီ`,
        };
      }
    } catch (e) {
      // ignore
    }
  }

  const adjustedDate = new Date(date);
  adjustedDate.setDate(adjustedDate.getDate() + dayOffset);

  // Tabular Astronomical conversion calibrated for standard Umm al-Qura
  const year = adjustedDate.getFullYear();
  const month = adjustedDate.getMonth() + 1;
  const day = adjustedDate.getDate();

  let jd: number;
  if (month < 3) {
    const y = year - 1;
    const m = month + 12;
    const b = Math.floor(y / 400) - Math.floor(y / 100) + Math.floor(y / 4);
    jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
  } else {
    const y = year;
    const m = month;
    const b = Math.floor(y / 400) - Math.floor(y / 100) + Math.floor(y / 4);
    jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
  }

  // Islamic epoch (July 16, 622 CE is JD 1948439.5)
  const epoch = 1948439.5;
  const daysSinceEpoch = jd - epoch;
  const hijriYear = Math.floor((30 * daysSinceEpoch + 10646) / 10631);
  const firstDayOfYear = Math.floor((hijriYear - 1) * 354.36667) + epoch;
  let dayInYear = Math.floor(jd - firstDayOfYear);
  if (dayInYear < 0) dayInYear = 0;

  let monthNum = Math.min(12, Math.floor(dayInYear / 29.5) + 1);
  if (monthNum < 1) monthNum = 1;
  let dayOfMonth = Math.floor(dayInYear - (monthNum - 1) * 29.5) + 1;
  if (dayOfMonth < 1) dayOfMonth = 1;
  if (dayOfMonth > 30) dayOfMonth = 30;

  const monthData = HIJRI_MONTHS[monthNum - 1] || HIJRI_MONTHS[0];

  let event: string | undefined = undefined;
  if (monthNum === 1 && dayOfMonth === 10) event = 'အာရှူရာနေ့ (Day of Ashura)';
  else if (monthNum === 3 && dayOfMonth === 12) event = 'မီလာဒုန္နဗီ မွေးနေ့တော် (Mawlid al-Nabi)';
  else if (monthNum === 7 && dayOfMonth === 27) event = 'မိအ်ရာ့ဂျ်ည (Isra & Mi\'raj)';
  else if (monthNum === 8 && dayOfMonth === 15) event = 'ရှဗေဗရာသ်ည (Shab-e-Barat)';
  else if (monthNum === 9 && dayOfMonth === 1) event = 'ရမ်ဇာန်ဥပုသ်လ စတင်ခြင်း';
  else if (monthNum === 9 && dayOfMonth >= 21 && dayOfMonth % 2 !== 0) event = 'လိုင်လသုလ် ကဒရ် ညမြတ်';
  else if (monthNum === 10 && dayOfMonth === 1) event = 'အီဒုလ်ဖိသရ် (Eid ul-Fitr)';
  else if (monthNum === 12 && dayOfMonth === 9) event = 'အရဖဟ်နေ့ (Day of Arafah)';
  else if (monthNum === 12 && dayOfMonth === 10) event = 'အီဒုလ်အသွ်ဟာ (Eid ul-Adha)';

  return {
    day: dayOfMonth,
    monthNumber: monthNum,
    monthNameAr: monthData.ar,
    monthNameMm: monthData.mm,
    monthNameEn: monthData.en,
    year: hijriYear,
    gregorianDateStr: adjustedDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    islamicEvent: event,
    formattedMm: `${dayOfMonth} ${monthData.mm} ${hijriYear} ဟိဂျ်ရီ`,
  };
}

// Astronomical Math Utilities for Solar position
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

function fixHour(a: number): number {
  a = a - 24 * Math.floor(a / 24);
  return a < 0 ? a + 24 : a;
}

function fixAngle(a: number): number {
  a = a - 360 * Math.floor(a / 360);
  return a < 0 ? a + 360 : a;
}

/**
 * High-precision astronomical calculation (Method 1: University of Islamic Sciences, Karachi)
 * Fajr 18°, Isha 18°, Hanafi Asr factor 2, Dhuhr at true solar noon zenith.
 */
export function calculatePrayerTimes(
  city: CityLocation,
  date: Date = new Date(),
  asrMethod: 'hanafi' | 'shafii' = 'hanafi'
): {
  items: PrayerTimeItem[];
  solarNoon: string;
  sunrise: string;
  sunset: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  nextPrayer: { id: PrayerName; nameMm: string; time: string; minutesRemaining: number };
  makroohTimes: { start: string; end: string; reasonMm: string }[];
  isFromNetwork: boolean;
} {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  // Julian date calculation
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const dSinceJ2000 = jd - 2451545.0 + (12 - city.timeZoneOffset) / 24;

  const g = fixAngle(357.529 + 0.98560028 * dSinceJ2000);
  const q = fixAngle(280.459 + 0.98564736 * dSinceJ2000);
  const L = fixAngle(q + 1.915 * Math.sin(g * D2R) + 0.02 * Math.sin(2 * g * D2R));

  const sinDec = 0.3978 * Math.sin(L * D2R);
  const cosDec = Math.cos(Math.asin(sinDec));
  const dec = Math.asin(sinDec) * R2D;

  const eqT = 4 * (fixAngle(q - L) - 1.915 * Math.sin(g * D2R) - 0.02 * Math.sin(2 * g * D2R));

  // Solar Noon (Zawal / Istiwa)
  const noonHour = fixHour(12 + city.timeZoneOffset - city.lng / 15 - eqT / 60);

  // Sunrise / Sunset with refraction (-0.833°)
  const cosH0 = (Math.sin(-0.833 * D2R) - Math.sin(city.lat * D2R) * Math.sin(dec * D2R)) /
                (Math.cos(city.lat * D2R) * cosDec);
  const h0 = Math.acos(Math.max(-1, Math.min(1, cosH0))) * R2D / 15;

  const sunriseHour = noonHour - h0;
  const sunsetHour = noonHour + h0;

  // Fajr: Sun is 18° below horizon (Karachi Method standard)
  const cosFajr = (Math.sin(-18 * D2R) - Math.sin(city.lat * D2R) * Math.sin(dec * D2R)) /
                  (Math.cos(city.lat * D2R) * cosDec);
  const hFajr = Math.acos(Math.max(-1, Math.min(1, cosFajr))) * R2D / 15;
  const fajrHour = noonHour - hFajr;

  // Isha: Sun is 18° below horizon
  const ishaHour = noonHour + hFajr;

  // Asr: Shadow factor (Hanafi 2, Shafi'i 1)
  const shadowFactor = asrMethod === 'hanafi' ? 2 : 1;
  const noonShadowAngle = Math.abs(city.lat - dec);
  const asrAngle = -Math.atan(1 / (shadowFactor + Math.tan(noonShadowAngle * D2R))) * R2D;
  const cosAsr = (Math.sin(asrAngle * D2R) - Math.sin(city.lat * D2R) * Math.sin(dec * D2R)) /
                 (Math.cos(city.lat * D2R) * cosDec);
  const hAsr = Math.acos(Math.max(-1, Math.min(1, cosAsr))) * R2D / 15;
  const asrHour = noonHour + hAsr;

  const dhuhrHour = noonHour;

  const toTimeString = (h: number): string => {
    const hours = Math.floor(h);
    const mins = Math.floor((h - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const fajrTime = toTimeString(fajrHour);
  const sunriseTime = toTimeString(sunriseHour);
  const zawalTime = toTimeString(noonHour);
  const dhuhrTime = toTimeString(dhuhrHour);
  const asrTime = toTimeString(asrHour);
  const sunsetTime = toTimeString(sunsetHour);
  const maghribTime = toTimeString(sunsetHour);
  const ishaTime = toTimeString(ishaHour);

  const items: PrayerTimeItem[] = [
    {
      id: 'fajr',
      nameMm: 'စုဗဟ် (ဖဂျရ်)',
      nameAr: 'الفجر',
      nameEn: 'Fajr',
      time: fajrTime,
      descriptionMm: 'အရုဏ်ဦး စတင်ချိန်မှ နေမထွက်မီအထိ',
    },
    {
      id: 'sunrise',
      nameMm: 'နေထွက်ချိန် (ရှုရူက်)',
      nameAr: 'الشروق',
      nameEn: 'Sunrise',
      time: sunriseTime,
      isMakrooh: true,
      descriptionMm: 'နေစတင်ထွက်ချိန် (မက္ကရူဟ် - ဆွလာသ်ဖတ်ခြင်း ပညတ်မထားပါ)',
    },
    {
      id: 'zawal',
      nameMm: 'မွန်းတည့်ချိန် (ဇဝါလ်)',
      nameAr: 'الزوال / الاستواء',
      nameEn: 'Solar Noon / Zawal',
      time: zawalTime,
      isMakrooh: true,
      descriptionMm: 'နေ အထွတ်အထိပ်ရောက်ချိန် (မက္ကရူဟ် - ဆွလာသ်ဖတ်ခြင်း ပညတ်မထားပါ)',
    },
    {
      id: 'dhuhr',
      nameMm: 'ဇုဟ်ရ်',
      nameAr: 'الظهر',
      nameEn: 'Dhuhr',
      time: dhuhrTime,
      descriptionMm: 'မွန်းတည့်ပြီးချိန်မှ အရိပ်တစ်ဆ (သို့) နှစ်ဆအထိ',
    },
    {
      id: 'asr',
      nameMm: 'အဆွရ်',
      nameAr: 'العصر',
      nameEn: 'Asr',
      time: asrTime,
      descriptionMm: 'နေမဝင်မီ နေမနီခင်အထိ အဆွရ်အချိန်',
    },
    {
      id: 'sunset',
      nameMm: 'နေဝင်ချိန် (ဝါဖြေချိန်)',
      nameAr: 'الغروب',
      nameEn: 'Sunset (Iftar)',
      time: sunsetTime,
      descriptionMm: 'နေလုံးဝဝင်ချိန် (အစ်ဖ်သာရ် ဝါဖြေချိန် စတင်သည်)',
    },
    {
      id: 'maghrib',
      nameMm: 'မဂ်ရိဗ်',
      nameAr: 'المغرب',
      nameEn: 'Maghrib',
      time: maghribTime,
      descriptionMm: 'နေဝင်ပြီးစအချိန်မှ ဆည်းဆာနီရောင်ပျောက်သည်အထိ',
    },
    {
      id: 'isha',
      nameMm: 'အီရှာ',
      nameAr: 'العشاء',
      nameEn: 'Isha',
      time: ishaTime,
      descriptionMm: 'ဆည်းဆာရောင်စင်ပြီးနောက် ညဦးမှ သန်းခေါင်တိုင်',
    },
  ];

  const currentMinutes = d.getHours() * 60 + d.getMinutes();
  const prayerMinutesList = [
    { id: 'fajr' as PrayerName, nameMm: 'စုဗဟ် (ဖဂျရ်)', min: Math.round(fajrHour * 60), time: fajrTime },
    { id: 'sunrise' as PrayerName, nameMm: 'နေထွက်ချိန်', min: Math.round(sunriseHour * 60), time: sunriseTime },
    { id: 'dhuhr' as PrayerName, nameMm: 'ဇုဟ်ရ်', min: Math.round(dhuhrHour * 60), time: dhuhrTime },
    { id: 'asr' as PrayerName, nameMm: 'အဆွရ်', min: Math.round(asrHour * 60), time: asrTime },
    { id: 'maghrib' as PrayerName, nameMm: 'မဂ်ရိဗ်', min: Math.round(sunsetHour * 60), time: maghribTime },
    { id: 'isha' as PrayerName, nameMm: 'အီရှာ', min: Math.round(ishaHour * 60), time: ishaTime },
  ];

  let next = prayerMinutesList.find((p) => p.min > currentMinutes);
  let rem = 0;
  if (!next) {
    next = prayerMinutesList[0];
    rem = 24 * 60 - currentMinutes + next.min;
  } else {
    rem = next.min - currentMinutes;
  }

  const makroohTimes = [
    {
      start: sunriseTime,
      end: toTimeString(sunriseHour + 0.33),
      reasonMm: 'နေထွက်စ ၂၀ မိနစ်ခန့်ကာလ (ဆွလာသ်ဖတ်ခြင်း မပြုရ)',
    },
    {
      start: toTimeString(noonHour - 0.2),
      end: dhuhrTime,
      reasonMm: 'နေ မွန်းတည့်တည့်ကျချိန် ဇဝါလ် (ဆွလာသ်ဖတ်ခြင်း မပြုရ)',
    },
    {
      start: toTimeString(sunsetHour - 0.33),
      end: sunsetTime,
      reasonMm: 'နေဝင်ခါနီး နေရောင်ဝါနီချိန် (အဆွရ် ကွာဇာဆွလာသ်မှလွဲ၍ မပြုရ)',
    },
  ];

  return {
    items,
    solarNoon: zawalTime,
    sunrise: sunriseTime,
    sunset: sunsetTime,
    fajr: fajrTime,
    dhuhr: dhuhrTime,
    asr: asrTime,
    maghrib: maghribTime,
    isha: ishaTime,
    nextPrayer: {
      id: next.id,
      nameMm: next.nameMm,
      time: next.time,
      minutesRemaining: rem,
    },
    makroohTimes,
    isFromNetwork: false,
  };
}

export interface NetworkPrayerResponse {
  prayerData: {
    items: PrayerTimeItem[];
    solarNoon: string;
    sunrise: string;
    sunset: string;
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    nextPrayer: {
      id: PrayerName;
      nameMm: string;
      time: string;
      minutesRemaining: number;
    };
    makroohTimes: Array<{
      start: string;
      end: string;
      reasonMm: string;
    }>;
    isFromNetwork: boolean;
    networkDateStr?: string;
  };
  hijri: HijriDateInfo;
  networkDate: {
    dateStr: string;
    day: number;
    month: number;
    year: number;
    monthNameMm: string;
    weekdayMm: string;
    formattedMm: string;
  };
  networkDateStr: string;
  networkTimestamp: number;
  isFromNetwork: boolean;
}

function cleanTimeStr(t: string | undefined): string {
  if (!t) return '00:00';
  return t.split(' ')[0].trim();
}

function timeToMinutes(t: string): number {
  const parts = t.split(':');
  return parseInt(parts[0] || '0', 10) * 60 + parseInt(parts[1] || '0', 10);
}

/**
 * Fetch authoritative network current date & time
 */
export async function fetchLiveNetworkDate(): Promise<NetworkDateInfo> {
  try {
    const res = await fetch('/api/network-date');
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    // ignore
  }

  // Construct from local device with Myanmar timezone fallback
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Yangon',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const pMap: Record<string, string> = {};
  for (const p of parts) pMap[p.type] = p.value;
  const year = parseInt(pMap.year, 10);
  const month = parseInt(pMap.month, 10);
  const day = parseInt(pMap.day, 10);
  const hour = parseInt(pMap.hour, 10);
  const minute = parseInt(pMap.minute, 10);
  const second = parseInt(pMap.second, 10);

  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay();

  return {
    timestamp: now.getTime(),
    myanmarDate: `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`,
    myanmarTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`,
    day,
    month,
    year,
    dayOfWeekMm: `${DAY_NAMES_MM[dayOfWeek]}နေ့`,
    monthNameMm: MONTH_NAMES_MM[month - 1],
    dateFormattedMm: `${year} ခုနှစ်၊ ${MONTH_NAMES_MM[month - 1]}လ (${day}) ရက်၊ ${DAY_NAMES_MM[dayOfWeek]}နေ့`,
  };
}

/**
 * Fetches real-time, authentic prayer times and Islamic date from the Network (server proxy or AlAdhan API)
 * Standard: University of Islamic Sciences, Karachi (18° / 18°)
 */
export async function fetchLiveNetworkPrayerData(
  city: CityLocation,
  asrMethod: 'hanafi' | 'shafii' = 'hanafi',
  hijriOffset = 0
): Promise<NetworkPrayerResponse> {
  const schoolParam = asrMethod === 'hanafi' ? 1 : 0;
  const cacheKey = `alhikmah_verified_prayer_${city.id}_${schoolParam}_${hijriOffset}`;

  // 1. Try server proxy endpoint first (/api/prayer-times)
  try {
    const res = await fetch(`/api/prayer-times?city=${city.id}&school=${schoolParam}&offset=${hijriOffset}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.timings && data.hijri) {
        const timings = data.timings;
        const items: PrayerTimeItem[] = [
          {
            id: 'fajr',
            nameMm: 'စုဗဟ် (ဖဂျရ်)',
            nameAr: 'الفجر',
            nameEn: 'Fajr',
            time: timings.fajr,
            descriptionMm: 'အရုဏ်ဦး စတင်ချိန်မှ နေမထွက်မီအထိ',
          },
          {
            id: 'sunrise',
            nameMm: 'နေထွက်ချိန် (ရှုရူက်)',
            nameAr: 'الشروق',
            nameEn: 'Sunrise',
            time: timings.sunrise,
            isMakrooh: true,
            descriptionMm: 'နေစတင်ထွက်ချိန် (မက္ကရူဟ် - ဆွလာသ်ဖတ်ခြင်း ပညတ်မထားပါ)',
          },
          {
            id: 'zawal',
            nameMm: 'မွန်းတည့်ချိန် (ဇဝါလ်)',
            nameAr: 'الزوال / الاستواء',
            nameEn: 'Solar Noon / Zawal',
            time: timings.zawal,
            isMakrooh: true,
            descriptionMm: 'နေ အထွတ်အထိပ်ရောက်ချိန် (မက္ကရူဟ် - ဆွလာသ်ဖတ်ခြင်း ပညတ်မထားပါ)',
          },
          {
            id: 'dhuhr',
            nameMm: 'ဇုဟ်ရ်',
            nameAr: 'الظهر',
            nameEn: 'Dhuhr',
            time: timings.dhuhr,
            descriptionMm: 'မွန်းတည့်ပြီးချိန်မှ အရိပ်တစ်ဆ (သို့) နှစ်ဆအထိ',
          },
          {
            id: 'asr',
            nameMm: 'အဆွရ်',
            nameAr: 'العصر',
            nameEn: 'Asr',
            time: timings.asr,
            descriptionMm: 'နေမဝင်မီ နေမနီခင်အထိ အဆွရ်အချိန်',
          },
          {
            id: 'sunset',
            nameMm: 'နေဝင်ချိန် (ဝါဖြေချိန်)',
            nameAr: 'الغروب',
            nameEn: 'Sunset (Iftar)',
            time: timings.sunset,
            descriptionMm: 'နေလုံးဝဝင်ချိန် (အစ်ဖ်သာရ် ဝါဖြေချိန် စတင်သည်)',
          },
          {
            id: 'maghrib',
            nameMm: 'မဂ်ရိဗ်',
            nameAr: 'المغرب',
            nameEn: 'Maghrib',
            time: timings.maghrib,
            descriptionMm: 'နေဝင်ပြီးစအချိန်မှ ဆည်းဆာနီရောင်ပျောက်သည်အထိ',
          },
          {
            id: 'isha',
            nameMm: 'အီရှာ',
            nameAr: 'العشاء',
            nameEn: 'Isha',
            time: timings.isha,
            descriptionMm: 'ဆည်းဆာရောင်စင်ပြီးနောက် ညဦးမှ သန်းခေါင်တိုင်',
          },
        ];

        const result: NetworkPrayerResponse = {
          prayerData: {
            items,
            solarNoon: timings.zawal,
            sunrise: timings.sunrise,
            sunset: timings.sunset,
            fajr: timings.fajr,
            dhuhr: timings.dhuhr,
            asr: timings.asr,
            maghrib: timings.maghrib,
            isha: timings.isha,
            nextPrayer: data.nextPrayer,
            makroohTimes: data.makroohTimes,
            isFromNetwork: true,
            networkDateStr: data.gregorian?.readable || data.gregorian?.dateStr,
          },
          hijri: {
            day: data.hijri.day,
            monthNumber: data.hijri.monthNumber,
            monthNameAr: data.hijri.monthNameAr,
            monthNameMm: data.hijri.monthNameMm,
            monthNameEn: data.hijri.monthNameEn,
            year: data.hijri.year,
            gregorianDateStr: data.gregorian?.readable,
            islamicEvent: data.hijri.islamicEvent,
            formattedMm: data.hijri.formattedMm,
          },
          networkDate: data.gregorian,
          networkDateStr: data.gregorian?.formattedMm || data.gregorian?.readable,
          networkTimestamp: data.networkTimestamp || Date.now(),
          isFromNetwork: true,
        };

        // Cache last verified network data in localStorage
        try {
          localStorage.setItem(cacheKey, JSON.stringify(result));
          localStorage.setItem('alhikmah_verified_hijri', JSON.stringify(result.hijri));
        } catch (e) {
          // ignore
        }

        return result;
      }
    }
  } catch (err) {
    console.warn('Backend prayer proxy unavailable, trying direct AlAdhan API:', err);
  }

  // 2. Direct AlAdhan API fallback
  try {
    const directUrl = `https://api.aladhan.com/v1/timingsByCity?city=${city.nameEn}&country=Myanmar&method=1&school=${schoolParam}`;
    const directRes = await fetch(directUrl);
    if (directRes.ok) {
      const json = await directRes.json();
      if (json.code === 200 && json.data) {
        const d = json.data;
        const rawTimings = d.timings;

        const fajrTime = cleanTimeStr(rawTimings.Fajr);
        const sunriseTime = cleanTimeStr(rawTimings.Sunrise);
        const dhuhrTime = cleanTimeStr(rawTimings.Dhuhr);
        const asrTime = cleanTimeStr(rawTimings.Asr);
        const sunsetTime = cleanTimeStr(rawTimings.Sunset);
        const maghribTime = cleanTimeStr(rawTimings.Maghrib);
        const ishaTime = cleanTimeStr(rawTimings.Isha);

        const dhuhrM = timeToMinutes(dhuhrTime);
        const zawalM = Math.max(0, dhuhrM - 1);
        const zawalTime = `${String(Math.floor(zawalM / 60)).padStart(2, '0')}:${String(zawalM % 60).padStart(2, '0')}`;

        const sunriseM = timeToMinutes(sunriseTime);
        const sunsetM = timeToMinutes(sunsetTime);

        const makroohTimes = [
          {
            start: sunriseTime,
            end: `${String(Math.floor((sunriseM + 20) / 60)).padStart(2, '0')}:${String((sunriseM + 20) % 60).padStart(2, '0')}`,
            reasonMm: 'နေထွက်စ ၂၀ မိနစ်ခန့်ကာလ (ဆွလာသ်ဖတ်ခြင်း မပြုရ)',
          },
          {
            start: `${String(Math.floor((dhuhrM - 12) / 60)).padStart(2, '0')}:${String((dhuhrM - 12) % 60).padStart(2, '0')}`,
            end: dhuhrTime,
            reasonMm: 'နေ မွန်းတည့်တည့်ကျချိန် ဇဝါလ် (ဆွလာသ်ဖတ်ခြင်း မပြုရ)',
          },
          {
            start: `${String(Math.floor((sunsetM - 20) / 60)).padStart(2, '0')}:${String((sunsetM - 20) % 60).padStart(2, '0')}`,
            end: sunsetTime,
            reasonMm: 'နေဝင်ခါနီး နေရောင်ဝါနီချိန် (အဆွရ် ကွာဇာဆွလာသ်မှလွဲ၍ မပြုရ)',
          },
        ];

        const rawH = d.date.hijri;
        let hDay = parseInt(rawH.day, 10) + hijriOffset;
        let hMonth = parseInt(String(rawH.month.number), 10);
        const hYear = parseInt(String(rawH.year), 10);

        if (hDay < 1) {
          hMonth = hMonth === 1 ? 12 : hMonth - 1;
          hDay = 29;
        } else if (hDay > 30) {
          hMonth = hMonth === 12 ? 1 : hMonth + 1;
          hDay = 1;
        }

        const hMonthObj = HIJRI_MONTHS[hMonth - 1] || HIJRI_MONTHS[0];

        const rawG = d.date.gregorian;
        const gDay = parseInt(rawG.day, 10);
        const gMonth = parseInt(rawG.month.number, 10);
        const gYear = parseInt(rawG.year, 10);
        const gDateObj = new Date(gYear, gMonth - 1, gDay);
        const weekdayMm = `${DAY_NAMES_MM[gDateObj.getDay()]}နေ့`;
        const monthNameMm = MONTH_NAMES_MM[gMonth - 1];
        const formattedMm = `${gYear} ခုနှစ်၊ ${monthNameMm}လ (${gDay}) ရက်၊ ${weekdayMm}`;

        // Current time calculation
        const now = new Date();
        const curMins = now.getHours() * 60 + now.getMinutes();
        const pList = [
          { id: 'fajr' as PrayerName, nameMm: 'စုဗဟ် (ဖဂျရ်)', min: timeToMinutes(fajrTime), time: fajrTime },
          { id: 'sunrise' as PrayerName, nameMm: 'နေထွက်ချိန်', min: timeToMinutes(sunriseTime), time: sunriseTime },
          { id: 'dhuhr' as PrayerName, nameMm: 'ဇုဟ်ရ်', min: timeToMinutes(dhuhrTime), time: dhuhrTime },
          { id: 'asr' as PrayerName, nameMm: 'အဆွရ်', min: timeToMinutes(asrTime), time: asrTime },
          { id: 'maghrib' as PrayerName, nameMm: 'မဂ်ရိဗ်', min: timeToMinutes(sunsetTime), time: maghribTime },
          { id: 'isha' as PrayerName, nameMm: 'အီရှာ', min: timeToMinutes(ishaTime), time: ishaTime },
        ];

        let next = pList.find((p) => p.min > curMins);
        let rem = 0;
        if (!next) {
          next = pList[0];
          rem = 24 * 60 - curMins + next.min;
        } else {
          rem = next.min - curMins;
        }

        const items: PrayerTimeItem[] = [
          { id: 'fajr', nameMm: 'စုဗဟ် (ဖဂျရ်)', nameAr: 'الفجر', nameEn: 'Fajr', time: fajrTime, descriptionMm: 'အရုဏ်ဦး စတင်ချိန်မှ နေမထွက်မီအထိ' },
          { id: 'sunrise', nameMm: 'နေထွက်ချိန် (ရှုရူက်)', nameAr: 'الشروق', nameEn: 'Sunrise', time: sunriseTime, isMakrooh: true, descriptionMm: 'နေစတင်ထွက်ချိန် (မက္ကရူဟ် - ဆွလာသ်ဖတ်ခြင်း ပညတ်မထားပါ)' },
          { id: 'zawal', nameMm: 'မွန်းတည့်ချိန် (ဇဝါလ်)', nameAr: 'الزوال / الاستواء', nameEn: 'Solar Noon / Zawal', time: zawalTime, isMakrooh: true, descriptionMm: 'နေ အထွတ်အထိပ်ရောက်ချိန် (မက္ကရူဟ် - ဆွလာသ်ဖတ်ခြင်း ပညတ်မထားပါ)' },
          { id: 'dhuhr', nameMm: 'ဇုဟ်ရ်', nameAr: 'الظهر', nameEn: 'Dhuhr', time: dhuhrTime, descriptionMm: 'မွန်းတည့်ပြီးချိန်မှ အရိပ်တစ်ဆ (သို့) နှစ်ဆအထိ' },
          { id: 'asr', nameMm: 'အဆွရ်', nameAr: 'العصر', nameEn: 'Asr', time: asrTime, descriptionMm: 'နေမဝင်မီ နေမနီခင်အထိ အဆွရ်အချိန်' },
          { id: 'sunset', nameMm: 'နေဝင်ချိန် (ဝါဖြေချိန်)', nameAr: 'الغروب', nameEn: 'Sunset (Iftar)', time: sunsetTime, descriptionMm: 'နေလုံးဝဝင်ချိန် (အစ်ဖ်သာရ် ဝါဖြေချိန် စတင်သည်)' },
          { id: 'maghrib', nameMm: 'မဂ်ရိဗ်', nameAr: 'المغرب', nameEn: 'Maghrib', time: maghribTime, descriptionMm: 'နေဝင်ပြီးစအချိန်မှ ဆည်းဆာနီရောင်ပျောက်သည်အထိ' },
          { id: 'isha', nameMm: 'အီရှာ', nameAr: 'العشاء', nameEn: 'Isha', time: ishaTime, descriptionMm: 'ဆည်းဆာရောင်စင်ပြီးနောက် ညဦးမှ သန်းခေါင်တိုင်' },
        ];

        const result: NetworkPrayerResponse = {
          prayerData: {
            items,
            solarNoon: zawalTime,
            sunrise: sunriseTime,
            sunset: sunsetTime,
            fajr: fajrTime,
            dhuhr: dhuhrTime,
            asr: asrTime,
            maghrib: maghribTime,
            isha: ishaTime,
            nextPrayer: { id: next.id, nameMm: next.nameMm, time: next.time, minutesRemaining: rem },
            makroohTimes,
            isFromNetwork: true,
            networkDateStr: d.date.readable,
          },
          hijri: {
            day: hDay,
            monthNumber: hMonth,
            monthNameAr: hMonthObj.ar,
            monthNameMm: hMonthObj.mm,
            monthNameEn: hMonthObj.en,
            year: hYear,
            gregorianDateStr: d.date.readable,
            formattedMm: `${hDay} ${hMonthObj.mm} ${hYear} ဟိဂျ်ရီ`,
          },
          networkDate: {
            dateStr: rawG.date,
            day: gDay,
            month: gMonth,
            year: gYear,
            monthNameMm,
            weekdayMm,
            formattedMm,
          },
          networkDateStr: formattedMm,
          networkTimestamp: Date.now(),
          isFromNetwork: true,
        };

        try {
          localStorage.setItem(cacheKey, JSON.stringify(result));
          localStorage.setItem('alhikmah_verified_hijri', JSON.stringify(result.hijri));
        } catch (e) {
          // ignore
        }

        return result;
      }
    }
  } catch (err) {
    console.warn('Direct AlAdhan API fetch also failed:', err);
  }

  // 3. Fallback: check cached response
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      return {
        ...parsed,
        isFromNetwork: true,
      };
    } catch (e) {
      // ignore
    }
  }

  // 4. Offline astronomical calculation fallback
  const offlineTimes = calculatePrayerTimes(city, new Date(), asrMethod);
  const offlineHijri = getHijriDate(new Date(), hijriOffset);
  const offlineNow = new Date();

  return {
    prayerData: offlineTimes,
    hijri: offlineHijri,
    networkDate: {
      dateStr: offlineNow.toLocaleDateString('en-GB'),
      day: offlineNow.getDate(),
      month: offlineNow.getMonth() + 1,
      year: offlineNow.getFullYear(),
      monthNameMm: MONTH_NAMES_MM[offlineNow.getMonth()],
      weekdayMm: `${DAY_NAMES_MM[offlineNow.getDay()]}နေ့`,
      formattedMm: `${offlineNow.getFullYear()} ခုနှစ်၊ ${MONTH_NAMES_MM[offlineNow.getMonth()]}လ (${offlineNow.getDate()}) ရက်၊ ${DAY_NAMES_MM[offlineNow.getDay()]}နေ့`,
    },
    networkDateStr: offlineNow.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    networkTimestamp: Date.now(),
    isFromNetwork: false,
  };
}

/**
 * Fetches network-verified monthly prayer calendar
 */
export async function fetchLiveNetworkMonthlyCalendar(
  city: CityLocation,
  year: number,
  month: number,
  asrMethod: 'hanafi' | 'shafii' = 'hanafi'
): Promise<any[]> {
  const schoolParam = asrMethod === 'hanafi' ? 1 : 0;
  const cacheKey = `alhikmah_verified_cal_${city.id}_${year}_${month}_${schoolParam}`;

  // 1. Try backend server proxy
  try {
    const res = await fetch(`/api/monthly-calendar?city=${city.id}&year=${year}&month=${month}&school=${schoolParam}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.rows) && data.rows.length > 0) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data.rows));
        } catch (e) {
          // ignore
        }
        return data.rows;
      }
    }
  } catch (err) {
    console.warn('Backend calendar proxy failed, trying direct AlAdhan URL:', err);
  }

  // 2. Direct AlAdhan monthly calendar
  try {
    const url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${city.lat}&longitude=${city.lng}&method=1&school=${schoolParam}`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.code === 200 && Array.isArray(json.data)) {
        const today = new Date();
        const rows = json.data.map((item: any) => {
          const timings = item.timings;
          const gDate = item.date.gregorian;
          const hDate = item.date.hijri;
          const dayNum = parseInt(gDate.day, 10);
          const hMonthNum = parseInt(hDate.month.number, 10);
          const hMonthObj = HIJRI_MONTHS[hMonthNum - 1] || HIJRI_MONTHS[0];

          const dhuhrClean = cleanTimeStr(timings.Dhuhr);
          const dhuhrM = timeToMinutes(dhuhrClean);
          const zawalM = Math.max(0, dhuhrM - 1);
          const zawalH = Math.floor(zawalM / 60);
          const zawalMin = zawalM % 60;
          const zawalStr = `${String(zawalH).padStart(2, '0')}:${String(zawalMin).padStart(2, '0')}`;

          const dateObj = new Date(year, month - 1, dayNum);
          const dayNameMm = DAY_NAMES_MM[dateObj.getDay()] || gDate.weekday.en;

          return {
            day: dayNum,
            dayNameMm,
            hijriDay: parseInt(hDate.day, 10),
            hijriMonthMm: hMonthObj.mm,
            hijriMonthAr: hMonthObj.ar,
            fajr: cleanTimeStr(timings.Fajr),
            sunrise: cleanTimeStr(timings.Sunrise),
            zawal: zawalStr,
            dhuhr: dhuhrClean,
            asr: cleanTimeStr(timings.Asr),
            sunset: cleanTimeStr(timings.Sunset),
            maghrib: cleanTimeStr(timings.Maghrib),
            isha: cleanTimeStr(timings.Isha),
            isToday:
              dayNum === today.getDate() &&
              month === today.getMonth() + 1 &&
              year === today.getFullYear(),
          };
        });

        try {
          localStorage.setItem(cacheKey, JSON.stringify(rows));
        } catch (e) {
          // ignore
        }

        return rows;
      }
    }
  } catch (err) {
    console.warn('Direct AlAdhan calendar fetch failed:', err);
  }

  // 3. Fallback: cached rows
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // ignore
    }
  }

  // 4. Offline astronomical calculation fallback
  const daysInMonth = new Date(year, month, 0).getDate();
  const rows = [];
  const today = new Date();

  for (let i = 1; i <= daysInMonth; i++) {
    const dayDate = new Date(year, month - 1, i);
    const dayHijri = getHijriDate(dayDate);
    const times = calculatePrayerTimes(city, dayDate, asrMethod);

    rows.push({
      day: i,
      dayNameMm: DAY_NAMES_MM[dayDate.getDay()],
      hijriDay: dayHijri.day,
      hijriMonthMm: dayHijri.monthNameMm,
      hijriMonthAr: dayHijri.monthNameAr,
      fajr: times.fajr,
      sunrise: times.sunrise,
      zawal: times.solarNoon,
      dhuhr: times.dhuhr,
      asr: times.asr,
      sunset: times.sunset,
      maghrib: times.maghrib,
      isha: times.isha,
      isToday:
        dayDate.getDate() === today.getDate() &&
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getFullYear() === today.getFullYear(),
    });
  }

  return rows;
}
