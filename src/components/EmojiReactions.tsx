import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Smile } from 'lucide-react';

const COMMON_EMOJIS = [
  '❤️', '👍', '👎', '😂', '😢', '😮', '😡', '🎉', '🔥', '💯',
  '👏', '✨', '💪', '🙌', '👌', '🤝', '💝', '🌟', '⚡', '💎'
];

interface EmojiReactionsProps {
  messageId: string;
  reactions?: Record<string, { count: number; users: string[]; hasReacted: boolean }>;
  onReact: (emoji: string) => void;
  compact?: boolean;
}

export const EmojiReactions = ({ 
  messageId, 
  reactions = {}, 
  onReact, 
  compact = false 
}: EmojiReactionsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    onReact(emoji);
    setIsOpen(false);
  };

  const totalReactions = Object.values(reactions).reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Existing reactions */}
      {Object.entries(reactions).map(([emoji, data]) => (
        data.count > 0 && (
          <Button
            key={emoji}
            variant={data.hasReacted ? "default" : "outline"}
            size="sm"
            onClick={() => onReact(emoji)}
            className={`
              h-6 px-2 text-xs transition-all duration-200 hover:scale-105
              ${data.hasReacted ? 'bg-primary/20 border-primary' : 'hover:bg-muted'}
              ${compact ? 'min-w-[2rem]' : 'min-w-[2.5rem]'}`}
          >
            <span className="mr-1">{emoji}</span>
            {!compact && <span className="text-xs">{data.count}</span>}
          </Button>
        )
      ))}

      {/* Add reaction button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-muted"
            title="Add reaction"
          >
            <Smile className="w-3 h-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          <div className="grid grid-cols-10 gap-1">
            {COMMON_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => handleEmojiClick(emoji)}
                className="h-8 w-8 p-0 hover:bg-muted transition-colors duration-150"
                title={`React with ${emoji}`}
              >
                <span className="text-lg">{emoji}</span>
              </Button>
            ))}
          </div>
          
          {totalReactions > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                {totalReactions} reaction{totalReactions !== 1 ? 's' : ''} on this message
              </p>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};
