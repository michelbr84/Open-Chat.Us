import { useState } from 'react';
import { MessageCircle, ChevronDown, ChevronRight, Reply, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useThreadedMessages } from '@/hooks/useThreadedMessages';
import { MessageRenderer } from '@/components/MessageRenderer';

interface ThreadedMessageProps {
  message: {
    id: string;
    content: string;
    sender_id: string;
    sender_name: string;
    created_at: string;
    edited_at?: string;
    is_edited: boolean;
    reactions?: any[];
  };
  channelId?: string;
  onReactionAdd?: (messageId: string, emoji: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
}

export const ThreadedMessage = ({ 
  message, 
  channelId,
  onReactionAdd,
  onEdit,
  onDelete
}: ThreadedMessageProps) => {
  const { threads, threadMessages, expandedThreads, createThread, toggleThread, isLoading } = 
    useThreadedMessages(channelId);
  
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Find thread for this message
  const messageThread = threads.find(t => t.parent_message_id === message.id);
  const isExpanded = messageThread ? expandedThreads.has(messageThread.id) : false;
  const replies = messageThread ? threadMessages[messageThread.id] || [] : [];

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setIsSendingReply(true);
    try {
      await createThread(message.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
      
      // Auto-expand thread to show new reply
      if (messageThread && !isExpanded) {
        toggleThread(messageThread.id);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  return (
    <div className="space-y-2">
      {/* Main Message */}
      <Card className="p-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {message.sender_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{message.sender_name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </span>
              {message.is_edited && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  edited
                </Badge>
              )}
            </div>
            
            <MessageRenderer 
              content={message.content}
              className="text-sm"
            />
            
            {/* Message Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="h-6 px-2 text-xs"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
              
              {messageThread && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleThread(messageThread.id)}
                  className="h-6 px-2 text-xs"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 mr-1" />
                  ) : (
                    <ChevronRight className="h-3 w-3 mr-1" />
                  )}
                  {messageThread.reply_count} {messageThread.reply_count === 1 ? 'reply' : 'replies'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Reply Input */}
      {isReplying && (
        <Card className="p-3 ml-11 animate-fade-in">
          <div className="flex gap-2">
            <Input
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={isSendingReply}
            />
            <Button 
              onClick={handleReply}
              disabled={!replyContent.trim() || isSendingReply}
              size="sm"
            >
              {isSendingReply ? 'Sending...' : 'Reply'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setIsReplying(false)}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Thread Replies */}
      {messageThread && isExpanded && (
        <div className="ml-11 space-y-2 animate-fade-in">
          <Separator />
          
          {isLoading ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Loading replies...
            </div>
          ) : replies.length > 0 ? (
            <div className="space-y-3">
              {replies.map((reply) => (
                <Card key={reply.id} className="p-3 bg-muted/30">
                  <div className="flex items-start gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {reply.sender_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs">{reply.sender_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <MessageRenderer 
                        content={reply.content}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No replies yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};