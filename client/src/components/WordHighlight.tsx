import { useState, useEffect } from 'react';

interface WordHighlightProps {
  word: string;
  onClick: (word: string, context: string) => void;
  vocabularyItems: any[];
  isInHighlightMode: boolean;
  context: string;
}

// Calculate colors based on familiarity scores
const getFamiliarityColor = (score: number, isDarkMode: boolean) => {
  // Color scales
  const lightModeColors = {
    1: 'bg-red-100 hover:bg-red-200', // Unknown word (red)
    2: 'bg-orange-100 hover:bg-orange-200', // Barely known (orange)
    3: 'bg-yellow-100 hover:bg-yellow-200', // Somewhat known (yellow)
    4: 'bg-blue-100 hover:bg-blue-200', // Well known (blue)
    5: 'bg-green-100 hover:bg-green-200', // Mastered (green)
    default: 'hover:bg-gray-200', // No score yet
  };

  const darkModeColors = {
    1: 'bg-red-900/30 hover:bg-red-900/50', // Unknown word (red)
    2: 'bg-orange-900/30 hover:bg-orange-900/50', // Barely known (orange)
    3: 'bg-yellow-900/30 hover:bg-yellow-900/50', // Somewhat known (yellow)
    4: 'bg-blue-900/30 hover:bg-blue-900/50', // Well known (blue)
    5: 'bg-green-900/30 hover:bg-green-900/50', // Mastered (green)
    default: 'hover:bg-gray-700/50', // No score yet
  };

  const colors = isDarkMode ? darkModeColors : lightModeColors;
  return colors[score as keyof typeof colors] || colors.default;
};

export default function WordHighlight({ word, onClick, vocabularyItems, isInHighlightMode, context }: WordHighlightProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Check if the document has dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Set up a mutation observer to detect theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);
  
  // Find if this word exists in vocabulary
  const vocabularyItem = vocabularyItems.find(
    item => item.word.toLowerCase() === word.toLowerCase()
  );
  
  const familiarityScore = vocabularyItem?.familiarityScore;
  
  // Determine highlight class based on familiarity and dark mode
  const highlightClass = familiarityScore 
    ? getFamiliarityColor(familiarityScore, isDarkMode) 
    : (isInHighlightMode ? 'bg-gray-100 dark:bg-gray-800' : '');
  
  return (
    <span 
      className={`cursor-pointer rounded px-0.5 transition-colors ${highlightClass}`}
      onClick={() => onClick(word, context)}
    >
      {word}
    </span>
  );
}
