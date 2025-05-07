import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  ExternalLink, 
  Plus, 
  Volume2,
  Star, 
  StarHalf 
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { lookupWord } from '@/lib/dictionary';

interface DictionaryPanelProps {
  word: string;
  context: string;
  language: string;
  bookId?: number;
  onClose: () => void;
}

export default function DictionaryPanel({ word, context, language, bookId, onClose }: DictionaryPanelProps) {
  const { toast } = useToast();
  const [translation, setTranslation] = useState('');
  const [notes, setNotes] = useState('');
  const [familiarityScore, setFamiliarityScore] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [dictResult, setDictResult] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState('dictionary');
  
  // Check if word is already saved in vocabulary
  useEffect(() => {
    const checkExistingVocab = async () => {
      try {
        setIsLoading(true);
        const items = await fetch(`/api/vocabulary/language/${language}`).then(res => res.json());
        const existingItem = items.find((item: any) => item.word.toLowerCase() === word.toLowerCase());
        
        if (existingItem) {
          setTranslation(existingItem.translation || '');
          setNotes(existingItem.notes || '');
          setFamiliarityScore(existingItem.familiarityScore || 1);
          setCurrentTab('save');
        }
        
        // Look up word in dictionary
        const result = await lookupWord(word, language);
        setDictResult(result);
      } catch (error) {
        console.error('Error checking vocabulary:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkExistingVocab();
  }, [word, language]);
  
  const handleSaveVocabulary = async () => {
    try {
      await apiRequest('POST', '/api/vocabulary', {
        word,
        context,
        translation,
        notes,
        familiarityScore,
        language,
        bookId
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/vocabulary/language/${language}`] });
      
      toast({
        title: 'Word saved',
        description: `"${word}" has been added to your vocabulary`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Error saving word',
        description: 'There was a problem saving this word',
        variant: 'destructive'
      });
    }
  };
  
  const renderFamiliaritySelector = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((score) => (
          <Button
            key={score}
            variant={familiarityScore === score ? "default" : "outline"}
            size="sm"
            onClick={() => setFamiliarityScore(score)}
            className="w-10 h-10 p-0"
          >
            {score}
          </Button>
        ))}
      </div>
    );
  };
  
  const openExternalDictionary = (url: string) => {
    window.open(url, '_blank');
  };
  
  return (
    <Card className="w-80 md:w-96 h-full overflow-auto">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{word}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="w-full">
          <TabsTrigger value="dictionary" className="flex-1">Dictionary</TabsTrigger>
          <TabsTrigger value="save" className="flex-1">Save Word</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dictionary" className="space-y-4 mt-2">
          {isLoading ? (
            <CardContent>
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          ) : (
            <CardContent className="space-y-4">
              {dictResult ? (
                <>
                  {dictResult.phonetic && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{dictResult.phonetic}</span>
                      {dictResult.audio && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => new Audio(dictResult.audio).play()}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {dictResult.meanings && dictResult.meanings.map((meaning: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {meaning.partOfSpeech}
                      </h3>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        {meaning.definitions.slice(0, 3).map((def: any, idx: number) => (
                          <li key={idx}>{def.definition}</li>
                        ))}
                      </ul>
                      {meaning.definitions.length > 3 && (
                        <p className="text-xs text-muted-foreground">+ {meaning.definitions.length - 3} more definitions</p>
                      )}
                    </div>
                  ))}
                  
                  {dictResult.translations && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Translations</h3>
                      <div className="text-sm">
                        {dictResult.translations.join(', ')}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No dictionary results available for "{word}".
                </p>
              )}
              
              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-medium">External Dictionaries</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openExternalDictionary(`https://www.google.com/search?q=define+${encodeURIComponent(word)}+${language}`)}
                    className="text-xs flex items-center"
                  >
                    Google <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openExternalDictionary(`https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`)}
                    className="text-xs flex items-center"
                  >
                    Wiktionary <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openExternalDictionary(`https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(word)}`)}
                    className="text-xs flex items-center"
                  >
                    Translate <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
              
              <div className="pt-2">
                <h3 className="text-sm font-medium mb-2">Context</h3>
                <div className="text-sm bg-muted p-2 rounded-md">
                  {context ? (
                    <p>{context}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No context available</p>
                  )}
                </div>
              </div>
            </CardContent>
          )}
          
          <CardFooter>
            <Button className="w-full" onClick={() => setCurrentTab('save')}>
              <Plus className="h-4 w-4 mr-2" /> Save to Vocabulary
            </Button>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="save">
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Translation</label>
              <Input 
                placeholder="Enter translation" 
                value={translation} 
                onChange={(e) => setTranslation(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Context</label>
              <Textarea 
                placeholder="Sentence where this word appears" 
                value={context} 
                readOnly
                className="resize-none bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea 
                placeholder="Add your notes about this word" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Familiarity (1-5)</label>
              {renderFamiliaritySelector()}
              <p className="text-xs text-muted-foreground mt-1">
                1 = New word, 5 = Very familiar
              </p>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleSaveVocabulary}
            >
              Save Word
            </Button>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
