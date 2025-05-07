import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { parseFile } from '@/lib/fileParser';
import ReaderToolbar from '@/components/ReaderToolbar';
import TextRenderer from '@/components/TextRenderer';
import DictionaryPanel from '@/components/DictionaryPanel';

export default function Reader() {
  const { id } = useParams();
  const { toast } = useToast();
  const [bookText, setBookText] = useState('');
  const [fontSize, setFontSize] = useState(18);
  const [selectedWord, setSelectedWord] = useState<{ word: string; context: string } | null>(null);
  const [highlightMode, setHighlightMode] = useState(false);
  const [renderMode, setRenderMode] = useState<'sentence' | 'paragraph'>('paragraph');
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fetch book details
  const { data: book } = useQuery({
    queryKey: [`/api/books/${id}`],
  });
  
  // Fetch vocabulary for the book's language
  const { data: vocabularyItems = [] } = useQuery({
    queryKey: [`/api/vocabulary/language/${book?.language}`],
    enabled: !!book?.language,
  });
  
  // Fetch bookmarks for this book
  const { data: bookmarks = [] } = useQuery({
    queryKey: [`/api/bookmarks/book/${id}`],
    enabled: !!id,
  });
  
  // Load book content
  useEffect(() => {
    if (!book) return;
    
    const loadBookContent = async () => {
      try {
        setIsLoading(true);
        
        // Parse the book file
        const parsedBook = await parseFile(book.filePath);
        setBookText(parsedBook.content);
        
        // Update book's last opened timestamp
        await apiRequest('PUT', `/api/books/${id}`, {
          lastOpened: new Date()
        });
        
        // Parse current position and set current page
        if (book.currentPosition) {
          setCurrentPage(parseInt(book.currentPosition) || 1);
        }
      } catch (error) {
        toast({
          title: 'Error loading book',
          description: `Could not load the book: ${error}`,
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBookContent();
  }, [book, id, toast]);
  
  // Save current position when leaving the page
  useEffect(() => {
    return () => {
      if (book && id) {
        // Update current position when unmounting
        apiRequest('PUT', `/api/books/${id}`, {
          currentPosition: currentPage.toString()
        }).catch(err => {
          console.error('Failed to save reading position:', err);
        });
      }
    };
  }, [book, id, currentPage]);
  
  const handleWordClick = (word: string, context: string) => {
    setSelectedWord({ word, context });
  };
  
  const handleAddBookmark = async (note: string) => {
    // Bookmark already added in ReaderToolbar component
    queryClient.invalidateQueries({ queryKey: [`/api/bookmarks/book/${id}`] });
  };
  
  const handleToggleHighlightMode = () => {
    setHighlightMode(!highlightMode);
  };
  
  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
  };
  
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'sepia') => {
    setTheme(newTheme);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleGoToPage = (position: string) => {
    const pageNumber = parseInt(position);
    if (!isNaN(pageNumber)) {
      setCurrentPage(pageNumber);
    }
  };
  
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {book && (
        <ReaderToolbar 
          bookId={book.id}
          currentPosition={currentPage.toString()}
          bookTitle={book.title}
          onAddBookmark={handleAddBookmark}
          onToggleHighlightMode={handleToggleHighlightMode}
          highlightModeActive={highlightMode}
          onFontSizeChange={handleFontSizeChange}
          fontSize={fontSize}
          onThemeChange={handleThemeChange}
          currentTheme={theme}
          onSearch={handleSearch}
          onGoToPage={handleGoToPage}
          totalPages={book.totalPages}
          currentPage={currentPage}
        />
      )}
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto">
            <TextRenderer 
              text={bookText}
              fontSize={fontSize}
              renderMode={renderMode}
              onWordClick={handleWordClick}
              vocabularyItems={vocabularyItems}
              isInHighlightMode={highlightMode}
              theme={theme}
              searchTerm={searchQuery}
            />
          </div>
          
          {selectedWord && (
            <div className="border-l h-full overflow-auto">
              <DictionaryPanel 
                word={selectedWord.word}
                context={selectedWord.context}
                language={book?.language || 'en'}
                bookId={parseInt(id || '0')}
                onClose={() => setSelectedWord(null)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
