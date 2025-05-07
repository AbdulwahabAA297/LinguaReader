import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBookSchema, 
  insertVocabularyItemSchema, 
  insertBookmarkSchema,
  insertLanguageSchema
} from "@shared/schema";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userDataPath = path.join(__dirname, '../userdata');

// Ensure user data directory exists
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

// Ensure books directory exists
const booksPath = path.join(userDataPath, 'books');
if (!fs.existsSync(booksPath)) {
  fs.mkdirSync(booksPath, { recursive: true });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Books API
  app.get('/api/books', async (req, res) => {
    try {
      const books = await storage.getBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch books: ${error}` });
    }
  });
  
  app.get('/api/books/:id', async (req, res) => {
    try {
      const book = await storage.getBook(Number(req.params.id));
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch book: ${error}` });
    }
  });

  app.get('/api/books/language/:language', async (req, res) => {
    try {
      const books = await storage.getBooksByLanguage(req.params.language);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch books by language: ${error}` });
    }
  });
  
  app.post('/api/books', async (req, res) => {
    try {
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid book data', errors: error.errors });
      }
      res.status(500).json({ message: `Failed to create book: ${error}` });
    }
  });
  
  app.put('/api/books/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updatedBook = await storage.updateBook(id, req.body);
      if (!updatedBook) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json(updatedBook);
    } catch (error) {
      res.status(500).json({ message: `Failed to update book: ${error}` });
    }
  });
  
  app.delete('/api/books/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteBook(id);
      if (!success) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: `Failed to delete book: ${error}` });
    }
  });
  
  // Vocabulary API
  app.get('/api/vocabulary', async (req, res) => {
    try {
      const vocabulary = await storage.getVocabularyItems();
      res.json(vocabulary);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch vocabulary: ${error}` });
    }
  });
  
  app.get('/api/vocabulary/:id', async (req, res) => {
    try {
      const item = await storage.getVocabularyItem(Number(req.params.id));
      if (!item) {
        return res.status(404).json({ message: 'Vocabulary item not found' });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch vocabulary item: ${error}` });
    }
  });
  
  app.get('/api/vocabulary/language/:language', async (req, res) => {
    try {
      const items = await storage.getVocabularyItemsByLanguage(req.params.language);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch vocabulary by language: ${error}` });
    }
  });
  
  app.get('/api/vocabulary/book/:bookId', async (req, res) => {
    try {
      const items = await storage.getVocabularyItemsByBook(Number(req.params.bookId));
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch vocabulary by book: ${error}` });
    }
  });
  
  app.post('/api/vocabulary', async (req, res) => {
    try {
      const itemData = insertVocabularyItemSchema.parse(req.body);
      const item = await storage.createVocabularyItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid vocabulary data', errors: error.errors });
      }
      res.status(500).json({ message: `Failed to create vocabulary item: ${error}` });
    }
  });
  
  app.put('/api/vocabulary/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updatedItem = await storage.updateVocabularyItem(id, req.body);
      if (!updatedItem) {
        return res.status(404).json({ message: 'Vocabulary item not found' });
      }
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: `Failed to update vocabulary item: ${error}` });
    }
  });
  
  app.delete('/api/vocabulary/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteVocabularyItem(id);
      if (!success) {
        return res.status(404).json({ message: 'Vocabulary item not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: `Failed to delete vocabulary item: ${error}` });
    }
  });
  
  // Bookmarks API
  app.get('/api/bookmarks/book/:bookId', async (req, res) => {
    try {
      const bookmarks = await storage.getBookmarksByBook(Number(req.params.bookId));
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch bookmarks: ${error}` });
    }
  });
  
  app.post('/api/bookmarks', async (req, res) => {
    try {
      const bookmarkData = insertBookmarkSchema.parse(req.body);
      const bookmark = await storage.createBookmark(bookmarkData);
      res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid bookmark data', errors: error.errors });
      }
      res.status(500).json({ message: `Failed to create bookmark: ${error}` });
    }
  });
  
  app.delete('/api/bookmarks/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteBookmark(id);
      if (!success) {
        return res.status(404).json({ message: 'Bookmark not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: `Failed to delete bookmark: ${error}` });
    }
  });
  
  // Languages API
  app.get('/api/languages', async (req, res) => {
    try {
      const languages = await storage.getLanguages();
      res.json(languages);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch languages: ${error}` });
    }
  });
  
  app.get('/api/languages/:code', async (req, res) => {
    try {
      const language = await storage.getLanguageByCode(req.params.code);
      if (!language) {
        return res.status(404).json({ message: 'Language not found' });
      }
      res.json(language);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch language: ${error}` });
    }
  });
  
  app.post('/api/languages', async (req, res) => {
    try {
      const languageData = insertLanguageSchema.parse(req.body);
      const language = await storage.createLanguage(languageData);
      res.status(201).json(language);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid language data', errors: error.errors });
      }
      res.status(500).json({ message: `Failed to create language: ${error}` });
    }
  });
  
  app.put('/api/languages/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updatedLanguage = await storage.updateLanguage(id, req.body);
      if (!updatedLanguage) {
        return res.status(404).json({ message: 'Language not found' });
      }
      res.json(updatedLanguage);
    } catch (error) {
      res.status(500).json({ message: `Failed to update language: ${error}` });
    }
  });
  
  // Settings API
  app.get('/api/settings/:key', async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: 'Setting not found' });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch setting: ${error}` });
    }
  });
  
  app.put('/api/settings/:key', async (req, res) => {
    try {
      const key = req.params.key;
      const value = req.body.value;
      if (value === undefined) {
        return res.status(400).json({ message: 'Setting value is required' });
      }
      const setting = await storage.updateSetting(key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: `Failed to update setting: ${error}` });
    }
  });
  
  // SRS API
  app.get('/api/review/due', async (req, res) => {
    try {
      const dueItems = await storage.getVocabularyItemsDueForReview();
      res.json(dueItems);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch due vocabulary items: ${error}` });
    }
  });
  
  app.put('/api/review/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { familiarityScore } = req.body;
      
      if (typeof familiarityScore !== 'number' || familiarityScore < 1 || familiarityScore > 5) {
        return res.status(400).json({ message: 'Familiarity score must be a number between 1 and 5' });
      }
      
      const updatedItem = await storage.updateVocabularyItemReviewStatus(id, familiarityScore);
      if (!updatedItem) {
        return res.status(404).json({ message: 'Vocabulary item not found' });
      }
      
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: `Failed to update review status: ${error}` });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
