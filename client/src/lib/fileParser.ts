// Utility functions for parsing different file formats
import * as epubjs from 'epubjs';

// Interface for parsed text result
export interface ParsedText {
  title: string;
  author?: string;
  content: string;
  totalPages?: number;
  metadata?: Record<string, any>;
}

// Parse plain text files
export async function parseTextFile(filePath: string): Promise<ParsedText> {
  try {
    // Use the Electron API to read the file
    const content = await window.electronAPI.readFile(filePath);
    const title = filePath.split('/').pop() || 'Untitled';
    
    return {
      title,
      content,
    };
  } catch (error) {
    console.error('Error parsing text file:', error);
    throw new Error(`Failed to parse text file: ${error}`);
  }
}

// Parse EPUB files
export async function parseEpubFile(filePath: string): Promise<ParsedText> {
  try {
    // Read the EPUB file as binary data
    const fileData = await window.electronAPI.readBinaryFile(filePath);
    
    // Convert the buffer to an array buffer
    const arrayBuffer = fileData.buffer.slice(
      fileData.byteOffset, 
      fileData.byteOffset + fileData.byteLength
    );
    
    // Use EPUB.js to parse the file
    const book = epubjs.default.default();
    await book.open(arrayBuffer);
    
    // Get metadata
    const metadata = await book.loaded.metadata;
    const title = metadata.title || filePath.split('/').pop() || 'Untitled';
    const author = metadata.creator;
    
    // Get all the spine items (chapters)
    const spine = book.spine;
    
    // Extract content from all chapters
    let content = '';
    
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
  } catch (error) {
    console.error('Error parsing EPUB file:', error);
    throw new Error(`Failed to parse EPUB file: ${error}`);
  }
}

// Parse PDF files
export async function parsePdfFile(filePath: string): Promise<ParsedText> {
  try {
    // For PDF parsing in Electron, we would need a PDF.js implementation
    // This is a placeholder for PDF parsing functionality
    // In a real implementation, we would use PDF.js or a similar library

    const title = filePath.split('/').pop() || 'Untitled PDF';
    
    // This is just a placeholder for PDF text extraction
    // In a real implementation, we would extract the text from each page
    return {
      title,
      content: 'PDF parsing not implemented in this demo',
      totalPages: 0,
    };
  } catch (error) {
    console.error('Error parsing PDF file:', error);
    throw new Error(`Failed to parse PDF file: ${error}`);
  }
}

// Detect file type and parse accordingly
export async function parseFile(filePath: string): Promise<ParsedText> {
  const fileExt = filePath.split('.').pop()?.toLowerCase();
  
  switch (fileExt) {
    case 'txt':
      return parseTextFile(filePath);
    case 'epub':
      return parseEpubFile(filePath);
    case 'pdf':
      return parsePdfFile(filePath);
    default:
      // Default to text file parser for unknown extensions
      return parseTextFile(filePath);
  }
}
