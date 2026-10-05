import { db, isCloudSqlAvailable } from './index.ts';
import { fatwas } from './schema.ts';
import { desc } from 'drizzle-orm';
import { FatwaItem } from '../types/index.ts';
import { INITIAL_FATWAS } from '../data/initialFatwas.ts';

const inMemoryFatwas: any[] = [...INITIAL_FATWAS];

export async function getFatwas(): Promise<any[]> {
  if (isCloudSqlAvailable() && db) {
    try {
      const list = await db.select().from(fatwas).orderBy(desc(fatwas.createdAt));
      if (list && list.length > 0) return list;
    } catch (error) {
      console.warn('Database query failed in getFatwas (using fallback):', error);
    }
  }
  return inMemoryFatwas;
}

export async function insertFatwa(fatwa: FatwaItem, authorUid?: string) {
  const newFatwa = {
    ...fatwa,
    questionerUid: authorUid || null,
    createdAt: new Date().toISOString(),
  };

  const existingIdx = inMemoryFatwas.findIndex((f) => f.id === fatwa.id);
  if (existingIdx >= 0) {
    inMemoryFatwas[existingIdx] = { ...inMemoryFatwas[existingIdx], ...newFatwa };
  } else {
    inMemoryFatwas.unshift(newFatwa);
  }

  if (isCloudSqlAvailable() && db) {
    try {
      const result = await db.insert(fatwas)
        .values({
          id: fatwa.id,
          fatwaNumber: fatwa.fatwaNumber,
          titleMm: fatwa.titleMm,
          category: fatwa.category,
          categoryMm: fatwa.categoryMm,
          questionMm: fatwa.questionMm,
          questioner: fatwa.questioner,
          questionerUid: authorUid || null,
          answerMm: fatwa.answerMm,
          answerAr: fatwa.answerAr || null,
          referencesMm: fatwa.referencesMm ? JSON.stringify(fatwa.referencesMm) : null,
          muftiOrBoard: fatwa.muftiOrBoard,
          views: fatwa.views || 1,
        })
        .onConflictDoUpdate({
          target: fatwas.id,
          set: {
            views: fatwa.views || 1,
          },
        })
        .returning();

      return result[0];
    } catch (error) {
      console.warn('Failed to insert fatwa into Cloud SQL, kept in memory:', error);
    }
  }

  return newFatwa;
}
