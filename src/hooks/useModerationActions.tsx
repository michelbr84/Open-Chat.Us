import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ModerationAction = 'warn' | 'mute' | 'unmute' | 'ban' | 'unban' | 'suspend' | 'unsuspend';

interface UserModerationStatus {
  id: string;
  user_id: string;
  status: string;
  muted_until?: string;
  banned_until?: string;
  total_warnings: number;
  reputation_score: number;
  is_shadow_banned: boolean;
  last_infraction_at?: string;
}

export const useModerationActions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Apply moderation action using the database function
  const applyModerationAction = useCallback(async (
    targetUserId: string,
    action: ModerationAction,
    reason: string,
    durationMinutes?: number
  ) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('apply_moderation_action', {
        target_user_id: targetUserId,
        action_type: action,
        reason_text: reason,
        duration_minutes: durationMinutes || null
      });

      if (error) throw error;

      const actionNames = {
        warn: 'Warning issued',
        mute: `User muted${durationMinutes ? ` for ${durationMinutes} minutes` : ' permanently'}`,
        unmute: 'User unmuted',
        ban: `User banned${durationMinutes ? ` for ${durationMinutes} minutes` : ' permanently'}`,
        unban: 'User unbanned',
        suspend: 'User suspended',
        unsuspend: 'User unsuspended'
      };

      toast({
        title: "Moderation Action Applied",
        description: actionNames[action],
      });

      return data;
    } catch (error) {
      console.error('Moderation action failed:', error);
      toast({
        title: "Error",
        description: "Failed to apply moderation action.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get user moderation status
  const getUserModerationStatus = useCallback(async (userId: string): Promise<UserModerationStatus | null> => {
    try {
      const { data, error } = await supabase
        .from('user_moderation_status')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get user moderation status:', error);
      return null;
    }
  }, []);

  // Check if user is currently muted
  const isUserMuted = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_user_muted', {
        user_id_param: userId
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Failed to check mute status:', error);
      return false;
    }
  }, []);

  // Check if user is currently banned
  const isUserBanned = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_user_banned', {
        user_id_param: userId
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Failed to check ban status:', error);
      return false;
    }
  }, []);

  // Get user reputation score
  const getUserReputation = useCallback(async (userId: string): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('get_user_reputation', {
        user_id_param: userId
      });

      if (error) throw error;
      return data || 100;
    } catch (error) {
      console.error('Failed to get user reputation:', error);
      return 100;
    }
  }, []);

  // Issue warning
  const issueWarning = useCallback(async (
    userId: string,
    reason: string,
    severity: number = 1
  ) => {
    try {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error('User not authenticated');

      const { error } = await supabase.from('user_warnings').insert({
        user_id: userId,
        issued_by: profile.user.id,
        reason: reason,
        severity: severity
      });

      if (error) throw error;

      // Also create moderation action
      await applyModerationAction(userId, 'warn', reason);

      toast({
        title: "Warning Issued",
        description: `Warning issued to user for: ${reason}`,
      });
    } catch (error) {
      console.error('Failed to issue warning:', error);
      toast({
        title: "Error",
        description: "Failed to issue warning.",
        variant: "destructive"
      });
    }
  }, [applyModerationAction, toast]);

  // Get moderation history for a user
  const getModerationHistory = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('moderation_actions')
        .select(`
          *,
          moderator:moderator_id(name, email)
        `)
        .eq('target_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get moderation history:', error);
      return [];
    }
  }, []);

  // Get user warnings
  const getUserWarnings = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_warnings')
        .select(`
          *,
          issued_by_user:issued_by(name, email)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get user warnings:', error);
      return [];
    }
  }, []);

  // Acknowledge warning (user action)
  const acknowledgeWarning = useCallback(async (warningId: string) => {
    try {
      const { error } = await supabase
        .from('user_warnings')
        .update({
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', warningId);

      if (error) throw error;

      toast({
        title: "Warning Acknowledged",
        description: "You have acknowledged this warning.",
      });
    } catch (error) {
      console.error('Failed to acknowledge warning:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge warning.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    applyModerationAction,
    getUserModerationStatus,
    isUserMuted,
    isUserBanned,
    getUserReputation,
    issueWarning,
    getModerationHistory,
    getUserWarnings,
    acknowledgeWarning,
    loading
  };
};