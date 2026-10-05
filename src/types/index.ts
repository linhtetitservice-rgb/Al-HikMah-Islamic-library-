export type PrayerName = 'fajr' | 'sunrise' | 'zawal' | 'dhuhr' | 'asr' | 'sunset' | 'maghrib' | 'isha';

export interface PrayerTimeItem {
  id: PrayerName;
  nameMm: string;
  nameAr: string;
  nameEn: string;
  time: string; // HH:mm
  isMakrooh?: boolean;
  descriptionMm: string;
}

export interface CityLocation {
  id: string;
  nameMm: string;
  nameEn: string;
  lat: number;
  lng: number;
  timeZoneOffset: number; // in hours, Myanmar is 6.5 (UTC+06:30)
}

export interface HijriDateInfo {
  day: number;
  monthNumber: number;
  monthNameAr: string;
  monthNameMm: string;
  monthNameEn: string;
  year: number;
  gregorianDateStr: string;
  islamicEvent?: string;
  formattedMm?: string;
}

export interface NetworkDateInfo {
  timestamp: number;
  myanmarDate: string;
  myanmarTime: string;
  day: number;
  month: number;
  year: number;
  dayOfWeekMm: string;
  monthNameMm: string;
  dateFormattedMm: string;
}

export interface HadithItem {
  id: string;
  topicMm: string;
  topicAr?: string;
  narratorMm: string;
  narratorAr?: string;
  hadithAr: string;
  hadithMm: string;
  sourceBookMm: string;
  sourceBookAr?: string;
  hadithNumber?: string;
  reflectionMm: string;
}

export interface WisdomItem {
  id: string;
  themeMm: string;
  quoteAr: string;
  quoteMm: string;
  sourceMm: string;
  sourceType: 'quran' | 'hadith' | 'scholar';
  reflectionMm: string;
}

export interface BookChapter {
  id: string;
  titleMm: string;
  titleAr?: string;
  content: string; // rich text or paragraphs
  pageNumber: number;
}

export interface BookItem {
  id: string;
  titleMm: string;
  titleAr?: string;
  titleEn?: string;
  authorMm: string;
  authorAr?: string;
  category: string;
  categoryMm: string;
  descriptionMm: string;
  coverColor: string; // Tailwind gradient or accent
  totalPages: number;
  isMemberOnly: boolean;
  language: 'my' | 'ar' | 'both';
  chapters: BookChapter[];
  pdfUrl?: string; // If user uploaded a PDF or embedded
  audioUrl?: string; // If user uploaded an audio file or MP3 URL
  mediaType?: 'book' | 'audio' | 'pdf'; // Type of media resource
  audioDuration?: string; // Formatted duration e.g. "04:30" or "45:12"
  reciterOrSpeakerMm?: string; // ဟောကြားသူ / ရွတ်ဖတ်သူ ဆရာတော်
  audioFileSize?: string; // e.g. "4.8 MB"
  fileData?: string; // Base64 or raw file data
  isUserUploaded?: boolean;
  uploaderId?: string;
  uploaderName?: string;
  publishedYear?: string;
  readCount: number;
  rating: number;
  telegramChannel?: string;
  telegramPostId?: number | string;
}

export interface FatwaItem {
  id: string;
  titleMm: string;
  category: string;
  categoryMm: string;
  questionMm: string;
  questioner: string;
  answerMm: string;
  answerAr?: string;
  referencesMm: string[];
  muftiOrBoard: string;
  dateMm: string;
  fatwaNumber: string;
  views: number;
}

export interface UserProfile {
  id: string;
  uid?: string;
  name: string;
  displayName?: string;
  email: string;
  role: 'member' | 'student' | 'scholar' | 'admin';
  avatarInitials: string;
  photoURL?: string;
  joinDate: string;
  isPremium?: boolean;
  savedBookmarks?: string[];
  notes?: any[];
  bookmarks: {
    bookId: string;
    bookTitle: string;
    page: number;
    chapterTitle: string;
    date: string;
  }[];
  readingHistory: {
    bookId: string;
    bookTitle: string;
    lastPage: number;
    totalPages: number;
    lastReadDate: string;
  }[];
  personalNotes: {
    id: string;
    bookId: string;
    bookTitle: string;
    page: number;
    text: string;
    createdAt: string;
  }[];
}

export interface ZakatCalculationInput {
  goldGrams: number;
  goldRatePerGram: number; // in MMK
  silverGrams: number;
  silverRatePerGram: number; // in MMK
  cashInHandAndBank: number;
  businessMerchandise: number;
  investmentsAndShares: number;
  loansReceivable: number;
  debtsOwed: number;
  monthlyExpensesDue: number;
  currency: 'MMK' | 'USD';
}

export interface ZakatCalculationResult {
  totalAssets: number;
  totalLiabilities: number;
  netWealth: number;
  nisabValue: number;
  nisabMet: boolean;
  zakatDue: number;
  nisabBasis: 'gold' | 'silver';
}
