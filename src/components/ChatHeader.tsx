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
    <header className="chat-header border-b border-border p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold neon-glow">
          OpenChat
        </h1>
      </div>

      {/* Search bar */}
      <div className="flex-1 max-w-md relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 chat-input"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {!user ? (
          <Button variant="outline" onClick={onLoginClick}>
            <LogIn className="w-4 h-4 mr-2" />
            Log In
          </Button>
        ) : (
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        )}
        
        <Button
          variant="outline"
          onClick={cycleTheme}
          title={`Current theme: ${theme.replace('theme-', '')}`}
        >
          <Palette className="w-4 h-4 mr-2" />
          {getThemeIcon()}
        </Button>
        
        <Button variant="outline" onClick={onDonateClick}>
          <Heart className="w-4 h-4 mr-2" />
          Donate
        </Button>
      </div>
    </header>
  );
};