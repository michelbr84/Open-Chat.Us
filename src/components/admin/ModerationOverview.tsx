import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  Activity, 
  Flag, 
  Users, 
  MessageSquare, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Shield
} from 'lucide-react';

interface ModerationStats {
  totalUsers: number;
  activeWarnings: number;
  mutedUsers: number;
  bannedUsers: number;
  pendingFlags: number;
  todayActions: number;
  messageVolume24h: number;
  autoBlockedToday: number;
}

export const ModerationOverview = () => {
  const [stats, setStats] = useState<ModerationStats>({
    totalUsers: 0,
    activeWarnings: 0,
    mutedUsers: 0,
    bannedUsers: 0,
    pendingFlags: 0,
    todayActions: 0,
    messageVolume24h: 0,
    autoBlockedToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get user moderation stats
        const { data: moderationStats } = await supabase
          .from('user_moderation_status')
          .select('status, muted_until, banned_until, total_warnings');

        // Get flagged content stats
        const { data: flaggedStats } = await supabase
          .from('flagged_content')
          .select('review_status, created_at, auto_flagged')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        // Get recent moderation actions
        const { data: actionStats } = await supabase
          .from('moderation_actions')
          .select('action, created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        // Calculate stats
        const now = new Date();
        const totalUsers = moderationStats?.length || 0;
        
        const activeWarnings = moderationStats?.reduce((sum, user) => sum + user.total_warnings, 0) || 0;
        
        const mutedUsers = moderationStats?.filter(user => 
          user.status === 'muted' && 
          (!user.muted_until || new Date(user.muted_until) > now)
        ).length || 0;
        
        const bannedUsers = moderationStats?.filter(user => 
          user.status === 'banned' && 
          (!user.banned_until || new Date(user.banned_until) > now)
        ).length || 0;

        const pendingFlags = flaggedStats?.filter(flag => flag.review_status === 'pending').length || 0;
        
        const todayActions = actionStats?.length || 0;
        
        const autoBlockedToday = flaggedStats?.filter(flag => 
          flag.auto_flagged && flag.review_status === 'pending'
        ).length || 0;

        setStats({
          totalUsers,
          activeWarnings,
          mutedUsers,
          bannedUsers,
          pendingFlags,
          todayActions,
          messageVolume24h: 0, // TODO: Add message volume tracking
          autoBlockedToday
        });

        // Get recent high-priority alerts
        const { data: alerts } = await supabase
          .from('flagged_content')
          .select(`
            *,
            flagged_by_user:flagged_by(name, email)
          `)
          .eq('review_status', 'pending')
          .gte('confidence_score', 0.8)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentAlerts(alerts || []);

      } catch (error) {
        console.error('Failed to fetch moderation stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up real-time updates
    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'flagged_content'
      }, () => {
        fetchStats(); // Refresh stats on changes
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'moderation_actions'
      }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 w-20 bg-muted rounded"></div>
              <div className="h-8 w-16 bg-muted rounded"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      description: "Users with moderation status",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Pending Reviews",
      value: stats.pendingFlags,
      description: "Flagged content awaiting review",
      icon: Flag,
      color: stats.pendingFlags > 10 ? "text-red-600" : "text-orange-600"
    },
    {
      title: "Active Sanctions",
      value: stats.mutedUsers + stats.bannedUsers,
      description: `${stats.mutedUsers} muted, ${stats.bannedUsers} banned`,
      icon: Shield,
      color: "text-red-600"
    },
    {
      title: "Today's Actions",
      value: stats.todayActions,
      description: "Moderation actions in 24h",
      icon: Activity,
      color: "text-green-600"
    },
    {
      title: "Auto-Blocked",
      value: stats.autoBlockedToday,
      description: "Auto-moderated content today",
      icon: AlertTriangle,
      color: "text-purple-600"
    },
    {
      title: "Active Warnings",
      value: stats.activeWarnings,
      description: "Total user warnings issued",
      icon: MessageSquare,
      color: "text-yellow-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent High-Priority Alerts */}
      {recentAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              High-Priority Alerts
            </CardTitle>
            <CardDescription>
              Recent content flagged with high confidence scores requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAlerts.map((alert) => (
              <Alert key={alert.id} className="border-red-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>Content Type: {alert.content_type}</span>
                  <Badge variant="destructive">
                    {Math.round(alert.confidence_score * 100)}% confidence
                  </Badge>
                </AlertTitle>
                <AlertDescription>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm">
                      Reason: {alert.flag_reason}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common moderation tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Flag className="h-6 w-6 text-orange-500 mb-2" />
              <h3 className="font-medium">Review Queue</h3>
              <p className="text-sm text-muted-foreground">
                {stats.pendingFlags} items pending review
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Users className="h-6 w-6 text-blue-500 mb-2" />
              <h3 className="font-medium">User Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage user statuses and sanctions
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <TrendingUp className="h-6 w-6 text-green-500 mb-2" />
              <h3 className="font-medium">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                View moderation trends and metrics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};