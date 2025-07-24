import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ReactionData {
  count: number;
  users: string[];
  hasReacted: boolean;
}

interface MessageReactions {
  [emoji: string]: ReactionData;
}

export const useMessageReactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reactions, setReactions] = useState<Record<string, MessageReactions>>({});

  // Load reactions for all messages
  const loadReactions = async () => {
    const { data, error } = await supabase
      .from('message_reactions')
      .select('*');

    if (error) {
      console.error('Failed to load reactions:', error);
      return;
    }

    // Group reactions by message and emoji
    const grouped: Record<string, MessageReactions> = {};
    
    data?.forEach((reaction) => {
      if (!grouped[reaction.message_id]) {
        grouped[reaction.message_id] = {};
      }
      
      if (!grouped[reaction.message_id][reaction.emoji]) {
        grouped[reaction.message_id][reaction.emoji] = {
          count: 0,
          users: [],
          hasReacted: false,
        };
      }
      
      grouped[reaction.message_id][reaction.emoji].count++;
      grouped[reaction.message_id][reaction.emoji].users.push(reaction.user_id);
      
      if (user && reaction.user_id === user.id) {
        grouped[reaction.message_id][reaction.emoji].hasReacted = true;
      }
    });

    setReactions(grouped);
  };

  // Subscribe to real-time reaction changes
  useEffect(() => {
    loadReactions();

    const channel = supabase
      .channel('message-reactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message_reactions' },
        () => {
          // Reload reactions when any reaction changes
          loadReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Add or remove a reaction
  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to react to messages.",
        variant: "destructive",
      });
      return;
    }

    const currentReaction = reactions[messageId]?.[emoji];
    const hasReacted = currentReaction?.hasReacted;

    if (hasReacted) {
      // Remove reaction
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);

      if (error) {
        toast({
          title: "Failed to remove reaction",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    } else {
      // Add reaction
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji: emoji,
        });

      if (error) {
        toast({
          title: "Failed to add reaction",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }

    // Provide user feedback
    toast({
      title: `${emoji} ${hasReacted ? 'removed' : 'added'}`,
      description: `Your reaction has been ${hasReacted ? 'removed' : 'added'}.`,
    });
  };

  return {
    reactions,
    toggleReaction,
  };
};