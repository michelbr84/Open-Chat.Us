import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Users, UserPlus, Activity, TrendingUp } from 'lucide-react';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { AnalyticsChart } from './AnalyticsChart';
import { MetricCard } from './MetricCard';
import { DateRangePicker } from './DateRangePicker';
import { exportToCsv, exportToPdf } from '@/utils/exportUtils';

export const UserAnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  const { data, loading, error } = useUserAnalytics({
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
        <p className="text-destructive">Error loading user analytics: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Analytics</h2>
          <p className="text-muted-foreground">
            Monitor user registration, activity, and engagement patterns
          </p>
        </div>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={data?.totalUsers || 0}
          icon={Users}
          loading={loading}
          description="All registered users"
        />
        <MetricCard
          title="New Users (Week)"
          value={data?.newUsersWeek || 0}
          change={{
            value: data?.newUsersWeek && data?.newUsersMonth 
              ? ((data.newUsersWeek / (data.newUsersMonth / 4)) - 1) * 100 
              : 0,
            period: 'last week'
          }}
          icon={UserPlus}
          variant="positive"
          loading={loading}
        />
        <MetricCard
          title="Active Users (Today)"
          value={data?.activeUsersToday || 0}
          icon={Activity}
          loading={loading}
          description="Users active in the last 24 hours"
        />
        <MetricCard
          title="Active Users (Week)"
          value={data?.activeUsersWeek || 0}
          change={{
            value: data?.activeUsersWeek && data?.activeUsersToday 
              ? ((data.activeUsersWeek / 7) / Math.max(data.activeUsersToday, 1) - 1) * 100 
              : 0,
            period: 'daily average'
          }}
          icon={TrendingUp}
          variant="positive"
          loading={loading}
        />
      </div>

      {/* Registration Trend */}
      <AnalyticsChart
        title="User Registration Trend"
        description="New user registrations over time"
        data={data?.registrationTrend || []}
        type="area"
        xAxisKey="date"
        yAxisKey="count"
        loading={loading}
        onExport={(format) => handleExport('user-registration-trend', data?.registrationTrend || [], format)}
      />

      {/* Activity Trend */}
      <AnalyticsChart
        title="User Activity Trend"
        description="Daily and weekly active user patterns"
        data={data?.activityTrend || []}
        type="line"
        xAxisKey="date"
        yAxisKey={['dailyActive', 'weeklyActive']}
        loading={loading}
        onExport={(format) => handleExport('user-activity-trend', data?.activityTrend || [], format)}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Role Distribution */}
        <AnalyticsChart
          title="User Role Distribution"
          description="Distribution of user roles across the platform"
          data={data?.userRoleDistribution || []}
          type="pie"
          xAxisKey="role"
          yAxisKey="count"
          height={250}
          loading={loading}
          onExport={(format) => handleExport('user-role-distribution', data?.userRoleDistribution || [], format)}
        />

        {/* Reputation Distribution */}
        <AnalyticsChart
          title="User Reputation Distribution"
          description="Distribution of user reputation scores"
          data={data?.reputationDistribution || []}
          type="bar"
          xAxisKey="range"
          yAxisKey="count"
          height={250}
          loading={loading}
          onExport={(format) => handleExport('reputation-distribution', data?.reputationDistribution || [], format)}
        />
      </div>
    </div>
  );
};