import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserAnalyticsData {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  registrationTrend: Array<{
    date: string;
    count: number;
  }>;
  activityTrend: Array<{
    date: string;
    dailyActive: number;
    weeklyActive: number;
  }>;
  reputationDistribution: Array<{
    range: string;
    count: number;
  }>;
  userRoleDistribution: Array<{
    role: string;
    count: number;
  }>;
}

export const useUserAnalytics = (dateRange: { from: Date; to: Date }) => {
  const [data, setData] = useState<UserAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const fromDate = dateRange.from.toISOString().split('T')[0];
        const toDate = dateRange.to.toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Get total users
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get new users today
        const { count: newUsersToday } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today);

        // Get new users this week
        const { count: newUsersWeek } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', weekAgo);

        // Get new users this month
        const { count: newUsersMonth } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', monthAgo);

        // Get active users today (users who have audit log entries today)
        const { count: activeUsersToday } = await supabase
          .from('audit_logs')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', today)
          .not('user_id', 'is', null);

        // Get active users this week
        const { count: activeUsersWeek } = await supabase
          .from('audit_logs')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', weekAgo)
          .not('user_id', 'is', null);

        // Get registration trend
        const { data: registrationData } = await supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', fromDate)
          .lte('created_at', toDate)
          .order('created_at');

        // Process registration trend
        const registrationTrend = processDateTrend(registrationData || [], 'created_at', fromDate, toDate);

        // Get activity trend (using audit logs as proxy for activity)
        const { data: activityData } = await supabase
          .from('audit_logs')
          .select('created_at, user_id')
          .gte('created_at', fromDate)
          .lte('created_at', toDate)
          .not('user_id', 'is', null)
          .order('created_at');

        // Process activity trend
        const activityTrend = processActivityTrend(activityData || [], fromDate, toDate);

        // Get user role distribution
        const { data: roleData } = await supabase
          .from('profiles')
          .select('role');

        const userRoleDistribution = processRoleDistribution(roleData || []);

        // Get reputation distribution (mock data for now - will be real once reputation system is fully implemented)
        const reputationDistribution = [
          { range: '0-25', count: Math.floor((totalUsers || 0) * 0.1) },
          { range: '26-50', count: Math.floor((totalUsers || 0) * 0.2) },
          { range: '51-75', count: Math.floor((totalUsers || 0) * 0.4) },
          { range: '76-90', count: Math.floor((totalUsers || 0) * 0.2) },
          { range: '91-100', count: Math.floor((totalUsers || 0) * 0.1) }
        ];

        setData({
          totalUsers: totalUsers || 0,
          activeUsersToday: activeUsersToday || 0,
          activeUsersWeek: activeUsersWeek || 0,
          newUsersToday: newUsersToday || 0,
          newUsersWeek: newUsersWeek || 0,
          newUsersMonth: newUsersMonth || 0,
          registrationTrend,
          activityTrend,
          reputationDistribution,
          userRoleDistribution
        });
      } catch (err) {
        console.error('Error fetching user analytics:', err);
        setError('Failed to fetch user analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAnalytics();

    // Set up real-time updates for key metrics
    const channel = supabase
      .channel('user-analytics')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        // Refetch data when profiles change
        fetchUserAnalytics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateRange]);

  return { data, loading, error };
};

// Helper function to process date-based trends
const processDateTrend = (data: any[], dateField: string, fromDate: string, toDate: string) => {
  const dateMap = new Map<string, number>();
  
  // Initialize all dates in range with 0
  const start = new Date(fromDate);
  const end = new Date(toDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dateMap.set(d.toISOString().split('T')[0], 0);
  }
  
  // Count occurrences
  data.forEach(item => {
    const date = item[dateField].split('T')[0];
    if (dateMap.has(date)) {
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    }
  });
  
  return Array.from(dateMap.entries()).map(([date, count]) => ({
    date,
    count
  }));
};

// Helper function to process activity trends
const processActivityTrend = (data: any[], fromDate: string, toDate: string) => {
  const dateMap = new Map<string, Set<string>>();
  
  // Initialize all dates in range
  const start = new Date(fromDate);
  const end = new Date(toDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dateMap.set(d.toISOString().split('T')[0], new Set());
  }
  
  // Track unique users per day
  data.forEach(item => {
    const date = item.created_at.split('T')[0];
    if (dateMap.has(date) && item.user_id) {
      dateMap.get(date)?.add(item.user_id);
    }
  });
  
  return Array.from(dateMap.entries()).map(([date, userSet]) => ({
    date,
    dailyActive: userSet.size,
    weeklyActive: userSet.size // Simplified - in real implementation, this would be a rolling 7-day window
  }));
};

// Helper function to process role distribution
const processRoleDistribution = (data: any[]) => {
  const roleMap = new Map<string, number>();
  
  data.forEach(item => {
    const role = item.role || 'user';
    roleMap.set(role, (roleMap.get(role) || 0) + 1);
  });
  
  return Array.from(roleMap.entries()).map(([role, count]) => ({
    role: role.charAt(0).toUpperCase() + role.slice(1),
    count
  }));
};