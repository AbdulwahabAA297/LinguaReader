// Type definitions for the Electron API bridge
interface ElectronAPI {
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, data: string) => Promise<void>;
  readBinaryFile: (filePath: string) => Promise<Buffer>;
  saveFile: (filePath: string, data: string) => Promise<void>;
  fileExists: (filePath: string) => boolean;
  openFileDialog: (options: any) => Promise<string[]>;
  saveFileDialog: (options: any) => Promise<string>;
  getAppPath: () => Promise<string>;
  getUserDataPath: () => Promise<string>;
  exportVocabularyToCSV: (data: any[], filePath: string) => Promise<void>;
  exportVocabularyToJSON: (data: any, filePath: string) => Promise<void>;
  importVocabularyFromCSV: (filePath: string) => Promise<any[]>;
  importVocabularyFromJSON: (filePath: string) => Promise<any>;
}

// Declare global window object with electronAPI
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
