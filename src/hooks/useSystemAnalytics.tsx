import { useState } from 'react';

export interface SystemAnalyticsData {
  totalRateLimitViolations: number;
  violationsThisWeek: number;
  totalSecurityIncidents: number;
  incidentsThisWeek: number;
  averageResponseTime: number;
  systemUptime: number;
  storageUsage: number;
  bandwidthUsage: number;
  rateLimitTrend: Array<{ date: string; violations: number; type: string }>;
  securityEventTrend: Array<{ date: string; events: number; severity: 'low' | 'medium' | 'high' }>;
  performanceMetrics: Array<{ date: string; responseTime: number; uptime: number }>;
  violationTypeDistribution: Array<{ type: string; count: number }>;
  securityEventTypes: Array<{ type: string; count: number; severity: 'low' | 'medium' | 'high' }>;
}

export const useSystemAnalytics = (dateRange: { from: Date; to: Date }) => {
  const [data] = useState<SystemAnalyticsData>({
    totalRateLimitViolations: 0, violationsThisWeek: 0, totalSecurityIncidents: 0, incidentsThisWeek: 0,
    averageResponseTime: 150, systemUptime: 99.9, storageUsage: 65, bandwidthUsage: 45,
    rateLimitTrend: [], securityEventTrend: [], performanceMetrics: [], violationTypeDistribution: [], securityEventTypes: []
  });
  return { data, loading: false, error: null };
};
