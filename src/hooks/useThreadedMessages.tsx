import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MessageThread {
  id: string;
  parent_message_id: string;
  channel_id?: string;
  reply_count: number;
  last_reply_at: string;
  created_at: string;
}

interface ThreadedMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  thread_id?: string;
  reply_to_message_id?: string;
  created_at: string;
  edited_at?: string;
  is_edited: boolean;
  reactions?: any[];
}

export const useThreadedMessages = (channelId?: string) => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [threadMessages, setThreadMessages] = useState<Record<string, ThreadedMessage[]>>({});
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch threads for a channel
  useEffect(() => {
    if (!channelId) return;

    const fetchThreads = async () => {
      try {
        const { data, error } = await supabase
          .from('message_threads')
          .select('*')
          .eq('channel_id', channelId)
          .order('last_reply_at', { ascending: false });

        if (error) throw error;

        setThreads(data || []);
      } catch (error) {
        console.error('Error fetching threads:', error);
      }
    };

    fetchThreads();
  }, [channelId]);

  // Real-time subscription for thread updates
  useEffect(() => {
    if (!channelId) return;

    const channel = supabase
      .channel('thread_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_threads',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setThreads(prev => [payload.new as MessageThread, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setThreads(prev => 
              prev.map(t => t.id === payload.new.id ? payload.new as MessageThread : t)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  // Create a new thread (reply to a message)
  const createThread = async (parentMessageId: string, replyContent: string) => {
    if (!user || !replyContent.trim()) return null;

    try {
      // First, create or get the thread
      let thread: MessageThread;
      
      const { data: existingThread, error: threadError } = await supabase
        .from('message_threads')
        .select('*')
        .eq('parent_message_id', parentMessageId)
        .single();

      if (threadError && threadError.code !== 'PGRST116') {
        throw threadError;
      }

      if (existingThread) {
        thread = existingThread;
      } else {
        // Create new thread
        const { data: newThread, error: createError } = await supabase
          .from('message_threads')
          .insert({
            parent_message_id: parentMessageId,
            channel_id: channelId,
            reply_count: 0,
            last_reply_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;
        thread = newThread;
      }

      // Create the reply message
      const { data: replyMessage, error: messageError } = await supabase
        .from('messages')
        .insert({
          content: replyContent.trim(),
          sender_id: user.id,
          sender_name: user.email || 'Anonymous',
          thread_id: thread.id,
          reply_to_message_id: parentMessageId,
          channel_id: channelId,
        })
        .select()
        .single();

      if (messageError) throw messageError;

      toast.success('Reply sent!');
      return replyMessage;
    } catch (error: any) {
      console.error('Error creating thread reply:', error);
      toast.error('Failed to send reply');
      return null;
    }
  };

  // Fetch messages for a specific thread
  const fetchThreadMessages = async (threadId: string) => {
    if (threadMessages[threadId]) return; // Already loaded

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, sender_id, sender_name, created_at, edited_at')
        .eq('parent_message_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform data to match ThreadedMessage interface
      const transformedMessages: ThreadedMessage[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id || '',
        sender_name: msg.sender_name,
        created_at: msg.created_at,
        edited_at: msg.edited_at || undefined,
        is_edited: !!msg.edited_at,
        reactions: [],
      }));

      setThreadMessages(prev => ({
        ...prev,
        [threadId]: transformedMessages,
      }));
    } catch (error) {
      console.error('Error fetching thread messages:', error);
      toast.error('Failed to load thread messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle thread expansion
  const toggleThread = async (threadId: string) => {
    const isExpanded = expandedThreads.has(threadId);
    
    if (isExpanded) {
      setExpandedThreads(prev => {
        const newSet = new Set(prev);
        newSet.delete(threadId);
        return newSet;
      });
    } else {
      setExpandedThreads(prev => new Set(prev).add(threadId));
      await fetchThreadMessages(threadId);
    }
  };

  // Real-time subscription for thread messages
  useEffect(() => {
    const activeThreadIds = Array.from(expandedThreads);
    if (activeThreadIds.length === 0) return;

    const channel = supabase
      .channel('thread_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=in.(${activeThreadIds.join(',')})`,
        },
        (payload) => {
          const newMessage = payload.new as ThreadedMessage;
          if (newMessage.thread_id) {
            setThreadMessages(prev => ({
              ...prev,
              [newMessage.thread_id!]: [
                ...(prev[newMessage.thread_id!] || []),
                newMessage,
              ],
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [expandedThreads]);

  return {
    threads,
    threadMessages,
    expandedThreads,
    isLoading,
    createThread,
    toggleThread,
    fetchThreadMessages,
  };
};