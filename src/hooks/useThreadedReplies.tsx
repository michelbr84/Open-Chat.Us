import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ThreadedMessage {
  id: string;
  content: string;
  created_at: string;
  user_id?: string;
  guest_id?: string;
  username: string;
  parent_message_id?: string;
  reply_count?: number;
  mentions?: any[];
}

export const useThreadedReplies = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<{ [key: string]: ThreadedMessage[] }>({});
  const [loadingThreads, setLoadingThreads] = useState<Set<string>>(new Set());

  // Generate a simple guest ID if no user
  const guestId = user ? null : `guest-${Date.now()}-${Math.random().toString(36).substring(2)}`;

  const startReply = useCallback((messageId: string) => {
    setReplyingTo(messageId);
  }, []);

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const loadThreadReplies = useCallback(async (parentMessageId: string) => {
    if (loadingThreads.has(parentMessageId) || threadMessages[parentMessageId]) return;

    setLoadingThreads(prev => new Set(prev).add(parentMessageId));

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('parent_message_id', parentMessageId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Map database messages to ThreadedMessage format
      const mappedMessages: ThreadedMessage[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        user_id: msg.sender_id,
        guest_id: null,
        username: msg.sender_name,
        parent_message_id: msg.parent_message_id,
        reply_count: msg.reply_count || 0,
        mentions: Array.isArray(msg.mentions) ? msg.mentions : []
      }));

      setThreadMessages(prev => ({
        ...prev,
        [parentMessageId]: mappedMessages
      }));
    } catch (error) {
      console.error('Error loading thread replies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load thread replies',
        variant: 'destructive',
      });
    } finally {
      setLoadingThreads(prev => {
        const newSet = new Set(prev);
        newSet.delete(parentMessageId);
        return newSet;
      });
    }
  }, [loadingThreads, threadMessages, toast]);

  const sendReply = useCallback(async (content: string, parentMessageId: string) => {
    if (!content.trim()) return false;

    try {
      const messageData = {
        content: content.trim(),
        parent_message_id: parentMessageId,
        sender_id: user?.id || null,
        sender_name: user?.user_metadata?.name || user?.email || `Guest ${guestId?.slice(-4)}`,
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;

      // Map the returned message to ThreadedMessage format
      const mappedMessage: ThreadedMessage = {
        id: data.id,
        content: data.content,
        created_at: data.created_at,
        user_id: data.sender_id,
        guest_id: null,
        username: data.sender_name,
        parent_message_id: data.parent_message_id,
        reply_count: 0,
        mentions: Array.isArray(data.mentions) ? data.mentions : []
      };

      // Update thread messages
      setThreadMessages(prev => ({
        ...prev,
        [parentMessageId]: [...(prev[parentMessageId] || []), mappedMessage]
      }));

      // Update reply count for parent message
      await supabase
        .from('messages')
        .update({ 
          reply_count: (threadMessages[parentMessageId]?.length || 0) + 1 
        })
        .eq('id', parentMessageId);

      setReplyingTo(null);
      return true;
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, guestId, threadMessages, toast]);

  const getThreadReplies = useCallback((parentMessageId: string) => {
    return threadMessages[parentMessageId] || [];
  }, [threadMessages]);

  const isLoadingThread = useCallback((parentMessageId: string) => {
    return loadingThreads.has(parentMessageId);
  }, [loadingThreads]);

  return {
    replyingTo,
    startReply,
    cancelReply,
    sendReply,
    loadThreadReplies,
    getThreadReplies,
    isLoadingThread,
  };
};