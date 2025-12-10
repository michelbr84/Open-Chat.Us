import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { MessageSquare, Heart, Flag, TrendingUp } from 'lucide-react';
import { useContentAnalytics } from '@/hooks/useContentAnalytics';
import { AnalyticsChart } from './AnalyticsChart';
import { MetricCard } from './MetricCard';
import { DateRangePicker } from './DateRangePicker';
import { exportToCsv, exportToPdf } from '@/utils/exportUtils';

export const ContentAnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  const { data, loading, error } = useContentAnalytics({
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
        <p className="text-destructive">Error loading content analytics: {String(error)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content & Moderation Analytics</h2>
          <p className="text-muted-foreground">
            Track content engagement, moderation effectiveness, and safety metrics
          </p>
        </div>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Messages"
          value={data?.totalMessages || 0}
          icon={MessageSquare}
          loading={loading}
        />
        <MetricCard
          title="Messages Growth"
          value={`${data?.messagesGrowth?.toFixed(1) || 0}%`}
          change={{
            value: data?.messagesGrowth || 0,
            period: 'vs last week'
          }}
          icon={TrendingUp}
          variant={data?.messagesGrowth && data.messagesGrowth > 0 ? 'positive' : 'negative'}
          loading={loading}
        />
        <MetricCard
          title="Total Reactions"
          value={data?.totalReactions || 0}
          icon={Heart}
          loading={loading}
        />
        <MetricCard
          title="Flag Resolution Rate"
          value={`${data?.flagResolutionRate?.toFixed(1) || 0}%`}
          icon={Flag}
          variant={data?.flagResolutionRate && data.flagResolutionRate > 80 ? 'positive' : 'warning'}
          loading={loading}
        />
      </div>

      <AnalyticsChart
        title="Content Volume Trend"
        description="Messages and reactions over time"
        data={data?.messageVolumeTrend || []}
        type="area"
        xAxisKey="date"
        yAxisKey={['messages', 'reactions']}
        loading={loading}
        onExport={(format) => handleExport('content-volume-trend', data?.messageVolumeTrend || [], format)}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <AnalyticsChart
          title="Content Type Distribution"
          data={data?.contentTypeDistribution || []}
          type="pie"
          xAxisKey="type"
          yAxisKey="count"
          height={250}
          loading={loading}
          onExport={(format) => handleExport('content-type-distribution', data?.contentTypeDistribution || [], format)}
        />

        <AnalyticsChart
          title="Top Flag Reasons"
          data={data?.topFlagReasons || []}
          type="bar"
          xAxisKey="reason"
          yAxisKey="count"
          height={250}
          loading={loading}
          onExport={(format) => handleExport('top-flag-reasons', data?.topFlagReasons || [], format)}
        />
      </div>
    </div>
  );
};
