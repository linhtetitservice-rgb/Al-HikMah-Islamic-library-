import { BookItem } from '../types/index.ts';

export interface TelegramChannelPost {
  message_id: number;
  chat: {
    id: number | string;
    title?: string;
    username?: string;
    type: string;
  };
  date: number;
  text?: string;
  caption?: string;
  document?: {
    file_id: string;
    file_unique_id: string;
    file_name?: string;
    mime_type?: string;
    file_size?: number;
  };
}

export interface TelegramUpdate {
  update_id: number;
  channel_post?: TelegramChannelPost;
  message?: TelegramChannelPost;
}

const CATEGORY_KEYWORDS: Record<string, { cat: string; catMm: string }> = {
  ကုရ်အာန်: { cat: 'quran', catMm: 'ကုရ်အာန်နှင့် သဖ်စီးရ်' },
  quran: { cat: 'quran', catMm: 'ကုရ်အာန်နှင့် သဖ်စီးရ်' },
  ဟဒီးစ်: { cat: 'hadith', catMm: 'ဟဒီးစ်တော်များ' },
  hadith: { cat: 'hadith', catMm: 'ဟဒီးစ်တော်များ' },
  ဖိကာဟ်: { cat: 'fiqh', catMm: 'ဖိကာဟ်နှင့် တရားတော်' },
  fiqh: { cat: 'fiqh', catMm: 'ဖိကာဟ်နှင့် တရားတော်' },
  နမားဇ်: { cat: 'fiqh', catMm: 'ဖိကာဟ်နှင့် တရားတော်' },
  ဇကာသ်: { cat: 'fiqh', catMm: 'ဖိကာဟ်နှင့် တရားတော်' },
  ရမ်ဇာန်: { cat: 'fiqh', catMm: 'ဖိကာဟ်နှင့် တရားတော်' },
  စီရသ်: { cat: 'seerah', catMm: 'တမန်တော်မြတ် အတ္ထုပ္ပတ္တိ' },
  seerah: { cat: 'seerah', catMm: 'တမန်တော်မြတ် အတ္ထုပ္ပတ္တိ' },
  သာဝက: { cat: 'seerah', catMm: 'တမန်တော်မြတ် အတ္ထုပ္ပတ္တိ' },
  အကီဒဟ်: { cat: 'aqeedah', catMm: 'အကီဒဟ် (ယုံကြည်ချက်)' },
  ဒုအာ: { cat: 'dua', catMm: 'ဒုအာနှင့် ဇိကိရ်' },
  dua: { cat: 'dua', catMm: 'ဒုအာနှင့် ဇိကိရ်' },
};

const COVER_GRADIENTS = [
  'from-emerald-950 via-teal-950 to-stone-900',
  'from-teal-950 via-stone-900 to-emerald-950',
  'from-stone-900 via-emerald-950 to-amber-950',
  'from-cyan-950 via-teal-950 to-stone-900',
  'from-amber-950 via-stone-900 to-emerald-950',
];

