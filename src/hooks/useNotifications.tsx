import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Notification {
  id: string;
  user_id: string;
  type: 'mention' | 'dm' | 'reaction' | 'achievement' | 'announcement' | 'system';
  title: string;
  message?: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

interface NotificationPreferences {
  [key: string]: boolean;
  mentions: boolean;
  dms: boolean;
  reactions: boolean;
  announcements: boolean;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    mentions: true,
    dms: true,
    reactions: true,
    announcements: true,
  });

  // Fetch user's notification preferences
  useEffect(() => {
    if (!user) return;

    const fetchPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('notification_preferences')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data?.notification_preferences) {
          setPreferences(data.notification_preferences as NotificationPreferences);
        }
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
      }
    };

    fetchPreferences();
  }, [user]);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        setNotifications((data || []) as Notification[]);
        setUnreadCount(data?.filter(n => !n.is_read).length || 0);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  // Real-time notification subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show browser notification if preferences allow
          if (shouldShowNotification(newNotification.type)) {
            showBrowserNotification(newNotification);
            toast(newNotification.title, {
              description: newNotification.message,
              action: {
                label: 'View',
                onClick: () => markAsRead(newNotification.id),
              },
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, preferences]);

  // Check if notification should be shown based on preferences
  const shouldShowNotification = (type: Notification['type']): boolean => {
    switch (type) {
      case 'mention':
        return preferences.mentions;
      case 'dm':
        return preferences.dms;
      case 'reaction':
        return preferences.reactions;
      case 'announcement':
        return preferences.announcements;
      default:
        return true;
    }
  };

  // Show browser notification
  const showBrowserNotification = (notification: Notification) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.png',
        tag: notification.id,
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.png',
            tag: notification.id,
          });
        }
      });
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Update notification preferences
  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ notification_preferences: newPreferences })
        .eq('id', user.id);

      if (error) throw error;

      setPreferences(newPreferences);
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      toast.success('Notifications enabled!');
      return true;
    } else {
      toast.error('Notifications permission denied');
      return false;
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    preferences,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    requestNotificationPermission,
    hasPermission: Notification.permission === 'granted',
  };
};