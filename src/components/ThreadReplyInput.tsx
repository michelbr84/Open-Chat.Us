import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, X } from 'lucide-react';
import { EmojiPickerAutocomplete } from './EmojiPickerAutocomplete';

interface ThreadReplyInputProps {
  parentMessageId: string;
  onSendReply: (content: string, parentMessageId: string) => Promise<boolean>;
  onCancel: () => void;
  placeholder?: string;
}

export const ThreadReplyInput: React.FC<ThreadReplyInputProps> = ({
  parentMessageId,
  onSendReply,
  onCancel,
  placeholder = "Reply to this message...",
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const success = await onSendReply(content, parentMessageId);
    if (success) {
      setContent('');
    }
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-border/50">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[60px] pr-12 resize-none"
            autoFocus
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line, Esc to cancel
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!content.trim() || isSubmitting}
              className="h-8"
            >
              <Send className="w-4 h-4 mr-1" />
              Reply
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};