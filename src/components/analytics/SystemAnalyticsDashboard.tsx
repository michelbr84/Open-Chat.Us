import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Shield, Activity, AlertTriangle, Server } from 'lucide-react';
import { useSystemAnalytics } from '@/hooks/useSystemAnalytics';
import { AnalyticsChart } from './AnalyticsChart';
import { MetricCard } from './MetricCard';
import { DateRangePicker } from './DateRangePicker';
import { exportToCsv, exportToPdf } from '@/utils/exportUtils';

export const SystemAnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  const { data, loading, error } = useSystemAnalytics({
    from: dateRange.from || new Date(),
    to: dateRange.to || new Date()
  });

  const handleExport = (chartName: string, chartData: any[], format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      exportToCsv(chartData, `${chartName}-${Date.now()}.csv`);
    } else {
      exportToPdf(chartData, chartName, `${chartName}-${Date.now()}.pdf`);
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading system analytics: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health & Security</h2>
          <p className="text-muted-foreground">
            Monitor system performance, security incidents, and resource usage
          </p>
        </div>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="System Uptime"
          value={`${data?.systemUptime?.toFixed(2) || 0}%`}
          icon={Server}
          variant={data?.systemUptime && data.systemUptime > 99 ? 'positive' : 'warning'}
          loading={loading}
        />
        <MetricCard
          title="Avg Response Time"
          value={`${data?.averageResponseTime?.toFixed(0) || 0}ms`}
          icon={Activity}
          variant={data?.averageResponseTime && data.averageResponseTime < 200 ? 'positive' : 'warning'}
          loading={loading}
        />
        <MetricCard
          title="Rate Limit Violations"
          value={data?.violationsThisWeek || 0}
          icon={Shield}
          variant={data?.violationsThisWeek && data.violationsThisWeek < 10 ? 'positive' : 'warning'}
          loading={loading}
        />
        <MetricCard
          title="Security Incidents"
          value={data?.incidentsThisWeek || 0}
          icon={AlertTriangle}
          variant={data?.incidentsThisWeek && data.incidentsThisWeek === 0 ? 'positive' : 'negative'}
          loading={loading}
        />
      </div>

      <AnalyticsChart
        title="Security Events Trend"
        description="Security incidents and violations over time"
        data={data?.securityEventTrend || []}
        type="line"
        xAxisKey="date"
        yAxisKey="events"
        loading={loading}
        onExport={(format) => handleExport('security-events-trend', data?.securityEventTrend || [], format)}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <AnalyticsChart
          title="Violation Types"
          data={data?.violationTypeDistribution || []}
          type="pie"
          xAxisKey="type"
          yAxisKey="count"
          height={250}
          loading={loading}
          onExport={(format) => handleExport('violation-types', data?.violationTypeDistribution || [], format)}
        />

        <AnalyticsChart
          title="Performance Metrics"
          data={data?.performanceMetrics || []}
          type="area"
          xAxisKey="date"
          yAxisKey={['responseTime', 'uptime']}
          height={250}
          loading={loading}
          onExport={(format) => handleExport('performance-metrics', data?.performanceMetrics || [], format)}
        />
      </div>
    </div>
  );
};