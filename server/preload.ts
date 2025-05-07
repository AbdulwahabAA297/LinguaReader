import { contextBridge, ipcRenderer } from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  readFile: (filePath: string): Promise<string> => {
    return fs.promises.readFile(filePath, 'utf8');
  },
  
  writeFile: (filePath: string, data: string): Promise<void> => {
    return fs.promises.writeFile(filePath, data, 'utf8');
  },
  
  readBinaryFile: (filePath: string): Promise<Buffer> => {
    return fs.promises.readFile(filePath);
  },
  
  saveFile: (filePath: string, data: string): Promise<void> => {
    return fs.promises.writeFile(filePath, data);
  },
  
  fileExists: (filePath: string): boolean => {
    return fs.existsSync(filePath);
  },
  
  // Dialog operations
  openFileDialog: async (options: any): Promise<string[]> => {
    return ipcRenderer.invoke('dialog:openFile', options);
  },
  
  saveFileDialog: async (options: any): Promise<string> => {
    return ipcRenderer.invoke('dialog:saveFile', options);
  },
  
  // App operations
  getAppPath: (): Promise<string> => {
    return ipcRenderer.invoke('app:getPath');
  },
  
  getUserDataPath: (): Promise<string> => {
    return ipcRenderer.invoke('app:getUserDataPath');
  },
  
  // Export vocabulary
  exportVocabularyToCSV: async (data: any[], filePath: string): Promise<void> => {
    return ipcRenderer.invoke('export:vocabularyCSV', data, filePath);
  },
  
  exportVocabularyToJSON: async (data: any, filePath: string): Promise<void> => {
    return ipcRenderer.invoke('export:vocabularyJSON', data, filePath);
  },
  
  // Import vocabulary
  importVocabularyFromCSV: async (filePath: string): Promise<any[]> => {
    return ipcRenderer.invoke('import:vocabularyCSV', filePath);
  },
  
  importVocabularyFromJSON: async (filePath: string): Promise<any> => {
    return ipcRenderer.invoke('import:vocabularyJSON', filePath);
  }
});
