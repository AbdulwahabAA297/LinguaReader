import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Dashboard from "@/pages/Dashboard";
import Library from "@/pages/Library";
import Reader from "@/pages/Reader";
import Vocabulary from "@/pages/Vocabulary";
import FlashcardSession from "@/pages/FlashcardSession";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import { Sidebar } from "@/components/ui/sidebar";
import { 
  BookOpen, 
  Library as LibraryIcon, 
  Home, 
  BookMarked, 
  Settings as SettingsIcon 
} from "lucide-react";

function Navigation() {
  const [location] = useLocation();
  
  // Don't show sidebar in reader view for more screen space
  if (location.startsWith('/read/')) {
    return null;
  }
  
  const items = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Library', href: '/library', icon: LibraryIcon },
    { name: 'Vocabulary', href: '/vocabulary', icon: BookOpen },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ];
  
  return (
    <Sidebar items={items} />
  );
}

function Router() {
  return (
    <div className="flex h-screen">
      <Navigation />
      <div className="flex-1 overflow-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/library" component={Library} />
          <Route path="/read/:id" component={Reader} />
          <Route path="/vocabulary" component={Vocabulary} />
          <Route path="/flashcards" component={FlashcardSession} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
