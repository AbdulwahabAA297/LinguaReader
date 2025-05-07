// Natural Language Processing utilities

/**
 * Split text into sentences
 * @param text The text to split into sentences
 * @returns An array of sentences
 */
export function splitIntoSentences(text: string): string[] {
  // Simple sentence splitting - more sophisticated NLP could be used here
  // This regex handles common sentence ending punctuation
  const sentenceRegex = /[^.!?]+[.!?]+/g;
  
  const sentences = text.match(sentenceRegex) || [];
  
  // Handle any text that doesn't end with sentence punctuation
  const remainingText = text.replace(sentenceRegex, '').trim();
  if (remainingText) {
    sentences.push(remainingText);
  }
  
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Split text into paragraphs
 * @param text The text to split into paragraphs
 * @returns An array of paragraphs
 */
export function splitIntoParagraphs(text: string): string[] {
  // Split by double newlines or more
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
}

/**
 * Split text into words
 * @param text The text to split into words
 * @returns An array of words
 */
export function splitIntoWords(text: string): string[] {
  // Remove punctuation and split by spaces
  return text.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
}

/**
 * Get a context sentence/excerpt for a word
 * @param word The word to get context for
 * @param text The full text
 * @param windowSize The number of characters around the word for context
 * @returns A context string containing the word
 */
export function getWordContext(word: string, text: string, windowSize: number = 100): string {
  // Find the word in the text (case insensitive)
  const regex = new RegExp(`\\b${word}\\b`, 'i');
  const match = regex.exec(text);
  
  if (!match) return '';
  
  const wordIndex = match.index;
  
  // Get text before and after the word
  const startIndex = Math.max(0, wordIndex - windowSize);
  const endIndex = Math.min(text.length, wordIndex + word.length + windowSize);
  
  let context = text.substring(startIndex, endIndex);
  
  // If we cut in the middle of a word at the start or end, adjust
  if (startIndex > 0) {
    const firstSpaceIndex = context.indexOf(' ');
    if (firstSpaceIndex > 0) {
      context = context.substring(firstSpaceIndex + 1);
    }
  }
  
  if (endIndex < text.length) {
    const lastSpaceIndex = context.lastIndexOf(' ');
    if (lastSpaceIndex >= 0) {
      context = context.substring(0, lastSpaceIndex);
    }
  }
  
  return context.trim();
}

/**
 * Find all occurrences of a word in text
 * @param word The word to find
 * @param text The text to search in
 * @returns An array of indices where the word appears
 */
export function findWordOccurrences(word: string, text: string): number[] {
  const indices: number[] = [];
  const regex = new RegExp(`\\b${word}\\b`, 'gi');
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    indices.push(match.index);
  }
  
  return indices;
}

/**
 * Generate cloze (fill-in-the-blank) sentences for a word
 * @param word The word to create cloze for
 * @param context The context sentence/paragraph
 * @returns A string with the word replaced by a blank
 */
export function generateCloze(word: string, context: string): string {
  const regex = new RegExp(`\\b${word}\\b`, 'i');
  return context.replace(regex, '_______');
}
