import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Flag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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
}

export const ChatMessage = ({ message, isOwn, guestName }: ChatMessageProps) => {
  const { user } = useAuth();
  const [reacted, setReacted] = useState(false);
  const [reported, setReported] = useState(false);

  const handleReaction = () => {
    setReacted(!reacted);
    // TODO: In a real app, this would send to backend
  };

  const handleReport = () => {
    setReported(true);
    // TODO: In a real app, this would send to backend
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
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

  return (
    <div className={`flex gap-3 mb-4 animate-fade-in ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold flex-shrink-0">
        {getAvatar()}
      </div>

      {/* Message bubble */}
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`
          px-4 py-2 rounded-lg 
          ${isOwn ? 'chat-bubble-own' : 'chat-bubble-other'}
          ${isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'}
          neon-border
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
        </div>

        {/* Message actions */}
        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReaction}
            className={`h-6 px-2 text-xs ${reacted ? 'text-red-500' : 'text-muted-foreground'}`}
          >
            <Heart className={`w-3 h-3 mr-1 ${reacted ? 'fill-current' : ''}`} />
            {reacted ? 'Liked' : 'Like'}
          </Button>
          
          {!isOwn && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReport}
              className={`h-6 px-2 text-xs ${reported ? 'text-orange-500' : 'text-muted-foreground'}`}
              disabled={reported}
            >
              <Flag className="w-3 h-3 mr-1" />
              {reported ? 'Reported' : 'Report'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};