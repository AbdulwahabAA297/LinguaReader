import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, BookText, Search, FilterX } from 'lucide-react';
import LibraryItem from '@/components/LibraryItem';
import BookImportDialog from '@/components/BookImportDialog';

export default function Library() {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  
  // Fetch books
  const { data: books = [], isLoading: isBooksLoading } = useQuery({
    queryKey: ['/api/books'],
  });
  
  // Fetch languages
  const { data: languages = [], isLoading: isLanguagesLoading } = useQuery({
    queryKey: ['/api/languages'],
  });
  
  // Filter books by search query and language
  const filteredBooks = books.filter(book => {
    // Filter by language
    if (languageFilter !== 'all' && book.language !== languageFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        book.title.toLowerCase().includes(query) ||
        (book.author && book.author.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Group books by language
  const booksByLanguage = books.reduce((acc: Record<string, any[]>, book) => {
    const language = book.language;
    if (!acc[language]) {
      acc[language] = [];
    }
    acc[language].push(book);
    return acc;
  }, {});
  
  const isLoading = isBooksLoading || isLanguagesLoading;
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">My Library</h1>
        <Button onClick={() => setIsImportDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Import Book
        </Button>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or author..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {languages.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                {language.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {(searchQuery || languageFilter !== 'all') && (
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => {
              setSearchQuery('');
              setLanguageFilter('all');
            }}
            title="Clear filters"
          >
            <FilterX className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Book Library */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Books</TabsTrigger>
          {Object.keys(booksByLanguage).map(langCode => {
            const language = languages.find(l => l.code === langCode);
            return (
              <TabsTrigger key={langCode} value={langCode}>
                {language?.name || langCode}
              </TabsTrigger>
            );
          })}
        </TabsList>
        
        <TabsContent value="all">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <LibraryItem key={book.id} book={book} languages={languages} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookText className="mx-auto h-12 w-12 text-muted-foreground" />
              
              {searchQuery || languageFilter !== 'all' ? (
                <>
                  <h3 className="mt-4 text-lg font-medium">No matching books found</h3>
                  <p className="mt-2 text-muted-foreground">
                    Try changing your search or filter criteria
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mt-4 text-lg font-medium">Your library is empty</h3>
                  <p className="mt-2 text-muted-foreground">
                    Import your first book to get started
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setIsImportDialogOpen(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Import Book
                  </Button>
                </>
              )}
            </div>
          )}
        </TabsContent>
        
        {Object.entries(booksByLanguage).map(([langCode, langBooks]) => (
          <TabsContent key={langCode} value={langCode}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {langBooks.map((book) => (
                <LibraryItem key={book.id} book={book} languages={languages} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Import Dialog */}
      <BookImportDialog 
        isOpen={isImportDialogOpen} 
        onClose={() => setIsImportDialogOpen(false)} 
        languages={languages}
      />
    </div>
  );
}
