import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpButton } from '@/components/HelpButton';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useUserPresence } from '@/hooks/useUserPresence';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Search, Palette, LogIn, LogOut, Heart, X, Circle, Bookmark, Bell, User, Download, Settings, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { UnreadMessageIndicator } from '@/components/UnreadMessageIndicator';
import { NotificationCenter } from '@/components/NotificationCenter';
import { StatusUpdateModal } from '@/components/StatusUpdateModal';
import { UserPresenceIndicator } from '@/components/UserPresenceIndicator';
import { BotTestButton } from '@/components/BotTestButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface ChatHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLoginClick: () => void;
  onDonateClick: () => void;
  onOpenPrivateChat: (senderId: string, senderName: string) => void;
  onShowBookmarks?: () => void;
  onExportChat?: () => void;
}

export const ChatHeader = ({
  searchQuery,
  onSearchChange,
  onLoginClick,
  onDonateClick,
  onOpenPrivateChat,
  onShowBookmarks,
  onExportChat
}: ChatHeaderProps) => {
  const { cycleTheme, theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getOnlineCount } = useUserPresence();
  const { permission, requestPermission } = useNotifications();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

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
        <div className="flex items-center gap-2">
          <h1 className="text-lg md:text-xl font-bold neon-glow">
            OpenChat
          </h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
            <span>{getOnlineCount()} online</span>
          </div>
        </div>

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
        {/* Notification Permission Toggle */}
        {permission === 'default' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={requestPermission}
            className="min-h-[40px] px-3"
            title="Enable browser notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="sr-only">Enable Notifications</span>
          </Button>
        )}

        {user && (
          <>
            <NotificationCenter />
            {onShowBookmarks && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onShowBookmarks}
                className="min-h-[40px] px-3"
                title="View bookmarked messages"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Bookmarks</span>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2 min-h-[40px]">
                  <UserPresenceIndicator userId={user.id} userName={user.email} />
                  <span className="hidden sm:inline-block max-w-[100px] truncate">
                    {user.identities?.[0]?.identity_data?.full_name || user.email?.split('@')[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsStatusModalOpen(true)}>
                  <Circle className="mr-2 h-4 w-4 fill-current" />
                  <span>Set Status</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/achievements')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Achievements</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {onExportChat && (
                  <>
                    <DropdownMenuItem onClick={onExportChat}>
                      <Download className="mr-2 h-4 w-4" />
                      <span>Export Chat</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <UnreadMessageIndicator onOpenPrivateChat={onOpenPrivateChat} />
          </>
        )}



        {!user && (
          <Button variant="outline" onClick={onLoginClick} className="min-h-[40px] px-4">
            <LogIn className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Log In</span>
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

        <BotTestButton />

        <Button variant="outline" onClick={onDonateClick} className="min-h-[40px] px-4">
          <Heart className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Donate</span>
        </Button>
      </div>

      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />
    </header>
  );
};