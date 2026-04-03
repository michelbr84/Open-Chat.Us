import { useMessageComposition } from '@/hooks/useMessageComposition';
import { MessageComposer } from '@/components/chat/MessageComposer';
import { AttachmentPreview } from '@/components/chat/AttachmentPreview';
import { MentionOverlay } from '@/components/chat/MentionOverlay';
import { SlashCommandOverlay } from '@/components/chat/SlashCommandOverlay';
import { EmojiPickerAutocomplete } from '@/components/EmojiPickerAutocomplete';

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
  onSlashCommand,
}: MessageInputProps) => {
  const {
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
    closeEmojiOverlay,
  } = useMessageComposition({
    onSendMessage,
    disabled,
    onlineUsers,
    mentionToAdd,
    onMentionAdded,
  });

  return (
    <div className="border-t border-border p-3 md:p-4 relative">
      <MessageComposer
        inputRef={inputRef}
        message={message}
        disabled={disabled}
        placeholder={placeholder}
        remainingChars={remainingChars}
        isNearLimit={isNearLimit}
        attachmentCount={attachments.length}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onCursorChange={handleCursorChange}
        onSend={handleSend}
        onFileUploaded={addAttachment}
        onAudioRecorded={handleAudioRecorded}
      />

      <AttachmentPreview
        attachments={attachments}
        onRemove={removeAttachment}
      />

      <MentionOverlay
        suggestions={suggestions}
        selectedIndex={selectedSuggestionIndex}
        onSelect={handleMentionSelect}
        onHover={setSelectedSuggestionIndex}
        position={getSuggestionPosition()}
        visible={showMentionSuggestions}
      />

      <EmojiPickerAutocomplete
        visible={showEmojiSuggestions}
        query={emojiQuery}
        position={getEmojiSuggestionPosition()}
        onSelect={handleEmojiSelect}
        onClose={closeEmojiOverlay}
        selectedIndex={selectedEmojiIndex}
        onHover={setSelectedEmojiIndex}
      />

      <SlashCommandOverlay
        suggestions={slashSuggestions}
        onSelect={handleSlashCommandSelect}
        isVisible={showSlashSuggestions}
      />
    </div>
  );
};
