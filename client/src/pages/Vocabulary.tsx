import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  FilterX, 
  Download, 
  Upload, 
  BookOpen, 
  StarIcon, 
  Clock 
} from 'lucide-react';
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
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import VocabularyCard from '@/components/VocabularyCard';
import { sortItemsByDueDate } from '@/lib/srsSystem';
import { Link } from 'wouter';

export default function Vocabulary() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [familiarityFilter, setFamiliarityFilter] = useState('all');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  
  // Fetch vocabulary items
  const { data: vocabularyItems = [] } = useQuery({
    queryKey: ['/api/vocabulary'],
  });
  
  // Fetch languages
  const { data: languages = [] } = useQuery({
    queryKey: ['/api/languages'],
  });
  
  // Filter vocabulary by search query, language, and familiarity
  const filteredVocabulary = vocabularyItems.filter(item => {
    // Filter by language
    if (languageFilter !== 'all' && item.language !== languageFilter) {
      return false;
    }
    
    // Filter by familiarity
    if (familiarityFilter !== 'all' && item.familiarityScore !== parseInt(familiarityFilter)) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.word.toLowerCase().includes(query) ||
        (item.translation && item.translation.toLowerCase().includes(query)) ||
        (item.notes && item.notes.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Group vocabulary by language
  const vocabByLanguage = vocabularyItems.reduce((acc: Record<string, any[]>, item) => {
    const language = item.language;
    if (!acc[language]) {
      acc[language] = [];
    }
    acc[language].push(item);
    return acc;
  }, {});
  
  // Get due items
  const dueItems = sortItemsByDueDate(vocabularyItems.filter(item => {
    if (!item.nextReviewDate) return true;
    const now = new Date();
    const reviewDate = new Date(item.nextReviewDate);
    return reviewDate <= now;
  }));
  
  const handleExportVocabulary = async (format: 'csv' | 'json') => {
    try {
      const filePath = await window.electronAPI.saveFileDialog({
        title: 'Export Vocabulary',
        defaultPath: `vocabulary-export.${format}`,
        filters: [
          { name: format.toUpperCase(), extensions: [format] }
        ]
      });
      
      if (!filePath) return; // User cancelled
      
      // Prepare export data
      const exportData = vocabularyItems.map(item => ({
        word: item.word,
        translation: item.translation || '',
        context: item.context || '',
        notes: item.notes || '',
        familiarityScore: item.familiarityScore,
        language: item.language,
        lastReviewed: item.lastReviewed || '',
      }));
      
      if (format === 'csv') {
        await window.electronAPI.exportVocabularyToCSV(exportData, filePath);
      } else {
        await window.electronAPI.exportVocabularyToJSON(exportData, filePath);
      }
      
      toast({
        title: 'Export successful',
        description: `Vocabulary exported to ${filePath}`
      });
      
      setIsExportDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Export failed',
        description: `Error exporting vocabulary: ${error}`,
        variant: 'destructive'
      });
    }
  };
  
  const handleImportVocabulary = async (format: 'csv' | 'json') => {
    try {
      const filePaths = await window.electronAPI.openFileDialog({
        title: 'Import Vocabulary',
        filters: [
          { name: format.toUpperCase(), extensions: [format] }
        ],
        properties: ['openFile']
      });
      
      if (!filePaths || filePaths.length === 0) return; // User cancelled
      
      const filePath = filePaths[0];
      let importedData;
      
      if (format === 'csv') {
        importedData = await window.electronAPI.importVocabularyFromCSV(filePath);
      } else {
        importedData = await window.electronAPI.importVocabularyFromJSON(filePath);
      }
      
      // Import each item through the API
      let importCount = 0;
      for (const item of importedData) {
        // Basic validation
        if (!item.word || !item.language) continue;
        
        try {
          await fetch('/api/vocabulary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              word: item.word,
              translation: item.translation || '',
              context: item.context || '',
              notes: item.notes || '',
              familiarityScore: parseInt(item.familiarityScore) || 1,
              language: item.language,
            })
          });
          importCount++;
        } catch (err) {
          console.error('Error importing item:', err);
        }
      }
      
      toast({
        title: 'Import successful',
        description: `Imported ${importCount} vocabulary items`
      });
      
      // Refresh vocabulary data
      queryClient.invalidateQueries({ queryKey: ['/api/vocabulary'] });
      
      setIsImportDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Import failed',
        description: `Error importing vocabulary: ${error}`,
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Vocabulary</h1>
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsExportDialogOpen(true)}>
                Export Vocabulary
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>
                Import Vocabulary
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link to="/flashcards">
            <Button>
              <Clock className="h-4 w-4 mr-2" />
              Review Flashcards
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vocabulary..."
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
        
        <Select value={familiarityFilter} onValueChange={setFamiliarityFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by familiarity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {[1, 2, 3, 4, 5].map((level) => (
              <SelectItem key={level} value={level.toString()}>
                Level {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {(searchQuery || languageFilter !== 'all' || familiarityFilter !== 'all') && (
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => {
              setSearchQuery('');
              setLanguageFilter('all');
              setFamiliarityFilter('all');
            }}
            title="Clear filters"
          >
            <FilterX className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Vocabulary Content */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Words</TabsTrigger>
          <TabsTrigger value="due">Due for Review</TabsTrigger>
          {Object.keys(vocabByLanguage).map(langCode => {
            const language = languages.find(l => l.code === langCode);
            return (
              <TabsTrigger key={langCode} value={langCode}>
                {language?.name || langCode}
              </TabsTrigger>
            );
          })}
        </TabsList>
        
        <TabsContent value="all">
          {filteredVocabulary.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVocabulary.map((item) => (
                <VocabularyCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              
              {searchQuery || languageFilter !== 'all' || familiarityFilter !== 'all' ? (
                <>
                  <h3 className="mt-4 text-lg font-medium">No matching vocabulary items found</h3>
                  <p className="mt-2 text-muted-foreground">
                    Try changing your search or filter criteria
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mt-4 text-lg font-medium">Your vocabulary list is empty</h3>
                  <p className="mt-2 text-muted-foreground">
                    Start reading books and adding words to your vocabulary
                  </p>
                </>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="due">
          {dueItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dueItems.map((item) => (
                <VocabularyCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No words due for review</h3>
              <p className="mt-2 text-muted-foreground">
                All caught up! Check back later for more reviews.
              </p>
            </div>
          )}
        </TabsContent>
        
        {Object.entries(vocabByLanguage).map(([langCode, langItems]) => (
          <TabsContent key={langCode} value={langCode}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {langItems.map((item) => (
                <VocabularyCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Vocabulary</DialogTitle>
            <DialogDescription>
              Choose a format to export your vocabulary list
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => handleExportVocabulary('csv')}
              >
                <div className="text-xl font-bold mb-2">.CSV</div>
                <div className="text-xs text-muted-foreground">Spreadsheet Format</div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => handleExportVocabulary('json')}
              >
                <div className="text-xl font-bold mb-2">.JSON</div>
                <div className="text-xs text-muted-foreground">Data Format</div>
              </Button>
            </div>
            
            <Separator />
            
            <p className="text-sm text-muted-foreground">
              Exports your entire vocabulary list with all details
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Vocabulary</DialogTitle>
            <DialogDescription>
              Choose a format to import vocabulary
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => handleImportVocabulary('csv')}
              >
                <div className="text-xl font-bold mb-2">.CSV</div>
                <div className="text-xs text-muted-foreground">Spreadsheet Format</div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => handleImportVocabulary('json')}
              >
                <div className="text-xl font-bold mb-2">.JSON</div>
                <div className="text-xs text-muted-foreground">Data Format</div>
              </Button>
            </div>
            
            <Separator />
            
            <p className="text-sm text-muted-foreground">
              Import vocabulary from previously exported files
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
