import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Book, MoreVertical, Trash, Edit } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Book as BookType } from '@shared/schema';

interface LibraryItemProps {
  book: BookType;
  languages: { code: string; name: string }[];
}

export default function LibraryItem({ book, languages }: LibraryItemProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: book.title,
    author: book.author || '',
    language: book.language,
  });

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  const handleDelete = async () => {
    try {
      await apiRequest('DELETE', `/api/books/${book.id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({ title: 'Book deleted', description: `${book.title} has been removed from your library` });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({ 
        title: 'Error deleting book', 
        description: 'There was a problem deleting this book', 
        variant: 'destructive'
      });
    }
  };

  const handleEdit = async () => {
    try {
      await apiRequest('PUT', `/api/books/${book.id}`, editFormData);
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({ title: 'Book updated', description: 'Book details have been updated' });
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({ 
        title: 'Error updating book', 
        description: 'There was a problem updating this book', 
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardContent className="flex-grow pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Book className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold text-lg">{book.title}</h3>
                {book.author && <p className="text-muted-foreground">{book.author}</p>}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
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
          
          <div className="mt-4 text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Language:</span>
              <span>{languages.find(l => l.code === book.language)?.name || book.language}</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">Type:</span>
              <span className="capitalize">{book.fileType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last opened:</span>
              <span>{formatDate(book.lastOpened)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t p-4">
          <Link to={`/read/${book.id}`} className="w-full">
            <Button className="w-full">
              Open Book
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this book?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            This will permanently delete "{book.title}" from your library. Your vocabulary items associated with this book will remain.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Book Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Book Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={editFormData.title} 
                onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="author">Author</Label>
              <Input 
                id="author" 
                value={editFormData.author} 
                onChange={(e) => setEditFormData({...editFormData, author: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="language">Language</Label>
              <Select 
                value={editFormData.language} 
                onValueChange={(value) => setEditFormData({...editFormData, language: value})}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
