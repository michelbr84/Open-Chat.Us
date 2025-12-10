import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useMessageEditing = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const editMessage = async (messageId: string, newContent: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to edit messages.",
        variant: "destructive",
      });
      return false;
    }

    if (!newContent.trim()) {
      toast({
        title: "Invalid content",
        description: "Message content cannot be empty.",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase
      .from('messages')
      .update({ 
        content: newContent.trim(),
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('sender_id', user.id); // Security: users can only edit their own messages

    if (error) {
      toast({
        title: "Failed to edit message",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Message edited",
      description: "Your message has been updated.",
    });
    return true;
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to delete messages.",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase
      .from('messages')
      .update({ 
        is_deleted: true, 
        content: '[Message deleted]'
      })
      .eq('id', messageId)
      .eq('sender_id', user.id); // Security: users can only delete their own messages

    if (error) {
      toast({
        title: "Failed to delete message",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Message deleted",
      description: "Your message has been deleted.",
    });
    return true;
  };

  // Get edit history - we'll just return empty array since we don't have an edit history table
  const getEditHistory = async (messageId: string) => {
    return [];
  };

  return {
    editMessage,
    deleteMessage,
    getEditHistory,
  };
};
