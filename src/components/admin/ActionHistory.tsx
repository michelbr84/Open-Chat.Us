import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Clock, 
  User, 
  Shield, 
  AlertTriangle,
  Ban,
  VolumeX,
  FileText
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ModerationAction {
  id: string;
  target_user_id: string;
  moderator_id: string;
  action: string;
  reason: string;
  details?: string;
  duration_minutes?: number;
  expires_at?: string;
  created_at: string;
  moderator_profile?: {
    name: string;
    email: string;
  };
  target_profile?: {
    name: string;
    email: string;
  };
}

export const ActionHistory = () => {
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');

  useEffect(() => {
    fetchActionHistory();
  }, [filterAction, timeFilter]);

  const fetchActionHistory = async () => {
    try {
      let query = supabase
        .from('moderation_actions')
        .select(`
          *,
          moderator_profile:moderator_id(name, email),
          target_profile:target_user_id(name, email)
        `)
        .order('created_at', { ascending: false });

      // Apply action filter
      if (filterAction !== 'all') {
        query = query.eq('action', filterAction as any);
      }

      // Apply time filter
      if (timeFilter !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (timeFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      
      // Type assertion for the joined data
      setActions((data as any[])?.map(action => ({
        ...action,
        moderator_profile: action.moderator_profile || null,
        target_profile: action.target_profile || null
      })) || []);
    } catch (error) {
      console.error('Failed to fetch action history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'warn': return AlertTriangle;
      case 'mute': return VolumeX;
      case 'unmute': return VolumeX;
      case 'ban': return Ban;
      case 'unban': return User;
      case 'suspend': return Shield;
      case 'unsuspend': return Shield;
      default: return FileText;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'warn': return 'text-yellow-600';
      case 'mute': return 'text-orange-600';
      case 'unmute': return 'text-green-600';
      case 'ban': return 'text-red-600';
      case 'unban': return 'text-green-600';
      case 'suspend': return 'text-purple-600';
      case 'unsuspend': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredActions = actions.filter(action => {
    const searchLower = searchTerm.toLowerCase();
    return (
      action.target_profile?.name?.toLowerCase().includes(searchLower) ||
      action.target_profile?.email?.toLowerCase().includes(searchLower) ||
      action.moderator_profile?.name?.toLowerCase().includes(searchLower) ||
      action.reason.toLowerCase().includes(searchLower) ||
      action.target_user_id.includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-32 bg-muted rounded"></div>
              <div className="h-3 w-48 bg-muted rounded"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user, moderator, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="warn">Warnings</SelectItem>
            <SelectItem value="mute">Mutes</SelectItem>
            <SelectItem value="unmute">Unmutes</SelectItem>
            <SelectItem value="ban">Bans</SelectItem>
            <SelectItem value="unban">Unbans</SelectItem>
            <SelectItem value="suspend">Suspensions</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action History */}
      <div className="space-y-4">
        {filteredActions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No actions found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredActions.map((action) => {
            const ActionIcon = getActionIcon(action.action);
            
            return (
              <Card key={action.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <ActionIcon className={`h-5 w-5 ${getActionColor(action.action)}`} />
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {action.action.charAt(0).toUpperCase() + action.action.slice(1)} Action
                          <Badge variant="outline" className={getActionColor(action.action)}>
                            {action.action}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {new Date(action.created_at).toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Target User */}
                  <div>
                    <h4 className="text-sm font-medium mb-1">Target User:</h4>
                    <p className="text-sm text-muted-foreground">
                      {action.target_profile?.name || 'Unknown'} ({action.target_profile?.email || action.target_user_id})
                    </p>
                  </div>

                  {/* Moderator */}
                  <div>
                    <h4 className="text-sm font-medium mb-1">Moderator:</h4>
                    <p className="text-sm text-muted-foreground">
                      {action.moderator_profile?.name || 'System'} ({action.moderator_profile?.email || 'Automated'})
                    </p>
                  </div>

                  {/* Reason */}
                  <div>
                    <h4 className="text-sm font-medium mb-1">Reason:</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {action.reason}
                    </p>
                  </div>

                  {/* Duration and Expiry */}
                  {action.duration_minutes && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Duration:</h4>
                      <p className="text-sm text-muted-foreground">
                        {action.duration_minutes} minutes
                        {action.expires_at && (
                          <span className="ml-2">
                            (Expires: {new Date(action.expires_at).toLocaleString()})
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Additional Details */}
                  {action.details && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Additional Details:</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {action.details}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};