// Spaced Repetition System (SRS) utilities

/**
 * Calculate the next review date based on familiarity score
 * @param familiarityScore The familiarity score (1-5)
 * @param lastReviewed The date when the item was last reviewed
 * @returns The next date when the item should be reviewed
 */
export function calculateNextReviewDate(familiarityScore: number, lastReviewed: Date = new Date()): Date {
  // Implement the SuperMemo-2 algorithm (a simpler version of SuperMemo SM-2)
  // https://en.wikipedia.org/wiki/SuperMemo#Algorithm
  
  // This algorithm calculates intervals based on familiarity score:
  // 1: Review again in 1 day
  // 2: Review again in 3 days
  // 3: Review again in 7 days
  // 4: Review again in 14 days
  // 5: Review again in 30 days
  
  const intervals = {
    1: 1, // 1 day
    2: 3, // 3 days
    3: 7, // 7 days
    4: 14, // 14 days
    5: 30 // 30 days
  };
  
  // Default to lowest interval if invalid score
  const interval = intervals[familiarityScore as keyof typeof intervals] || intervals[1];
  
  // Calculate next review date
  const nextReviewDate = new Date(lastReviewed);
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  
  return nextReviewDate;
}

/**
 * Get items that are due for review today
 * @param vocabularyItems Array of vocabulary items
 * @returns Array of items due for review
 */
export function getItemsDueForReview(vocabularyItems: any[]): any[] {
  const now = new Date();
  
  return vocabularyItems.filter(item => {
    // If the item has a next review date and it's in the past or today
    if (item.nextReviewDate) {
      const reviewDate = new Date(item.nextReviewDate);
      return reviewDate <= now;
    }
    
    // Items without a next review date are assumed to be due
    return true;
  });
}

/**
 * Sort vocabulary items by their due date (earliest first)
 * @param vocabularyItems Array of vocabulary items
 * @returns Sorted array of items
 */
export function sortItemsByDueDate(vocabularyItems: any[]): any[] {
  return [...vocabularyItems].sort((a, b) => {
    // Items without a next review date come first
    if (!a.nextReviewDate) return -1;
    if (!b.nextReviewDate) return 1;
    
    // Otherwise sort by next review date (ascending)
    return new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime();
  });
}

/**
 * Calculate the retention score (percentage of words you remember)
 * @param vocabularyItems Array of vocabulary items
 * @returns Percentage of retention (0-100)
 */
export function calculateRetentionScore(vocabularyItems: any[]): number {
  if (vocabularyItems.length === 0) return 0;
  
  // Count items with familiarity score >= 3 (words you know reasonably well)
  const knownItems = vocabularyItems.filter(item => item.familiarityScore >= 3).length;
  const totalItems = vocabularyItems.length;
  
  return Math.round((knownItems / totalItems) * 100);
}
