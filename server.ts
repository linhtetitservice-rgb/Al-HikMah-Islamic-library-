import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { getBooks, insertBook } from './src/db/books.ts';
import { getFatwas, insertFatwa } from './src/db/fatwas.ts';
import { getOrCreateUser } from './src/db/users.ts';
import {
  getUserReadingData,
  toggleBookmark,
  updateReadingProgress,
  addPersonalNote,
} from './src/db/userActivities.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { seedInitialDataIfNeeded } from './src/db/seed.ts';
import { parseTelegramBookUpdate, TelegramUpdate } from './src/services/telegramService.ts';
import { adminDb } from './src/lib/firebase-admin.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CityLocation {
  id: string;
  nameMm: string;
  nameEn: string;
  lat: number;
  lng: number;
  timeZoneOffset: number;
}

const MYANMAR_CITIES: CityLocation[] = [
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

const HIJRI_MONTHS = [
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

const DAY_NAMES_MM = ['တနင်္ဂနွေ', 'တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး', 'ကြာသပတေး', 'သောကြာ', 'စနေ'];
const MONTH_NAMES_MM = [
  'ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်',
  'ဇူလိုင်', 'သြဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'
];

function cleanTimeStr(t: string | undefined): string {
  if (!t) return '00:00';
  return t.split(' ')[0].trim();
}

function timeToMinutes(t: string): number {
  const parts = t.split(':');
  return parseInt(parts[0] || '0', 10) * 60 + parseInt(parts[1] || '0', 10);
}

// Memory caches (10 min TTL)
const prayerCache = new Map<string, { data: any; expiry: number }>();
const calendarCache = new Map<string, { data: any; expiry: number }>();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // 1. Current Network Date & Time in Myanmar
  app.get('/api/network-date', (_req, res) => {
    const now = new Date();
    // Format date in Asia/Yangon timezone
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Yangon',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const partMap: Record<string, string> = {};
    for (const p of parts) {
      partMap[p.type] = p.value;
    }

    const year = parseInt(partMap.year, 10);
    const month = parseInt(partMap.month, 10);
    const day = parseInt(partMap.day, 10);
    const hour = parseInt(partMap.hour, 10);
    const minute = parseInt(partMap.minute, 10);
    const second = parseInt(partMap.second, 10);

    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();

    res.json({
      timestamp: now.getTime(),
      iso: now.toISOString(),
      myanmarDate: `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`,
      myanmarTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`,
      day,
      month,
      year,
      dayOfWeekMm: `${DAY_NAMES_MM[dayOfWeek]}နေ့`,
      monthNameMm: MONTH_NAMES_MM[month - 1],
      dateFormattedMm: `${year} ခုနှစ်၊ ${MONTH_NAMES_MM[month - 1]}လ (${day}) ရက်၊ ${DAY_NAMES_MM[dayOfWeek]}နေ့`,
      timezone: 'Asia/Yangon',
      utcOffset: '+06:30',
    });
  });

  // 2. Verified Live Prayer Times from Network
  app.get('/api/prayer-times', async (req, res) => {
    try {
      const cityId = (req.query.city as string) || 'yangon';
      const school = req.query.school === '0' ? 0 : 1; // 1 = Hanafi, 0 = Shafi'i
      const hijriOffset = parseInt((req.query.offset as string) || '0', 10);

      const city = MYANMAR_CITIES.find((c) => c.id === cityId) || MYANMAR_CITIES[0];

      // Myanmar current date string (DD-MM-YYYY)
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
      const curYear = parseInt(pMap.year, 10);
      const curMonth = parseInt(pMap.month, 10);
      const curDay = parseInt(pMap.day, 10);
      const curHour = parseInt(pMap.hour, 10);
      const curMinute = parseInt(pMap.minute, 10);
      const dateStr = `${String(curDay).padStart(2, '0')}-${String(curMonth).padStart(2, '0')}-${curYear}`;

      const cacheKey = `${city.id}_${school}_${dateStr}_${hijriOffset}`;
      const cached = prayerCache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        return res.json(cached.data);
      }

      // Fetch from AlAdhan API (Method 1: University of Islamic Sciences, Karachi)
      const apiUrl = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${city.lat}&longitude=${city.lng}&method=1&school=${school}&timezonestring=Asia/Yangon`;
      
      let apiRes: Response | null = null;
      try {
        apiRes = await fetch(apiUrl);
      } catch (e) {
        // Fallback to timingsByCity if latitude endpoint has issues
        const fallbackUrl = `https://api.aladhan.com/v1/timingsByCity?city=${city.nameEn}&country=Myanmar&method=1&school=${school}`;
        apiRes = await fetch(fallbackUrl);
      }

      if (!apiRes || !apiRes.ok) {
        throw new Error(`AlAdhan API responded with status ${apiRes?.status}`);
      }

      const json = await apiRes.json();
      if (json.code !== 200 || !json.data) {
        throw new Error('Invalid response from AlAdhan prayer API');
      }

      const data = json.data;
      const rawTimings = data.timings;

      const fajrTime = cleanTimeStr(rawTimings.Fajr);
      const sunriseTime = cleanTimeStr(rawTimings.Sunrise);
      const dhuhrTime = cleanTimeStr(rawTimings.Dhuhr);
      const asrTime = cleanTimeStr(rawTimings.Asr);
      const sunsetTime = cleanTimeStr(rawTimings.Sunset);
      const maghribTime = cleanTimeStr(rawTimings.Maghrib);
      const ishaTime = cleanTimeStr(rawTimings.Isha);

      // Zawal is approximately 1 minute before Dhuhr zenith
      const dhuhrMins = timeToMinutes(dhuhrTime);
      const zawalMins = Math.max(0, dhuhrMins - 1);
      const zawalH = Math.floor(zawalMins / 60);
      const zawalM = zawalMins % 60;
      const zawalTime = `${String(zawalH).padStart(2, '0')}:${String(zawalM).padStart(2, '0')}`;

      // Makrooh prohibited windows
      const sunriseMins = timeToMinutes(sunriseTime);
      const sunsetMins = timeToMinutes(sunsetTime);

      const sunriseEndM = sunriseMins + 20;
      const sunriseEndTime = `${String(Math.floor(sunriseEndM / 60)).padStart(2, '0')}:${String(sunriseEndM % 60).padStart(2, '0')}`;

      const zawalStartM = dhuhrMins - 12;
      const zawalStartTime = `${String(Math.floor(zawalStartM / 60)).padStart(2, '0')}:${String(zawalStartM % 60).padStart(2, '0')}`;

      const sunsetStartM = sunsetMins - 20;
      const sunsetStartTime = `${String(Math.floor(sunsetStartM / 60)).padStart(2, '0')}:${String(sunsetStartM % 60).padStart(2, '0')}`;

      const makroohTimes = [
        {
          start: sunriseTime,
          end: sunriseEndTime,
          reasonMm: 'နေထွက်စ ၂၀ မိနစ်ခန့်ကာလ (ဆွလာသ်ဖတ်ခြင်း မပြုရ)',
        },
        {
          start: zawalStartTime,
          end: dhuhrTime,
          reasonMm: 'နေ မွန်းတည့်တည့်ကျချိန် ဇဝါလ် (ဆွလာသ်ဖတ်ခြင်း မပြုရ)',
        },
        {
          start: sunsetStartTime,
          end: sunsetTime,
          reasonMm: 'နေဝင်ခါနီး နေရောင်ဝါနီချိန် (အဆွရ် ကွာဇာဆွလာသ်မှလွဲ၍ မပြုရ)',
        },
      ];

      // Next prayer calculation using Myanmar local time
      const currentMinutes = curHour * 60 + curMinute;
      const prayerMinutesList = [
        { id: 'fajr', nameMm: 'စုဗဟ် (ဖဂျရ်)', min: timeToMinutes(fajrTime), time: fajrTime },
        { id: 'sunrise', nameMm: 'နေထွက်ချိန်', min: timeToMinutes(sunriseTime), time: sunriseTime },
        { id: 'dhuhr', nameMm: 'ဇုဟ်ရ်', min: timeToMinutes(dhuhrTime), time: dhuhrTime },
        { id: 'asr', nameMm: 'အဆွရ်', min: timeToMinutes(asrTime), time: asrTime },
        { id: 'maghrib', nameMm: 'မဂ်ရိဗ်', min: timeToMinutes(maghribTime), time: maghribTime },
        { id: 'isha', nameMm: 'အီရှာ', min: timeToMinutes(ishaTime), time: ishaTime },
      ];

      let next = prayerMinutesList.find((p) => p.min > currentMinutes);
      let rem = 0;
      if (!next) {
        next = prayerMinutesList[0];
        rem = 24 * 60 - currentMinutes + next.min;
      } else {
        rem = next.min - currentMinutes;
      }

      // Hijri date from network
      const rawHijri = data.date.hijri;
      let netHijriDay = parseInt(String(rawHijri.day), 10) + hijriOffset;
      let netHijriMonthNum = parseInt(String(rawHijri.month.number), 10);
      const netHijriYear = parseInt(String(rawHijri.year), 10);

      if (netHijriDay < 1) {
        netHijriMonthNum = netHijriMonthNum === 1 ? 12 : netHijriMonthNum - 1;
        netHijriDay = 29;
      } else if (netHijriDay > 30) {
        netHijriMonthNum = netHijriMonthNum === 12 ? 1 : netHijriMonthNum + 1;
        netHijriDay = 1;
      }

      const hMonthData = HIJRI_MONTHS[netHijriMonthNum - 1] || HIJRI_MONTHS[0];

      let event: string | undefined = undefined;
      if (netHijriMonthNum === 1 && netHijriDay === 10) event = 'အာရှူရာနေ့ (Day of Ashura)';
      else if (netHijriMonthNum === 3 && netHijriDay === 12) event = 'မီလာဒုန္နဗီ မွေးနေ့တော် (Mawlid al-Nabi)';
      else if (netHijriMonthNum === 7 && netHijriDay === 27) event = 'မိအ်ရာ့ဂျ်ည (Isra & Mi\'raj)';
      else if (netHijriMonthNum === 8 && netHijriDay === 15) event = 'ရှဗေဗရာသ်ည (Shab-e-Barat)';
      else if (netHijriMonthNum === 9 && netHijriDay === 1) event = 'ရမ်ဇာန်ဥပုသ်လ စတင်ခြင်း';
      else if (netHijriMonthNum === 9 && netHijriDay >= 21 && netHijriDay % 2 !== 0) event = 'လိုင်လသုလ် ကဒရ် ညမြတ်';
      else if (netHijriMonthNum === 10 && netHijriDay === 1) event = 'အီဒုလ်ဖိသရ် (Eid ul-Fitr)';
      else if (netHijriMonthNum === 12 && netHijriDay === 9) event = 'အရဖဟ်နေ့ (Day of Arafah)';
      else if (netHijriMonthNum === 12 && netHijriDay === 10) event = 'အီဒုလ်အသွ်ဟာ (Eid ul-Adha)';

      const dateObj = new Date(curYear, curMonth - 1, curDay);
      const dayOfWeekIdx = dateObj.getDay();

      const responsePayload = {
        city: {
          id: city.id,
          nameMm: city.nameMm,
          nameEn: city.nameEn,
        },
        networkTimestamp: now.getTime(),
        gregorian: {
          dateStr,
          day: curDay,
          month: curMonth,
          year: curYear,
          monthNameMm: MONTH_NAMES_MM[curMonth - 1],
          weekdayMm: `${DAY_NAMES_MM[dayOfWeekIdx]}နေ့`,
          readable: data.date.readable,
          formattedMm: `${curYear} ခုနှစ်၊ ${MONTH_NAMES_MM[curMonth - 1]}လ (${curDay}) ရက်၊ ${DAY_NAMES_MM[dayOfWeekIdx]}နေ့`,
        },
        hijri: {
          day: netHijriDay,
          monthNumber: netHijriMonthNum,
          monthNameAr: hMonthData.ar,
          monthNameMm: hMonthData.mm,
          monthNameEn: hMonthData.en,
          year: netHijriYear,
          islamicEvent: event,
          formattedMm: `${netHijriDay} ${hMonthData.mm} ${netHijriYear} ဟိဂျ်ရီ`,
        },
        timings: {
          fajr: fajrTime,
          sunrise: sunriseTime,
          zawal: zawalTime,
          dhuhr: dhuhrTime,
          asr: asrTime,
          sunset: sunsetTime,
          maghrib: maghribTime,
          isha: ishaTime,
        },
        nextPrayer: {
          id: next.id,
          nameMm: next.nameMm,
          time: next.time,
          minutesRemaining: rem,
        },
        makroohTimes,
        calculationMethod: 'University of Islamic Sciences, Karachi (18° / 18°)',
        school: school === 1 ? 'Hanafi (Shadow factor 2)' : 'Shafi\'i (Shadow factor 1)',
        isFromNetwork: true,
      };

      // Cache for 10 minutes
      prayerCache.set(cacheKey, { data: responsePayload, expiry: Date.now() + 10 * 60 * 1000 });

      return res.json(responsePayload);
    } catch (err: any) {
      console.error('Error fetching prayer times from network:', err);
      return res.status(500).json({
        error: 'Network fetch error',
        message: err?.message || String(err),
      });
    }
  });

  // 3. Verified Monthly Calendar from Network
  app.get('/api/monthly-calendar', async (req, res) => {
    try {
      const cityId = (req.query.city as string) || 'yangon';
      const year = parseInt((req.query.year as string) || String(new Date().getFullYear()), 10);
      const month = parseInt((req.query.month as string) || String(new Date().getMonth() + 1), 10);
      const school = req.query.school === '0' ? 0 : 1;

      const city = MYANMAR_CITIES.find((c) => c.id === cityId) || MYANMAR_CITIES[0];
      const cacheKey = `cal_${city.id}_${year}_${month}_${school}`;
      const cached = calendarCache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        return res.json(cached.data);
      }

      const url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${city.lat}&longitude=${city.lng}&method=1&school=${school}`;
      const apiRes = await fetch(url);
      if (!apiRes.ok) {
        throw new Error(`Calendar API returned ${apiRes.status}`);
      }

      const json = await apiRes.json();
      if (json.code !== 200 || !Array.isArray(json.data)) {
        throw new Error('Invalid monthly calendar data');
      }

      // Myanmar current date to mark isToday
      const now = new Date();
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Yangon',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(now);
      const pMap: Record<string, string> = {};
      for (const p of parts) pMap[p.type] = p.value;
      const todayYear = parseInt(pMap.year, 10);
      const todayMonth = parseInt(pMap.month, 10);
      const todayDay = parseInt(pMap.day, 10);

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
          isToday: dayNum === todayDay && month === todayMonth && year === todayYear,
        };
      });

      const result = {
        city: { id: city.id, nameMm: city.nameMm, nameEn: city.nameEn },
        year,
        month,
        monthNameMm: MONTH_NAMES_MM[month - 1],
        rows,
        isFromNetwork: true,
      };

      calendarCache.set(cacheKey, { data: result, expiry: Date.now() + 60 * 60 * 1000 });
      return res.json(result);
    } catch (err: any) {
      console.error('Error fetching calendar:', err);
      return res.status(500).json({ error: 'Failed to fetch calendar', message: err?.message });
    }
  });

  // ==========================================
  // CLOUD SQL POSTGRESQL DATABASE API ROUTES
  // ==========================================

  // 4. Fetch Books from Cloud SQL
  app.get('/api/db/books', async (_req, res) => {
    try {
      await seedInitialDataIfNeeded();
      const booksList = await getBooks();
      res.json(booksList);
    } catch (error: any) {
      console.error('Failed to fetch books from Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch books from Cloud SQL' });
    }
  });

  // 5. Insert Book into Cloud SQL
  app.post('/api/db/books', async (req, res) => {
    try {
      const bookData = req.body;
      const inserted = await insertBook(bookData, req.body.uploaderId, req.body.uploaderName);
      res.json(inserted);
    } catch (error: any) {
      console.error('Failed to insert book into Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Failed to insert book into Cloud SQL' });
    }
  });

  // 6. Fetch Fatwas from Cloud SQL
  app.get('/api/db/fatwas', async (_req, res) => {
    try {
      await seedInitialDataIfNeeded();
      const fatwasList = await getFatwas();
      res.json(fatwasList);
    } catch (error: any) {
      console.error('Failed to fetch fatwas from Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch fatwas from Cloud SQL' });
    }
  });

  // 7. Insert Fatwa into Cloud SQL
  app.post('/api/db/fatwas', async (req, res) => {
    try {
      const fatwaData = req.body;
      const inserted = await insertFatwa(fatwaData, req.body.authorUid);
      res.json(inserted);
    } catch (error: any) {
      console.error('Failed to insert fatwa into Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Failed to insert fatwa into Cloud SQL' });
    }
  });

  // 8. User Profile Synchronization with Cloud SQL (Authenticated)
  app.post('/api/db/user/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { uid, email, name, role, photoUrl } = req.body;
      const user = await getOrCreateUser(
        req.user.uid || uid,
        req.user.email || email || 'member@alhikmah.org',
        name || 'Member',
        role || 'student',
        photoUrl
      );
      res.json(user);
    } catch (error: any) {
      console.error('Failed to sync user with Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Failed to sync user' });
    }
  });

  // 9. User Reading Data from Cloud SQL (Authenticated)
  app.get('/api/db/user/activity', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const data = await getUserReadingData(req.user.uid);
      res.json(data);
    } catch (error: any) {
      console.error('Failed to fetch user activity from Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch activity' });
    }
  });

  // 10. Bookmark Toggle (Authenticated)
  app.post('/api/db/user/bookmark', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { bookId, bookTitle, page, chapterTitle } = req.body;
      const result = await toggleBookmark(req.user.uid, bookId, bookTitle, page, chapterTitle);
      res.json(result);
    } catch (error: any) {
      console.error('Failed to toggle bookmark in Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Failed to toggle bookmark' });
    }
  });

  // 11. Reading Progress Update (Authenticated)
  app.post('/api/db/user/progress', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { bookId, bookTitle, lastPage, totalPages } = req.body;
      const result = await updateReadingProgress(req.user.uid, bookId, bookTitle, lastPage, totalPages);
      res.json(result);
    } catch (error: any) {
      console.error('Failed to update reading progress in Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Failed to update progress' });
    }
  });

  // 12. Add Personal Note (Authenticated)
  app.post('/api/db/user/note', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { bookId, bookTitle, page, text } = req.body;
      const result = await addPersonalNote(req.user.uid, bookId, bookTitle, page, text);
      res.json(result);
    } catch (error: any) {
      console.error('Failed to add personal note in Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Failed to add note' });
    }
  });

  // ==========================================
  // TELEGRAM CHANNEL & BOT SYNC API ROUTES
  // ==========================================
  const recentTelegramEvents: any[] = [];

  // Telegram Live Webhook Endpoint
  app.post('/api/telegram/webhook', async (req, res) => {
    try {
      const update: TelegramUpdate = req.body;
      console.log('Received Telegram Update:', update?.update_id);

      const parsedBook = parseTelegramBookUpdate(update);
      if (parsedBook) {
        // Save to Cloud SQL
        const inserted = await insertBook(
          parsedBook,
          'telegram-bot',
          parsedBook.telegramChannel || 'Telegram Channel'
        );

        const fullBook: any = {
          ...parsedBook,
          ...(inserted || {}),
          chapters: parsedBook.chapters || [],
        };

        // Sync to Firestore using Admin SDK (server privileges, no client rules barriers)
        try {
          await adminDb.collection('books').doc(fullBook.id).set({
            id: fullBook.id,
            titleMm: fullBook.titleMm,
            titleAr: fullBook.titleAr || '',
            titleEn: fullBook.titleEn || '',
            authorMm: fullBook.authorMm,
            authorAr: fullBook.authorAr || '',
            category: fullBook.category,
            categoryMm: fullBook.categoryMm,
            descriptionMm: fullBook.descriptionMm || '',
            coverColor: fullBook.coverColor,
            totalPages: fullBook.totalPages,
            isMemberOnly: fullBook.isMemberOnly,
            language: fullBook.language,
            publishedYear: fullBook.publishedYear || new Date().getFullYear().toString(),
            readCount: fullBook.readCount || 0,
            rating: fullBook.rating || 5.0,
            isUserUploaded: true,
            uploaderId: 'telegram-bot',
            uploaderName: parsedBook.telegramChannel || 'Telegram Channel',
            telegramChannel: fullBook.telegramChannel || '',
            telegramPostId: String(fullBook.telegramPostId || ''),
            createdAt: new Date().toISOString(),
          }, { merge: true });
        } catch (fErr) {
          console.warn('Admin sync to Firestore skipped/failed:', fErr);
        }

        recentTelegramEvents.unshift({
          timestamp: Date.now(),
          bookId: parsedBook.id,
          title: parsedBook.titleMm,
          channel: parsedBook.telegramChannel,
          document: update.channel_post?.document?.file_name || 'Book File',
        });
        if (recentTelegramEvents.length > 50) recentTelegramEvents.pop();

        console.log(`Telegram book successfully synced: "${parsedBook.titleMm}"`);
        return res.json({ ok: true, synced: true, book: fullBook });
      }

      return res.json({ ok: true, synced: false, message: 'No book document or text detected in post' });
    } catch (error: any) {
      console.error('Error handling Telegram webhook:', error);
      return res.status(500).json({ error: error.message || 'Telegram webhook handling failed' });
    }
  });

  // Telegram Integration Status & Info
  app.get('/api/telegram/status', (_req, res) => {
    res.json({
      hasToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      channelConfigured: Boolean(process.env.TELEGRAM_CHANNEL_ID),
      recentEvents: recentTelegramEvents,
    });
  });

  async function syncTelegramFromBot() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return [];

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
      if (!res.ok) return [];
      const data: any = await res.json();
      if (!data.ok || !Array.isArray(data.result) || data.result.length === 0) {
        return [];
      }

      const importedBooks: any[] = [];
      let maxUpdateId = 0;

      for (const update of data.result) {
        if (update.update_id > maxUpdateId) maxUpdateId = update.update_id;
        const parsedBook = parseTelegramBookUpdate(update);
        if (parsedBook) {
          const inserted = await insertBook(
            parsedBook,
            'telegram-bot',
            parsedBook.telegramChannel || '@alhikmahislby'
          );
          const fullBook: any = {
            ...parsedBook,
            ...(inserted || {}),
            chapters: parsedBook.chapters || [],
          };
          importedBooks.push(fullBook);

          try {
            await adminDb.collection('books').doc(fullBook.id).set({
              id: fullBook.id,
              titleMm: fullBook.titleMm,
              titleAr: fullBook.titleAr || '',
              titleEn: fullBook.titleEn || '',
              authorMm: fullBook.authorMm,
              authorAr: fullBook.authorAr || '',
              category: fullBook.category,
              categoryMm: fullBook.categoryMm,
              descriptionMm: fullBook.descriptionMm || '',
              coverColor: fullBook.coverColor,
              totalPages: fullBook.totalPages,
              isMemberOnly: fullBook.isMemberOnly,
              language: fullBook.language,
              publishedYear: fullBook.publishedYear || new Date().getFullYear().toString(),
              readCount: fullBook.readCount || 0,
              rating: fullBook.rating || 5.0,
              isUserUploaded: true,
              uploaderId: 'telegram-bot',
              uploaderName: parsedBook.telegramChannel || 'Telegram Channel',
              telegramChannel: fullBook.telegramChannel || '',
              telegramPostId: String(fullBook.telegramPostId || ''),
              createdAt: new Date().toISOString(),
            }, { merge: true });
          } catch (fErr) {
            // Optional firestore sync
          }

          recentTelegramEvents.unshift({
            timestamp: Date.now(),
            bookId: parsedBook.id,
            title: parsedBook.titleMm,
            channel: parsedBook.telegramChannel,
            document: update.channel_post?.document?.file_name || update.message?.document?.file_name || 'Book File',
          });
          if (recentTelegramEvents.length > 50) recentTelegramEvents.pop();
        }
      }

      if (maxUpdateId > 0) {
        await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${maxUpdateId + 1}`);
      }

      return importedBooks;
    } catch (err) {
      console.error('Telegram polling error:', err);
      return [];
    }
  }

  // Trigger manual sync or check
  app.post('/api/telegram/sync-updates', async (_req, res) => {
    try {
      const imported = await syncTelegramFromBot();
      res.json({
        success: true,
        message: `Telegram မှ စာအုပ် (${imported.length}) အုပ် စစ်ဆေးတွေ့ရှိပြီး စာကြည့်တိုက်သို့ ထည့်သွင်းပြီးပါပြီ`,
        importedCount: imported.length,
        books: imported,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Telegram sync failed' });
    }
  });

  // Background interval polling for new Telegram posts every 25 seconds
  if (process.env.TELEGRAM_BOT_TOKEN) {
    setInterval(() => {
      syncTelegramFromBot().catch(() => {});
    }, 25000);
  }

  // Test / Simulate Telegram Channel Post (1-Click Test for User)
  app.post('/api/telegram/simulate-post', async (req, res) => {
    try {
      const {
        title = 'အစ္စလာမ့် သာသနာရေးရာ နေ့စဉ်ကျင့်ဝတ် လက်စွဲတော်',
        author = 'မော်လာနာ နူရ်မုဟမ္မဒ်',
        category = 'fiqh',
        fileName = 'Islamic_Daily_Ethics_Fiqh.pdf',
        channelName = '@alhikmah_islamic_books',
        pages = 48,
        description = 'ဤစာအုပ်သည် နေ့စဉ် အိဗာဒသ်၊ သန့်ရှင်းရေးနှင့် နမားဇ်ဆိုင်ရာ အရေးကြီး စည်းမျဉ်းများကို မြန်မာဘာသာဖြင့် အသေးစိတ် ရှင်းလင်းထားသော လက်စွဲစာအုပ် ဖြစ်ပါသည်။',
      } = req.body || {};

      const simulatedUpdate: TelegramUpdate = {
        update_id: Math.floor(100000 + Math.random() * 900000),
        channel_post: {
          message_id: Math.floor(100 + Math.random() * 9000),
          chat: {
            id: -1001889922001,
            title: 'Al-Hikmah Official Telegram Channel',
            username: channelName.replace('@', ''),
            type: 'channel',
          },
          date: Math.floor(Date.now() / 1000),
          caption: `စာအုပ်အမည်: ${title}\nစာရေးသူ: ${author}\nကဏ္ဍ: ${category}\nစာမျက်နှာ: ${pages}\n\nအကျဉ်းချုပ်: ${description}`,
          document: {
            file_id: `BQACAgQAAxkBAAIC_${Date.now()}`,
            file_unique_id: `AgAD_${Date.now()}`,
            file_name: fileName,
            mime_type: 'application/pdf',
            file_size: 3450000,
          },
        },
      };

      const parsedBook = parseTelegramBookUpdate(simulatedUpdate);
      if (parsedBook) {
        const inserted = await insertBook(
          parsedBook,
          'telegram-simulated',
          channelName
        );

        const fullBook: any = {
          ...parsedBook,
          ...(inserted || {}),
          chapters: parsedBook.chapters || [],
        };

        // Sync to Firestore using Admin SDK
        try {
          await adminDb.collection('books').doc(fullBook.id).set({
            id: fullBook.id,
            titleMm: fullBook.titleMm,
            titleAr: fullBook.titleAr || '',
            titleEn: fullBook.titleEn || '',
            authorMm: fullBook.authorMm,
            authorAr: fullBook.authorAr || '',
            category: fullBook.category,
            categoryMm: fullBook.categoryMm,
            descriptionMm: fullBook.descriptionMm || '',
            coverColor: fullBook.coverColor,
            totalPages: fullBook.totalPages,
            isMemberOnly: fullBook.isMemberOnly,
            language: fullBook.language,
            publishedYear: fullBook.publishedYear || new Date().getFullYear().toString(),
            readCount: fullBook.readCount || 0,
            rating: fullBook.rating || 5.0,
            isUserUploaded: true,
            uploaderId: 'telegram-simulated',
            uploaderName: channelName,
            telegramChannel: fullBook.telegramChannel || '',
            telegramPostId: String(fullBook.telegramPostId || ''),
            createdAt: new Date().toISOString(),
          }, { merge: true });
        } catch (fErr) {
          console.warn('Admin sync to Firestore skipped/failed:', fErr);
        }

        recentTelegramEvents.unshift({
          timestamp: Date.now(),
          bookId: parsedBook.id,
          title: parsedBook.titleMm,
          channel: channelName,
          document: fileName,
          simulated: true,
        });
        if (recentTelegramEvents.length > 50) recentTelegramEvents.pop();

        return res.json({
          success: true,
          message: 'စာအုပ်အား Telegram Channel မှ Web Library သို့ အောင်မြင်စွာ တင်သွင်းပြီးပါပြီ',
          book: fullBook,
        });
      }

      return res.status(400).json({ error: 'Failed to parse simulated book update' });
    } catch (error: any) {
      console.error('Error in simulate-post:', error);
      return res.status(500).json({ error: error.message || 'Simulation failed' });
    }
  });

  // Vite middleware in dev or static serving in prod
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${PORT}`);
  });
}

startServer();
