import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemAnalyticsData {
  totalRateLimitViolations: number;
  violationsThisWeek: number;
  totalSecurityIncidents: number;
  incidentsThisWeek: number;
  averageResponseTime: number;
  systemUptime: number;
  storageUsage: number;
  bandwidthUsage: number;
  rateLimitTrend: Array<{
    date: string;
    violations: number;
    type: string;
  }>;
  securityEventTrend: Array<{
    date: string;
    events: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  performanceMetrics: Array<{
    date: string;
    responseTime: number;
    uptime: number;
  }>;
  violationTypeDistribution: Array<{
    type: string;
    count: number;
  }>;
  securityEventTypes: Array<{
    type: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export const useSystemAnalytics = (dateRange: { from: Date; to: Date }) => {
  const [data, setData] = useState<SystemAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystemAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const fromDate = dateRange.from.toISOString();
        const toDate = dateRange.to.toISOString();
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // Get rate limit violations
        const { count: totalRateLimitViolations } = await supabase
          .from('rate_limit_violations')
          .select('*', { count: 'exact', head: true });

        const { count: violationsThisWeek } = await supabase
          .from('rate_limit_violations')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', weekAgo);

        // Get security incidents (from audit logs)
        const { count: totalSecurityIncidents } = await supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .or('action_type.ilike.%SECURITY%,action_type.eq.RATE_LIMIT_EXCEEDED');

        const { count: incidentsThisWeek } = await supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .or('action_type.ilike.%SECURITY%,action_type.eq.RATE_LIMIT_EXCEEDED')
          .gte('created_at', weekAgo);

        // Mock performance data (in real implementation, this would come from monitoring services)
        const averageResponseTime = 150 + Math.random() * 100; // 150-250ms
        const systemUptime = 99.5 + Math.random() * 0.5; // 99.5-100%
        const storageUsage = 65 + Math.random() * 20; // 65-85%
        const bandwidthUsage = 45 + Math.random() * 30; // 45-75%

        // Get rate limit trend
        const { data: rateLimitData } = await supabase
          .from('rate_limit_violations')
          .select('created_at, violation_type')
          .gte('created_at', fromDate)
          .lte('created_at', toDate)
          .order('created_at');

        const rateLimitTrend = processRateLimitTrend(
          rateLimitData || [], 
          dateRange.from.toISOString().split('T')[0], 
          dateRange.to.toISOString().split('T')[0]
        );

        // Get security event trend
        const { data: securityData } = await supabase
          .from('audit_logs')
          .select('created_at, action_type, metadata')
          .or('action_type.ilike.%SECURITY%,action_type.eq.RATE_LIMIT_EXCEEDED')
          .gte('created_at', fromDate)
          .lte('created_at', toDate)
          .order('created_at');

        const securityEventTrend = processSecurityEventTrend(
          securityData || [], 
          dateRange.from.toISOString().split('T')[0], 
          dateRange.to.toISOString().split('T')[0]
        );

        // Generate mock performance metrics
        const performanceMetrics = generatePerformanceMetrics(
          dateRange.from.toISOString().split('T')[0], 
          dateRange.to.toISOString().split('T')[0]
        );

        // Process violation type distribution
        const violationTypeDistribution = processViolationTypes(rateLimitData || []);

        // Process security event types
        const securityEventTypes = processSecurityEventTypes(securityData || []);

        setData({
          totalRateLimitViolations: totalRateLimitViolations || 0,
          violationsThisWeek: violationsThisWeek || 0,
          totalSecurityIncidents: totalSecurityIncidents || 0,
          incidentsThisWeek: incidentsThisWeek || 0,
          averageResponseTime,
          systemUptime,
          storageUsage,
          bandwidthUsage,
          rateLimitTrend,
          securityEventTrend,
          performanceMetrics,
          violationTypeDistribution,
          securityEventTypes
        });
      } catch (err) {
        console.error('Error fetching system analytics:', err);
        setError('Failed to fetch system analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchSystemAnalytics();

    // Set up real-time updates
    const channel = supabase
      .channel('system-analytics')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rate_limit_violations'
      }, () => {
        fetchSystemAnalytics();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'audit_logs',
        filter: 'action_type=ilike.*SECURITY*'
      }, () => {
        fetchSystemAnalytics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateRange]);

  return { data, loading, error };
};

// Helper functions
const processRateLimitTrend = (data: any[], fromDate: string, toDate: string) => {
  const dateMap = new Map<string, Map<string, number>>();
  
  // Initialize all dates
  const start = new Date(fromDate);
  const end = new Date(toDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    dateMap.set(dateStr, new Map());
  }
  
  // Count violations by type and date
  data.forEach(item => {
    const date = item.created_at.split('T')[0];
    const type = item.violation_type || 'Unknown';
    
    if (dateMap.has(date)) {
      const typeMap = dateMap.get(date)!;
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    }
  });
  
  // Flatten to array format
  const result: Array<{ date: string; violations: number; type: string }> = [];
  
  dateMap.forEach((typeMap, date) => {
    if (typeMap.size === 0) {
      result.push({ date, violations: 0, type: 'None' });
    } else {
      typeMap.forEach((count, type) => {
        result.push({ date, violations: count, type });
      });
    }
  });
  
  return result;
};

const processSecurityEventTrend = (data: any[], fromDate: string, toDate: string) => {
  const dateMap = new Map<string, Map<string, number>>();
  
  // Initialize all dates
  const start = new Date(fromDate);
  const end = new Date(toDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    dateMap.set(dateStr, new Map([
      ['low', 0],
      ['medium', 0],
      ['high', 0]
    ]));
  }
  
  // Count events by severity and date
  data.forEach(item => {
    const date = item.created_at.split('T')[0];
    // Determine severity based on action type
    let severity: 'low' | 'medium' | 'high' = 'low';
    
    if (item.action_type.includes('RATE_LIMIT_EXCEEDED')) {
      severity = 'medium';
    } else if (item.action_type.includes('SECURITY_SENSITIVE')) {
      severity = 'high';
    }
    
    if (dateMap.has(date)) {
      const severityMap = dateMap.get(date)!;
      severityMap.set(severity, (severityMap.get(severity) || 0) + 1);
    }
  });
  
  // Flatten to array format
  const result: Array<{ date: string; events: number; severity: 'low' | 'medium' | 'high' }> = [];
  
  dateMap.forEach((severityMap, date) => {
    const totalEvents = Array.from(severityMap.values()).reduce((sum, count) => sum + count, 0);
    
    // Find the dominant severity for this date
    let dominantSeverity: 'low' | 'medium' | 'high' = 'low';
    let maxCount = 0;
    
    severityMap.forEach((count, severity) => {
      if (count > maxCount) {
        maxCount = count;
        dominantSeverity = severity as 'low' | 'medium' | 'high';
      }
    });
    
    result.push({ date, events: totalEvents, severity: dominantSeverity });
  });
  
  return result;
};

const generatePerformanceMetrics = (fromDate: string, toDate: string) => {
  const result: Array<{ date: string; responseTime: number; uptime: number }> = [];
  
  const start = new Date(fromDate);
  const end = new Date(toDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    
    // Generate realistic mock data
    const baseResponseTime = 150;
    const responseTime = baseResponseTime + (Math.random() - 0.5) * 100;
    
    const baseUptime = 99.5;
    const uptime = Math.min(100, baseUptime + (Math.random() - 0.3) * 1);
    
    result.push({
      date: dateStr,
      responseTime: Math.max(50, responseTime),
      uptime: Math.max(95, uptime)
    });
  }
  
  return result;
};

const processViolationTypes = (data: any[]) => {
  const typeMap = new Map<string, number>();
  
  data.forEach(item => {
    const type = item.violation_type || 'Unknown';
    typeMap.set(type, (typeMap.get(type) || 0) + 1);
  });
  
  return Array.from(typeMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
};

const processSecurityEventTypes = (data: any[]) => {
  const typeMap = new Map<string, { count: number; severity: 'low' | 'medium' | 'high' }>();
  
  data.forEach(item => {
    const type = item.action_type;
    let severity: 'low' | 'medium' | 'high' = 'low';
    
    if (type.includes('RATE_LIMIT_EXCEEDED')) {
      severity = 'medium';
    } else if (type.includes('SECURITY_SENSITIVE')) {
      severity = 'high';
    }
    
    if (typeMap.has(type)) {
      typeMap.get(type)!.count++;
    } else {
      typeMap.set(type, { count: 1, severity });
    }
  });
  
  return Array.from(typeMap.entries())
    .map(([type, data]) => ({ type, count: data.count, severity: data.severity }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};