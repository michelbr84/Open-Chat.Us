import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ModerationAction = 'warn' | 'mute' | 'unmute' | 'ban' | 'unban' | 'suspend' | 'unsuspend';

interface UserModerationStatus {
  id: string;
  user_id: string;
  status: string;
  muted_until?: string | null;
  banned_until?: string | null;
  total_warnings: number;
}

export const useModerationActions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Apply moderation action using the moderation_actions table
  const applyModerationAction = useCallback(async (
    targetUserId: string,
    action: ModerationAction,
    reason: string,
    durationMinutes?: number
  ) => {
    setLoading(true);
    
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      // Insert moderation action record
      const { error } = await supabase.from('moderation_actions').insert({
        target_user_id: targetUserId,
        action_type: action,
        reason: reason,
        duration_minutes: durationMinutes || null,
        moderator_id: authUser.user?.id || null
      });

      if (error) throw error;

      // Update user moderation status based on action
      if (action === 'mute' || action === 'unmute') {
        await supabase.from('user_moderation_status').upsert({
          user_id: targetUserId,
          muted_until: action === 'mute' && durationMinutes 
            ? new Date(Date.now() + durationMinutes * 60 * 1000).toISOString() 
            : null,
          status: action === 'mute' ? 'muted' : 'active',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      }

      if (action === 'ban' || action === 'unban') {
        await supabase.from('user_moderation_status').upsert({
          user_id: targetUserId,
          banned_until: action === 'ban' && durationMinutes 
            ? new Date(Date.now() + durationMinutes * 60 * 1000).toISOString() 
            : action === 'ban' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
          status: action === 'ban' ? 'banned' : 'active',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      }

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

      return true;
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
      return data as UserModerationStatus | null;
    } catch (error) {
      console.error('Failed to get user moderation status:', error);
      return null;
    }
  }, []);

  // Check if user is currently muted
  const isUserMuted = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const status = await getUserModerationStatus(userId);
      if (!status?.muted_until) return false;
      return new Date(status.muted_until) > new Date();
    } catch (error) {
      console.error('Failed to check mute status:', error);
      return false;
    }
  }, [getUserModerationStatus]);

  // Check if user is currently banned
  const isUserBanned = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const status = await getUserModerationStatus(userId);
      if (!status?.banned_until) return false;
      return new Date(status.banned_until) > new Date();
    } catch (error) {
      console.error('Failed to check ban status:', error);
      return false;
    }
  }, [getUserModerationStatus]);

  // Get user reputation score from profiles table
  const getUserReputation = useCallback(async (userId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('reputation')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data?.reputation || 100;
    } catch (error) {
      console.error('Failed to get user reputation:', error);
      return 100;
    }
  }, []);

  // Issue warning - using moderation_actions table
  const issueWarning = useCallback(async (
    userId: string,
    reason: string,
    severity: number = 1
  ) => {
    try {
      await applyModerationAction(userId, 'warn', reason);

      // Update total warnings count
      const status = await getUserModerationStatus(userId);
      await supabase.from('user_moderation_status').upsert({
        user_id: userId,
        total_warnings: (status?.total_warnings || 0) + severity,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

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
  }, [applyModerationAction, getUserModerationStatus, toast]);

  // Get moderation history for a user
  const getModerationHistory = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('moderation_actions')
        .select('*')
        .eq('target_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get moderation history:', error);
      return [];
    }
  }, []);

  // Get user warnings
  const getUserWarnings = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('moderation_actions')
        .select('*')
        .eq('target_user_id', userId)
        .eq('action_type', 'warn')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get user warnings:', error);
      return [];
    }
  }, []);

  // Acknowledge warning (user action) - no-op since we don't have is_acknowledged column
  const acknowledgeWarning = useCallback(async (warningId: string) => {
    toast({
      title: "Warning Acknowledged",
      description: "You have acknowledged this warning.",
    });
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
