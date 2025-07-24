import { useToast } from '@/hooks/use-toast';
import { sanitizeMessageContent, containsInappropriateContent, isContentValidationRateLimited } from '@/utils/sanitization';
import { getOrCreateGuestId } from '@/utils/secureGuestId';

// Enhanced message validation hook
export const useSecureMessageHandling = () => {
  const { toast } = useToast();

  const validateAndSanitizeMessage = (content: string): { isValid: boolean; sanitized: string } => {
    if (!content || typeof content !== 'string') {
      toast({
        title: "Invalid message",
        description: "Message content is required.",
        variant: "destructive",
      });
      return { isValid: false, sanitized: '' };
    }

    const trimmed = content.trim();
    
    if (trimmed.length === 0) {
      toast({
        title: "Empty message",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return { isValid: false, sanitized: '' };
    }

    if (trimmed.length > 1000) {
      toast({
        title: "Message too long",
        description: "Message must be 1000 characters or less.",
        variant: "destructive",
      });
      return { isValid: false, sanitized: '' };
    }

    // Check rate limiting
    const guestId = getOrCreateGuestId();
    if (isContentValidationRateLimited(guestId)) {
      toast({
        title: "Rate limit exceeded",
        description: "Please wait before sending another message.",
        variant: "destructive",
      });
      return { isValid: false, sanitized: '' };
    }

    // Sanitize content
    const sanitized = sanitizeMessageContent(trimmed);
    
    if (!sanitized) {
      toast({
        title: "Invalid content",
        description: "Message contains prohibited content.",
        variant: "destructive",
      });
      return { isValid: false, sanitized: '' };
    }

    // Check for inappropriate content
    if (containsInappropriateContent(sanitized)) {
      toast({
        title: "Inappropriate content",
        description: "Message contains content that is not allowed.",
        variant: "destructive",
      });
      return { isValid: false, sanitized: '' };
    }

    return { isValid: true, sanitized };
  };

  const logSecurityEvent = (eventType: string, details: any) => {
    console.warn(`Security Event [${eventType}]:`, {
      timestamp: new Date().toISOString(),
      guestId: getOrCreateGuestId(),
      ...details
    });
  };

  return {
    validateAndSanitizeMessage,
    logSecurityEvent,
  };
};