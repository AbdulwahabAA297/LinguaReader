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
  translations?: Array<{
    text: string;
    language: string;
  }>;
  englishExplanation?: string;
  language: string;
  transliterations?: {
    text: string;
    script?: string;
  };
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
    
    // Special handling for Arabic words
    if (language === 'ar') {
      // In a real implementation, we would connect to an Arabic dictionary API
      // For the demo, we'll provide a simulated response with English explanations
      
      // Get English translation and explanation
      const englishTranslation = await getTranslation(word, 'ar', 'en');
      const englishExplanation = await getExplanation(word, 'ar');
      
      return {
        word,
        language,
        transliterations: {
          text: getTransliteration(word)
        },
        translations: englishTranslation ? [
          { text: englishTranslation, language: 'en' }
        ] : undefined,
        englishExplanation,
        meanings: [{
          partOfSpeech: 'noun',
          definitions: [{
            definition: 'See English explanation'
          }]
        }]
      };
    }
    
    // For other languages, attempt to get translations to English and Arabic
    const englishTranslation = language !== 'en' ? await getTranslation(word, language, 'en') : undefined;
    const arabicTranslation = language !== 'ar' ? await getTranslation(word, language, 'ar') : undefined;
    
    let translations = [];
    if (englishTranslation) {
      translations.push({ text: englishTranslation, language: 'en' });
    }
    if (arabicTranslation) {
      translations.push({ text: arabicTranslation, language: 'ar' });
    }
    
    return {
      word,
      language,
      translations: translations.length > 0 ? translations : undefined,
      meanings: [{
        partOfSpeech: 'unknown',
        definitions: [{
          definition: englishTranslation || 'No online dictionary data available for this language'
        }]
      }]
    };
  } catch (error) {
    console.error('Error fetching online dictionary data:', error);
    return null;
  }
}

/**
 * Get a translation for a word from one language to another
 * In a real implementation, this would use a translation API
 */
async function getTranslation(word: string, fromLang: string, toLang: string): Promise<string | undefined> {
  // This would normally call a translation API
  // For demo purposes, we return a simulated result based on common words
  
  // Simple Arabic-English demo translations
  const arabicEnglishPairs: Record<string, string> = {
    'كتاب': 'book',
    'مرحبا': 'hello',
    'سلام': 'peace',
    'شكرا': 'thank you',
    'نعم': 'yes',
    'لا': 'no',
    'ماء': 'water',
    'طعام': 'food',
    'بيت': 'house',
    'مدرسة': 'school'
  };
  
  // English-Arabic demo translations (reverse of the above)
  const englishArabicPairs: Record<string, string> = Object.entries(arabicEnglishPairs)
    .reduce((acc, [ar, en]) => ({...acc, [en]: ar}), {});
  
  if (fromLang === 'ar' && toLang === 'en') {
    return arabicEnglishPairs[word] || `[Translation of "${word}" from Arabic]`;
  } else if (fromLang === 'en' && toLang === 'ar') {
    return englishArabicPairs[word] || `[ترجمة "${word}" إلى العربية]`;
  } else {
    // For other language pairs, return a placeholder
    return `[Translation from ${fromLang} to ${toLang}]`;
  }
}

/**
 * Get a transliteration of an Arabic word
 */
function getTransliteration(word: string): string {
  // This would normally use a transliteration library or API
  // For demo purposes, we return a simplified result
  
  const arabicTransliterationMap: Record<string, string> = {
    'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's',
    'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': '\'', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y',
    'ء': '\'', 'ة': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'a', 'ى': 'a', 'ؤ': 'w', 'ئ': 'y'
  };
  
  // Very simplified transliteration for demo
  let transliteration = '';
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    transliteration += arabicTransliterationMap[char] || char;
  }
  
  return transliteration;
}

/**
 * Get an English explanation of a word in another language
 */
async function getExplanation(word: string, language: string): Promise<string | undefined> {
  // In a real implementation, this would use an API or local data
  // For now, we return a simulated explanation
  
  if (language === 'ar') {
    const explanations: Record<string, string> = {
      'كتاب': 'A written or printed work consisting of pages bound together.',
      'مرحبا': 'A common greeting used to welcome someone.',
      'سلام': 'A state of harmony, tranquility, and security.',
      'شكرا': 'An expression of gratitude or acknowledgment of assistance.',
      'نعم': 'Used to express agreement or affirmation.',
      'لا': 'Used to express denial, refusal, or negation.',
      'ماء': 'A clear, colorless liquid essential for most forms of life.',
      'طعام': 'Any nutritious substance consumed to maintain life and growth.',
      'بيت': 'A structure serving as a dwelling for one or more persons.',
      'مدرسة': 'An institution for educating children or adults.'
    };
    
    return explanations[word] || `This is an Arabic word that would be explained in English. In a full implementation, this would provide a detailed explanation of the word "${word}", its cultural context, and usage examples.`;
  }
  
  return undefined;
}
