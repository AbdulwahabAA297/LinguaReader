import { drizzle } from 'drizzle-orm/better-sqlite3';
import BetterSQLite3 from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import * as schema from "@shared/schema";
import fs from 'fs';
import isDev from 'electron-is-dev';

// Get the user data directory
let userDataPath = isDev 
  ? './userdata'
  : app.getPath('userData');

// Ensure the directory exists
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

// Path to the SQLite database file
const dbPath = path.join(userDataPath, 'linguareader.db');

// Create SQLite database connection
const sqlite = new BetterSQLite3(dbPath);

// Create drizzle instance
export const db = drizzle(sqlite, { schema });

// Initialize database with default data if needed
export function initializeDatabase() {
  // Add default languages if the languages table is empty
  const languages = db.select().from(schema.languages).all();
  
  if (languages.length === 0) {
    db.insert(schema.languages).values([
      { code: 'en', name: 'English', enabled: true },
      { code: 'es', name: 'Spanish', enabled: true },
      { code: 'fr', name: 'French', enabled: true },
      { code: 'de', name: 'German', enabled: true },
      { code: 'it', name: 'Italian', enabled: true },
      { code: 'pt', name: 'Portuguese', enabled: true },
      { code: 'ru', name: 'Russian', enabled: true },
      { code: 'ja', name: 'Japanese', enabled: true },
      { code: 'zh', name: 'Chinese', enabled: true },
      { code: 'ko', name: 'Korean', enabled: true },
    ]).run();
  }
}