import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  id: string;
  username: string;
  total_points: number;
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
        // Use the leaderboard table we created
        const { data: leaderboardData, error } = await supabase
          .from('leaderboard')
          .select('*')
          .order('total_points', { ascending: false })
          .limit(filters.limit);

        if (error) throw error;

        // Get achievement counts for each user
        const userIds = leaderboardData?.map((p: any) => p.user_id) || [];
        
        let achievementMap = new Map<string, number>();
        if (userIds.length > 0) {
          const { data: achievementCounts } = await supabase
            .from('user_achievements')
            .select('user_id')
            .in('user_id', userIds);

          achievementCounts?.forEach((ach: any) => {
            achievementMap.set(ach.user_id, (achievementMap.get(ach.user_id) || 0) + 1);
          });
        }

        // Transform data with levels and rankings
        const transformedData: LeaderboardEntry[] = (leaderboardData || []).map((entry: any, index: number) => {
          const { level, levelName } = calculateLevel(entry.total_points || 0);
          return {
            id: entry.id,
            username: entry.username || 'Anonymous',
            total_points: entry.total_points || 0,
            avatar_url: undefined,
            level,
            levelName,
            achievements_count: achievementMap.get(entry.user_id) || 0,
            rank: index + 1
          };
        });

        setLeaderboard(transformedData);

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
