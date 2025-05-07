import { useState, useRef } from 'react';
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
  const [browserFile, setBrowserFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    language: '',
    filePath: '',
    fileType: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if we're in electron environment
  const isElectronEnvironment = typeof window.electronAPI !== 'undefined';
  
  const handleBrowserFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setBrowserFile(file);
      setFileName(file.name);
      
      // Extract file name without extension for title
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      setFormData({
        ...formData,
        title: nameWithoutExtension,
        fileType: file.name.split('.').pop()?.toLowerCase() || '',
      });
    }
  };

  const handleFileSelect = async () => {
    if (isElectronEnvironment) {
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
    } else {
      // Trigger browser file input for web environment
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const handleImport = async () => {
    // Validate form data
    if (!formData.title || !formData.language) {
      toast({
        title: 'Missing information',
        description: 'Please fill out all required fields',
        variant: 'destructive'
      });
      return;
    }
    
    // Additional validation for file selection
    if (!selectedFile && !browserFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to import',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      let bookData = {...formData};
      
      // Handle browser file upload differently from desktop file paths
      if (browserFile) {
        // Create a temporary file URL for browser files
        bookData = {
          ...formData,
          fileType: browserFile.name.split('.').pop()?.toLowerCase() || '',
          filePath: 'browser-upload' // Placeholder for browser uploads
        };
        
        // In a full implementation, we would use FormData and upload the file
        // For this demo, we'll just simulate a successful import
      }
      
      const book = await apiRequest('POST', '/api/books', bookData);
      
      // Invalidate books query to refresh the library
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      
      toast({
        title: 'Book imported',
        description: `Successfully imported "${formData.title}"`
      });
      
      onClose();
      
      // Reset form
      setSelectedFile(null);
      setBrowserFile(null);
      setFileName('');
      setFormData({
        title: '',
        author: '',
        language: '',
        filePath: '',
        fileType: '',
      });
      
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
        
        {/* Hidden file input for browser environment */}
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".txt,.epub,.pdf"
          onChange={handleBrowserFileChange}
        />
        
        <div className="grid gap-4 py-4">
          {selectedFile || browserFile ? (
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
          
          {(selectedFile || browserFile) && (
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
          
          {(selectedFile || browserFile) && (
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
