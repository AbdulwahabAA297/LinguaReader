import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { parseFile } from '@/lib/fileParser';

interface BookImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  languages: { code: string; name: string }[];
}

export default function BookImportDialog({ isOpen, onClose, languages }: BookImportDialogProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    language: '',
    filePath: '',
    fileType: '',
  });

  const handleFileSelect = async () => {
    try {
      const filePaths = await window.electronAPI.openFileDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'E-Books', extensions: ['epub'] },
          { name: 'PDF Documents', extensions: ['pdf'] }
        ]
      });

      if (filePaths && filePaths.length > 0) {
        const filePath = filePaths[0];
        const fileExt = filePath.split('.').pop()?.toLowerCase() || '';
        const name = filePath.split('/').pop() || 'Untitled';
        
        setSelectedFile(filePath);
        setFileName(name);
        
        // Set form data with file info
        setFormData({
          ...formData,
          title: name.replace(`.${fileExt}`, ''),
          filePath: filePath,
          fileType: fileExt
        });
        
        // Try to parse more metadata from the file
        try {
          setIsLoading(true);
          const parsedData = await parseFile(filePath);
          
          setFormData(prev => ({
            ...prev,
            title: parsedData.title || prev.title,
            author: parsedData.author || prev.author
          }));
        } catch (error) {
          console.error('Error parsing file metadata:', error);
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      toast({
        title: 'Error selecting file',
        description: 'Could not open file dialog',
        variant: 'destructive'
      });
    }
  };

  const handleImport = async () => {
    // Validate form data
    if (!formData.title || !formData.language || !formData.filePath || !formData.fileType) {
      toast({
        title: 'Missing information',
        description: 'Please fill out all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const book = await apiRequest('POST', '/api/books', formData);
      
      // Invalidate books query to refresh the library
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      
      toast({
        title: 'Book imported',
        description: `Successfully imported "${formData.title}"`
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Import failed',
        description: `Error importing the book: ${error}`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import a Book</DialogTitle>
          <DialogDescription>
            Add a new book to your library. Supported formats: TXT, EPUB, PDF.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {selectedFile ? (
            <div className="grid gap-2">
              <Label>Selected File</Label>
              <div className="flex items-center gap-2">
                <Input value={fileName} readOnly className="flex-1" />
                <Button variant="outline" onClick={handleFileSelect}>
                  Change
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button onClick={handleFileSelect}>
                Select File
              </Button>
            </div>
          )}
          
          {selectedFile && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  disabled={isLoading}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="author">Author (optional)</Label>
                <Input 
                  id="author" 
                  value={formData.author} 
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  disabled={isLoading}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Select 
                  value={formData.language} 
                  onValueChange={(value) => setFormData({...formData, language: value})}
                  disabled={isLoading}
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
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          
          {selectedFile && (
            <Button onClick={handleImport} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                  Importing...
                </>
              ) : 'Import Book'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
