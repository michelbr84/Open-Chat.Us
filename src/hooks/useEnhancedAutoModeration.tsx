import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ModerationResult {
  action_required: 'allow' | 'flag' | 'warn' | 'auto_remove';
  violation_score: number;
  confidence_score: number;
  triggered_filters: Array<{
    filter_id: string;
    filter_name: string;
    severity_level: number;
    action_type: string;
  }>;
  user_reputation: number;
}

export interface ModerationQueueItem {
  id: string;
  content_id: string;
  content_type: string;
  content_text: string;
  author_id?: string;
  author_name?: string;
  auto_flagged: boolean;
  confidence_score?: number;
  priority_level: number;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  created_at: string;
}

export const useEnhancedAutoModeration = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const validateContent = useCallback(async (
    content: string,
    userId?: string,
    contextType: string = 'message'
  ): Promise<ModerationResult | null> => {
    try {
      setIsProcessing(true);
      
      const { data, error } = await supabase.rpc('enhanced_content_validation', {
        content_text: content,
        user_id_param: userId,
        context_type: contextType
      });

      if (error) {
        console.error('Content validation error:', error);
        toast({
          title: 'Moderation Error',
          description: 'Failed to validate content. Please try again.',
          variant: 'destructive',
        });
        return null;
      }

      return data as unknown as ModerationResult;
    } catch (error) {
      console.error('Enhanced auto-moderation error:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const createModerationQueueEntry = useCallback(async (
    contentId: string,
    contentType: string,
    contentText: string,
    authorId?: string,
    authorName?: string,
    filterId?: string,
    flaggedByUser?: string,
    autoFlagged: boolean = true,
    confidenceScore?: number,
    priorityLevel: number = 1
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('create_moderation_queue_entry', {
        p_content_id: contentId,
        p_content_type: contentType,
        p_content_text: contentText,
        p_author_id: authorId,
        p_author_name: authorName,
        p_filter_id: filterId,
        p_flagged_by_user: flaggedByUser,
        p_auto_flagged: autoFlagged,
        p_confidence_score: confidenceScore,
        p_priority_level: priorityLevel
      });

      if (error) {
        console.error('Error creating moderation queue entry:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to create moderation queue entry:', error);
      return null;
    }
  }, []);

  const processModerationAction = useCallback(async (
    queueId: string,
    action: string,
    reviewNotes?: string,
    durationMinutes?: number
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('process_moderation_action', {
        p_queue_id: queueId,
        p_action: action,
        p_review_notes: reviewNotes,
        p_duration_minutes: durationMinutes
      });

      if (error) {
        console.error('Error processing moderation action:', error);
        toast({
          title: 'Action Failed',
          description: 'Failed to process moderation action. Please try again.',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Action Processed',
        description: `Moderation action "${action}" has been applied successfully.`,
      });

      return data;
    } catch (error) {
      console.error('Failed to process moderation action:', error);
      return false;
    }
  }, [toast]);

  const getModerationQueue = useCallback(async (
    status: string = 'pending',
    limit: number = 50
  ): Promise<ModerationQueueItem[]> => {
    try {
      const { data, error } = await supabase
        .from('moderation_queue')
        .select('*')
        .eq('status', status)
        .order('priority_level', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching moderation queue:', error);
        return [];
      }

      return (data || []) as ModerationQueueItem[];
    } catch (error) {
      console.error('Failed to fetch moderation queue:', error);
      return [];
    }
  }, []);

  const getUserModerationStatus = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_moderation_status')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user moderation status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch user moderation status:', error);
      return null;
    }
  }, []);

  const trackRateLimitViolation = useCallback(async (
    userIdentifier: string,
    violationType: string,
    channelContext?: string
  ) => {
    try {
      const { error } = await supabase.from('rate_limit_violations').insert({
        user_identifier: userIdentifier,
        violation_type: violationType,
        channel_context: channelContext,
        time_window_start: new Date().toISOString()
      });

      if (error) {
        console.error('Error tracking rate limit violation:', error);
      }
    } catch (error) {
      console.error('Failed to track rate limit violation:', error);
    }
  }, []);

  return {
    validateContent,
    createModerationQueueEntry,
    processModerationAction,
    getModerationQueue,
    getUserModerationStatus,
    trackRateLimitViolation,
    isProcessing
  };
};