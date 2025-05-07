// Dictionary and translation utilities

/**
 * Results from a dictionary lookup
 */
interface DictionaryResult {
  word: string;
  phonetic?: string;
  audio?: string;
  meanings?: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
    }>;
  }>;
  translations?: string[];
  language: string;
}

/**
 * Look up a word in a dictionary (online or offline)
 * @param word The word to look up
 * @param language The language code (e.g., 'en', 'es', 'fr')
 * @returns Dictionary lookup results
 */
export async function lookupWord(word: string, language: string): Promise<DictionaryResult | null> {
  try {
    // First try to use offline dictionary if available
    const offlineResult = await lookupWordOffline(word, language);
    if (offlineResult) {
      return offlineResult;
    }
    
    // If offline dictionary is not available or doesn't have the word,
    // try to use an online dictionary (if internet is available)
    const onlineResult = await lookupWordOnline(word, language);
    return onlineResult;
  } catch (error) {
    console.error('Error looking up word:', error);
    return null;
  }
}

/**
 * Look up a word in an offline dictionary
 * @param word The word to look up
 * @param language The language code
 * @returns Dictionary lookup results or null if not found
 */
async function lookupWordOffline(word: string, language: string): Promise<DictionaryResult | null> {
  // In a real implementation, we would:
  // 1. Check if an offline dictionary is available for this language
  // 2. Look up the word in the dictionary file

  // This is a placeholder implementation
  // In a real app, we would have actual dictionary data files
  
  return null; // No offline dictionary in this demo
}

/**
 * Look up a word in an online dictionary
 * @param word The word to look up
 * @param language The language code
 * @returns Dictionary lookup results or null if not found
 */
async function lookupWordOnline(word: string, language: string): Promise<DictionaryResult | null> {
  try {
    // Try to use Free Dictionary API for English words
    if (language === 'en') {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const entry = data[0];
          
          return {
            word: entry.word,
            phonetic: entry.phonetic,
            audio: entry.phonetics?.find((p: any) => p.audio)?.audio,
            meanings: entry.meanings?.map((m: any) => ({
              partOfSpeech: m.partOfSpeech,
              definitions: m.definitions.map((d: any) => ({
                definition: d.definition,
                example: d.example,
                synonyms: d.synonyms
              }))
            })),
            language
          };
        }
      }
    }
    
    // For other languages or if the Free Dictionary API fails, we could use other APIs
    // This is just a placeholder for demo purposes
    return {
      word,
      language,
      meanings: [{
        partOfSpeech: 'unknown',
        definitions: [{
          definition: 'No online dictionary data available for this language'
        }]
      }]
    };
  } catch (error) {
    console.error('Error fetching online dictionary data:', error);
    return null;
  }
}
