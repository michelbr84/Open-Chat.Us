import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import logger from '@/utils/logger';
import { useSecureMessageHandling } from '@/hooks/useSecureMessageHandling';
import { useMentionSearch } from '@/hooks/useMentionSearch';
import { useSlashCommands } from '@/hooks/useSlashCommands';
import { useFileUpload } from '@/hooks/useFileUpload';
import { parseMentions, createMentionString } from '@/utils/mentionParser';
import { parseEmojiShortcodes } from '@/utils/emojiSystem';

export const MAX_MESSAGE_LENGTH = 1000;

interface UseMessageCompositionProps {
  onSendMessage: (message: string, mentions?: any[], attachments?: any[]) => void;
  disabled?: boolean;
  onlineUsers?: Array<{ name: string; isMember: boolean; key: string }>;
  mentionToAdd?: string;
  onMentionAdded?: () => void;
}

export const useMessageComposition = ({
  onSendMessage,
  disabled = false,
  onlineUsers = [],
  mentionToAdd,
  onMentionAdded,
}: UseMessageCompositionProps) => {
  const [message, setMessage] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  // Mention state
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

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
  const { uploadFile } = useFileUpload();

  // Detect @mention in text
  const detectMention = useCallback((text: string, cursorPos: number) => {
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex === -1) {
      setShowMentionSuggestions(false);
      clearSuggestions();
      return;
    }

    const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
    if (textAfterAt.includes(' ')) {
      setShowMentionSuggestions(false);
      clearSuggestions();
      return;
    }

    setMentionStartIndex(lastAtIndex);
    setShowMentionSuggestions(true);
    searchUsers(textAfterAt);
  }, [clearSuggestions, searchUsers]);

  // Detect :emoji: shortcode in text
  const detectEmoji = useCallback((text: string, cursorPos: number) => {
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastColonIndex = textBeforeCursor.lastIndexOf(':');

    if (lastColonIndex === -1) {
      setShowEmojiSuggestions(false);
      setEmojiQuery('');
      return;
    }

    const textAfterColon = textBeforeCursor.slice(lastColonIndex + 1);
    if (textAfterColon.includes(' ') || textAfterColon.includes(':')) {
      setShowEmojiSuggestions(false);
      setEmojiQuery('');
      return;
    }

    setEmojiStartIndex(lastColonIndex);
    setEmojiQuery(textAfterColon);
    setShowEmojiSuggestions(true);
  }, []);

  // Handle input text changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;
    const newCursorPosition = e.target.selectionStart || 0;

    setMessage(newMessage);
    setCursorPosition(newCursorPosition);

    if (newMessage.startsWith('/')) {
      const slashSuggestions = getSlashSuggestions(newMessage);
      setShowSlashSuggestions(slashSuggestions.length > 0);
      setShowMentionSuggestions(false);
      setShowEmojiSuggestions(false);
    } else {
      setShowSlashSuggestions(false);
      detectMention(newMessage, newCursorPosition);
      detectEmoji(newMessage, newCursorPosition);
    }
  }, [getSlashSuggestions, detectMention, detectEmoji]);

  // Handle selecting a mention from suggestions
  const handleMentionSelect = useCallback((user: { name: string; id: string }) => {
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

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  }, [mentionStartIndex, message, cursorPosition, clearSuggestions]);

  // Handle selecting an emoji from suggestions
  const handleEmojiSelect = useCallback((emoji: { emoji: string; name: string }) => {
    if (emojiStartIndex === -1) return;

    const beforeEmoji = message.slice(0, emojiStartIndex);
    const afterCursor = message.slice(cursorPosition);

    const newMessage = beforeEmoji + emoji.emoji + ' ' + afterCursor;
    const newCursorPosition = beforeEmoji.length + emoji.emoji.length + 1;

    setMessage(newMessage);
    setShowEmojiSuggestions(false);
    setEmojiQuery('');
    setEmojiStartIndex(-1);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  }, [emojiStartIndex, message, cursorPosition]);

  // Handle selecting a slash command from suggestions
  const handleSlashCommandSelect = useCallback((command: string) => {
    setMessage(command + ' ');
    setShowSlashSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
      setTimeout(() => {
        const newPos = command.length + 1;
        inputRef.current?.setSelectionRange(newPos, newPos);
      }, 0);
    }
  }, []);

  // Clear all overlays
  const clearAllOverlays = useCallback(() => {
    setShowMentionSuggestions(false);
    setShowEmojiSuggestions(false);
    setShowSlashSuggestions(false);
    clearSuggestions();
  }, [clearSuggestions]);

  // Send the message
  const handleSend = useCallback(async () => {
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

    if (trimmedMessage) {
      const validation = await validateAndSanitizeMessage(trimmedMessage);
      if (!validation.isValid) {
        return;
      }

      const { content: emojiProcessed } = parseEmojiShortcodes(validation.sanitized);
      const { content, mentions } = parseMentions(emojiProcessed);

      if (!disabled) {
        onSendMessage(content, mentions, attachments);
        setMessage('');
        setAttachments([]);
        clearAllOverlays();
      }
    } else if (attachments.length > 0) {
      if (!disabled) {
        onSendMessage('', [], attachments);
        setMessage('');
        setAttachments([]);
        clearAllOverlays();
      }
    }
  }, [message, attachments, toast, isSlashCommand, executeSlashCommand, onSendMessage, validateAndSanitizeMessage, disabled, clearAllOverlays]);

  // Handle keyboard navigation for overlays and sending
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle emoji suggestions
    if (showEmojiSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedEmojiIndex(prev => (prev < 7 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedEmojiIndex(prev => (prev > 0 ? prev - 1 : 7));
        return;
      }
      if (e.key === 'Enter' && selectedEmojiIndex >= 0) {
        e.preventDefault();
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
  }, [showEmojiSuggestions, selectedEmojiIndex, showMentionSuggestions, suggestions, selectedSuggestionIndex, handleMentionSelect, clearSuggestions, handleSend]);

  // Track cursor position on click/keyup
  const handleCursorChange = useCallback(() => {
    if (inputRef.current) {
      const newCursorPosition = inputRef.current.selectionStart || 0;
      setCursorPosition(newCursorPosition);
      detectMention(message, newCursorPosition);
    }
  }, [message, detectMention]);

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

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newMessage.length, newMessage.length);
        }
      }, 0);
    }
  }, [mentionToAdd, message, onMentionAdded]);

  // Add a file attachment
  const addAttachment = useCallback((file: any) => {
    setAttachments(prev => [...prev, file]);
    toast({
      title: "File attached",
      description: `${file.name} has been attached to your message.`,
    });
  }, [toast]);

  // Remove a file attachment by index
  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle voice recording upload
  const handleAudioRecorded = useCallback(async (file: File) => {
    try {
      const uploadedFile = await uploadFile(file);
      if (uploadedFile) {
        onSendMessage('', [], [uploadedFile]);
        toast({
          title: "Voice message sent",
          description: "Your voice message has been sent.",
        });
      }
    } catch (error) {
      logger.error("Failed to upload voice message", { error });
    }
  }, [uploadFile, onSendMessage, toast]);

  // Compute suggestion positions
  const getSuggestionPosition = useCallback(() => {
    if (!inputRef.current || mentionStartIndex === -1) {
      return { top: 0, left: 0 };
    }
    const input = inputRef.current;
    const rect = input.getBoundingClientRect();
    const charWidth = 8;
    const mentionOffset = mentionStartIndex * charWidth;
    return {
      top: rect.top - 10,
      left: rect.left + mentionOffset + 12,
    };
  }, [mentionStartIndex]);

  const getEmojiSuggestionPosition = useCallback(() => {
    if (!inputRef.current || emojiStartIndex === -1) {
      return { top: 0, left: 0 };
    }
    const input = inputRef.current;
    const rect = input.getBoundingClientRect();
    const charWidth = 8;
    const emojiOffset = emojiStartIndex * charWidth;
    return {
      top: rect.top - 10,
      left: rect.left + emojiOffset + 12,
    };
  }, [emojiStartIndex]);

  const remainingChars = MAX_MESSAGE_LENGTH - message.length;
  const isNearLimit = remainingChars <= 100;
  const slashSuggestions = getSlashSuggestions(message);

  return {
    // State
    message,
    attachments,
    remainingChars,
    isNearLimit,

    // Refs
    inputRef,

    // Mention state
    showMentionSuggestions,
    suggestions,
    selectedSuggestionIndex,
    setSelectedSuggestionIndex,

    // Emoji state
    showEmojiSuggestions,
    emojiQuery,
    selectedEmojiIndex,
    setSelectedEmojiIndex,

    // Slash command state
    showSlashSuggestions,
    slashSuggestions,

    // Handlers
    handleInputChange,
    handleKeyDown,
    handleCursorChange,
    handleSend,
    handleMentionSelect,
    handleEmojiSelect,
    handleSlashCommandSelect,
    addAttachment,
    removeAttachment,
    handleAudioRecorded,

    // Position calculators
    getSuggestionPosition,
    getEmojiSuggestionPosition,

    // Close emoji overlay
    closeEmojiOverlay: useCallback(() => {
      setShowEmojiSuggestions(false);
      setEmojiQuery('');
    }, []),
  };
};
