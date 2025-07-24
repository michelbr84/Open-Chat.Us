import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Flag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { EmojiReactions } from './EmojiReactions';
import { MessageActions } from './MessageActions';

interface Message {
  id: string;
  content: string;
  sender_name: string;
  sender_id: string | null;
  created_at: string;
}

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  guestName?: string;
  reactions?: Record<string, { count: number; users: string[]; hasReacted: boolean }>;
  onReact?: (messageId: string, emoji: string) => void;
  onReport?: (messageId: string, reason: string, details?: string) => void;
}

export const ChatMessage = ({ 
  message, 
  isOwn, 
  guestName,
  reactions = {},
  onReact,
  onReport
}: ChatMessageProps) => {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getDisplayName = () => {
    if (message.sender_id && user?.id === message.sender_id) {
      return 'You';
    }
    return message.sender_name;
  };

  const getAvatar = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const handleReaction = (emoji: string) => {
    onReact?.(message.id, emoji);
  };

  const handleReport = (reason: string, details?: string) => {
    onReport?.(message.id, reason, details);
  };

  const hasReactions = Object.values(reactions).some(r => r.count > 0);

  return (
    <div 
      className={`group flex gap-3 mb-4 animate-fade-in transition-all duration-200 ${
        isOwn ? 'flex-row-reverse' : 'flex-row'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
        {getAvatar()}
      </div>

      {/* Message content */}
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col relative`}>
        <div className={`
          px-4 py-2 rounded-lg relative group/bubble
          ${isOwn ? 'chat-bubble-own rounded-br-sm' : 'chat-bubble-other rounded-bl-sm'}
          ${isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'}
          neon-border transition-all duration-200 hover:shadow-lg
        `}>
          {/* Message meta */}
          <div className="flex items-center gap-2 mb-1 text-xs opacity-75">
            <span className="font-medium">{getDisplayName()}</span>
            <span>{formatTime(message.created_at)}</span>
          </div>
          
          {/* Message content */}
          <div className="text-sm leading-relaxed break-words">
            {message.content}
          </div>

          {/* Hover actions */}
          <div className={`
            absolute ${isOwn ? 'left-0 top-2 -translate-x-full -ml-2' : 'right-0 top-2 translate-x-full mr-2'}
            flex items-center gap-1 transition-all duration-200
            ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
          `}>
            <EmojiReactions
              messageId={message.id}
              reactions={reactions}
              onReact={handleReaction}
              compact
            />
            <MessageActions
              messageId={message.id}
              isOwn={isOwn}
              content={message.content}
              onReport={!isOwn ? handleReport : undefined}
            />
          </div>
        </div>

        {/* Reactions display */}
        {hasReactions && (
          <div className="mt-1 flex items-center gap-1">
            <EmojiReactions
              messageId={message.id}
              reactions={reactions}
              onReact={handleReaction}
            />
          </div>
        )}

        {/* Legacy action buttons (fallback for mobile) */}
        <div className={`
          flex items-center gap-1 mt-1 transition-opacity duration-200
          ${isHovered ? 'opacity-0 md:hidden' : 'opacity-100 md:opacity-0'}
        `}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReaction('❤️')}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Heart className="w-3 h-3 mr-1" />
            Like
          </Button>
          
          {!isOwn && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReport('inappropriate')}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-orange-500 transition-colors"
            >
              <Flag className="w-3 h-3 mr-1" />
              Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};