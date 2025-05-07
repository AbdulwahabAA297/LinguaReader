import { 
  users, type User, type InsertUser, 
  books, type Book, type InsertBook,
  vocabularyItems, type VocabularyItem, type InsertVocabularyItem,
  bookmarks, type Bookmark, type InsertBookmark,
  languages, type Language, type InsertLanguage,
  settings, type Setting, type InsertSetting
} from "@shared/schema";

// Storage interface with all required CRUD operations
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Books
  getBook(id: number): Promise<Book | undefined>;
  getBooks(): Promise<Book[]>;
  getBooksByLanguage(language: string): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<Book>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
  
  // Vocabulary
  getVocabularyItem(id: number): Promise<VocabularyItem | undefined>;
  getVocabularyItems(): Promise<VocabularyItem[]>;
  getVocabularyItemsByLanguage(language: string): Promise<VocabularyItem[]>;
  getVocabularyItemsByBook(bookId: number): Promise<VocabularyItem[]>;
  createVocabularyItem(item: InsertVocabularyItem): Promise<VocabularyItem>;
  updateVocabularyItem(id: number, item: Partial<VocabularyItem>): Promise<VocabularyItem | undefined>;
  deleteVocabularyItem(id: number): Promise<boolean>;
  
  // Bookmarks
  getBookmark(id: number): Promise<Bookmark | undefined>;
  getBookmarksByBook(bookId: number): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(id: number): Promise<boolean>;
  
  // Languages
  getLanguage(id: number): Promise<Language | undefined>;
  getLanguageByCode(code: string): Promise<Language | undefined>;
  getLanguages(): Promise<Language[]>;
  createLanguage(language: InsertLanguage): Promise<Language>;
  updateLanguage(id: number, language: Partial<Language>): Promise<Language | undefined>;
  
  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  updateSetting(key: string, value: any): Promise<Setting>;
  
  // SRS functions
  getVocabularyItemsDueForReview(): Promise<VocabularyItem[]>;
  updateVocabularyItemReviewStatus(id: number, familiarityScore: number): Promise<VocabularyItem | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private books: Map<number, Book>;
  private vocabularyItems: Map<number, VocabularyItem>;
  private bookmarks: Map<number, Bookmark>;
  private languages: Map<number, Language>;
  private settingsMap: Map<string, Setting>;
  
  private userId: number;
  private bookId: number;
  private vocabularyId: number;
  private bookmarkId: number;
  private languageId: number;
  private settingId: number;
  
  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.vocabularyItems = new Map();
    this.bookmarks = new Map();
    this.languages = new Map();
    this.settingsMap = new Map();
    
    this.userId = 1;
    this.bookId = 1;
    this.vocabularyId = 1;
    this.bookmarkId = 1;
    this.languageId = 1;
    this.settingId = 1;
    
    // Initialize with default languages
    this.initializeDefaultLanguages();
  }
  
  private initializeDefaultLanguages() {
    const defaultLanguages: InsertLanguage[] = [
      { code: 'en', name: 'English', enabled: true },
      { code: 'ar', name: 'Arabic', enabled: true },
      { code: 'es', name: 'Spanish', enabled: true },
      { code: 'fr', name: 'French', enabled: true },
      { code: 'de', name: 'German', enabled: true },
      { code: 'it', name: 'Italian', enabled: true },
      { code: 'ru', name: 'Russian', enabled: true },
      { code: 'zh', name: 'Chinese', enabled: true },
      { code: 'ja', name: 'Japanese', enabled: true },
    ];
    
    for (const lang of defaultLanguages) {
      this.createLanguage(lang);
    }
  }
  
  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Books
  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }
  
  async getBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }
  
  async getBooksByLanguage(language: string): Promise<Book[]> {
    return Array.from(this.books.values()).filter(
      (book) => book.language === language
    );
  }
  
  async createBook(book: InsertBook): Promise<Book> {
    const id = this.bookId++;
    const now = new Date();
    
    // Create a properly typed Book object with all required fields
    const newBook: Book = { 
      id, 
      title: book.title,
      author: book.author ?? null,
      language: book.language,
      filePath: book.filePath,
      fileType: book.fileType,
      currentPosition: book.currentPosition ?? null,
      totalPages: book.totalPages ?? null,
      coverImage: book.coverImage ?? null,
      dateAdded: now,
      lastOpened: now
    };
    
    this.books.set(id, newBook);
    return newBook;
  }
  
  async updateBook(id: number, bookUpdate: Partial<Book>): Promise<Book | undefined> {
    const book = this.books.get(id);
    if (!book) return undefined;
    
    const updatedBook = { ...book, ...bookUpdate };
    this.books.set(id, updatedBook);
    return updatedBook;
  }
  
  async deleteBook(id: number): Promise<boolean> {
    return this.books.delete(id);
  }
  
  // Vocabulary Items
  async getVocabularyItem(id: number): Promise<VocabularyItem | undefined> {
    return this.vocabularyItems.get(id);
  }
  
  async getVocabularyItems(): Promise<VocabularyItem[]> {
    return Array.from(this.vocabularyItems.values());
  }
  
  async getVocabularyItemsByLanguage(language: string): Promise<VocabularyItem[]> {
    return Array.from(this.vocabularyItems.values()).filter(
      (item) => item.language === language
    );
  }
  
  async getVocabularyItemsByBook(bookId: number): Promise<VocabularyItem[]> {
    return Array.from(this.vocabularyItems.values()).filter(
      (item) => item.bookId === bookId
    );
  }
  
  async createVocabularyItem(item: InsertVocabularyItem): Promise<VocabularyItem> {
    const id = this.vocabularyId++;
    const now = new Date();
    
    // Create properly typed VocabularyItem
    const newItem: VocabularyItem = { 
      id,
      word: item.word,
      language: item.language,
      translation: item.translation ?? null,
      context: item.context ?? null,
      notes: item.notes ?? null,
      bookId: item.bookId ?? null,
      familiarityScore: item.familiarityScore ?? null, 
      dateAdded: now,
      lastReviewed: now,
      nextReviewDate: now,
    };
    
    this.vocabularyItems.set(id, newItem);
    return newItem;
  }
  
  async updateVocabularyItem(id: number, itemUpdate: Partial<VocabularyItem>): Promise<VocabularyItem | undefined> {
    const item = this.vocabularyItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...itemUpdate };
    this.vocabularyItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteVocabularyItem(id: number): Promise<boolean> {
    return this.vocabularyItems.delete(id);
  }
  
  // Bookmarks
  async getBookmark(id: number): Promise<Bookmark | undefined> {
    return this.bookmarks.get(id);
  }
  
  async getBookmarksByBook(bookId: number): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter(
      (bookmark) => bookmark.bookId === bookId
    );
  }
  
  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.bookmarkId++;
    const now = new Date();
    
    // Create properly typed Bookmark
    const newBookmark: Bookmark = { 
      id,
      bookId: bookmark.bookId,
      position: bookmark.position,
      note: bookmark.note ?? null,
      dateAdded: now
    };
    
    this.bookmarks.set(id, newBookmark);
    return newBookmark;
  }
  
  async deleteBookmark(id: number): Promise<boolean> {
    return this.bookmarks.delete(id);
  }
  
  // Languages
  async getLanguage(id: number): Promise<Language | undefined> {
    return this.languages.get(id);
  }
  
  async getLanguageByCode(code: string): Promise<Language | undefined> {
    return Array.from(this.languages.values()).find(
      (language) => language.code === code
    );
  }
  
  async getLanguages(): Promise<Language[]> {
    return Array.from(this.languages.values());
  }
  
  async createLanguage(language: InsertLanguage): Promise<Language> {
    const id = this.languageId++;
    
    // Create properly typed Language
    const newLanguage: Language = {
      id,
      code: language.code,
      name: language.name,
      dictionaryPath: language.dictionaryPath ?? null,
      enabled: language.enabled ?? null
    };
    
    this.languages.set(id, newLanguage);
    return newLanguage;
  }
  
  async updateLanguage(id: number, languageUpdate: Partial<Language>): Promise<Language | undefined> {
    const language = this.languages.get(id);
    if (!language) return undefined;
    
    const updatedLanguage = { ...language, ...languageUpdate };
    this.languages.set(id, updatedLanguage);
    return updatedLanguage;
  }
  
  // Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settingsMap.get(key);
  }
  
  async updateSetting(key: string, value: any): Promise<Setting> {
    const existing = this.settingsMap.get(key);
    
    if (existing) {
      const updated = { ...existing, value };
      this.settingsMap.set(key, updated);
      return updated;
    } else {
      const id = this.settingId++;
      const newSetting: Setting = { id, key, value };
      this.settingsMap.set(key, newSetting);
      return newSetting;
    }
  }
  
  // SRS functions
  async getVocabularyItemsDueForReview(): Promise<VocabularyItem[]> {
    const now = new Date();
    return Array.from(this.vocabularyItems.values()).filter(
      (item) => item.nextReviewDate && item.nextReviewDate <= now
    );
  }
  
  async updateVocabularyItemReviewStatus(id: number, familiarityScore: number): Promise<VocabularyItem | undefined> {
    const item = this.vocabularyItems.get(id);
    if (!item) return undefined;
    
    const now = new Date();
    // Calculate next review date based on spaced repetition algorithm
    // Simple implementation: days = 2^familiarityScore
    const nextReviewDate = new Date();
    nextReviewDate.setDate(now.getDate() + Math.pow(2, familiarityScore));
    
    const updatedItem = { 
      ...item, 
      familiarityScore, 
      lastReviewed: now,
      nextReviewDate
    };
    
    this.vocabularyItems.set(id, updatedItem);
    return updatedItem;
  }
}

export const storage = new MemStorage();
