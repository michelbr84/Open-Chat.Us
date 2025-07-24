import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type a message..." 
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  
  const MAX_MESSAGE_LENGTH = 1000;

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
    
    if (!disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const remainingChars = MAX_MESSAGE_LENGTH - message.length;
  const isNearLimit = remainingChars <= 100;
  
  return (
    <div className="border-t border-border p-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="chat-input pr-16"
            maxLength={MAX_MESSAGE_LENGTH}
          />
          {isNearLimit && (
            <div className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${
              remainingChars <= 50 ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {remainingChars}
            </div>
          )}
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || message.length > MAX_MESSAGE_LENGTH}
          size="sm"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};