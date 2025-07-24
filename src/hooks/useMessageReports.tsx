import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useMessageReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const submitReport = async (messageId: string, reason: string, details?: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to report messages.",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase
      .from('message_reports')
      .insert({
        message_id: messageId,
        reporter_id: user.id,
        reason: reason,
        details: details || null,
      });

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        toast({
          title: "Already reported",
          description: "You have already reported this message.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to submit report",
          description: error.message,
          variant: "destructive",
        });
      }
      return false;
    }

    toast({
      title: "Report submitted",
      description: "Thank you for helping keep our community safe.",
    });
    return true;
  };

  const getUserReports = async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('message_reports')
      .select('*')
      .eq('reporter_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load user reports:', error);
      return [];
    }

    return data || [];
  };

  return {
    submitReport,
    getUserReports,
  };
};