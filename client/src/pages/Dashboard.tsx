import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Library, 
  CheckCircle2, 
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { calculateRetentionScore, getItemsDueForReview } from '@/lib/srsSystem';

export default function Dashboard() {
  const [dueCount, setDueCount] = useState(0);
  const [retentionScore, setRetentionScore] = useState(0);
  const [recentBooks, setRecentBooks] = useState<any[]>([]);
  
  // Define types for our data
  interface Book {
    id: number;
    title: string;
    author?: string;
    language: string;
    filePath: string;
    lastOpened?: string;
    currentPosition?: string;
    fileType: string;
  }
  
  interface VocabularyItem {
    id: number;
    word: string;
    definition: string;
    context: string;
    language: string;
    bookId?: number;
    familiarityScore: number;
    lastReviewed: string;
    nextReview: string;
  }
  
  // Get all books
  const { data: books = [] } = useQuery<Book[]>({
    queryKey: ['/api/books'],
  });
  
  // Get vocabulary items
  const { data: vocabularyItems = [] } = useQuery<VocabularyItem[]>({
    queryKey: ['/api/vocabulary'],
  });
  
  useEffect(() => {
    if (vocabularyItems && vocabularyItems.length >= 0) {
      // Calculate due items count
      const dueItems = getItemsDueForReview(vocabularyItems);
      setDueCount(dueItems.length);
      
      // Calculate retention score
      const score = calculateRetentionScore(vocabularyItems);
      setRetentionScore(score);
    }
  }, [vocabularyItems]);
  
  useEffect(() => {
    if (books && books.length >= 0) {
      // Get recent books (last 3 opened)
      const sorted = [...books].sort((a, b) => {
        if (!a.lastOpened) return 1;
        if (!b.lastOpened) return -1;
        return new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime();
      });
      setRecentBooks(sorted.slice(0, 3));
    }
  }, [books]);
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{books.length}</div>
            <p className="text-xs text-muted-foreground">
              in your library
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vocabulary Size</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vocabularyItems.length}</div>
            <p className="text-xs text-muted-foreground">
              saved words
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retentionScore}%</div>
            <p className="text-xs text-muted-foreground">
              words you know well
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Flashcards Due Section */}
      <Card className={dueCount > 0 ? 'border-primary' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Flashcards Due
          </CardTitle>
          <CardDescription>
            Review your vocabulary with spaced repetition
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dueCount > 0 ? (
            <p className="text-lg">You have <span className="font-bold">{dueCount}</span> words due for review today.</p>
          ) : (
            <p>No flashcards due for review right now.</p>
          )}
        </CardContent>
        <CardFooter>
          {dueCount > 0 ? (
            <Link to="/flashcards">
              <Button>
                Start Review Session
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" disabled>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              All caught up!
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Recent Books Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recently Opened Books</h2>
          <Link to="/library">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        
        {recentBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentBooks.map(book => (
              <Card key={book.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{book.title}</CardTitle>
                  {book.author && (
                    <CardDescription>{book.author}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">
                    Language: <span className="font-medium">{book.language}</span>
                  </p>
                  {book.lastOpened && (
                    <p className="text-sm text-muted-foreground">
                      Last opened: {new Date(book.lastOpened).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Link to={`/read/${book.id}`} className="w-full">
                    <Button className="w-full">
                      Continue Reading
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-medium">No books yet</h3>
                <p className="text-muted-foreground">
                  Import your first book to start reading and building vocabulary
                </p>
                <Link to="/library">
                  <Button>
                    Go to Library
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
