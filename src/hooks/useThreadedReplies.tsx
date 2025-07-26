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
  const { user, guestId } = useAuth();
  const { toast } = useToast();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<{ [key: string]: ThreadedMessage[] }>({});
  const [loadingThreads, setLoadingThreads] = useState<Set<string>>(new Set());

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

      setThreadMessages(prev => ({
        ...prev,
        [parentMessageId]: data || []
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
        user_id: user?.id || null,
        guest_id: !user ? guestId : null,
        username: user?.user_metadata?.name || user?.email || `Guest ${guestId?.slice(-4)}`,
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;

      // Update thread messages
      setThreadMessages(prev => ({
        ...prev,
        [parentMessageId]: [...(prev[parentMessageId] || []), data]
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