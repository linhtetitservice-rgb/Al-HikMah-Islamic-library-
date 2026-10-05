import { db, isCloudSqlAvailable } from './index.ts';
import { books, fatwas } from './schema.ts';
import { INITIAL_BOOKS } from '../data/initialBooks.ts';
import { INITIAL_FATWAS } from '../data/initialFatwas.ts';

export async function seedInitialDataIfNeeded() {
  if (!isCloudSqlAvailable() || !db) {
    return;
  }
  try {
    const existingBooks = await db.select().from(books).limit(1);
    if (existingBooks.length === 0) {
      console.log('Seeding initial books into Cloud SQL database...');
      for (const b of INITIAL_BOOKS) {
        await db.insert(books).values({
          id: b.id,
          titleMm: b.titleMm,
          titleAr: b.titleAr || null,
          titleEn: b.titleEn || null,
          authorMm: b.authorMm,
          authorAr: b.authorAr || null,
          category: b.category,
          categoryMm: b.categoryMm,
          descriptionMm: b.descriptionMm || null,
          coverColor: b.coverColor,
          totalPages: b.totalPages,
          isMemberOnly: b.isMemberOnly,
          language: b.language,
          publishedYear: b.publishedYear || null,
          readCount: b.readCount || 0,
          rating: String(b.rating || 5.0),
          isUserUploaded: false,
        }).onConflictDoNothing();
      }
      console.log(`Seeded ${INITIAL_BOOKS.length} books into Cloud SQL.`);
    }

    const existingFatwas = await db.select().from(fatwas).limit(1);
    if (existingFatwas.length === 0) {
      console.log('Seeding initial fatwas into Cloud SQL database...');
      for (const f of INITIAL_FATWAS) {
        await db.insert(fatwas).values({
          id: f.id,
          fatwaNumber: f.fatwaNumber,
          titleMm: f.titleMm,
          category: f.category,
          categoryMm: f.categoryMm,
          questionMm: f.questionMm,
          questioner: f.questioner,
          answerMm: f.answerMm,
          answerAr: f.answerAr || null,
          referencesMm: JSON.stringify(f.referencesMm),
          muftiOrBoard: f.muftiOrBoard,
          views: f.views,
        }).onConflictDoNothing();
      }
      console.log(`Seeded ${INITIAL_FATWAS.length} fatwas into Cloud SQL.`);
    }
  } catch (error) {
    console.warn('Seeding Cloud SQL initial data skipped or failed:', error);
  }
}
