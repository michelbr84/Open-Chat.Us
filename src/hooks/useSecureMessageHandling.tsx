import { useToast } from '@/hooks/use-toast';
import { sanitizeMessageContent, containsInappropriateContent, isContentValidationRateLimited } from '@/utils/sanitization';
import { getOrCreateGuestId } from '@/utils/secureGuestId';
import { useAutoModeration } from '@/hooks/useAutoModeration';
import { useAuth } from '@/hooks/useAuth';

// Enhanced message validation hook with auto-moderation
export const useSecureMessageHandling = () => {
  const { toast } = useToast();
  const { moderateContent } = useAutoModeration();
  const { user } = useAuth();

  const validateAndSanitizeMessage = async (content: string, messageId?: string): Promise<{ isValid: boolean; sanitized: string }> => {
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

    // Run auto-moderation checks
    try {
      const moderationResult = await moderateContent(sanitized, user?.id || null, messageId);
      
      if (!moderationResult.allowed) {
        const violationMessage = moderationResult.violations.length > 0 
          ? moderationResult.violations[0] 
          : 'Content not allowed';
          
        toast({
          title: "Message blocked",
          description: moderationResult.autoBlocked 
            ? `Message automatically blocked: ${violationMessage}`
            : "Message contains inappropriate content.",
          variant: "destructive",
        });
        return { isValid: false, sanitized: '' };
      }

      // Show warning for flagged content that was allowed
      if (moderationResult.flagged && moderationResult.allowed) {
        toast({
          title: "Content flagged",
          description: "Your message has been sent but flagged for review.",
          variant: "default",
        });
      }
    } catch (moderationError) {
      console.error('Moderation check failed:', moderationError);
      // Continue with basic validation if moderation fails
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