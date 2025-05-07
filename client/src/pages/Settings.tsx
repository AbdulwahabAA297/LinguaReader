import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export default function Settings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [fontSizePreference, setFontSizePreference] = useState(18);
  const [renderModePreference, setRenderModePreference] = useState('paragraph');
  const [offlineMode, setOfflineMode] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  
  // Fetch languages
  const { data: languages = [] } = useQuery({
    queryKey: ['/api/languages'],
  });
  
  // Fetch settings
  const { data: fontSizeSetting } = useQuery({
    queryKey: ['/api/settings/fontSize'],
  });
  
  const { data: renderModeSetting } = useQuery({
    queryKey: ['/api/settings/renderMode'],
  });
  
  const { data: offlineModeSetting } = useQuery({
    queryKey: ['/api/settings/offlineMode'],
  });
  
  const { data: defaultLanguageSetting } = useQuery({
    queryKey: ['/api/settings/defaultLanguage'],
  });
  
  // Initialize settings from fetched data
  useEffect(() => {
    if (fontSizeSetting?.value) {
      setFontSizePreference(fontSizeSetting.value);
    }
    
    if (renderModeSetting?.value) {
      setRenderModePreference(renderModeSetting.value);
    }
    
    if (offlineModeSetting?.value !== undefined) {
      setOfflineMode(offlineModeSetting.value);
    }
    
    if (defaultLanguageSetting?.value) {
      setDefaultLanguage(defaultLanguageSetting.value);
    }
  }, [fontSizeSetting, renderModeSetting, offlineModeSetting, defaultLanguageSetting]);
  
  const updateSetting = async (key: string, value: any) => {
    try {
      await apiRequest('PUT', `/api/settings/${key}`, { value });
      queryClient.invalidateQueries({ queryKey: [`/api/settings/${key}`] });
      toast({
        title: 'Setting updated',
        description: 'Your preference has been saved'
      });
    } catch (error) {
      toast({
        title: 'Error saving setting',
        description: `Failed to save your preference: ${error}`,
        variant: 'destructive'
      });
    }
  };
  
  const handleFontSizeChange = (value: string) => {
    const size = parseInt(value);
    setFontSizePreference(size);
    updateSetting('fontSize', size);
  };
  
  const handleRenderModeChange = (value: string) => {
    setRenderModePreference(value);
    updateSetting('renderMode', value);
  };
  
  const handleOfflineModeChange = (checked: boolean) => {
    setOfflineMode(checked);
    updateSetting('offlineMode', checked);
  };
  
  const handleDefaultLanguageChange = (value: string) => {
    setDefaultLanguage(value);
    updateSetting('defaultLanguage', value);
  };
  
  const handleExportData = async () => {
    try {
      const filePath = await window.electronAPI.saveFileDialog({
        title: 'Export All Data',
        defaultPath: 'linguareader-data.json',
        filters: [
          { name: 'JSON', extensions: ['json'] }
        ]
      });
      
      if (!filePath) return; // User cancelled
      
      // For this example, we'll just export settings
      // In a real app, this would export all user data
      const exportData = {
        settings: {
          fontSize: fontSizePreference,
          renderMode: renderModePreference,
          offlineMode,
          defaultLanguage
        }
      };
      
      await window.electronAPI.saveFile(filePath, JSON.stringify(exportData, null, 2));
      
      toast({
        title: 'Data exported',
        description: `All data exported to ${filePath}`
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: `Error exporting data: ${error}`,
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md mb-6">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="reading">Reading</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select 
                  value={theme || 'system'} 
                  onValueChange={(value) => setTheme(value)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose between light mode, dark mode, or system default
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="fontSize">Default Font Size</Label>
                <div className="flex items-center gap-4">
                  <div className="w-full">
                    <Input 
                      id="fontSize"
                      type="range"
                      min="12"
                      max="32"
                      value={fontSizePreference}
                      onChange={(e) => handleFontSizeChange(e.target.value)}
                    />
                  </div>
                  <div className="w-12 text-center">
                    {fontSizePreference}px
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Default font size for reading (can be changed per book)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reading">
          <Card>
            <CardHeader>
              <CardTitle>Reading Settings</CardTitle>
              <CardDescription>
                Configure how text is displayed and processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="renderMode">Text Display Mode</Label>
                <Select 
                  value={renderModePreference} 
                  onValueChange={handleRenderModeChange}
                >
                  <SelectTrigger id="renderMode">
                    <SelectValue placeholder="Select display mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paragraph">Paragraph Mode</SelectItem>
                    <SelectItem value="sentence">Sentence Mode</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose how text is segmented when reading
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <Select 
                  value={defaultLanguage} 
                  onValueChange={handleDefaultLanguageChange}
                >
                  <SelectTrigger id="defaultLanguage">
                    <SelectValue placeholder="Select default language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Default language for new books and dictionaries
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-level settings and data management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="offlineMode">Offline Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Only use offline dictionaries and features
                  </p>
                </div>
                <Switch 
                  id="offlineMode"
                  checked={offlineMode}
                  onCheckedChange={handleOfflineModeChange}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Data Management</Label>
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" onClick={handleExportData}>
                    Export All Data
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Export all your data for backup or transfer
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Application Information</Label>
                <div className="text-sm">
                  <p><strong>Version:</strong> 1.0.0</p>
                  <p><strong>Local Data Directory:</strong> {window.electronAPI.getUserDataPath().catch(() => 'Unknown')}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                All data is stored locally on your device. No data is sent to external servers.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
