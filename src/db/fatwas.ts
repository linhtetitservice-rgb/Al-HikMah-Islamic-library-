import { db } from './index.ts';
import { fatwas } from './schema.ts';
import { desc, eq } from 'drizzle-orm';
import { FatwaItem } from '../types/index.ts';

export async function getFatwas(): Promise<any[]> {
  try {
    return await db.select().from(fatwas).orderBy(desc(fatwas.createdAt));
  } catch (error) {
    console.error('Database query failed in getFatwas:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function insertFatwa(fatwa: FatwaItem, authorUid?: string) {
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
    console.error('Database query failed in insertFatwa:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
