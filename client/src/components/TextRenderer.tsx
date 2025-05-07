import { useState, useEffect, useRef } from 'react';
import { splitIntoSentences, splitIntoParagraphs, getWordContext } from '@/lib/nlpUtils';
import WordHighlight from '@/components/WordHighlight';

interface TextRendererProps {
  text: string;
  fontSize: number;
  renderMode: 'sentence' | 'paragraph';
  onWordClick: (word: string, context: string) => void;
  vocabularyItems: any[];
  isInHighlightMode: boolean;
  theme: 'light' | 'dark' | 'sepia';
  searchTerm?: string;
}

export default function TextRenderer({ 
  text, 
  fontSize, 
  renderMode,
  onWordClick, 
  vocabularyItems,
  isInHighlightMode,
  theme,
  searchTerm
}: TextRendererProps) {
  const [segments, setSegments] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Split text into segments (sentences or paragraphs)
  useEffect(() => {
    const segmentedText = renderMode === 'sentence'
      ? splitIntoSentences(text)
      : splitIntoParagraphs(text);
    
    setSegments(segmentedText);
  }, [text, renderMode]);

  // Apply theme styles
  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-900 text-gray-100';
      case 'sepia':
        return 'bg-amber-50 text-amber-900';
      default: // light
        return 'bg-white text-gray-900';
    }
  };

  // Scroll to search term if provided
  useEffect(() => {
    if (!searchTerm || !containerRef.current) return;
    
    // Find the segment that contains the search term
    const searchRegex = new RegExp(searchTerm, 'i');
    const segmentIndex = segments.findIndex(segment => searchRegex.test(segment));
    
    if (segmentIndex !== -1) {
      // Find all segment elements
      const segmentElements = containerRef.current.querySelectorAll('[data-segment]');
      if (segmentElements.length > segmentIndex) {
        // Scroll to the segment that contains the search term
        segmentElements[segmentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight the search term (this could be improved with a more sophisticated highlighting mechanism)
        const segmentElement = segmentElements[segmentIndex] as HTMLElement;
        if (segmentElement) {
          segmentElement.classList.add('bg-yellow-200', 'dark:bg-yellow-800');
          
          // Remove the highlight after a few seconds
          setTimeout(() => {
            segmentElement.classList.remove('bg-yellow-200', 'dark:bg-yellow-800');
          }, 3000);
        }
      }
    }
  }, [searchTerm, segments]);

  // Render a segment (sentence or paragraph)
  const renderSegment = (segment: string, index: number) => {
    // Split segment into words and punctuation
    const parts = segment.split(/(\s+|[,.!?;:()])/g);
    
    return (
      <div 
        key={index} 
        className={`mb-${renderMode === 'sentence' ? '1' : '4'} transition-colors`}
        data-segment={index}
      >
        {parts.map((part, i) => {
          // Skip rendering spaces and punctuation as clickable words
          if (/^\s+$/.test(part) || /^[,.!?;:()]$/.test(part)) {
            return <span key={`${index}-${i}`}>{part}</span>;
          }
          
          // Check if this is an actual word (not empty and not just punctuation)
          if (part.trim().length > 0) {
            // Get context for this word
            const context = getWordContext(part, text);
            
            return (
              <WordHighlight
                key={`${index}-${i}`}
                word={part}
                onClick={onWordClick}
                vocabularyItems={vocabularyItems}
                isInHighlightMode={isInHighlightMode}
                context={context || segment}
              />
            );
          }
          
          return <span key={`${index}-${i}`}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`p-4 md:p-8 ${getThemeStyles()} transition-colors min-h-full`}
      style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
    >
      {segments.map(renderSegment)}
    </div>
  );
}
