import { db, isCloudSqlAvailable } from './index.ts';
import { bookmarks, readingHistory, personalNotes } from './schema.ts';
import { desc, eq, and } from 'drizzle-orm';

interface InMemBm {
  id: number;
  userId: string;
  bookId: string;
  bookTitle: string;
  page: number;
  chapterTitle?: string | null;
  createdAt: Date;
}

interface InMemHistory {
  id: number;
  userId: string;
  bookId: string;
  bookTitle: string;
  lastPage: number;
  totalPages: number;
  updatedAt: Date;
}

interface InMemNote {
  id: number;
  userId: string;
  bookId: string;
  bookTitle: string;
  page: number;
  text: string;
  createdAt: Date;
}

const inMemoryBookmarks: InMemBm[] = [];
const inMemoryHistory: InMemHistory[] = [];
const inMemoryNotes: InMemNote[] = [];

export async function getUserReadingData(userId: string) {
  if (isCloudSqlAvailable() && db) {
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
      console.warn('Database query failed in getUserReadingData (using fallback):', error);
    }
  }

  return {
    bookmarks: inMemoryBookmarks.filter((b) => b.userId === userId),
    readingHistory: inMemoryHistory.filter((h) => h.userId === userId),
    personalNotes: inMemoryNotes.filter((n) => n.userId === userId),
  };
}

export async function toggleBookmark(
  userId: string,
  bookId: string,
  bookTitle: string,
  page: number,
  chapterTitle: string
) {
  const existingIdx = inMemoryBookmarks.findIndex(
    (b) => b.userId === userId && b.bookId === bookId && b.page === page
  );
  if (existingIdx >= 0) {
    const removedId = inMemoryBookmarks[existingIdx].id;
    inMemoryBookmarks.splice(existingIdx, 1);
    if (isCloudSqlAvailable() && db) {
      try {
        await db.delete(bookmarks).where(eq(bookmarks.id, removedId));
      } catch (err) {
        console.warn('Failed to delete bookmark in Cloud SQL:', err);
      }
    }
    return { action: 'removed', id: removedId };
  } else {
    const newBm: InMemBm = {
      id: Date.now(),
      userId,
      bookId,
      bookTitle,
      page,
      chapterTitle,
      createdAt: new Date(),
    };
    inMemoryBookmarks.push(newBm);
    if (isCloudSqlAvailable() && db) {
      try {
        const inserted = await db.insert(bookmarks).values(newBm).returning();
        return { action: 'added', bookmark: inserted[0] };
      } catch (err) {
        console.warn('Failed to insert bookmark into Cloud SQL:', err);
      }
    }
    return { action: 'added', bookmark: newBm };
  }
}

export async function updateReadingProgress(
  userId: string,
  bookId: string,
  bookTitle: string,
  lastPage: number,
  totalPages: number
) {
  const existing = inMemoryHistory.find(
    (h) => h.userId === userId && h.bookId === bookId
  );
  if (existing) {
    existing.lastPage = lastPage;
    existing.totalPages = totalPages;
    existing.updatedAt = new Date();
  } else {
    inMemoryHistory.push({
      id: Date.now(),
      userId,
      bookId,
      bookTitle,
      lastPage,
      totalPages,
      updatedAt: new Date(),
    });
  }

  if (isCloudSqlAvailable() && db) {
    try {
      const existingDb = await db
        .select()
        .from(readingHistory)
        .where(
          and(
            eq(readingHistory.userId, userId),
            eq(readingHistory.bookId, bookId)
          )
        )
        .limit(1);

      if (existingDb.length > 0) {
        const updated = await db
          .update(readingHistory)
          .set({
            lastPage,
            totalPages,
            updatedAt: new Date(),
          })
          .where(eq(readingHistory.id, existingDb[0].id))
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
      console.warn('Database query failed in updateReadingProgress:', error);
    }
  }

  return existing || inMemoryHistory[inMemoryHistory.length - 1];
}

export async function addPersonalNote(
  userId: string,
  bookId: string,
  bookTitle: string,
  page: number,
  text: string
) {
  const newNote: InMemNote = {
    id: Date.now(),
    userId,
    bookId,
    bookTitle,
    page,
    text,
    createdAt: new Date(),
  };
  inMemoryNotes.push(newNote);

  if (isCloudSqlAvailable() && db) {
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
      console.warn('Database query failed in addPersonalNote:', error);
    }
  }

  return newNote;
}
