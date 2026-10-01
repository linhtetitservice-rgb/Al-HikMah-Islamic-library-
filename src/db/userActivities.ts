import { db } from './index.ts';
import { bookmarks, readingHistory, personalNotes } from './schema.ts';
import { desc, eq, and } from 'drizzle-orm';

export async function getUserReadingData(userId: string) {
  try {
    const userBookmarks = await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));

    const userHistory = await db
      .select()
      .from(readingHistory)
      .where(eq(readingHistory.userId, userId))
      .orderBy(desc(readingHistory.updatedAt));

    const userNotes = await db
      .select()
      .from(personalNotes)
      .where(eq(personalNotes.userId, userId))
      .orderBy(desc(personalNotes.createdAt));

    return {
      bookmarks: userBookmarks,
      readingHistory: userHistory,
      personalNotes: userNotes,
    };
  } catch (error) {
    console.error('Database query failed in getUserReadingData:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function toggleBookmark(
  userId: string,
  bookId: string,
  bookTitle: string,
  page: number,
  chapterTitle: string
) {
  try {
    const existing = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.bookId, bookId),
          eq(bookmarks.page, page)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id));
      return { action: 'removed', id: existing[0].id };
    } else {
      const inserted = await db
        .insert(bookmarks)
        .values({
          userId,
          bookId,
          bookTitle,
          page,
          chapterTitle,
        })
        .returning();
      return { action: 'added', bookmark: inserted[0] };
    }
  } catch (error) {
    console.error('Database query failed in toggleBookmark:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateReadingProgress(
  userId: string,
  bookId: string,
  bookTitle: string,
  lastPage: number,
  totalPages: number
) {
  try {
    const existing = await db
      .select()
      .from(readingHistory)
      .where(
        and(
          eq(readingHistory.userId, userId),
          eq(readingHistory.bookId, bookId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(readingHistory)
        .set({
          lastPage,
          totalPages,
          updatedAt: new Date(),
        })
        .where(eq(readingHistory.id, existing[0].id))
        .returning();
      return updated[0];
    } else {
      const inserted = await db
        .insert(readingHistory)
        .values({
          userId,
          bookId,
          bookTitle,
          lastPage,
          totalPages,
        })
        .returning();
      return inserted[0];
    }
  } catch (error) {
    console.error('Database query failed in updateReadingProgress:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function addPersonalNote(
  userId: string,
  bookId: string,
  bookTitle: string,
  page: number,
  text: string
) {
  try {
    const inserted = await db
      .insert(personalNotes)
      .values({
        userId,
        bookId,
        bookTitle,
        page,
        text,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in addPersonalNote:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
