import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';
import { db, initializeDatabase } from '../server/db-sqlite';
import { eq } from 'drizzle-orm';
import * as schema from '../shared/schema';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the React app based on environment
  if (isDev) {
    mainWindow.loadURL('http://localhost:5000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Initialize SQLite database
  try {
    initializeDatabase();
    console.log('SQLite database initialized successfully');
  } catch (error) {
    console.error('Error initializing SQLite database:', error);
  }
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// File dialog handlers
ipcMain.handle('dialog:openFile', async (event, options) => {
  if (!mainWindow) return [];

  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, options);
  if (canceled) {
    return [];
  }
  return filePaths;
});

ipcMain.handle('dialog:saveFile', async (event, options) => {
  if (!mainWindow) return '';

  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, options);
  if (canceled || !filePath) {
    return '';
  }
  return filePath;
});

// App path handlers
ipcMain.handle('app:getPath', () => {
  return app.getAppPath();
});

ipcMain.handle('app:getUserDataPath', () => {
  return app.getPath('userData');
});

// Export vocabulary handlers
ipcMain.handle('export:vocabularyCSV', async (event, data, filePath) => {
  try {
    const csvData = stringify(data, { header: true });
    await fs.promises.writeFile(filePath, csvData);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
});

ipcMain.handle('export:vocabularyJSON', async (event, data, filePath) => {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(filePath, jsonData);
  } catch (error) {
    console.error('Error exporting JSON:', error);
    throw error;
  }
});

// Import vocabulary handlers
ipcMain.handle('import:vocabularyCSV', async (event, filePath) => {
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    return parse(fileContent, { columns: true });
  } catch (error) {
    console.error('Error importing CSV:', error);
    throw error;
  }
});

ipcMain.handle('import:vocabularyJSON', async (event, filePath) => {
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error importing JSON:', error);
    throw error;
  }
});

// Database API handlers for direct data access in the standalone application
// Books
ipcMain.handle('db:getBooks', async () => {
  try {
    return db.select().from(schema.books).all();
  } catch (error) {
    console.error('Error getting books:', error);
    throw error;
  }
});

ipcMain.handle('db:getBook', async (_, id) => {
  try {
    const [book] = db.select().from(schema.books).where(eq(schema.books.id, id)).all();
    return book || null;
  } catch (error) {
    console.error('Error getting book:', error);
    throw error;
  }
});

ipcMain.handle('db:createBook', async (_, bookData) => {
  try {
    const [book] = db.insert(schema.books).values(bookData).returning().run();
    return book;
  } catch (error) {
    console.error('Error creating book:', error);
    throw error;
  }
});

ipcMain.handle('db:updateBook', async (_, id, bookData) => {
  try {
    const [updated] = db.update(schema.books).set(bookData).where(eq(schema.books.id, id)).returning().run();
    return updated;
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteBook', async (_, id) => {
  try {
    db.delete(schema.books).where(eq(schema.books.id, id)).run();
    return true;
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
});

// Vocabulary
ipcMain.handle('db:getVocabularyItems', async () => {
  try {
    return db.select().from(schema.vocabularyItems).all();
  } catch (error) {
    console.error('Error getting vocabulary items:', error);
    throw error;
  }
});

ipcMain.handle('db:createVocabularyItem', async (_, itemData) => {
  try {
    const [item] = db.insert(schema.vocabularyItems).values(itemData).returning().run();
    return item;
  } catch (error) {
    console.error('Error creating vocabulary item:', error);
    throw error;
  }
});

ipcMain.handle('db:updateVocabularyItem', async (_, id, itemData) => {
  try {
    const [updated] = db.update(schema.vocabularyItems).set(itemData).where(eq(schema.vocabularyItems.id, id)).returning().run();
    return updated;
  } catch (error) {
    console.error('Error updating vocabulary item:', error);
    throw error;
  }
});

// Languages
ipcMain.handle('db:getLanguages', async () => {
  try {
    return db.select().from(schema.languages).all();
  } catch (error) {
    console.error('Error getting languages:', error);
    throw error;
  }
});

// Settings
ipcMain.handle('db:getSetting', async (_, key) => {
  try {
    const [setting] = db.select().from(schema.settings).where(eq(schema.settings.key, key)).all();
    return setting || null;
  } catch (error) {
    console.error('Error getting setting:', error);
    throw error;
  }
});

ipcMain.handle('db:updateSetting', async (_, key, value) => {
  try {
    // Check if setting exists
    const [existingSetting] = db.select().from(schema.settings).where(eq(schema.settings.key, key)).all();
    
    if (existingSetting) {
      // Update existing setting
      const [updated] = db.update(schema.settings)
        .set({ value: JSON.stringify(value) })
        .where(eq(schema.settings.key, key))
        .returning()
        .run();
      return updated;
    } else {
      // Create new setting
      const [setting] = db.insert(schema.settings)
        .values({ key, value: JSON.stringify(value) })
        .returning()
        .run();
      return setting;
    }
  } catch (error) {
    console.error('Error updating setting:', error);
    throw error;
  }
});
