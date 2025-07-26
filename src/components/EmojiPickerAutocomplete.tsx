import React, { useState, useEffect, useRef } from 'react';
import { searchEmojis, EmojiData } from '@/utils/emojiSystem';
import { Button } from '@/components/ui/button';

interface EmojiPickerAutocompleteProps {
  visible: boolean;
  query: string;
  position: { top: number; left: number };
  onSelect: (emoji: EmojiData) => void;
  onClose: () => void;
  selectedIndex: number;
  onHover: (index: number) => void;
}

export const EmojiPickerAutocomplete: React.FC<EmojiPickerAutocompleteProps> = ({
  visible,
  query,
  position,
  onSelect,
  onClose,
  selectedIndex,
  onHover,
}) => {
  const [suggestions, setSuggestions] = useState<EmojiData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query) {
      const results = searchEmojis(query, 8);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  useEffect(() => {
    // Handle click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  if (!visible || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-50 bg-popover border border-border rounded-lg shadow-lg p-2 max-w-xs"
      style={{
        top: position.top - 10,
        left: position.left,
        transform: 'translateY(-100%)',
      }}
    >
      <div className="text-xs text-muted-foreground mb-2 px-2">
        Emoji suggestions
      </div>
      <div className="space-y-1">
        {suggestions.map((emoji, index) => (
          <Button
            key={`${emoji.emoji}-${index}`}
            variant={index === selectedIndex ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start text-left h-8 px-2"
            onClick={() => onSelect(emoji)}
            onMouseEnter={() => onHover(index)}
          >
            <span className="text-lg mr-2">{emoji.emoji}</span>
            <span className="flex-1 truncate">:{emoji.name}:</span>
            {emoji.aliases.length > 1 && (
              <span className="text-xs text-muted-foreground ml-2">
                +{emoji.aliases.length - 1}
              </span>
            )}
          </Button>
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-2 px-2 text-center">
        ↑↓ to navigate • Enter to select • Esc to close
      </div>
    </div>
  );
};