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
      
      // Simple validation - check for basic content issues
      const violations: ModerationResult['triggered_filters'] = [];
      let score = 0;
      
      // Basic spam check
      if (content.length > 1000) {
        violations.push({ filter_id: '1', filter_name: 'Length limit', severity_level: 1, action_type: 'warn' });
        score += 20;
      }
      
      // Check for excessive caps
      const capsRatio = (content.match(/[A-Z]/g)?.length || 0) / content.length;
      if (capsRatio > 0.7 && content.length > 10) {
        violations.push({ filter_id: '2', filter_name: 'Excessive caps', severity_level: 1, action_type: 'warn' });
        score += 15;
      }

      let action_required: ModerationResult['action_required'] = 'allow';
      if (score >= 50) action_required = 'flag';
      if (score >= 80) action_required = 'auto_remove';

      return {
        action_required,
        violation_score: score,
        confidence_score: Math.min(score / 100, 1),
        triggered_filters: violations,
        user_reputation: 100
      };
    } catch (error) {
      console.error('Enhanced auto-moderation error:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

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
      // Create entry in flagged_content table instead
      const { data, error } = await supabase.from('flagged_content').insert({
        message_id: contentId,
        reason: `Auto-flagged: ${contentType}`,
        auto_flagged: autoFlagged,
        review_status: 'pending'
      }).select().single();

      if (error) {
        console.error('Error creating moderation queue entry:', error);
        return null;
      }

      return data?.id || null;
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
      const { error } = await supabase.from('moderation_actions').insert({
        action_type: action,
        target_message_id: queueId,
        reason: reviewNotes,
        duration_minutes: durationMinutes
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

      return true;
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
        .from('flagged_content')
        .select('*')
        .eq('review_status', status)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching moderation queue:', error);
        return [];
      }

      // Transform to ModerationQueueItem format
      return (data || []).map((item: any) => ({
        id: item.id,
        content_id: item.message_id || '',
        content_type: 'message',
        content_text: item.reason || '',
        auto_flagged: item.auto_flagged || false,
        priority_level: 1,
        status: item.review_status || 'pending',
        created_at: item.created_at
      }));
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
        .maybeSingle();

      if (error) {
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
    // Simply log the violation - no dedicated table needed
    console.warn('Rate limit violation:', { userIdentifier, violationType, channelContext });
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
