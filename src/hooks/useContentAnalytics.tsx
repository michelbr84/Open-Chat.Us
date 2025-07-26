import { useState, useEffect } from 'react';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContentAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const fromDate = dateRange.from.toISOString();
        const toDate = dateRange.to.toISOString();
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // Get total messages (using audit logs as proxy)
        const { count: totalMessages } = await supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .eq('action_type', 'MESSAGE_POST');

        // Get messages this week
        const { count: messagesThisWeek } = await supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .eq('action_type', 'MESSAGE_POST')
          .gte('created_at', weekAgo);

        // Get messages previous week for growth calculation
        const previousWeekStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
        const { count: messagesPreviousWeek } = await supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .eq('action_type', 'MESSAGE_POST')
          .gte('created_at', previousWeekStart)
          .lt('created_at', weekAgo);

        // Calculate growth rate
        const messagesGrowth = messagesPreviousWeek 
          ? ((messagesThisWeek || 0) - messagesPreviousWeek) / messagesPreviousWeek * 100 
          : 0;

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

        const flagResolutionRate = totalFlags ? (resolvedFlags || 0) / totalFlags * 100 : 0;

        // Get auto-flagged content for auto-moderation rate
        const { count: autoFlags } = await supabase
          .from('flagged_content')
          .select('*', { count: 'exact', head: true })
          .eq('auto_flagged', true);

        const autoModerationRate = totalFlags ? (autoFlags || 0) / totalFlags * 100 : 0;

        // Get message volume trend
        const { data: messageVolumeData } = await supabase
          .from('audit_logs')
          .select('created_at')
          .eq('action_type', 'MESSAGE_POST')
          .gte('created_at', fromDate)
          .lte('created_at', toDate)
          .order('created_at');

        // Get reaction trend
        const { data: reactionData } = await supabase
          .from('message_reactions')
          .select('created_at')
          .gte('created_at', fromDate)
          .lte('created_at', toDate)
          .order('created_at');

        const messageVolumeTrend = processMessageVolumeTrend(
          messageVolumeData || [], 
          reactionData || [], 
          dateRange.from.toISOString().split('T')[0], 
          dateRange.to.toISOString().split('T')[0]
        );

        // Get flagging trend
        const { data: flagData } = await supabase
          .from('flagged_content')
          .select('created_at, review_status')
          .gte('created_at', fromDate)
          .lte('created_at', toDate)
          .order('created_at');

        const flaggingTrend = processFlaggingTrend(
          flagData || [], 
          dateRange.from.toISOString().split('T')[0], 
          dateRange.to.toISOString().split('T')[0]
        );

        // Get moderation action types
        const { data: moderationData } = await supabase
          .from('moderation_actions')
          .select('action');

        const moderationActionTypes = processModerationActions(moderationData || []);

        // Get content type distribution (simplified)
        const contentTypeDistribution = [
          { type: 'Text Messages', count: totalMessages || 0 },
          { type: 'Media', count: Math.floor((totalMessages || 0) * 0.15) },
          { type: 'Links', count: Math.floor((totalMessages || 0) * 0.08) },
          { type: 'Reactions', count: totalReactions || 0 }
        ];

        // Get top flag reasons
        const { data: flagReasonData } = await supabase
          .from('flagged_content')
          .select('flag_reason');

        const topFlagReasons = processFlagReasons(flagReasonData || []);

        setData({
          totalMessages: totalMessages || 0,
          messagesThisWeek: messagesThisWeek || 0,
          messagesGrowth,
          totalReactions: totalReactions || 0,
          reactionsThisWeek: reactionsThisWeek || 0,
          totalFlags: totalFlags || 0,
          flagsThisWeek: flagsThisWeek || 0,
          flagResolutionRate,
          autoModerationRate,
          messageVolumeTrend,
          flaggingTrend,
          moderationActionTypes,
          contentTypeDistribution,
          topFlagReasons
        });
      } catch (err) {
        console.error('Error fetching content analytics:', err);
        setError('Failed to fetch content analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchContentAnalytics();

    // Set up real-time updates
    const channel = supabase
      .channel('content-analytics')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'flagged_content'
      }, () => {
        fetchContentAnalytics();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'message_reactions'
      }, () => {
        fetchContentAnalytics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateRange]);

  return { data, loading, error };
};

// Helper functions
const processMessageVolumeTrend = (messageData: any[], reactionData: any[], fromDate: string, toDate: string) => {
  const dateMap = new Map<string, { messages: number; reactions: number }>();
  
  // Initialize all dates
  const start = new Date(fromDate);
  const end = new Date(toDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    dateMap.set(dateStr, { messages: 0, reactions: 0 });
  }
  
  // Count messages
  messageData.forEach(item => {
    const date = item.created_at.split('T')[0];
    if (dateMap.has(date)) {
      const entry = dateMap.get(date)!;
      entry.messages++;
    }
  });
  
  // Count reactions
  reactionData.forEach(item => {
    const date = item.created_at.split('T')[0];
    if (dateMap.has(date)) {
      const entry = dateMap.get(date)!;
      entry.reactions++;
    }
  });
  
  return Array.from(dateMap.entries()).map(([date, data]) => ({
    date,
    messages: data.messages,
    reactions: data.reactions
  }));
};

const processFlaggingTrend = (flagData: any[], fromDate: string, toDate: string) => {
  const dateMap = new Map<string, { flags: number; resolved: number }>();
  
  // Initialize all dates
  const start = new Date(fromDate);
  const end = new Date(toDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    dateMap.set(dateStr, { flags: 0, resolved: 0 });
  }
  
  // Count flags and resolutions
  flagData.forEach(item => {
    const date = item.created_at.split('T')[0];
    if (dateMap.has(date)) {
      const entry = dateMap.get(date)!;
      entry.flags++;
      if (item.review_status !== 'pending') {
        entry.resolved++;
      }
    }
  });
  
  return Array.from(dateMap.entries()).map(([date, data]) => ({
    date,
    flags: data.flags,
    resolved: data.resolved
  }));
};

const processModerationActions = (data: any[]) => {
  const actionMap = new Map<string, number>();
  
  data.forEach(item => {
    const action = item.action || 'unknown';
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
    const reason = item.flag_reason || 'Other';
    reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
  });
  
  return Array.from(reasonMap.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};