import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Search, Palette, LogIn, LogOut, Heart, X } from 'lucide-react';

interface ChatHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLoginClick: () => void;
  onDonateClick: () => void;
}

export const ChatHeader = ({ 
  searchQuery, 
  onSearchChange, 
  onLoginClick, 
  onDonateClick 
}: ChatHeaderProps) => {
  const { cycleTheme, theme } = useTheme();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'theme-dark': return '🌙';
      case 'theme-light': return '☀️';
      case 'theme-neon': return '⚡';
      default: return '🎨';
    }
  };

  return (
    <header className="chat-header border-b border-border p-3 md:p-4 flex flex-col md:flex-row items-center gap-3 md:gap-4">
      {/* Top row: Title and theme toggle */}
      <div className="flex items-center justify-between w-full md:w-auto">
        <h1 className="text-lg md:text-xl font-bold neon-glow">
          OpenChat
        </h1>
        
        {/* Mobile theme toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={cycleTheme}
          title={`Current theme: ${theme.replace('theme-', '')}`}
          className="md:hidden"
        >
          <Palette className="w-4 h-4" />
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex-1 w-full md:max-w-md relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 chat-input h-10 text-base"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
        {!user ? (
          <Button variant="outline" onClick={onLoginClick} className="min-h-[40px] px-4">
            <LogIn className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Log In</span>
          </Button>
        ) : (
          <Button variant="outline" onClick={handleLogout} className="min-h-[40px] px-4">
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
        )}
        
        {/* Desktop theme toggle */}
        <Button
          variant="outline"
          onClick={cycleTheme}
          title={`Current theme: ${theme.replace('theme-', '')}`}
          className="hidden md:flex min-h-[40px]"
        >
          <Palette className="w-4 h-4 mr-2" />
          {getThemeIcon()}
        </Button>
        
        <Button variant="outline" onClick={onDonateClick} className="min-h-[40px] px-4">
          <Heart className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Donate</span>
        </Button>
      </div>
    </header>
  );
};