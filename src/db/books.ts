import { db } from './index.ts';
import { books } from './schema.ts';
import { desc, eq } from 'drizzle-orm';
import { BookItem } from '../types/index.ts';

export async function getBooks(): Promise<any[]> {
  try {
    const list = await db.select().from(books).orderBy(desc(books.createdAt));
    return list.map((b) => ({
      ...b,
      chapters: [
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
  } catch (error) {
    console.error('Database query failed in getBooks:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function insertBook(book: BookItem, uploaderUid?: string, uploaderName?: string) {
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
    console.error('Database query failed in insertBook:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateBookStats(bookId: string, readCount: number, rating?: string) {
  try {
    const updateValues: Record<string, any> = { readCount };
    if (rating) updateValues.rating = rating;

    return await db.update(books)
      .set(updateValues)
      .where(eq(books.id, bookId))
      .returning();
  } catch (error) {
    console.error('Database query failed in updateBookStats:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
