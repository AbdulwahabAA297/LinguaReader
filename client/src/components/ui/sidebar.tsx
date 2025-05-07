import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface SidebarProps {
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export function Sidebar({ items }: SidebarProps) {
  const [location] = useLocation();
  
  return (
    <div className="h-screen w-16 md:w-64 bg-background border-r flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-lg font-bold hidden md:block">LinguaReader</h1>
      </div>
      <div className="flex flex-col flex-1 p-2">
        {items.map((item) => (
          <Link 
            key={item.href} 
            to={item.href}
            className={cn(
              "flex items-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              location === item.href 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5 mr-2" />
            <span className="hidden md:inline-block">{item.name}</span>
          </Link>
        ))}
      </div>
      <div className="p-4 border-t text-xs text-muted-foreground hidden md:block">
        <p>LinguaReader v1.0.0</p>
        <p>©2023 All rights reserved</p>
      </div>
    </div>
  );
}
