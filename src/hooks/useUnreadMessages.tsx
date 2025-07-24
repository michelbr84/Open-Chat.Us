import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UnreadConversation {
  sender_id: string;
  sender_name: string;
  unread_count: number;
  latest_message: string;
  latest_message_time: string;
}

interface UseUnreadMessagesResult {
  unreadCount: number;
  unreadConversations: UnreadConversation[];
  markMessagesAsRead: (senderId: string) => Promise<void>;
  loading: boolean;
  refreshUnreadMessages: () => Promise<void>;
}

export const useUnreadMessages = (): UseUnreadMessagesResult => {
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
      // Get total unread count
      const { data: countData, error: countError } = await supabase
        .rpc('get_unread_private_message_count', { p_user_id: user.id });

      if (countError) throw countError;

      // Get unread conversations
      const { data: conversationsData, error: conversationsError } = await supabase
        .rpc('get_unread_conversation_partners', { p_user_id: user.id });

      if (conversationsError) throw conversationsError;

      setUnreadCount(countData || 0);
      setUnreadConversations(conversationsData || []);
    } catch (error: any) {
      console.error('Error fetching unread messages:', error);
      toast({
        title: "Error loading unread messages",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (senderId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .rpc('mark_private_messages_as_read', {
          p_sender_id: senderId,
          p_receiver_id: user.id
        });

      if (error) throw error;

      // Refresh unread messages after marking as read
      await fetchUnreadMessages();
    } catch (error: any) {
      console.error('Error marking messages as read:', error);
      toast({
        title: "Error marking messages as read",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const refreshUnreadMessages = async () => {
    await fetchUnreadMessages();
  };

  // Initial load
  useEffect(() => {
    fetchUnreadMessages();
  }, [user]);

  // Set up real-time subscription for new private messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`unread-messages-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          // Show toast notification for new message
          const newMessage = payload.new as any;
          toast({
            title: "New private message",
            description: `${newMessage.sender_name}: ${newMessage.content.substring(0, 50)}${newMessage.content.length > 50 ? '...' : ''}`,
            duration: 5000,
          });

          // Refresh unread count
          fetchUnreadMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'private_messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          // Refresh when messages are marked as read
          fetchUnreadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    unreadCount,
    unreadConversations,
    markMessagesAsRead,
    loading,
    refreshUnreadMessages,
  };
};