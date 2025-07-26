import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sanitizeMessageContent, containsInappropriateContent, isContentValidationRateLimited } from '@/utils/sanitization';
import { getOrCreateGuestId } from '@/utils/secureGuestId';
import { MentionSuggestions } from '@/components/MentionSuggestions';
import { useMentionSearch } from '@/hooks/useMentionSearch';
import { parseMentions, createMentionString } from '@/utils/mentionParser';

interface MessageInputProps {
  onSendMessage: (message: string, mentions?: any[]) => void;
  disabled?: boolean;
  placeholder?: string;
  onlineUsers?: Array<{ name: string; isMember: boolean; key: string }>;
  mentionToAdd?: string;
  onMentionAdded?: () => void;
}

export const MessageInput = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type a message...",
  onlineUsers = [],
  mentionToAdd,
  onMentionAdded
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { suggestions, searchUsers, clearSuggestions, isLoading } = useMentionSearch(onlineUsers);
  
  const MAX_MESSAGE_LENGTH = 1000;

  // Handle mention detection and suggestions
  const detectMention = (text: string, cursorPos: number) => {
    // Find the last @ symbol before the cursor
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex === -1) {
      setShowMentionSuggestions(false);
      clearSuggestions();
      return;
    }
    
    // Check if there's a space between @ and cursor (invalid mention)
    const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
    if (textAfterAt.includes(' ')) {
      setShowMentionSuggestions(false);
      clearSuggestions();
      return;
    }
    
    // Valid mention in progress
    setMentionStartIndex(lastAtIndex);
    setShowMentionSuggestions(true);
    searchUsers(textAfterAt);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;
    const newCursorPosition = e.target.selectionStart || 0;
    
    setMessage(newMessage);
    setCursorPosition(newCursorPosition);
    
    // Check for mentions
    detectMention(newMessage, newCursorPosition);
  };

  const handleMentionSelect = (user: { name: string; id: string }) => {
    if (mentionStartIndex === -1) return;
    
    const beforeMention = message.slice(0, mentionStartIndex);
    const afterCursor = message.slice(cursorPosition);
    const mentionText = createMentionString(user.name);
    
    const newMessage = beforeMention + mentionText + ' ' + afterCursor;
    const newCursorPosition = beforeMention.length + mentionText.length + 1;
    
    setMessage(newMessage);
    setShowMentionSuggestions(false);
    clearSuggestions();
    setMentionStartIndex(-1);
    
    // Focus back to input and set cursor position
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage) {
      toast({
        title: "Empty message",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }
    
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      toast({
        title: "Message too long",
        description: `Message must be ${MAX_MESSAGE_LENGTH} characters or less.`,
        variant: "destructive",
      });
      return;
    }

    // Rate limiting check
    const guestId = getOrCreateGuestId();
    if (isContentValidationRateLimited(guestId)) {
      toast({
        title: "Too many messages",
        description: "Please wait before sending another message.",
        variant: "destructive",
      });
      return;
    }

    // Content sanitization and validation
    const sanitizedMessage = sanitizeMessageContent(trimmedMessage);
    
    if (!sanitizedMessage) {
      toast({
        title: "Invalid message",
        description: "Message contains prohibited content.",
        variant: "destructive",
      });
      return;
    }

    if (containsInappropriateContent(sanitizedMessage)) {
      toast({
        title: "Inappropriate content",
        description: "Message contains content that is not allowed.",
        variant: "destructive",
      });
      return;
    }
    
    if (!disabled) {
      // Parse mentions from the message
      const { content, mentions } = parseMentions(sanitizedMessage);
      onSendMessage(content, mentions);
      setMessage('');
      setShowMentionSuggestions(false);
      clearSuggestions();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentionSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        return;
      }
      
      if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        handleMentionSelect(suggestions[selectedSuggestionIndex]);
        return;
      }
      
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentionSuggestions(false);
        clearSuggestions();
        return;
      }
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Update cursor position tracking
  const handleCursorChange = () => {
    if (inputRef.current) {
      const newCursorPosition = inputRef.current.selectionStart || 0;
      setCursorPosition(newCursorPosition);
      detectMention(message, newCursorPosition);
    }
  };
  
  // Reset suggestion index when suggestions change
  useEffect(() => {
    setSelectedSuggestionIndex(0);
  }, [suggestions]);
  
  // Handle external mention addition
  useEffect(() => {
    if (mentionToAdd) {
      const mentionText = createMentionString(mentionToAdd);
      const newMessage = message ? `${message} ${mentionText} ` : `${mentionText} `;
      setMessage(newMessage);
      onMentionAdded?.();
      
      // Focus the input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newMessage.length, newMessage.length);
        }
      }, 0);
    }
  }, [mentionToAdd, message, onMentionAdded]);
  
  // Calculate suggestion position
  const getSuggestionPosition = () => {
    if (!inputRef.current || mentionStartIndex === -1) {
      return { top: 0, left: 0 };
    }
    
    const input = inputRef.current;
    const rect = input.getBoundingClientRect();
    
    // Approximate character width (this is rough, but works for most cases)
    const charWidth = 8;
    const mentionOffset = mentionStartIndex * charWidth;
    
    return {
      top: rect.top - 10, // Position above input
      left: rect.left + mentionOffset + 12 // Add padding offset
    };
  };

  const remainingChars = MAX_MESSAGE_LENGTH - message.length;
  const isNearLimit = remainingChars <= 100;
  
  return (
    <div className="border-t border-border p-3 md:p-4 relative">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onClick={handleCursorChange}
            onKeyUp={handleCursorChange}
            placeholder={placeholder}
            disabled={disabled}
            className="chat-input pr-16 h-12 md:h-10 text-base md:text-sm"
            maxLength={MAX_MESSAGE_LENGTH}
            aria-label="Type your message. Use @ to mention users"
            aria-describedby={isNearLimit ? "char-count" : undefined}
            autoComplete="off"
          />
          {isNearLimit && (
            <div 
              id="char-count"
              className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${
                remainingChars <= 50 ? 'text-destructive' : 'text-muted-foreground'
              }`}
              aria-live="polite"
            >
              {remainingChars}
            </div>
          )}
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || message.length > MAX_MESSAGE_LENGTH}
          className="h-12 md:h-10 px-4 md:px-3 min-w-[48px]"
          aria-label="Send message"
        >
          <Send className="w-5 h-5 md:w-4 md:h-4" aria-hidden="true" />
        </Button>
      </div>
      
      {/* Mention Suggestions */}
      <MentionSuggestions
        suggestions={suggestions}
        selectedIndex={selectedSuggestionIndex}
        onSelect={handleMentionSelect}
        onHover={setSelectedSuggestionIndex}
        position={getSuggestionPosition()}
        visible={showMentionSuggestions && suggestions.length > 0}
      />
    </div>
  );
};