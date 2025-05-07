import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { fileURLToPath } from 'url';

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

  // Load the index.html from the React app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
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
