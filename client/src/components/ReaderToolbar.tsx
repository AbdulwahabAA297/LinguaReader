import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  BookmarkPlus, 
  Bookmark, 
  Settings2, 
  Search, 
  SunMoon, 
  Moon, 
  Sun,
  ZoomIn, 
  ZoomOut,
  Highlighter,
  Type 
} from 'lucide-react';
import { Link } from 'wouter';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,

  DialogDescription 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { apiRequest } from '@/lib/queryClient';

interface ReaderToolbarProps {
  bookId: number;
  currentPosition: string;
  bookTitle: string;
  onAddBookmark: (note: string) => void;
  onToggleHighlightMode: () => void;
  highlightModeActive: boolean;
  onFontSizeChange: (size: number) => void;
  fontSize: number;
  onThemeChange: (theme: 'light' | 'dark' | 'sepia') => void;
  currentTheme: 'light' | 'dark' | 'sepia';
  onSearch: (query: string) => void;
  onGoToPage: (position: string) => void;
  totalPages?: number;
  currentPage?: number;
}

export default function ReaderToolbar({
  bookId,
  currentPosition,
  bookTitle,
  onAddBookmark,
  onToggleHighlightMode,
  highlightModeActive,
  onFontSizeChange,
  fontSize,
  onThemeChange,
  currentTheme,
  onSearch,
  onGoToPage,
  totalPages,
  currentPage
}: ReaderToolbarProps) {
  const { toast } = useToast();
  const [isBookmarkDialogOpen, setIsBookmarkDialogOpen] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pageInput, setPageInput] = useState(currentPage?.toString() || '1');

  useEffect(() => {
    setPageInput(currentPage?.toString() || '1');
  }, [currentPage]);

  const handleAddBookmark = async () => {
    try {
      await apiRequest('POST', '/api/bookmarks', {
        bookId,
        position: currentPosition,
        note: bookmarkNote
      });
      
      toast({
        title: 'Bookmark added',
        description: 'Your bookmark has been saved'
      });
      
      onAddBookmark(bookmarkNote);
      setBookmarkNote('');
      setIsBookmarkDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error adding bookmark',
        description: 'There was a problem saving your bookmark',
        variant: 'destructive'
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInput);
    if (isNaN(pageNumber) || pageNumber < 1 || (totalPages && pageNumber > totalPages)) {
      toast({
        title: 'Invalid page number',
        description: `Please enter a number between 1 and ${totalPages || '?'}`,
        variant: 'destructive'
      });
      return;
    }
    
    // Convert page number to position and navigate
    const position = pageNumber.toString();
    onGoToPage(position);
  };

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center space-x-2">
          <Link to="/library">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-sm font-medium hidden sm:block">{bookTitle}</h2>
        </div>
        
        <div className="flex items-center space-x-1">
          {totalPages && (
            <form onSubmit={handleGoToPage} className="flex items-center mr-2">
              <Input 
                className="w-16 h-8 text-xs" 
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
              />
              <span className="mx-1 text-xs text-muted-foreground">/ {totalPages}</span>
            </form>
          )}
          
          <Button
            variant={highlightModeActive ? "secondary" : "ghost"}
            size="icon"
            onClick={onToggleHighlightMode}
            title="Toggle highlight mode"
          >
            <Highlighter className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsBookmarkDialogOpen(true)}
            title="Add bookmark"
          >
            <BookmarkPlus className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            title="Search"
          >
            <Search className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title="Reader settings">
                <Settings2 className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="p-2">
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Font Size</p>
                  <div className="flex items-center space-x-2">
                    <ZoomOut className="h-4 w-4" />
                    <Slider 
                      value={[fontSize]} 
                      min={12} 
                      max={32} 
                      step={1}
                      onValueChange={(value) => onFontSizeChange(value[0])}
                      className="w-32" 
                    />
                    <ZoomIn className="h-4 w-4" />
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div>
                  <p className="text-sm font-medium mb-2">Theme</p>
                  <div className="flex space-x-2">
                    <Button 
                      variant={currentTheme === 'light' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => onThemeChange('light')}
                      className="w-full"
                    >
                      <Sun className="h-4 w-4 mr-1" /> Light
                    </Button>
                    <Button 
                      variant={currentTheme === 'dark' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => onThemeChange('dark')}
                      className="w-full"
                    >
                      <Moon className="h-4 w-4 mr-1" /> Dark
                    </Button>
                    <Button 
                      variant={currentTheme === 'sepia' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => onThemeChange('sepia')}
                      className="w-full"
                    >
                      <SunMoon className="h-4 w-4 mr-1" /> Sepia
                    </Button>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {isSearchOpen && (
        <div className="px-2 pb-2">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input
              placeholder="Search in text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </form>
        </div>
      )}
      
      {/* Bookmark Dialog */}
      <Dialog open={isBookmarkDialogOpen} onOpenChange={setIsBookmarkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bookmark</DialogTitle>
            <DialogDescription>
              Save your current position in the book with an optional note.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Add a note (optional)"
                value={bookmarkNote}
                onChange={(e) => setBookmarkNote(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookmarkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBookmark}>
              Save Bookmark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