export function parseTelegramBookUpdate(update: TelegramUpdate): BookItem | null {
  const post = update.channel_post || update.message;
  if (!post) return null;

  const rawText = post.caption || post.text || '';
  const doc = post.document;

  // We require either a document (e.g. PDF) or a meaningful text post about a book
  if (!doc && rawText.length < 5) {
    return null;
  }

  const channelTitle = post.chat.title || 'Telegram Channel';
  const channelHandle = post.chat.username ? `@${post.chat.username}` : channelTitle;
  const messageId = post.message_id;

  // Extract Title
  let title = '';
  const titleMatch = rawText.match(/(?:ခေါင်းစဉ်|စာအုပ်အမည်|အမည်|title)\s*[:=၊-]\s*([^\n\r]+)/i);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
  } else if (doc?.file_name) {
    // Clean file name, e.g. "Holy_Quran_Myanmar.pdf" -> "Holy Quran Myanmar"
    title = doc.file_name
      .replace(/\.(pdf|epub|doc|docx|txt)$/i, '')
      .replace(/[_.-]+/g, ' ')
      .trim();
  } else {
    // First line of text
    const firstLine = rawText.split('\n')[0].trim();
    title = firstLine.length > 0 ? firstLine.slice(0, 100) : `တယ်လီဂရမ် စာအုပ် #${messageId}`;
  }

  // Extract Author
  let author = '';
  const authorMatch = rawText.match(/(?:စာရေးသူ|ဆရာ|ရေးသားသူ|author|by)\s*[:=၊-]\s*([^\n\r]+)/i);
  if (authorMatch && authorMatch[1]) {
    author = authorMatch[1].trim();
  } else {
    author = `${channelHandle} မှ မျှဝေသည်`;
  }

  // Extract Category
  let category = 'general';
  let categoryMm = 'အထွေထွေ အစ္စလာမ့်စာပေ';

  const catMatch = rawText.match(/(?:ကဏ္ဍ|အမျိုးအစား|category)\s*[:=၊-]\s*([^\n\r]+)/i);
  if (catMatch && catMatch[1]) {
    const rawCat = catMatch[1].toLowerCase();
    for (const [key, val] of Object.entries(CATEGORY_KEYWORDS)) {
      if (rawCat.includes(key)) {
        category = val.cat;
        categoryMm = val.catMm;
        break;
      }
    }
  } else {
    // Search throughout text and title for keywords
    const combined = `${title} ${rawText}`.toLowerCase();
    for (const [key, val] of Object.entries(CATEGORY_KEYWORDS)) {
      if (combined.includes(key)) {
        category = val.cat;
        categoryMm = val.catMm;
        break;
      }
    }
  }

  // Extract Pages
  let pages = 24;
  const pageMatch = rawText.match(/(?:စာမျက်နှာ|pages?)\s*[:=၊-]\s*(\d+)/i);
  if (pageMatch && pageMatch[1]) {
    pages = parseInt(pageMatch[1], 10);
  } else if (doc?.file_size) {
    // Approximate pages based on size
    pages = Math.max(12, Math.min(600, Math.round(doc.file_size / 60000)));
  }

  // Description
  let description = rawText;
  if (!description || description.trim().length === 0) {
    description = `ဤစာအုပ်အား Telegram Channel (${channelHandle}) မှ အလိုအလျောက် ရယူတင်သွင်းထားပါသည်။`;
  }

  // Telegram direct message link
  const tmeUrl = post.chat.username
    ? `https://t.me/${post.chat.username}/${messageId}`
    : `https://t.me/c/${String(post.chat.id).replace('-100', '')}/${messageId}`;

  const coverGradient = COVER_GRADIENTS[Math.abs(Number(messageId)) % COVER_GRADIENTS.length];
  const bookId = `tg-${String(post.chat.id).replace(/[^a-zA-Z0-9]/g, '')}-${messageId}`;

  const parsedBook: BookItem = {
    id: bookId,
    titleMm: title,
    titleAr: '',
    titleEn: doc?.file_name || '',
    authorMm: author,
    authorAr: '',
    category,
    categoryMm,
    descriptionMm: description,
    coverColor: coverGradient,
    totalPages: pages,
    isMemberOnly: false,
    language: 'my',
    publishedYear: new Date(post.date * 1000).getFullYear().toString(),
    readCount: 0,
    rating: 5.0,
    isUserUploaded: true,
    pdfUrl: tmeUrl,
    telegramChannel: channelHandle,
    telegramPostId: messageId,
    chapters: [
      {
        id: 'c1',
        titleMm: 'မိတ်ဆက်နှင့် အမှာစာ',
        pageNumber: 1,
        content: `${title} ၏ မိတ်ဆက်အမှာစာဖြစ်ပါသည်။ ${description}`,
      },
      {
        id: 'c2',
        titleMm: 'အခန်း (၁) - အဓိက အနှစ်ချုပ်များ',
        pageNumber: 2,
        content: `အစ္စလာမ့် တရားတော်နှင့် ဓမ္မအသိပညာ ဖြန့်ဝေမှုအတွက် Telegram Channel (${channelHandle}) မှတစ်ဆင့် တိုက်ရိုက်ရောက်ရှိလာသော စာအုပ်ဖြစ်ပါသည်။ Telegram Channel တွင် မူရင်း PDF ဖိုင်အား ဒေါင်းလုဒ်ရယူနိုင်ပါသည်: ${tmeUrl}`,
      },
      {
        id: 'c3',
        titleMm: 'အခန်း (၂) - လေ့လာဆင်ခြင်ရန် အချက်များ',
        pageNumber: Math.max(3, Math.round(pages / 2)),
        content: `ကုရ်အာန်နှင့် ဟဒီးစ်တော်တို့၏ အလင်းရောင်ဖြင့် အသိပညာ ဗဟုသုတ တိုးပွားစေရန် လေ့လာဖတ်ရှုနိုင်ပါသည်။`,
      },
    ],
  };

  return parsedBook;
}
