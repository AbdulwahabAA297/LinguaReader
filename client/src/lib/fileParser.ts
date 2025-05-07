// Utility functions for parsing different file formats
// @ts-ignore - importing epubjs
import epubjs from 'epubjs';

// Interface for parsed text result
export interface ParsedText {
  title: string;
  author?: string;
  content: string;
  totalPages?: number;
  metadata?: Record<string, any>;
}

// Check if we're in Electron environment
const isElectronEnvironment = typeof window.electronAPI !== 'undefined';

// Parse plain text files (supports both Electron and browser environments)
export async function parseTextFile(filePath: string, fileObj?: File): Promise<ParsedText> {
  try {
    let content = '';
    let title = 'Untitled';
    
    if (isElectronEnvironment && filePath) {
      // Use the Electron API to read the file
      content = await window.electronAPI.readFile(filePath);
      title = filePath.split('/').pop() || 'Untitled';
    } else if (fileObj) {
      // Browser environment - read from File object
      content = await readBrowserFile(fileObj);
      title = fileObj.name.replace(/\.[^/.]+$/, "") || 'Untitled';
    } else {
      // Fallback for demo/testing
      content = "This is sample text content for the reader.";
      title = "Sample Text";
    }
    
    return {
      title,
      content,
    };
  } catch (error) {
    console.error('Error parsing text file:', error);
    throw new Error(`Failed to parse text file: ${error}`);
  }
}

// Helper function to read File objects in browser
async function readBrowserFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Error reading file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
}

// Parse EPUB files
export async function parseEpubFile(filePath: string, fileObj?: File): Promise<ParsedText> {
  try {
    let arrayBuffer;
    let fileName = '';
    
    if (isElectronEnvironment && filePath) {
      // Read the EPUB file as binary data
      const fileData = await window.electronAPI.readBinaryFile(filePath);
      
      // Convert the buffer to an array buffer
      arrayBuffer = fileData.buffer.slice(
        fileData.byteOffset, 
        fileData.byteOffset + fileData.byteLength
      );
      
      fileName = filePath.split('/').pop() || 'Untitled';
    } else if (fileObj) {
      // Browser environment - read from File object
      arrayBuffer = await readBrowserBinaryFile(fileObj);
      fileName = fileObj.name;
    } else {
      // Fallback with sample data
      throw new Error('No file provided for EPUB parsing');
    }
    
    // Use EPUB.js to parse the file
    // @ts-ignore - epubjs typing issues
    const book = new epubjs();
    await book.open(arrayBuffer);
    
    // Get metadata
    const metadata = await book.loaded.metadata;
    const title = metadata.title || fileName.replace(/\.[^/.]+$/, "") || 'Untitled';
    const author = metadata.creator;
    
    // Get all the spine items (chapters)
    const spine = book.spine;
    
    // Extract content from all chapters
    let content = '';
    
    if (spine && spine.items) {
      for (const item of spine.items) {
        const chapter = await book.spine.get(item.href);
        const text = await chapter.load();
        
        // Extract text from HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        content += tempDiv.textContent + '\n\n';
      }
      
      const totalPages = spine.items.length;
      
      return {
        title,
        author,
        content,
        totalPages,
        metadata
      };
    } else {
      throw new Error('Unable to extract content from EPUB file');
    }
  } catch (error) {
    console.error('Error parsing EPUB file:', error);
    throw new Error(`Failed to parse EPUB file: ${error}`);
  }
}

// Helper function to read binary File objects in browser
async function readBrowserBinaryFile(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as ArrayBuffer);
      } else {
        reject(new Error('Error reading binary file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading binary file'));
    reader.readAsArrayBuffer(file);
  });
}

// Parse PDF files
export async function parsePdfFile(filePath: string, fileObj?: File): Promise<ParsedText> {
  try {
    let title = 'Untitled PDF';
    
    if (filePath) {
      title = filePath.split('/').pop()?.replace(/\.[^/.]+$/, "") || 'Untitled PDF';
    } else if (fileObj) {
      title = fileObj.name.replace(/\.[^/.]+$/, "") || 'Untitled PDF';
    }
    
    // This is just a placeholder for PDF text extraction
    // In a real implementation, we would extract the text from each page using PDF.js
    return {
      title,
      content: 'Sample PDF content for preview purposes. The actual PDF parsing would use PDF.js to extract the text content from each page of the document.',
      totalPages: 5, // Placeholder
    };
  } catch (error) {
    console.error('Error parsing PDF file:', error);
    throw new Error(`Failed to parse PDF file: ${error}`);
  }
}

// Detect file type and parse accordingly
export async function parseFile(filePath: string, fileObj?: File): Promise<ParsedText> {
  let fileExt;
  
  if (filePath) {
    fileExt = filePath.split('.').pop()?.toLowerCase();
  } else if (fileObj) {
    fileExt = fileObj.name.split('.').pop()?.toLowerCase();
  } else {
    // Default to text if no file provided
    return {
      title: 'Sample Text',
      content: 'This is a sample text document for preview purposes.',
    };
  }
  
  switch (fileExt) {
    case 'txt':
      return parseTextFile(filePath, fileObj);
    case 'epub':
      return parseEpubFile(filePath, fileObj);
    case 'pdf':
      return parsePdfFile(filePath, fileObj);
    default:
      // Default to text file parser for unknown extensions
      return parseTextFile(filePath, fileObj);
  }
}
