import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useMessageBookmarks } from '@/hooks/useMessageBookmarks';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  messageId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
  showLabel?: boolean;
}

export const BookmarkButton = ({ 
  messageId, 
  className, 
  size = 'sm',
  variant = 'ghost',
  showLabel = false 
}: BookmarkButtonProps) => {
  const { isBookmarked, toggleBookmark } = useMessageBookmarks();
  const [isLoading, setIsLoading] = useState(false);
  
  const bookmarked = isBookmarked(messageId);

  const handleToggle = async () => {
    setIsLoading(true);
    await toggleBookmark(messageId);
    setIsLoading(false);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "transition-all duration-200",
        bookmarked && variant === 'ghost' && "text-yellow-600 hover:text-yellow-700",
        className
      )}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark message"}
    >
      {bookmarked ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      {showLabel && (
        <span className="ml-1">
          {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      )}
    </Button>
  );
};