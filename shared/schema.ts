import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Book/Document Table
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author"),
  language: text("language").notNull(),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(), // plain, epub, pdf
  currentPosition: text("current_position").default("0"),
  totalPages: integer("total_pages"),
  coverImage: text("cover_image"),
  dateAdded: timestamp("date_added").defaultNow(),
  lastOpened: timestamp("last_opened"),
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  dateAdded: true,
  lastOpened: true,
});

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

// Vocabulary Items
export const vocabularyItems = pgTable("vocabulary_items", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  context: text("context"),
  translation: text("translation"),
  notes: text("notes"),
  familiarityScore: integer("familiarity_score").default(1),
  language: text("language").notNull(),
  bookId: integer("book_id"),
  lastReviewed: timestamp("last_reviewed"),
  nextReviewDate: timestamp("next_review_date"),
  dateAdded: timestamp("date_added").defaultNow(),
});

export const insertVocabularyItemSchema = createInsertSchema(vocabularyItems).omit({
  id: true,
  dateAdded: true,
  lastReviewed: true,
  nextReviewDate: true,
});

export type InsertVocabularyItem = z.infer<typeof insertVocabularyItemSchema>;
export type VocabularyItem = typeof vocabularyItems.$inferSelect;

// Settings Table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
});

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

// Bookmarks
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull(),
  position: text("position").notNull(),
  note: text("note"),
  dateAdded: timestamp("date_added").defaultNow(),
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  dateAdded: true,
});

export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;

// Languages
export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  dictionaryPath: text("dictionary_path"),
  enabled: boolean("enabled").default(true),
});

export const insertLanguageSchema = createInsertSchema(languages).omit({
  id: true,
});

export type InsertLanguage = z.infer<typeof insertLanguageSchema>;
export type Language = typeof languages.$inferSelect;
