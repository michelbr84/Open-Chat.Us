import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MoreHorizontal, Flag, Copy, Reply, Edit, Trash, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageActionsProps {
  messageId: string;
  isOwn: boolean;
  content: string;
  senderName?: string;
  senderId?: string;
  onReport?: (reason: string, details?: string) => void;
  onEdit?: (newContent: string) => void;
  onDelete?: () => void;
  onReply?: () => void;
  onPrivateMessage?: (senderId: string, senderName: string) => void;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or unwanted content' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate', label: 'Hate speech or discrimination' },
  { value: 'violence', label: 'Violence or threats' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' },
];

export const MessageActions = ({
  messageId,
  isOwn,
  content,
  senderName,
  senderId,
  onReport,
  onEdit,
  onDelete,
  onReply,
  onPrivateMessage,
}: MessageActionsProps) => {
  const { toast } = useToast();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Message content copied to clipboard.",
    });
  };

  const handleReport = () => {
    if (!reportReason) return;
    
    onReport?.(reportReason, reportDetails);
    setShowReportDialog(false);
    setReportReason('');
    setReportDetails('');
    
    toast({
      title: "Report submitted",
      description: "Thank you for helping keep our community safe.",
    });
  };

  const handleDelete = () => {
    onDelete?.();
    setShowDeleteDialog(false);
    toast({
      title: "Message deleted",
      description: "Your message has been removed.",
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {onReply && (
            <>
              <DropdownMenuItem onClick={onReply}>
                <Reply className="w-4 h-4 mr-2" />
                Reply
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            Copy message
          </DropdownMenuItem>
          
          {isOwn && onEdit && (
            <DropdownMenuItem onClick={() => onEdit(content)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit message
            </DropdownMenuItem>
          )}
          
          {isOwn && onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete message
              </DropdownMenuItem>
            </>
          )}
          
          {!isOwn && onPrivateMessage && senderId && senderName && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onPrivateMessage(senderId, senderName)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Send private message
              </DropdownMenuItem>
            </>
          )}
          
          {!isOwn && onReport && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowReportDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Flag className="w-4 h-4 mr-2" />
                Report message
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Report Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Report Message</AlertDialogTitle>
            <AlertDialogDescription>
              Help us understand what's wrong with this message. Your report will be reviewed by our moderation team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Why are you reporting this message?</Label>
              <RadioGroup value={reportReason} onValueChange={setReportReason} className="mt-2">
                {REPORT_REASONS.map((reason) => (
                  <div key={reason.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason.value} id={reason.value} />
                    <Label htmlFor={reason.value} className="text-sm font-normal">
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div>
              <Label htmlFor="report-details" className="text-sm font-medium">
                Additional details (optional)
              </Label>
              <Textarea
                id="report-details"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Provide more context if needed..."
                className="mt-1 resize-none"
                rows={3}
              />
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReport}
              disabled={!reportReason}
              className="bg-destructive hover:bg-destructive/90"
            >
              Submit Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};