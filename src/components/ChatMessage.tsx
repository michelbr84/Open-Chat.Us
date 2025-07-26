import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Flag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { EmojiReactions } from './EmojiReactions';
import { MessageActions } from './MessageActions';
import { MessageRenderer } from './MessageRenderer';

interface Message {
  id: string;
  content: string;
  sender_name: string;
  sender_id: string | null;
  created_at: string;
  edited_at?: string | null;
  is_deleted?: boolean;
  mentions?: any[] | null;
}

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  guestName?: string;
  reactions?: Record<string, { count: number; users: string[]; hasReacted: boolean }>;
  onReact?: (messageId: string, emoji: string) => void;
  onReport?: (messageId: string, reason: string, details?: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onPrivateMessage?: (senderId: string, senderName: string) => void;
}

export const ChatMessage = ({ 
  message, 
  isOwn, 
  guestName,
  reactions = {},
  onReact,
  onReport,
  onEdit,
  onDelete,
  onReply,
  onPrivateMessage
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

  // Check if current user is mentioned in this message
  const isMentioned = user && message.mentions && message.mentions.some((mention: any) => 
    mention.user_id === user.id || mention.username === user.user_metadata?.name || mention.username === user.email
  );

  const hasReactions = Object.values(reactions).some(r => r.count > 0);

  return (
    <div 
      data-message-id={message.id}
      className={`group flex gap-2 md:gap-3 mb-3 md:mb-4 animate-fade-in transition-all duration-200 ${
        isOwn ? 'flex-row-reverse' : 'flex-row'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
    >
      {/* Avatar */}
      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
        {getAvatar()}
      </div>

      {/* Message content */}
      <div className={`max-w-[80%] md:max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col relative`}>
        <div className={`
          px-3 py-2 md:px-4 md:py-2 rounded-lg relative group/bubble
          ${isOwn ? 'chat-bubble-own rounded-br-sm' : 'chat-bubble-other rounded-bl-sm'}
          ${isMentioned ? 'ring-1 ring-primary/30 bg-primary/5' : ''}
          neon-border transition-all duration-200 hover:shadow-lg
        `}>
          {/* Message meta */}
          <div className="flex items-center gap-2 mb-1 text-xs opacity-75">
            <span className="font-medium">{getDisplayName()}</span>
            <span>{formatTime(message.created_at)}</span>
          </div>
          
          {/* Message content */}
          {message.is_deleted ? (
            <div className="text-sm italic text-muted-foreground">
              This message was deleted
            </div>
          ) : (
            <MessageRenderer 
              content={message.content} 
              mentions={message.mentions || []} 
            />
          )}
          {message.edited_at && (
            <span className="text-xs text-muted-foreground ml-2 italic">
              (edited)
            </span>
          )}

          {/* Hover actions */}
          <div className={`
            absolute ${isOwn ? 'left-0 top-1 md:top-2 -translate-x-full -ml-1 md:-ml-2' : 'right-0 top-1 md:top-2 translate-x-full mr-1 md:mr-2'}
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
              senderName={message.sender_name}
              senderId={message.sender_id}
              onReport={!isOwn ? handleReport : undefined}
              onEdit={isOwn && onEdit ? (newContent) => onEdit(message.id, newContent) : undefined}
              onDelete={isOwn && onDelete ? () => onDelete(message.id) : undefined}
              onReply={onReply ? () => onReply(message.id) : undefined}
              onPrivateMessage={!isOwn && onPrivateMessage ? onPrivateMessage : undefined}
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

        {/* Mobile action buttons (always visible on mobile) */}
        <div className={`
          flex items-center gap-1 mt-1 transition-opacity duration-200
          ${isHovered ? 'md:opacity-0' : 'opacity-100'}
          md:hidden
        `}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReaction('❤️')}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Heart className="w-3 h-3 mr-1" />
            Like
          </Button>
          
          {!isOwn && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReport('inappropriate')}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-orange-500 transition-colors"
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