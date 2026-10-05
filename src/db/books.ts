import { db, isCloudSqlAvailable } from './index.ts';
import { books } from './schema.ts';
import { desc, eq } from 'drizzle-orm';
import { BookItem } from '../types/index.ts';
import { INITIAL_BOOKS } from '../data/initialBooks.ts';

// In-memory fallback store initialized with INITIAL_BOOKS
const inMemoryBooks: any[] = [...INITIAL_BOOKS];

export async function getBooks(): Promise<any[]> {
  if (isCloudSqlAvailable() && db) {
    try {
      const list = await db.select().from(books).orderBy(desc(books.createdAt));
      if (list && list.length > 0) {
        return list.map((b: any) => ({
          ...b,
          chapters: b.chapters || [
            {
              id: 'c1',
              titleMm: 'မိတ်ဆက်နှင့် အမှာစာ',
              pageNumber: 1,
              content: b.descriptionMm || `${b.titleMm} စာအုပ်၏ မိတ်ဆက်အကျဉ်းချုပ် ဖြစ်ပါသည်။`,
            },
            {
              id: 'c2',
              titleMm: 'အဓိက တရားဒေသနာနှင့် အကြောင်းအရာ',
              pageNumber: 2,
              content: b.descriptionMm
                ? `${b.descriptionMm}\n\nဤစာအုပ်အား Al-Hikmah စာကြည့်တိုက်တွင် ဖတ်ရှုလေ့လာနိုင်ပါသည်။`
                : 'ဤစာအုပ်၏ အဓိက အနှစ်ချုပ်များကို စတင်ဖတ်ရှုနိုင်ပါသည်။',
            },
          ],
        }));
      }
    } catch (error) {
      console.warn('Database query failed in getBooks (using fallback):', error);
    }
  }
  return inMemoryBooks;
}

export async function insertBook(book: BookItem, uploaderUid?: string, uploaderName?: string) {
  const newBookRecord = {
    ...book,
    uploaderId: uploaderUid || null,
    uploaderName: uploaderName || null,
    createdAt: new Date().toISOString(),
  };

  const existingIdx = inMemoryBooks.findIndex((b) => b.id === book.id);
  if (existingIdx >= 0) {
    inMemoryBooks[existingIdx] = { ...inMemoryBooks[existingIdx], ...newBookRecord };
  } else {
    inMemoryBooks.unshift(newBookRecord);
  }

  if (isCloudSqlAvailable() && db) {
    try {
      const result = await db.insert(books)
        .values({
          id: book.id,
          titleMm: book.titleMm,
          titleAr: book.titleAr || null,
          titleEn: book.titleEn || null,
          authorMm: book.authorMm,
          authorAr: book.authorAr || null,
          category: book.category,
          categoryMm: book.categoryMm,
          descriptionMm: book.descriptionMm || null,
          coverColor: book.coverColor,
          totalPages: book.totalPages,
          isMemberOnly: book.isMemberOnly,
          language: book.language,
          publishedYear: book.publishedYear || null,
          readCount: book.readCount || 0,
          rating: String(book.rating || 5.0),
          isUserUploaded: Boolean(book.isUserUploaded),
          uploaderId: uploaderUid || null,
          uploaderName: uploaderName || null,
          fileData: book.fileData || null,
          telegramChannel: book.telegramChannel || null,
          telegramPostId: book.telegramPostId ? String(book.telegramPostId) : null,
        })
        .onConflictDoUpdate({
          target: books.id,
          set: {
            readCount: book.readCount,
            rating: String(book.rating || 5.0),
          },
        })
        .returning();

      return result[0];
    } catch (error) {
      console.warn('Failed to insert book to Cloud SQL, kept in memory:', error);
    }
  }

  return newBookRecord;
}

export async function updateBookStats(bookId: string, readCount: number, rating?: string) {
  const existing = inMemoryBooks.find((b) => b.id === bookId);
  if (existing) {
    existing.readCount = readCount;
    if (rating) existing.rating = parseFloat(rating) || existing.rating;
  }

  if (isCloudSqlAvailable() && db) {
    try {
      const updateValues: Record<string, any> = { readCount };
      if (rating) updateValues.rating = rating;

      const res = await db.update(books)
        .set(updateValues)
        .where(eq(books.id, bookId))
        .returning();
      return res;
    } catch (error) {
      console.warn('Failed to update book stats in Cloud SQL:', error);
    }
  }

  return existing ? [existing] : [];
}
