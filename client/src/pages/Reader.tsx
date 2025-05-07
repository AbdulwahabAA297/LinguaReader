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
  
  // Define book type
  interface Book {
    id: number;
    title: string;
    author: string | null;
    language: string;
    filePath: string;
    fileType: string;
    currentPosition: string | null;
    totalPages: number | null;
    coverImage: string | null;
    dateAdded: Date | null;
    lastOpened: Date | null;
  }
  
  // Define vocabulary item type
  interface VocabularyItem {
    id: number;
    word: string;
    translation: string | null;
    context: string | null;
    language: string;
    bookId: number | null;
    familiarityScore: number | null;
    dateAdded: Date | null;
    lastReviewed: Date | null;
    nextReviewDate: Date | null;
  }
  
  // Fetch book details
  const { data: book } = useQuery<Book>({
    queryKey: [`/api/books/${id}`],
  });
  
  // Fetch vocabulary for the book's language
  const { data: vocabularyItems = [] } = useQuery<VocabularyItem[]>({
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
        try {
          // First try to get the book content from the server
          const parsedBook = await parseFile(book.filePath);
          // Make sure we have actual content
          if (parsedBook.content && parsedBook.content.trim() !== '') {
            setBookText(parsedBook.content);
          } else {
            // Fallback to sample content if no real content
            setBookText(
              `Chapter 1: ${book.title}\n\n` +
              `By ${book.author || 'Unknown'}\n\n` +
              `This is the beginning of ${book.title}. This is a sample text that would normally contain the actual content of your book. ` +
              `In a real implementation, the full text of the book would be displayed here. ` +
              `You can still try out the basic functionality like highlighting words, using the dictionary, and saving vocabulary.\n\n` +
              `You can adjust the font size, theme, and other settings using the toolbar above. ` +
              `Try clicking on any word to look it up in the dictionary. ` +
              `You can also enable highlight mode to save words to your vocabulary.\n\n` +
              `Here are some sample paragraphs with a mix of common and uncommon words for you to practice with:\n\n` +
              `The sun was setting behind the mountains, casting a warm glow over the valley. The birds were returning to their nests, singing their evening songs. ` +
              `A gentle breeze rustled the leaves of the ancient oak trees. It was a tranquil scene, perfect for contemplation and reflection.\n\n` +
              `Sarah walked along the path, her footsteps barely audible on the soft ground. She had been exploring the forest since dawn, documenting the various plants and animals she encountered. ` +
              `Her journal was filled with detailed notes and sketches. As a botanist, she found this ecosystem particularly fascinating.\n\n` +
              `Later, they would gather around the campfire, sharing stories and roasting marshmallows. ` +
              `It was a tradition that had started years ago, when they first discovered this hidden paradise.`
            );
          }
        } catch (error) {
          console.error("Error parsing book content:", error);
          setBookText("Error loading book content. Please try again later.");
        }
        
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
