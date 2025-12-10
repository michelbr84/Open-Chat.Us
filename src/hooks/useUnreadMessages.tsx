import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UnreadConversation {
  sender_id: string;
  sender_name: string;
  unread_count: number;
}

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadConversations, setUnreadConversations] = useState<UnreadConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUnreadMessages = async () => {
    if (!user) {
      setUnreadCount(0);
      setUnreadConversations([]);
      setLoading(false);
      return;
    }

    try {
      // Use existing RPC functions
      const { data: countData } = await supabase.rpc('get_unread_message_count', { p_user_id: user.id });
      const { data: conversationsData } = await supabase.rpc('get_unread_conversations', { p_user_id: user.id });

      setUnreadCount(typeof countData === 'number' ? countData : 0);
      setUnreadConversations(Array.isArray(conversationsData) ? conversationsData : []);
    } catch (error: any) {
      console.error('Error fetching unread messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (senderId: string) => {
    if (!user) return;
    try {
      await supabase.rpc('mark_messages_as_read', { p_sender_id: senderId, p_user_id: user.id });
      await fetchUnreadMessages();
    } catch (error: any) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => { fetchUnreadMessages(); }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`unread-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'private_messages', filter: `receiver_id=eq.${user.id}` }, () => fetchUnreadMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return { unreadCount, unreadConversations, markMessagesAsRead, loading, refreshUnreadMessages: fetchUnreadMessages };
};
