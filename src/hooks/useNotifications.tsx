import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
  data: Record<string, unknown> | null;
}

interface NotificationPreferences {
  mentions: boolean;
  dms: boolean;
  reactions: boolean;
  announcements: boolean;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    mentions: true,
    dms: true,
    reactions: true,
    announcements: true,
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const hasPermission = permission === 'granted';

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data?.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        is_read: n.is_read ?? false,
        created_at: n.created_at,
        data: n.data as Record<string, unknown> | null,
      })) || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as {
            id: string;
            type: string;
            title: string;
            message: string | null;
            is_read: boolean | null;
            created_at: string;
            data: Record<string, unknown> | null;
          };
          setNotifications(prev => [{
            id: newNotification.id,
            type: newNotification.type,
            title: newNotification.title,
            message: newNotification.message,
            is_read: newNotification.is_read ?? false,
            created_at: newNotification.created_at,
            data: newNotification.data,
          }, ...prev]);

          // Send browser notification if permitted
          if (permission === 'granted') {
            sendNotification(newNotification.title, {
              body: newNotification.message || undefined,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, permission]);

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Not supported",
        description: "This browser does not support desktop notifications.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast({
          title: "Notifications enabled",
          description: "You will now receive notifications for mentions.",
        });
        return true;
      } else {
        toast({
          title: "Notifications blocked",
          description: "Please enable notifications in your browser settings if you want to receive alerts.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [toast]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      try {
        new Notification(title, options);
      } catch (e) {
        console.error('Notification error:', e);
      }
    }
  }, [permission]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user]);

  const updatePreferences = useCallback((newPreferences: NotificationPreferences) => {
    setPreferences(newPreferences);
    // Preferences could be persisted to database in the future
    localStorage.setItem('notification_preferences', JSON.stringify(newPreferences));
  }, []);

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notification_preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, []);

  return {
    permission,
    notifications,
    unreadCount,
    isLoading,
    preferences,
    hasPermission,
    requestPermission: requestNotificationPermission,
    requestNotificationPermission,
    sendNotification,
    markAsRead,
    markAllAsRead,
    updatePreferences,
  };
};
