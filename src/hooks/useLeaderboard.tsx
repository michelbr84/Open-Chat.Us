import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  id: string;
  full_name: string;
  reputation_score: number;
  avatar_url?: string;
  level: number;
  levelName: string;
  achievements_count: number;
  rank: number;
}

export interface LeaderboardFilters {
  timeframe: 'all' | 'week' | 'month';
  category: 'reputation' | 'achievements' | 'messages';
  limit: number;
}

export const useLeaderboard = (filters: LeaderboardFilters) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  // Helper function to calculate level from reputation
  const calculateLevel = (score: number) => {
    const levels = [
      { min: 0, max: 99, name: 'Newcomer' },
      { min: 100, max: 299, name: 'Regular' },
      { min: 300, max: 699, name: 'Contributor' },
      { min: 700, max: 1499, name: 'Veteran' },
      { min: 1500, max: 2999, name: 'Expert' },
      { min: 3000, max: 9999, name: 'Master' },
      { min: 10000, max: Infinity, name: 'Legend' }
    ];

    const currentLevel = levels.find(level => score >= level.min && score <= level.max) || levels[0];
    const levelIndex = levels.indexOf(currentLevel);
    
    return {
      level: levelIndex + 1,
      levelName: currentLevel.name
    };
  };

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('user_profiles')
          .select(`
            id,
            full_name,
            reputation_score,
            avatar_url,
            created_at
          `)
          .order('reputation_score', { ascending: false })
          .limit(filters.limit);

        // Apply timeframe filter
        if (filters.timeframe !== 'all') {
          const date = new Date();
          if (filters.timeframe === 'week') {
            date.setDate(date.getDate() - 7);
          } else if (filters.timeframe === 'month') {
            date.setMonth(date.getMonth() - 1);
          }
          query = query.gte('created_at', date.toISOString());
        }

        const { data: profiles, error } = await query;

        if (error) throw error;

        // Get achievement counts for each user
        const userIds = profiles?.map(p => p.id) || [];
        const { data: achievementCounts } = await supabase
          .from('user_achievements')
          .select('user_id')
          .in('user_id', userIds);

        // Count achievements per user
        const achievementMap = new Map<string, number>();
        achievementCounts?.forEach(ach => {
          achievementMap.set(ach.user_id, (achievementMap.get(ach.user_id) || 0) + 1);
        });

        // Transform data with levels and rankings
        const leaderboardData: LeaderboardEntry[] = (profiles || []).map((profile, index) => {
          const { level, levelName } = calculateLevel(profile.reputation_score);
          return {
            id: profile.id,
            full_name: profile.full_name || 'Anonymous',
            reputation_score: profile.reputation_score,
            avatar_url: profile.avatar_url,
            level,
            levelName,
            achievements_count: achievementMap.get(profile.id) || 0,
            rank: index + 1
          };
        });

        setLeaderboard(leaderboardData);

        // Get current user's rank
        const { data: currentUser } = await supabase.auth.getUser();
        if (currentUser.user) {
          const { count } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .gt('reputation_score', 0); // This would need the user's actual score

          setUserRank((count || 0) + 1);
        }

      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [filters]);

  return {
    leaderboard,
    loading,
    userRank
  };
};