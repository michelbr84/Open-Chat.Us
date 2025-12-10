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

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }

    const channel = supabase.channel('user_presence');
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users = Object.values(presenceState).flat().filter(p => p && typeof p === 'object' && 'user_id' in p) as unknown as UserPresence[];
        setOnlineUsers(users);
        setIsLoading(false);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, status: 'online', last_activity: new Date().toISOString() });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const updateUserStatus = async (status: 'online' | 'offline' | 'away' | 'busy', customMessage?: string) => {
    if (!user) return;
    const channel = supabase.channel('user_presence');
    await channel.track({ user_id: user.id, status, custom_message: customMessage, last_activity: new Date().toISOString() });
    setUserStatus({ user_id: user.id, status, custom_message: customMessage, last_activity: new Date().toISOString() });
  };

  return { onlineUsers, userStatus, isLoading, updateUserStatus, getOnlineCount: () => onlineUsers.filter(u => u.status === 'online').length, getUserStatus: (userId: string) => onlineUsers.find(u => u.user_id === userId) };
};
