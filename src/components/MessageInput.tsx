import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSecureMessageHandling } from '@/hooks/useSecureMessageHandling';
import { getOrCreateGuestId } from '@/utils/secureGuestId';
import { MentionSuggestions } from '@/components/MentionSuggestions';
import { EmojiPickerAutocomplete } from '@/components/EmojiPickerAutocomplete';
import { SlashCommandSuggestions } from '@/components/SlashCommandSuggestions';
import { FileUploadButton } from '@/components/FileUploadButton';
import { useMentionSearch } from '@/hooks/useMentionSearch';
import { useSlashCommands } from '@/hooks/useSlashCommands';
import { parseMentions, createMentionString } from '@/utils/mentionParser';
import { parseEmojiShortcodes, extractEmojiShortcodes } from '@/utils/emojiSystem';

interface MessageInputProps {
  onSendMessage: (message: string, mentions?: any[], attachments?: any[]) => void;
  disabled?: boolean;
  placeholder?: string;
  onlineUsers?: Array<{ name: string; isMember: boolean; key: string }>;
  mentionToAdd?: string;
  onMentionAdded?: () => void;
  onSlashCommand?: (command: string) => void;
}

export const MessageInput = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type a message...",
  onlineUsers = [],
  mentionToAdd,
  onMentionAdded,
  onSlashCommand
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  // Emoji autocomplete state
  const [showEmojiSuggestions, setShowEmojiSuggestions] = useState(false);
  const [emojiQuery, setEmojiQuery] = useState('');
  const [emojiStartIndex, setEmojiStartIndex] = useState(-1);
  const [selectedEmojiIndex, setSelectedEmojiIndex] = useState(0);
  
  // Slash command state
  const [showSlashSuggestions, setShowSlashSuggestions] = useState(false);
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  
  // File attachments
  const [attachments, setAttachments] = useState<any[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { validateAndSanitizeMessage } = useSecureMessageHandling();
  
  const { suggestions, searchUsers, clearSuggestions, isLoading } = useMentionSearch(onlineUsers);
  const { executeSlashCommand, getSuggestions: getSlashSuggestions, isSlashCommand } = useSlashCommands();
  
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

  // Handle emoji detection and suggestions
  const detectEmoji = (text: string, cursorPos: number) => {
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastColonIndex = textBeforeCursor.lastIndexOf(':');
    
    if (lastColonIndex === -1) {
      setShowEmojiSuggestions(false);
      setEmojiQuery('');
      return;
    }
    
    // Check if there's a space between : and cursor (invalid emoji)
    const textAfterColon = textBeforeCursor.slice(lastColonIndex + 1);
    if (textAfterColon.includes(' ') || textAfterColon.includes(':')) {
      setShowEmojiSuggestions(false);
      setEmojiQuery('');
      return;
    }
    
    // Valid emoji shortcode in progress
    setEmojiStartIndex(lastColonIndex);
    setEmojiQuery(textAfterColon);
    setShowEmojiSuggestions(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;
    const newCursorPosition = e.target.selectionStart || 0;
    
    setMessage(newMessage);
    setCursorPosition(newCursorPosition);
    
    // Check for slash commands
    if (newMessage.startsWith('/')) {
      const slashSuggestions = getSlashSuggestions(newMessage);
      setShowSlashSuggestions(slashSuggestions.length > 0);
      setShowMentionSuggestions(false);
      setShowEmojiSuggestions(false);
    } else {
      setShowSlashSuggestions(false);
      // Check for mentions
      detectMention(newMessage, newCursorPosition);
      // Check for emoji shortcodes
      detectEmoji(newMessage, newCursorPosition);
    }
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

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage && attachments.length === 0) {
      toast({
        title: "Empty message",
        description: "Please enter a message or attach a file to send.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if it's a slash command
    if (isSlashCommand(trimmedMessage)) {
      const result = await executeSlashCommand(trimmedMessage);
      if (result) {
        onSendMessage(result);
        setMessage('');
        setAttachments([]);
        return;
      }
    }
    
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      toast({
        title: "Message too long",
        description: `Message must be ${MAX_MESSAGE_LENGTH} characters or less.`,
        variant: "destructive",
      });
      return;
    }

    // Enhanced content validation with auto-moderation
    if (trimmedMessage) {
      const validation = await validateAndSanitizeMessage(trimmedMessage);
      if (!validation.isValid) {
        return;
      }
      
      // Use the sanitized message for further processing  
      const { content: emojiProcessed } = parseEmojiShortcodes(validation.sanitized);
      const { content, mentions } = parseMentions(emojiProcessed);
      
      if (!disabled) {
        onSendMessage(content, mentions, attachments);
        setMessage('');
        setAttachments([]);
        setShowMentionSuggestions(false);
        setShowEmojiSuggestions(false);
        setShowSlashSuggestions(false);
        clearSuggestions();
      }
    } else if (attachments.length > 0) {
      // Send just attachments
      if (!disabled) {
        onSendMessage('', [], attachments);
        setMessage('');
        setAttachments([]);
        setShowMentionSuggestions(false);
        setShowEmojiSuggestions(false);
        setShowSlashSuggestions(false);
        clearSuggestions();
      }
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: { emoji: string; name: string }) => {
    if (emojiStartIndex === -1) return;
    
    const beforeEmoji = message.slice(0, emojiStartIndex);
    const afterCursor = message.slice(cursorPosition);
    
    const newMessage = beforeEmoji + emoji.emoji + ' ' + afterCursor;
    const newCursorPosition = beforeEmoji.length + emoji.emoji.length + 1;
    
    setMessage(newMessage);
    setShowEmojiSuggestions(false);
    setEmojiQuery('');
    setEmojiStartIndex(-1);
    
    // Focus back to input and set cursor position
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle emoji suggestions
    if (showEmojiSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedEmojiIndex(prev => 
          prev < 7 ? prev + 1 : 0 // Max 8 emoji suggestions
        );
        return;
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedEmojiIndex(prev => 
          prev > 0 ? prev - 1 : 7
        );
        return;
      }
      
      if (e.key === 'Enter' && selectedEmojiIndex >= 0) {
        e.preventDefault();
        // We'll need to get the emoji from the autocomplete component
        return;
      }
      
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowEmojiSuggestions(false);
        setEmojiQuery('');
        return;
      }
    }
    
    // Handle mention suggestions
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

  // Calculate emoji suggestion position
  const getEmojiSuggestionPosition = () => {
    if (!inputRef.current || emojiStartIndex === -1) {
      return { top: 0, left: 0 };
    }
    
    const input = inputRef.current;
    const rect = input.getBoundingClientRect();
    
    // Approximate character width
    const charWidth = 8;
    const emojiOffset = emojiStartIndex * charWidth;
    
    return {
      top: rect.top - 10, // Position above input
      left: rect.left + emojiOffset + 12 // Add padding offset
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
            placeholder={disabled ? placeholder : "Type a message... (Use @bot for AI help)"}
            disabled={disabled}
            className="chat-input pr-16 h-12 md:h-10 text-base md:text-sm"
            maxLength={MAX_MESSAGE_LENGTH}
            aria-label="Type your message. Use @bot to chat with AI, @ to mention users"
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
        <div className="flex items-center gap-2">
          <FileUploadButton
            onFileUploaded={(file) => {
              setAttachments(prev => [...prev, file]);
              toast({
                title: "File attached",
                description: `${file.name} has been attached to your message.`,
              });
            }}
            disabled={disabled}
          />
          <Button
            onClick={handleSend}
            disabled={(!message.trim() && attachments.length === 0) || disabled || message.length > MAX_MESSAGE_LENGTH}
            className="h-12 md:h-10 px-4 md:px-3 min-w-[48px]"
            aria-label="Send message"
          >
            <Send className="w-5 h-5 md:w-4 md:h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
      
      {/* File attachments preview */}
      {attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center gap-2 px-2 py-1 bg-muted rounded text-sm">
              <span className="truncate max-w-[200px]">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* Mention Suggestions */}
      <MentionSuggestions
        suggestions={suggestions}
        selectedIndex={selectedSuggestionIndex}
        onSelect={handleMentionSelect}
        onHover={setSelectedSuggestionIndex}
        position={getSuggestionPosition()}
        visible={showMentionSuggestions && suggestions.length > 0}
      />
      
      {/* Emoji Autocomplete */}
      <EmojiPickerAutocomplete
        visible={showEmojiSuggestions}
        query={emojiQuery}
        position={getEmojiSuggestionPosition()}
        onSelect={handleEmojiSelect}
        onClose={() => {
          setShowEmojiSuggestions(false);
          setEmojiQuery('');
        }}
        selectedIndex={selectedEmojiIndex}
        onHover={setSelectedEmojiIndex}
      />
      
      {/* Slash Command Suggestions */}
      <SlashCommandSuggestions
        suggestions={getSlashSuggestions(message)}
        onSelect={(command) => {
          setMessage(command + ' ');
          setShowSlashSuggestions(false);
          if (inputRef.current) {
            inputRef.current.focus();
            setTimeout(() => {
              const newPos = command.length + 1;
              inputRef.current?.setSelectionRange(newPos, newPos);
            }, 0);
          }
        }}
        isVisible={showSlashSuggestions}
      />
    </div>
  );
};