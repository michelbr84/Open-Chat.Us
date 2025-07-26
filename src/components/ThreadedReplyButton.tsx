import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, ChevronRight } from 'lucide-react';

interface ThreadedReplyButtonProps {
  messageId: string;
  replyCount?: number;
  onStartReply: (messageId: string) => void;
  onToggleThread: (messageId: string) => void;
  isThreadOpen?: boolean;
  className?: string;
}

export const ThreadedReplyButton: React.FC<ThreadedReplyButtonProps> = ({
  messageId,
  replyCount = 0,
  onStartReply,
  onToggleThread,
  isThreadOpen = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onStartReply(messageId)}
        className="h-7 px-2 text-muted-foreground hover:text-foreground"
        title="Reply to this message"
      >
        <MessageSquare className="w-3.5 h-3.5" />
      </Button>
      
      {replyCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleThread(messageId)}
          className="h-7 px-2 text-muted-foreground hover:text-foreground flex items-center gap-1"
          title={`${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
        >
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isThreadOpen ? 'rotate-90' : ''}`} />
          <span className="text-xs">{replyCount}</span>
        </Button>
      )}
    </div>
  );
};