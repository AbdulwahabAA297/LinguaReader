import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft } from 'lucide-react';
import FlashcardReview from '@/components/FlashcardReview';

export default function FlashcardSession() {
  const [reviewCompleted, setReviewCompleted] = useState(false);
  
  const handleReviewComplete = () => {
    setReviewCompleted(true);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/vocabulary">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Flashcard Review</h1>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="review" className="w-full">
          <TabsList className="mb-4 grid grid-cols-2">
            <TabsTrigger value="review">Review Cards</TabsTrigger>
            <TabsTrigger value="settings">Review Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="review">
            {reviewCompleted ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Review Complete!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                  <p>You've completed your review session.</p>
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" onClick={() => setReviewCompleted(false)}>
                      Start Another Review
                    </Button>
                    <Link to="/vocabulary">
                      <Button>
                        Back to Vocabulary
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <FlashcardReview onComplete={handleReviewComplete} />
            )}
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Review Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Spaced Repetition System</h3>
                  <p className="text-muted-foreground">
                    The app uses a spaced repetition algorithm based on your familiarity ratings:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Level 1 (Don't know): Review again in 1 day</li>
                    <li>Level 2: Review again in 3 days</li>
                    <li>Level 3: Review again in 7 days</li>
                    <li>Level 4: Review again in 14 days</li>
                    <li>Level 5 (Know perfectly): Review again in 30 days</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Review Tips</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Be honest with your familiarity ratings for best results</li>
                    <li>Regular review sessions will help you learn vocabulary faster</li>
                    <li>You can also review words directly from the vocabulary page</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
