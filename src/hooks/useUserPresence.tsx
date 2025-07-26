import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserPresence {
  user_id: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  custom_message?: string;
  last_activity: string;
}

export const useUserPresence = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [userStatus, setUserStatus] = useState<UserPresence | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize presence tracking
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('user_presence');

    // Track current user's presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users = Object.values(presenceState).flat().filter(presence => 
          presence && typeof presence === 'object' && 'user_id' in presence
        ) as unknown as UserPresence[];
        setOnlineUsers(users);
        setIsLoading(false);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('Users joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Users left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track user presence
          await channel.track({
            user_id: user.id,
            status: 'online',
            last_activity: new Date().toISOString(),
            custom_message: null,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Update user status in database
  const updateUserStatus = async (
    status: 'online' | 'offline' | 'away' | 'busy',
    customMessage?: string
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_status')
        .upsert({
          user_id: user.id,
          status,
          custom_message: customMessage,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update presence channel
      const channel = supabase.channel('user_presence');
      await channel.track({
        user_id: user.id,
        status,
        custom_message: customMessage,
        last_activity: new Date().toISOString(),
      });

      setUserStatus({
        user_id: user.id,
        status,
        custom_message: customMessage,
        last_activity: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  // Get user's current status
  useEffect(() => {
    if (!user) return;

    const fetchUserStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('user_status')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setUserStatus(data as UserPresence);
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
      }
    };

    fetchUserStatus();
  }, [user]);

  // Set user offline when leaving
  useEffect(() => {
    if (!user) return;

    const handleBeforeUnload = () => {
      updateUserStatus('offline');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateUserStatus('away');
      } else {
        updateUserStatus('online');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const getOnlineCount = () => onlineUsers.filter(u => u.status === 'online').length;
  
  const getUserStatus = (userId: string) => onlineUsers.find(u => u.user_id === userId);

  return {
    onlineUsers,
    userStatus,
    isLoading,
    updateUserStatus,
    getOnlineCount,
    getUserStatus,
  };
};