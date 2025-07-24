import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UnreadMessageIndicatorProps {
  onOpenPrivateChat: (senderId: string, senderName: string) => void;
}

export const UnreadMessageIndicator = ({ onOpenPrivateChat }: UnreadMessageIndicatorProps) => {
  const { unreadCount, unreadConversations, markMessagesAsRead, loading } = useUnreadMessages();

  if (loading || unreadCount === 0) {
    return (
      <Button variant="outline" size="sm" className="relative">
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:inline ml-2">Messages</span>
      </Button>
    );
  }

  const handleConversationClick = async (senderId: string, senderName: string) => {
    await markMessagesAsRead(senderId);
    onOpenPrivateChat(senderId, senderName);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">Messages</span>
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 min-w-[20px] flex items-center justify-center text-xs px-1"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm">
            Unread Messages ({unreadCount})
          </h3>
        </div>
        <ScrollArea className="max-h-80">
          <div className="p-2">
            {unreadConversations.map((conversation) => (
              <Button
                key={conversation.sender_id}
                variant="ghost"
                className="w-full justify-start p-3 h-auto mb-1"
                onClick={() => handleConversationClick(conversation.sender_id, conversation.sender_name)}
              >
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-medium text-sm truncate">
                      {conversation.sender_name}
                    </span>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {conversation.unread_count}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-left truncate w-full">
                    {conversation.latest_message}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDistanceToNow(new Date(conversation.latest_message_time), { addSuffix: true })}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};