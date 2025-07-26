import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Achievement {
  id: string;
  achievement_code: string;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  reputation_reward: number;
  icon_name?: string;
  unlocks_feature?: string;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_code: string;
  achievement_name: string;
  achievement_description: string;
  points_awarded: number;
  unlocked_at: string;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all available achievements
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .order('category', { ascending: true });

        if (error) throw error;
        setAchievements((data || []) as Achievement[]);
      } catch (error) {
        console.error('Failed to load achievements:', error);
      }
    };

    loadAchievements();
  }, []);

  // Load user's achievements
  useEffect(() => {
    if (!user) {
      setUserAchievements([]);
      setLoading(false);
      return;
    }

    const loadUserAchievements = async () => {
      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id)
          .order('unlocked_at', { ascending: false });

        if (error) throw error;
        setUserAchievements(data || []);
      } catch (error) {
        console.error('Failed to load user achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserAchievements();

    // Subscribe to new achievements
    const channel = supabase
      .channel('user-achievements')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newAchievement = payload.new as UserAchievement;
          setUserAchievements(prev => [newAchievement, ...prev]);
          
          // Show achievement notification
          toast({
            title: "🏆 Achievement Unlocked!",
            description: `${newAchievement.achievement_name} - ${newAchievement.points_awarded} points`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Get achievements by category
  const getAchievementsByCategory = (category: string) => {
    return achievements.filter(achievement => achievement.category === category);
  };

  // Check if user has specific achievement
  const hasAchievement = (achievementCode: string) => {
    return userAchievements.some(ua => ua.achievement_code === achievementCode);
  };

  // Get user's progress towards achievements
  const getAchievementProgress = () => {
    const categories = [...new Set(achievements.map(a => a.category))];
    return categories.map(category => {
      const categoryAchievements = getAchievementsByCategory(category);
      const unlockedCount = categoryAchievements.filter(a => hasAchievement(a.achievement_code)).length;
      
      return {
        category,
        unlocked: unlockedCount,
        total: categoryAchievements.length,
        percentage: categoryAchievements.length > 0 ? (unlockedCount / categoryAchievements.length) * 100 : 0
      };
    });
  };

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-slate-600 border-slate-300';
      case 'uncommon': return 'text-green-600 border-green-300';
      case 'rare': return 'text-blue-600 border-blue-300';
      case 'epic': return 'text-purple-600 border-purple-300';
      case 'legendary': return 'text-orange-600 border-orange-300';
      default: return 'text-slate-600 border-slate-300';
    }
  };

  // Get total reputation points from achievements
  const getTotalAchievementPoints = () => {
    return userAchievements.reduce((total, achievement) => total + (achievement.points_awarded || 0), 0);
  };

  return {
    achievements,
    userAchievements,
    loading,
    getAchievementsByCategory,
    hasAchievement,
    getAchievementProgress,
    getRarityColor,
    getTotalAchievementPoints
  };
};