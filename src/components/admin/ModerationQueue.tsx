import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Check, 
  X, 
  Clock, 
  Flag, 
  MessageSquare, 
  FileText,
  User,
  AlertTriangle,
  Eye
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface FlaggedItem {
  id: string;
  content_type: string;
  content_id: string;
  flag_reason: string;
  auto_flagged: boolean;
  confidence_score: number;
  review_status: string;
  created_at: string;
  flagged_by_user?: {
    name: string;
    email: string;
  } | null;
}

export const ModerationQueue = () => {
  const [flaggedItems, setFlaggedItems] = useState<FlaggedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingItem, setReviewingItem] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'high-priority'>('pending');
  const { toast } = useToast();

  useEffect(() => {
    fetchFlaggedItems();
    
    // Set up real-time updates
    const channel = supabase
      .channel('moderation-queue')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'flagged_content'
      }, () => {
        fetchFlaggedItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  const fetchFlaggedItems = async () => {
    try {
      let query = supabase
        .from('flagged_content')
        .select(`
          *,
          flagged_by_user:flagged_by(name, email)
        `)
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('review_status', 'pending');
      } else if (filter === 'high-priority') {
        query = query.eq('review_status', 'pending').gte('confidence_score', 0.8);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Type assertion for the joined data
      setFlaggedItems((data as any[])?.map(item => ({
        ...item,
        flagged_by_user: item.flagged_by_user || null
      })) || []);
    } catch (error) {
      console.error('Failed to fetch flagged items:', error);
      toast({
        title: "Error",
        description: "Failed to load moderation queue.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const reviewItem = async (itemId: string, action: 'approve' | 'reject') => {
    setReviewingItem(itemId);
    
    try {
      const { error } = await supabase
        .from('flagged_content')
        .update({
          review_status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes || null
        })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Review Complete",
        description: `Item ${action}d successfully.`,
      });

      setReviewNotes('');
      fetchFlaggedItems();
    } catch (error) {
      console.error('Failed to review item:', error);
      toast({
        title: "Error",
        description: "Failed to review item.",
        variant: "destructive"
      });
    } finally {
      setReviewingItem(null);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'message':
        return MessageSquare;
      case 'user':
        return User;
      case 'attachment':
        return FileText;
      default:
        return Flag;
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 0.8) return 'bg-red-500';
    if (score >= 0.6) return 'bg-orange-500';
    if (score >= 0.4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPriorityText = (score: number) => {
    if (score >= 0.8) return 'Critical';
    if (score >= 0.6) return 'High';
    if (score >= 0.4) return 'Medium';
    return 'Low';
  };

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
      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          className="flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          Pending ({flaggedItems.filter(item => item.review_status === 'pending').length})
        </Button>
        <Button
          variant={filter === 'high-priority' ? 'default' : 'outline'}
          onClick={() => setFilter('high-priority')}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4" />
          High Priority
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="flex items-center gap-2"
        >
          <Flag className="h-4 w-4" />
          All Items
        </Button>
      </div>

      {/* Queue Items */}
      {flaggedItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No items in queue</h3>
            <p className="text-sm text-muted-foreground">
              All flagged content has been reviewed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {flaggedItems.map((item) => {
            const ContentIcon = getContentTypeIcon(item.content_type);
            
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <ContentIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {item.content_type.charAt(0).toUpperCase() + item.content_type.slice(1)} Flagged
                          {item.auto_flagged && (
                            <Badge variant="secondary" className="text-xs">
                              Auto-detected
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span>ID: {item.content_id}</span>
                          <span>•</span>
                          <span>{new Date(item.created_at).toLocaleString()}</span>
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Priority Badge */}
                      <div className="flex items-center gap-1">
                        <div 
                          className={`w-2 h-2 rounded-full ${getPriorityColor(item.confidence_score)}`}
                        ></div>
                        <span className="text-xs text-muted-foreground">
                          {getPriorityText(item.confidence_score)}
                        </span>
                      </div>
                      
                      <Badge variant={
                        item.review_status === 'pending' ? 'secondary' :
                        item.review_status === 'approved' ? 'default' : 'destructive'
                      }>
                        {item.review_status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Flag Reason */}
                  <div>
                    <h4 className="text-sm font-medium mb-1">Reason:</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {item.flag_reason}
                    </p>
                  </div>

                  {/* Flagged By */}
                  {item.flagged_by_user && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Flagged by:</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.flagged_by_user.name} ({item.flagged_by_user.email})
                      </p>
                    </div>
                  )}

                  {/* Confidence Score */}
                  <div>
                    <h4 className="text-sm font-medium mb-1">Confidence Score:</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getPriorityColor(item.confidence_score)}`}
                          style={{ width: `${item.confidence_score * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(item.confidence_score * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Review Actions */}
                  {item.review_status === 'pending' && (
                    <div className="space-y-3 pt-2 border-t">
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Review Notes (Optional):
                        </label>
                        <Textarea
                          placeholder="Add notes about your review decision..."
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => reviewItem(item.id, 'approve')}
                          disabled={reviewingItem === item.id}
                          className="flex items-center gap-1"
                          variant="default"
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => reviewItem(item.id, 'reject')}
                          disabled={reviewingItem === item.id}
                          className="flex items-center gap-1"
                          variant="destructive"
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              View Content
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Content Details</DialogTitle>
                              <DialogDescription>
                                Reviewing {item.content_type} ID: {item.content_id}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Content Information:</h4>
                                <div className="bg-muted p-3 rounded text-sm">
                                  <p><strong>Type:</strong> {item.content_type}</p>
                                  <p><strong>ID:</strong> {item.content_id}</p>
                                  <p><strong>Flag Reason:</strong> {item.flag_reason}</p>
                                  <p><strong>Confidence:</strong> {Math.round(item.confidence_score * 100)}%</p>
                                </div>
                              </div>
                              {/* TODO: Add actual content preview based on content_type */}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};