import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserPresence } from '@/hooks/useUserPresence';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type StatusType = 'online' | 'away' | 'busy' | 'offline';

const statusOptions: { value: StatusType; label: string; color: string; description: string }[] = [
  {
    value: 'online',
    label: 'Online',
    color: 'bg-green-500',
    description: 'Available and active',
  },
  {
    value: 'away',
    label: 'Away',
    color: 'bg-yellow-500',
    description: 'Away from keyboard',
  },
  {
    value: 'busy',
    label: 'Busy',
    color: 'bg-red-500',
    description: 'Do not disturb',
  },
  {
    value: 'offline',
    label: 'Offline',
    color: 'bg-gray-400',
    description: 'Not available',
  },
];

export const StatusUpdateModal = ({ isOpen, onClose }: StatusUpdateModalProps) => {
  const { userStatus, updateUserStatus } = useUserPresence();
  const [selectedStatus, setSelectedStatus] = useState<StatusType>('online');
  const [customMessage, setCustomMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (userStatus) {
      setSelectedStatus(userStatus.status as StatusType);
      setCustomMessage(userStatus.custom_message || '');
    }
  }, [userStatus]);

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      await updateUserStatus(selectedStatus, customMessage || undefined);
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearMessage = () => {
    setCustomMessage('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Your Status</DialogTitle>
          <DialogDescription>
            Let others know your availability and what you're up to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={selectedStatus} onValueChange={(value: StatusType) => setSelectedStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${option.color}`} />
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <div className="space-y-2">
              <Input
                id="message"
                placeholder="What's on your mind?"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                maxLength={100}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {customMessage.length}/100 characters
                </span>
                {customMessage && (
                  <Button variant="ghost" size="sm" onClick={handleClearMessage}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {customMessage && (
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-sm text-muted-foreground">Preview:</Label>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-3 h-3 rounded-full ${statusOptions.find(s => s.value === selectedStatus)?.color}`} />
                <Badge variant="outline" className="text-sm">
                  {statusOptions.find(s => s.value === selectedStatus)?.label}
                </Badge>
                <span className="text-sm">"{customMessage}"</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdateStatus} disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};