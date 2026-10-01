import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull().default('student'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 2. Books Table
export const books = pgTable('books', {
  id: text('id').primaryKey(),
  titleMm: text('title_mm').notNull(),
  titleAr: text('title_ar'),
  titleEn: text('title_en'),
  authorMm: text('author_mm').notNull(),
  authorAr: text('author_ar'),
  category: text('category').notNull(),
  categoryMm: text('category_mm').notNull(),
  descriptionMm: text('description_mm'),
  coverColor: text('cover_color').default('from-emerald-950 to-stone-900'),
  totalPages: integer('total_pages').notNull().default(1),
  isMemberOnly: boolean('is_member_only').notNull().default(false),
  language: text('language').notNull().default('my'),
  publishedYear: text('published_year'),
  readCount: integer('read_count').default(0),
  rating: text('rating').default('5.0'),
  isUserUploaded: boolean('is_user_uploaded').default(false),
  uploaderId: text('uploader_id'),
  uploaderName: text('uploader_name'),
  fileData: text('file_data'),
  telegramChannel: text('telegram_channel'),
  telegramPostId: text('telegram_post_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. User Bookmarks Table
export const bookmarks = pgTable('bookmarks', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid)
    .notNull(),
  bookId: text('book_id')
    .references(() => books.id)
    .notNull(),
  bookTitle: text('book_title').notNull(),
  page: integer('page').notNull(),
  chapterTitle: text('chapter_title').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. User Reading History Table
export const readingHistory = pgTable('reading_history', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid)
    .notNull(),
  bookId: text('book_id')
    .references(() => books.id)
    .notNull(),
  bookTitle: text('book_title').notNull(),
  lastPage: integer('last_page').notNull().default(1),
  totalPages: integer('total_pages').notNull().default(1),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 5. User Personal Notes Table
export const personalNotes = pgTable('personal_notes', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid)
    .notNull(),
  bookId: text('book_id')
    .references(() => books.id)
    .notNull(),
  bookTitle: text('book_title').notNull(),
  page: integer('page').notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Fatwas Table
export const fatwas = pgTable('fatwas', {
  id: text('id').primaryKey(),
  fatwaNumber: text('fatwa_number').notNull(),
  titleMm: text('title_mm').notNull(),
  category: text('category').notNull(),
  categoryMm: text('category_mm').notNull(),
  questionMm: text('question_mm').notNull(),
  questioner: text('questioner').notNull(),
  questionerUid: text('questioner_uid'),
  answerMm: text('answer_mm').notNull(),
  answerAr: text('answer_ar'),
  referencesMm: text('references_mm'),
  muftiOrBoard: text('mufti_or_board').notNull(),
  views: integer('views').default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookmarks: many(bookmarks),
  readingHistory: many(readingHistory),
  personalNotes: many(personalNotes),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.uid],
  }),
  book: one(books, {
    fields: [bookmarks.bookId],
    references: [books.id],
  }),
}));

export const readingHistoryRelations = relations(readingHistory, ({ one }) => ({
  user: one(users, {
    fields: [readingHistory.userId],
    references: [users.uid],
  }),
  book: one(books, {
    fields: [readingHistory.bookId],
    references: [books.id],
  }),
}));

export const personalNotesRelations = relations(personalNotes, ({ one }) => ({
  user: one(users, {
    fields: [personalNotes.userId],
    references: [users.uid],
  }),
  book: one(books, {
    fields: [personalNotes.bookId],
    references: [books.id],
  }),
}));
