import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { BookmarkX, Search, Calendar, MessageSquare, ExternalLink } from 'lucide-react';
import { useMessageBookmarks } from '@/hooks/useMessageBookmarks';
import { MessageRenderer } from '@/components/MessageRenderer';
import { formatDistanceToNow } from 'date-fns';

interface BookmarksPanelProps {
  onClose?: () => void;
  onMessageClick?: (messageId: string) => void;
}

export const BookmarksPanel = ({ onClose, onMessageClick }: BookmarksPanelProps) => {
  const { bookmarks, isLoading, removeBookmark } = useMessageBookmarks();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter bookmarks based on search query
  const filteredBookmarks = bookmarks.filter(bookmark =>
    bookmark.message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.message.sender_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveBookmark = async (messageId: string) => {
    await removeBookmark(messageId);
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <Card className="w-full max-w-2xl h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Bookmarked Messages</h2>
          <Badge variant="secondary">
            {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
          </Badge>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">Loading bookmarks...</div>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground mb-2" />
            <div className="text-sm text-muted-foreground">
              {searchQuery ? 'No bookmarks match your search' : 'No bookmarked messages yet'}
            </div>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="p-4 hover:bg-muted/50 transition-colors">
                {/* Message Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">{bookmark.message.sender_name}</span>
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(bookmark.message.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {onMessageClick && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMessageClick(bookmark.message_id)}
                        className="h-6 w-6 p-0"
                        title="Go to message"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBookmark(bookmark.message_id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      title="Remove bookmark"
                    >
                      <BookmarkX className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Message Content */}
                <div className="text-sm">
                  <MessageRenderer 
                    content={bookmark.message.content}
                    mentions={bookmark.message.mentions || []}
                    className="text-sm"
                  />
                </div>

                {/* Bookmark Date */}
                <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                  Bookmarked {formatDate(bookmark.created_at)}
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {onClose && (
        <>
          <Separator />
          <div className="p-4">
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};