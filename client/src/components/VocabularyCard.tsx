import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Pencil, Trash, StarIcon } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { VocabularyItem } from '@shared/schema';

interface VocabularyCardProps {
  item: VocabularyItem;
}

export default function VocabularyCard({ item }: VocabularyCardProps) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    word: item.word,
    translation: item.translation || '',
    context: item.context || '',
    notes: item.notes || '',
    familiarityScore: item.familiarityScore || 1
  });
  
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };
  
  const handleDelete = async () => {
    try {
      await apiRequest('DELETE', `/api/vocabulary/${item.id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/vocabulary'] });
      queryClient.invalidateQueries({ queryKey: [`/api/vocabulary/language/${item.language}`] });
      
      toast({
        title: 'Word deleted',
        description: `"${item.word}" has been removed from your vocabulary`
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error deleting word',
        description: 'There was a problem deleting this word',
        variant: 'destructive'
      });
    }
  };
  
  const handleEdit = async () => {
    try {
      await apiRequest('PUT', `/api/vocabulary/${item.id}`, editFormData);
      queryClient.invalidateQueries({ queryKey: ['/api/vocabulary'] });
      queryClient.invalidateQueries({ queryKey: [`/api/vocabulary/language/${item.language}`] });
      
      toast({
        title: 'Word updated',
        description: 'Your vocabulary item has been updated'
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error updating word',
        description: 'There was a problem updating this word',
        variant: 'destructive'
      });
    }
  };
  
  const renderFamiliarityStars = (score: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon 
          key={i} 
          className={`h-4 w-4 ${i <= score ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
        />
      );
    }
    return <div className="flex space-x-1">{stars}</div>;
  };
  
  const renderFamiliaritySelector = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((score) => (
          <Button
            key={score}
            variant={editFormData.familiarityScore === score ? "default" : "outline"}
            size="sm"
            onClick={() => setEditFormData({...editFormData, familiarityScore: score})}
            className="w-10 h-10 p-0"
          >
            {score}
          </Button>
        ))}
      </div>
    );
  };
  
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardContent className="pt-6 flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{item.word}</h3>
              {item.translation && (
                <p className="text-muted-foreground">{item.translation}</p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="mt-4">
            {item.context && (
              <div className="my-2 text-sm">
                <p className="italic text-muted-foreground">"{item.context}"</p>
              </div>
            )}
            
            {item.notes && (
              <div className="mt-2 text-sm">
                <p>{item.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="border-t p-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{item.language}</Badge>
            {renderFamiliarityStars(item.familiarityScore)}
          </div>
          <div className="text-xs text-muted-foreground">
            Added: {formatDate(item.dateAdded)}
          </div>
        </CardFooter>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vocabulary Item</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Word</label>
              <Input 
                value={editFormData.word} 
                onChange={(e) => setEditFormData({...editFormData, word: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Translation</label>
              <Input 
                value={editFormData.translation} 
                onChange={(e) => setEditFormData({...editFormData, translation: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Context</label>
              <Textarea 
                value={editFormData.context} 
                onChange={(e) => setEditFormData({...editFormData, context: e.target.value})}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea 
                value={editFormData.notes} 
                onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Familiarity (1-5)</label>
              {renderFamiliaritySelector()}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vocabulary Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{item.word}" from your vocabulary? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
