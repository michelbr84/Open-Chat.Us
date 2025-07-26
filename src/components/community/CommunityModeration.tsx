import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Flag, AlertTriangle, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMessageReports } from '@/hooks/useMessageReports';
import { useToast } from '@/hooks/use-toast';

interface CommunityModerationProps {
  messageId: string;
  messageContent: string;
  authorName: string;
  isReported?: boolean;
  className?: string;
}

export const CommunityModeration = ({
  messageId,
  messageContent,
  authorName,
  isReported = false,
  className = ""
}: CommunityModerationProps) => {
  const { user } = useAuth();
  const { submitReport } = useMessageReports();
  const { toast } = useToast();
  
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [votes, setVotes] = useState({ helpful: 0, inappropriate: 0 });
  const [userVote, setUserVote] = useState<'helpful' | 'inappropriate' | null>(null);

  const reportReasons = [
    'Spam or unwanted content',
    'Harassment or bullying',
    'Inappropriate language',
    'Off-topic discussion',
    'Misinformation',
    'Other'
  ];

  const handleReport = async () => {
    if (!reportReason) {
      toast({
        title: "Please select a reason",
        description: "You must select a reason for reporting.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const success = await submitReport(messageId, reportReason, reportDetails);
      if (success) {
        setShowReportDialog(false);
        setReportReason('');
        setReportDetails('');
        toast({
          title: "Report submitted",
          description: "Thank you for helping keep our community safe."
        });
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommunityVote = async (voteType: 'helpful' | 'inappropriate') => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to vote on content.",
        variant: "destructive"
      });
      return;
    }

    // Mock voting system - in a real app, this would update the backend
    if (userVote === voteType) {
      // Remove vote
      setVotes(prev => ({
        ...prev,
        [voteType]: Math.max(0, prev[voteType] - 1)
      }));
      setUserVote(null);
    } else {
      // Add/change vote
      const newVotes = { ...votes };
      if (userVote) {
        newVotes[userVote] = Math.max(0, newVotes[userVote] - 1);
      }
      newVotes[voteType] = newVotes[voteType] + 1;
      setVotes(newVotes);
      setUserVote(voteType);
    }

    toast({
      title: "Vote recorded",
      description: `Thanks for your feedback on this content.`
    });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Community Voting */}
      <div className="flex items-center gap-1">
        <Button
          variant={userVote === 'helpful' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleCommunityVote('helpful')}
          className="h-7 px-2"
        >
          <ThumbsUp className="w-3 h-3" />
          {votes.helpful > 0 && <span className="ml-1 text-xs">{votes.helpful}</span>}
        </Button>
        
        <Button
          variant={userVote === 'inappropriate' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleCommunityVote('inappropriate')}
          className="h-7 px-2"
        >
          <ThumbsDown className="w-3 h-3" />
          {votes.inappropriate > 0 && <span className="ml-1 text-xs">{votes.inappropriate}</span>}
        </Button>
      </div>

      {/* Report Button */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-destructive hover:text-destructive"
            disabled={isReported}
          >
            <Flag className="w-3 h-3" />
            {isReported && <span className="ml-1 text-xs">Reported</span>}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Report Content
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded border-l-4 border-muted-foreground">
              <p className="text-sm text-muted-foreground mb-1">Reported message from {authorName}:</p>
              <p className="text-sm font-medium line-clamp-3">{messageContent}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for reporting:</label>
              <div className="space-y-2">
                {reportReasons.map(reason => (
                  <label key={reason} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={reportReason === reason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional details (optional):</label>
              <Textarea
                placeholder="Provide more context about why you're reporting this content..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowReportDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReport}
                disabled={submitting || !reportReason}
                className="flex-1"
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Quality Indicators */}
      {votes.inappropriate > votes.helpful && votes.inappropriate > 2 && (
        <Badge variant="destructive" className="text-xs">
          <Eye className="w-3 h-3 mr-1" />
          Flagged
        </Badge>
      )}
      
      {votes.helpful > votes.inappropriate && votes.helpful > 3 && (
        <Badge variant="secondary" className="text-xs">
          <ThumbsUp className="w-3 h-3 mr-1" />
          Quality
        </Badge>
      )}
    </div>
  );
};