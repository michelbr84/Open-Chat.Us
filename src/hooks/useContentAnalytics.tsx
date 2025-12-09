import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ContentAnalyticsData {
  totalMessages: number;
  messagesThisWeek: number;
  messagesGrowth: number;
  totalReactions: number;
  reactionsThisWeek: number;
  totalFlags: number;
  flagsThisWeek: number;
  flagResolutionRate: number;
  autoModerationRate: number;
  messageVolumeTrend: Array<{
    date: string;
    messages: number;
    reactions: number;
  }>;
  flaggingTrend: Array<{
    date: string;
    flags: number;
    resolved: number;
  }>;
  moderationActionTypes: Array<{
    action: string;
    count: number;
  }>;
  contentTypeDistribution: Array<{
    type: string;
    count: number;
  }>;
  topFlagReasons: Array<{
    reason: string;
    count: number;
  }>;
}

export const useContentAnalytics = (dateRange: { from: Date; to: Date }) => {
  const [data, setData] = useState<ContentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContentAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Get total messages
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      // Get messages this week
      const { count: messagesThisWeek } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo);

      // Get total reactions
      const { count: totalReactions } = await supabase
        .from('message_reactions')
        .select('*', { count: 'exact', head: true });

      // Get reactions this week
      const { count: reactionsThisWeek } = await supabase
        .from('message_reactions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo);

      // Get total flags
      const { count: totalFlags } = await supabase
        .from('flagged_content')
        .select('*', { count: 'exact', head: true });

      // Get flags this week
      const { count: flagsThisWeek } = await supabase
        .from('flagged_content')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo);

      // Get resolved flags for resolution rate
      const { count: resolvedFlags } = await supabase
        .from('flagged_content')
        .select('*', { count: 'exact', head: true })
        .neq('review_status', 'pending');

      const flagResolutionRate = totalFlags ? ((resolvedFlags || 0) / totalFlags) * 100 : 0;

      // Get auto-flagged content for auto-moderation rate
      const { count: autoFlags } = await supabase
        .from('flagged_content')
        .select('*', { count: 'exact', head: true })
        .eq('auto_flagged', true);

      const autoModerationRate = totalFlags ? ((autoFlags || 0) / totalFlags) * 100 : 0;

      // Get moderation action types
      const { data: moderationData } = await supabase
        .from('moderation_actions')
        .select('action_type');

      const moderationActionTypes = processModerationActions(moderationData || []);

      // Get top flag reasons
      const { data: flagReasonData } = await supabase
        .from('flagged_content')
        .select('reason');

      const topFlagReasons = processFlagReasons(flagReasonData || []);

      setData({
        totalMessages: totalMessages || 0,
        messagesThisWeek: messagesThisWeek || 0,
        messagesGrowth: 0,
        totalReactions: totalReactions || 0,
        reactionsThisWeek: reactionsThisWeek || 0,
        totalFlags: totalFlags || 0,
        flagsThisWeek: flagsThisWeek || 0,
        flagResolutionRate,
        autoModerationRate,
        messageVolumeTrend: [],
        flaggingTrend: [],
        moderationActionTypes,
        contentTypeDistribution: [
          { type: 'Text Messages', count: totalMessages || 0 },
          { type: 'Reactions', count: totalReactions || 0 }
        ],
        topFlagReasons
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchContentAnalytics();
  }, [fetchContentAnalytics]);

  return { data, loading, error };
};

const processModerationActions = (data: any[]) => {
  const actionMap = new Map<string, number>();
  
  data.forEach(item => {
    const action = item.action_type || 'unknown';
    actionMap.set(action, (actionMap.get(action) || 0) + 1);
  });
  
  return Array.from(actionMap.entries())
    .map(([action, count]) => ({
      action: action.charAt(0).toUpperCase() + action.slice(1),
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

const processFlagReasons = (data: any[]) => {
  const reasonMap = new Map<string, number>();
  
  data.forEach(item => {
    const reason = item.reason || 'Other';
    reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
  });
  
  return Array.from(reasonMap.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};
