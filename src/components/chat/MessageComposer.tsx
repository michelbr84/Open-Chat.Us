import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { AudioRecorder } from '@/components/AudioRecorder';
import { FileUploadButton } from '@/components/FileUploadButton';
import { MAX_MESSAGE_LENGTH } from '@/hooks/useMessageComposition';

interface MessageComposerProps {
  inputRef: React.RefObject<HTMLInputElement>;
  message: string;
  disabled: boolean;
  placeholder: string;
  remainingChars: number;
  isNearLimit: boolean;
  attachmentCount: number;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onCursorChange: () => void;
  onSend: () => void;
  onFileUploaded: (file: any) => void;
  onAudioRecorded: (file: File) => void;
}

export const MessageComposer = ({
  inputRef,
  message,
  disabled,
  placeholder,
  remainingChars,
  isNearLimit,
  attachmentCount,
  onInputChange,
  onKeyDown,
  onCursorChange,
  onSend,
  onFileUploaded,
  onAudioRecorded,
}: MessageComposerProps) => {
  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1 relative">
        <Input
          ref={inputRef}
          value={message}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          onClick={onCursorChange}
          onKeyUp={onCursorChange}
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
        <AudioRecorder
          onAudioRecorded={onAudioRecorded}
          disabled={disabled}
        />
        <FileUploadButton
          onFileUploaded={onFileUploaded}
          disabled={disabled}
        />
        <Button
          onClick={onSend}
          disabled={(!message.trim() && attachmentCount === 0) || disabled || message.length > MAX_MESSAGE_LENGTH}
          className="h-12 md:h-10 px-4 md:px-3 min-w-[48px]"
          aria-label="Send message"
        >
          <Send className="w-5 h-5 md:w-4 md:h-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};
