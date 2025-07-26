import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  MessageSquare,
  Shield,
  Ban,
  AlertCircle
} from 'lucide-react';
import { useEnhancedAutoModeration, ModerationQueueItem } from '@/hooks/useEnhancedAutoModeration';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const priorityColors = {
  1: 'bg-blue-500',
  2: 'bg-yellow-500', 
  3: 'bg-orange-500',
  4: 'bg-red-500',
  5: 'bg-red-700'
};

const priorityLabels = {
  1: 'Low',
  2: 'Medium',
  3: 'High', 
  4: 'Critical',
  5: 'Emergency'
};

export const EnhancedModerationQueue: React.FC = () => {
  const [queueItems, setQueueItems] = useState<ModerationQueueItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ModerationQueueItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionType, setActionType] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  
  const { 
    getModerationQueue, 
    processModerationAction, 
    isProcessing 
  } = useEnhancedAutoModeration();

  const loadQueueItems = async () => {
    setLoading(true);
    const items = await getModerationQueue(statusFilter);
    setQueueItems(items);
    setLoading(false);
  };

  useEffect(() => {
    loadQueueItems();
  }, [statusFilter]);

  // Real-time subscription for queue updates
  useEffect(() => {
    const channel = supabase
      .channel('moderation-queue-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'moderation_queue'
      }, () => {
        loadQueueItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter]);

  const handleAction = async () => {
    if (!selectedItem || !actionType) return;
    
    const success = await processModerationAction(
      selectedItem.id,
      actionType,
      reviewNotes,
      durationMinutes
    );
    
    if (success) {
      setSelectedItem(null);
      setReviewNotes('');
      setActionType('');
      setDurationMinutes(undefined);
      await loadQueueItems();
    }
  };

  const getPriorityBadge = (level: number) => (
    <Badge 
      variant="secondary" 
      className={`${priorityColors[level as keyof typeof priorityColors]} text-white`}
    >
      {priorityLabels[level as keyof typeof priorityLabels]}
    </Badge>
  );

  const getConfidenceBadge = (score?: number) => {
    if (!score) return null;
    const percentage = Math.round(score * 100);
    const variant = percentage >= 80 ? 'destructive' : percentage >= 60 ? 'secondary' : 'outline';
    return <Badge variant={variant}>{percentage}% confidence</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enhanced Moderation Queue
          </CardTitle>
          <CardDescription>
            Review and process flagged content with enhanced moderation tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Label htmlFor="status-filter">Status Filter:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={loadQueueItems} variant="outline" disabled={loading}>
              Refresh Queue
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Queue Items List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Queue Items ({queueItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : queueItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No items in queue
                      </div>
                    ) : (
                      queueItems.map((item) => (
                        <Card 
                          key={item.id} 
                          className={`cursor-pointer transition-colors ${
                            selectedItem?.id === item.id ? 'border-primary bg-primary/5' : ''
                          }`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                <span className="font-medium">{item.content_type}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {getPriorityBadge(item.priority_level)}
                                {getConfidenceBadge(item.confidence_score)}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {item.content_text}
                            </p>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {item.author_name || 'Anonymous'}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(item.created_at), 'MMM dd, HH:mm')}
                              </div>
                            </div>
                            {item.auto_flagged && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                Auto-flagged
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Item Details and Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Review & Action</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedItem ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Content</Label>
                      <div className="mt-1 p-3 bg-muted rounded-lg">
                        <p className="text-sm">{selectedItem.content_text}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Author</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedItem.author_name || 'Anonymous'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Priority</Label>
                        <div>{getPriorityBadge(selectedItem.priority_level)}</div>
                      </div>
                    </div>

                    {selectedItem.confidence_score && (
                      <div>
                        <Label className="text-sm font-medium">Confidence Score</Label>
                        <div>{getConfidenceBadge(selectedItem.confidence_score)}</div>
                      </div>
                    )}

                    <Separator />

                    <div>
                      <Label htmlFor="action-select">Action</Label>
                      <Select value={actionType} onValueChange={setActionType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Approve Content
                            </div>
                          </SelectItem>
                          <SelectItem value="content_removed">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-500" />
                              Remove Content
                            </div>
                          </SelectItem>
                          <SelectItem value="user_warned">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              Warn User
                            </div>
                          </SelectItem>
                          <SelectItem value="user_muted">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                              Mute User
                            </div>
                          </SelectItem>
                          <SelectItem value="user_banned">
                            <div className="flex items-center gap-2">
                              <Ban className="h-4 w-4 text-red-700" />
                              Ban User
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(actionType === 'user_muted' || actionType === 'user_banned') && (
                      <div>
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          placeholder="e.g., 60 for 1 hour, 1440 for 1 day"
                          value={durationMinutes || ''}
                          onChange={(e) => setDurationMinutes(parseInt(e.target.value) || undefined)}
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="review-notes">Review Notes</Label>
                      <Textarea
                        id="review-notes"
                        placeholder="Add notes about your decision..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button 
                      onClick={handleAction}
                      disabled={!actionType || isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? 'Processing...' : 'Apply Action'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select an item from the queue to review and take action
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};