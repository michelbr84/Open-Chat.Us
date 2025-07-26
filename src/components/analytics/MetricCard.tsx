import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
  };
  icon?: LucideIcon;
  variant?: 'default' | 'positive' | 'negative' | 'warning';
  loading?: boolean;
  description?: string;
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'positive':
      return {
        icon: 'text-green-600',
        badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      };
    case 'negative':
      return {
        icon: 'text-red-600',
        badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      };
    case 'warning':
      return {
        icon: 'text-orange-600',
        badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      };
    default:
      return {
        icon: 'text-primary',
        badge: 'bg-secondary text-secondary-foreground'
      };
  }
};

const formatValue = (value: string | number): string => {
  if (typeof value === 'number') {
    // Format large numbers with suffixes
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  }
  return value.toString();
};

const getChangeIndicator = (changeValue: number) => {
  if (changeValue > 0) {
    return { symbol: '+', variant: 'positive' };
  } else if (changeValue < 0) {
    return { symbol: '', variant: 'negative' };
  }
  return { symbol: '', variant: 'default' };
};

export const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  variant = 'default',
  loading = false,
  description
}: MetricCardProps) => {
  const styles = getVariantStyles(variant);
  const changeIndicator = change ? getChangeIndicator(change.value) : null;

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="animate-pulse bg-muted rounded h-4 w-24"></div>
          </CardTitle>
          {Icon && (
            <div className="animate-pulse bg-muted rounded h-4 w-4"></div>
          )}
        </CardHeader>
        <CardContent>
          <div className="animate-pulse bg-muted rounded h-7 w-16 mb-2"></div>
          <div className="animate-pulse bg-muted rounded h-3 w-20"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && (
          <Icon className={cn("h-4 w-4", styles.icon)} />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        <div className="flex items-center gap-2 mt-2">
          {change && changeIndicator && (
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs",
                styles.badge
              )}
            >
              {changeIndicator.symbol}{Math.abs(change.value).toFixed(1)}%
            </Badge>
          )}
          {change && (
            <p className="text-xs text-muted-foreground">
              from {change.period}
            </p>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};