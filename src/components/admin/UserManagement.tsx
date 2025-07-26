import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useModerationActions } from '@/hooks/useModerationActions';
import { 
  Search,
  User, 
  Shield, 
  Clock, 
  AlertTriangle,
  Ban,
  Volume2,
  VolumeX,
  Flag
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserModerationData {
  id: string;
  user_id: string;
  status: string;
  muted_until?: string;
  banned_until?: string;
  total_warnings: number;
  reputation_score: number;
  is_shadow_banned: boolean;
  last_infraction_at?: string;
  user_email?: string;
  user_name?: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserModerationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserModerationData | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionDuration, setActionDuration] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const { applyModerationAction, loading: actionLoading } = useModerationActions();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [filterStatus]);

  const fetchUsers = async () => {
    try {
      let query = supabase
        .from('user_moderation_status')
        .select(`
          *,
          profiles:user_id(name, email)
        `)
        .order('last_infraction_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus as any);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to include user info
      const transformedUsers = (data as any[])?.map(user => ({
        ...user,
        user_email: user.profiles?.email || 'Unknown',
        user_name: user.profiles?.name || 'Anonymous'
      })) || [];

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: "Error",
        description: "Failed to load user data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = async (
    action: 'warn' | 'mute' | 'unmute' | 'ban' | 'unban',
    duration?: number
  ) => {
    if (!selectedUser || !actionReason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a reason for this action.",
        variant: "destructive"
      });
      return;
    }

    try {
      await applyModerationAction(
        selectedUser.user_id,
        action,
        actionReason,
        duration
      );

      setSelectedUser(null);
      setActionReason('');
      setActionDuration('');
      fetchUsers();
    } catch (error) {
      console.error('Moderation action failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'warned': return 'text-yellow-600';
      case 'muted': return 'text-orange-600';
      case 'banned': return 'text-red-600';
      case 'suspended': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return User;
      case 'warned': return AlertTriangle;
      case 'muted': return VolumeX;
      case 'banned': return Ban;
      case 'suspended': return Shield;
      default: return User;
    }
  };

  const getReputationColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const filteredUsers = users.filter(user => 
    user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_id.includes(searchTerm)
  );

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
      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="warned">Warned</SelectItem>
            <SelectItem value="muted">Muted</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No users found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => {
            const StatusIcon = getStatusIcon(user.status);
            const isExpired = user.muted_until && new Date(user.muted_until) < new Date() ||
                           user.banned_until && new Date(user.banned_until) < new Date();
            
            return (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-5 w-5 ${getStatusColor(user.status)}`} />
                      <div>
                        <CardTitle className="text-base">
                          {user.user_name}
                        </CardTitle>
                        <CardDescription>
                          {user.user_email} • ID: {user.user_id}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={user.status === 'active' ? 'default' : 'secondary'}
                        className={getStatusColor(user.status)}
                      >
                        {user.status}
                        {isExpired && ' (Expired)'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* User Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Reputation:</span>
                      <span className={`ml-1 font-medium ${getReputationColor(user.reputation_score)}`}>
                        {user.reputation_score}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Warnings:</span>
                      <span className="ml-1 font-medium">
                        {user.total_warnings}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Shadow Banned:</span>
                      <span className="ml-1 font-medium">
                        {user.is_shadow_banned ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Issue:</span>
                      <span className="ml-1 font-medium">
                        {user.last_infraction_at 
                          ? new Date(user.last_infraction_at).toLocaleDateString()
                          : 'None'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Expiration Info */}
                  {(user.muted_until || user.banned_until) && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        {user.muted_until ? 'Muted' : 'Banned'} until:
                      </span>
                      <span className="ml-1 font-medium">
                        {new Date(user.muted_until || user.banned_until!).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedUser(user)}
                        >
                          Manage User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Manage User: {user.user_name}</DialogTitle>
                          <DialogDescription>
                            Apply moderation actions to this user
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Action Reason:
                            </label>
                            <Textarea
                              placeholder="Explain the reason for this action..."
                              value={actionReason}
                              onChange={(e) => setActionReason(e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Duration (minutes, optional):
                            </label>
                            <Input
                              type="number"
                              placeholder="Leave empty for permanent"
                              value={actionDuration}
                              onChange={(e) => setActionDuration(e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoading}
                              onClick={() => handleModerationAction('warn')}
                            >
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Warn
                            </Button>
                            
                            {user.status !== 'muted' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoading}
                                onClick={() => handleModerationAction(
                                  'mute', 
                                  actionDuration ? parseInt(actionDuration) : undefined
                                )}
                              >
                                <VolumeX className="h-4 w-4 mr-1" />
                                Mute
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoading}
                                onClick={() => handleModerationAction('unmute')}
                              >
                                <Volume2 className="h-4 w-4 mr-1" />
                                Unmute
                              </Button>
                            )}
                            
                            {user.status !== 'banned' ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={actionLoading}
                                onClick={() => handleModerationAction(
                                  'ban',
                                  actionDuration ? parseInt(actionDuration) : undefined
                                )}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Ban
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoading}
                                onClick={() => handleModerationAction('unban')}
                              >
                                <User className="h-4 w-4 mr-1" />
                                Unban
                              </Button>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};