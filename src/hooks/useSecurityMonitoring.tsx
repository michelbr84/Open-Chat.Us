import { useEffect, useRef } from 'react';
import { getOrCreateGuestId, validateGuestSession } from '@/utils/secureGuestId';
import { useToast } from '@/hooks/use-toast';

// Security monitoring hook
export const useSecurityMonitoring = () => {
  const { toast } = useToast();
  const lastActivityTime = useRef(Date.now());
  const sessionWarningShown = useRef(false);

  useEffect(() => {
    // Validate guest session on mount
    const guestId = getOrCreateGuestId();
    if (!validateGuestSession(guestId)) {
      console.warn('Invalid guest session detected');
      // Clear invalid session
      localStorage.removeItem('secure_guest_id');
      localStorage.removeItem('secure_guest_name');
    }

    // Session timeout monitoring (30 minutes)
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    const WARNING_TIME = 25 * 60 * 1000; // 25 minutes

    const checkSessionTimeout = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityTime.current;

      if (timeSinceActivity > WARNING_TIME && !sessionWarningShown.current) {
        sessionWarningShown.current = true;
        toast({
          title: "Session expiring soon",
          description: "Your session will expire in 5 minutes due to inactivity.",
          variant: "default",
        });
      }

      if (timeSinceActivity > SESSION_TIMEOUT) {
        toast({
          title: "Session expired",
          description: "Your session has expired. Please refresh the page.",
          variant: "destructive",
        });
        // Clear session data
        localStorage.removeItem('secure_guest_id');
        localStorage.removeItem('secure_guest_name');
      }
    };

    // Update activity time on user interaction
    const updateActivity = () => {
      lastActivityTime.current = Date.now();
      sessionWarningShown.current = false;
    };

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Session monitoring interval
    const sessionInterval = setInterval(checkSessionTimeout, 60000); // Check every minute

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearInterval(sessionInterval);
    };
  }, [toast]);

  const logSecurityEvent = (event: string, data: any = {}) => {
    const securityLog = {
      timestamp: new Date().toISOString(),
      event,
      guestId: getOrCreateGuestId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...data
    };

    console.warn('Security Event:', securityLog);
    
    // In production, you might want to send this to a logging service
    // analyticsService.track('security_event', securityLog);
  };

  return { logSecurityEvent };
};