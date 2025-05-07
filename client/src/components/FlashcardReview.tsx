import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Star, 
  X, 
  Check, 
  Volume2 
} from 'lucide-react';

interface FlashcardReviewProps {
  onComplete: () => void;
}

export default function FlashcardReview({ onComplete }: FlashcardReviewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewComplete, setReviewComplete] = useState(false);

  // Fetch vocabulary items due for review
  const { data: flashcards = [], isLoading } = useQuery({
    queryKey: ['/api/review/due'],
    staleTime: 0, // Always refetch to get the latest due items
  });

  // Update vocabulary item review status
  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, familiarityScore }: { id: number; familiarityScore: number }) => {
      return apiRequest('PUT', `/api/review/${id}`, { familiarityScore });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/review/due'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vocabulary'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating review status',
        description: `There was a problem: ${error}`,
        variant: 'destructive',
      });
    },
  });

  // Check if all cards are reviewed
  useEffect(() => {
    if (flashcards.length > 0 && currentCardIndex >= flashcards.length) {
      setReviewComplete(true);
    }
  }, [currentCardIndex, flashcards.length]);

  const handleReviewScore = async (score: number) => {
    if (currentCardIndex >= flashcards.length) return;
    
    const currentCard = flashcards[currentCardIndex];
    
    updateReviewMutation.mutate({
      id: currentCard.id,
      familiarityScore: score,
    });
    
    moveToNextCard();
  };

  const moveToNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex(prev => prev + 1);
  };

  const moveBackCard = () => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  const resetReview = () => {
    setIsFlipped(false);
    setCurrentCardIndex(0);
    setReviewComplete(false);
  };

  // Text-to-speech function
  const speakWord = (text: string, language: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language; // e.g., 'es' for Spanish, 'fr' for French
    window.speechSynthesis.speak(utterance);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">No Flashcards Due</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>There are no vocabulary items due for review at this time.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={onComplete}>Return to Dashboard</Button>
        </CardFooter>
      </Card>
    );
  }

  if (reviewComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Review Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>You've reviewed all {flashcards.length} cards due today.</p>
          <div className="mt-4 text-sm text-muted-foreground">
            Your next review session will be available when cards are due again based on your familiarity ratings.
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button variant="outline" onClick={resetReview}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Review Again
          </Button>
          <Button onClick={onComplete}>
            Finish
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const currentCard = flashcards[currentCardIndex];
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={moveBackCard} 
          disabled={currentCardIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="text-sm">
          Card {currentCardIndex + 1} of {flashcards.length}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={moveToNextCard}
          disabled={currentCardIndex === flashcards.length - 1}
        >
          Skip
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <Card 
        className="w-full cursor-pointer perspective" 
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
          <div className={`backface-hidden ${isFlipped ? 'hidden' : 'block'}`}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{currentCard.word}</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(currentCard.word, currentCard.language);
                  }}
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-32 flex items-center justify-center">
              <p className="text-sm italic text-center text-muted-foreground">
                Click to reveal the translation and context
              </p>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Language: {currentCard.language}
            </CardFooter>
          </div>
          
          <div className={`backface-hidden ${isFlipped ? 'block' : 'hidden'}`}>
            <CardHeader>
              <CardTitle>{currentCard.word}</CardTitle>
            </CardHeader>
            <CardContent>
              {currentCard.translation && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-1">Translation:</h3>
                  <p>{currentCard.translation}</p>
                </div>
              )}
              
              {currentCard.context && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-1">Context:</h3>
                  <p className="italic">"{currentCard.context}"</p>
                </div>
              )}
              
              {currentCard.notes && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Notes:</h3>
                  <p>{currentCard.notes}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <p className="text-sm text-center w-full">How well do you know this word?</p>
              <div className="flex justify-between w-full">
                <Button 
                  variant="outline" 
                  className="flex-1 mx-1 border-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReviewScore(1);
                  }}
                >
                  <X className="h-4 w-4 mr-1 text-red-500" />
                  1
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 mx-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReviewScore(2);
                  }}
                >
                  2
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 mx-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReviewScore(3);
                  }}
                >
                  3
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 mx-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReviewScore(4);
                  }}
                >
                  4
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 mx-1 border-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReviewScore(5);
                  }}
                >
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                  5
                </Button>
              </div>
            </CardFooter>
          </div>
        </div>
      </Card>
      
      <div className="mt-6 text-sm text-center text-muted-foreground">
        <p>Tap/click the card to flip it</p>
        <p className="mt-1">Rate your familiarity from 1 (don't know) to 5 (know perfectly)</p>
      </div>
    </div>
  );
}
