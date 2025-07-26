import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ReputationActivity {
  id: string;
  action_type: string;
  action_description: string;
  points_earned: number;
  created_at: string;
  metadata?: any;
}

export interface UserReputation {
  reputation_score: number;
  level: number;
  levelName: string;
  pointsToNextLevel: number;
  totalPoints: number;
  rank?: number;
}

export const useReputation = () => {
  const { user } = useAuth();
  const [reputation, setReputation] = useState<UserReputation>({
    reputation_score: 0,
    level: 1,
    levelName: 'Newcomer',
    pointsToNextLevel: 100,
    totalPoints: 0
  });
  const [activities, setActivities] = useState<ReputationActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Reputation level thresholds and names
  const levels = [
    { min: 0, max: 99, name: 'Newcomer', color: 'text-slate-600' },
    { min: 100, max: 299, name: 'Regular', color: 'text-green-600' },
    { min: 300, max: 699, name: 'Contributor', color: 'text-blue-600' },
    { min: 700, max: 1499, name: 'Veteran', color: 'text-purple-600' },
    { min: 1500, max: 2999, name: 'Expert', color: 'text-orange-600' },
    { min: 3000, max: 9999, name: 'Master', color: 'text-red-600' },
    { min: 10000, max: Infinity, name: 'Legend', color: 'text-yellow-600' }
  ];

  // Calculate reputation level from score
  const calculateLevel = useCallback((score: number) => {
    const currentLevel = levels.find(level => score >= level.min && score <= level.max) || levels[0];
    const levelIndex = levels.indexOf(currentLevel);
    const nextLevel = levels[levelIndex + 1];
    
    return {
      level: levelIndex + 1,
      levelName: currentLevel.name,
      color: currentLevel.color,
      pointsToNextLevel: nextLevel ? nextLevel.min - score : 0,
      totalPoints: score
    };
  }, []);

  // Load user reputation
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadReputation = async () => {
      try {
        // Get user profile with reputation score
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('reputation_score')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        const score = profile?.reputation_score || 0;
        const levelInfo = calculateLevel(score);
        
        setReputation({
          reputation_score: score,
          ...levelInfo
        });

        // Load recent reputation activities from audit logs
        const { data: auditData, error: auditError } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('user_id', user.id)
          .in('action_type', ['MESSAGE_POST', 'REACTION_ADD', 'HELPFUL_ACTION'])
          .order('created_at', { ascending: false })
          .limit(20);

        if (!auditError && auditData) {
          const reputationActivities = auditData.map(log => ({
            id: log.id,
            action_type: log.action_type,
            action_description: log.action_description,
            points_earned: getPointsForAction(log.action_type),
            created_at: log.created_at,
            metadata: log.metadata
          }));
          setActivities(reputationActivities);
        }

      } catch (error) {
        console.error('Failed to load reputation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReputation();
  }, [user, calculateLevel]);

  // Get points for different actions
  const getPointsForAction = (actionType: string): number => {
    switch (actionType) {
      case 'MESSAGE_POST': return 2;
      case 'REACTION_ADD': return 1;
      case 'HELPFUL_ACTION': return 5;
      case 'ACHIEVEMENT_UNLOCKED': return 10;
      default: return 0;
    }
  };

  // Award reputation points
  const awardPoints = async (actionType: string, points?: number) => {
    if (!user) return;

    const pointsToAward = points || getPointsForAction(actionType);
    
    try {
      // Update user reputation score
      const { error } = await supabase.rpc('update_user_reputation', {
        user_id_param: user.id,
        points: pointsToAward
      });

      if (!error) {
        // Update local state
        const newScore = reputation.reputation_score + pointsToAward;
        const levelInfo = calculateLevel(newScore);
        
        setReputation(prev => ({
          ...prev,
          reputation_score: newScore,
          ...levelInfo
        }));
      }
    } catch (error) {
      console.error('Failed to award reputation points:', error);
    }
  };

  // Get reputation rank (would need server-side function for accurate ranking)
  const getReputationRank = async (): Promise<number | null> => {
    try {
      const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gt('reputation_score', reputation.reputation_score);

      return (count || 0) + 1;
    } catch (error) {
      console.error('Failed to get reputation rank:', error);
      return null;
    }
  };

  return {
    reputation,
    activities,
    loading,
    levels,
    awardPoints,
    getReputationRank,
    calculateLevel
  };
};