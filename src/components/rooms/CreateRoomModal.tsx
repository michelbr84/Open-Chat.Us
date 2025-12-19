import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRooms } from '@/hooks/useRooms';
import { Lock, Users, Clock, Loader2 } from 'lucide-react';

interface CreateRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomCreated?: (room: any) => void;
}

export const CreateRoomModal = ({ open, onOpenChange, onRoomCreated }: CreateRoomModalProps) => {
  const { createRoom } = useRooms();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [roomType, setRoomType] = useState<'private' | 'group'>('private');
  const [isTemporary, setIsTemporary] = useState(false);
  const [expiresIn, setExpiresIn] = useState('60');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    setIsLoading(true);
    const room = await createRoom(
      name, 
      description, 
      roomType, 
      isTemporary, 
      parseInt(expiresIn)
    );
    setIsLoading(false);

    if (room) {
      onRoomCreated?.(room);
      onOpenChange(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setRoomType('private');
    setIsTemporary(false);
    setExpiresIn('60');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {roomType === 'private' ? <Lock className="h-5 w-5" /> : <Users className="h-5 w-5" />}
            Create {isTemporary ? 'Temporary' : ''} Room
          </DialogTitle>
          <DialogDescription>
            {isTemporary 
              ? 'This room will be automatically deleted when it expires.'
              : 'Create a private room for secure conversations.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Room Name</Label>
            <Input
              id="name"
              placeholder="Enter room name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
              aria-describedby="name-hint"
            />
            <p id="name-hint" className="text-xs text-muted-foreground">
              {name.length}/50 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="What's this room about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <Label>Room Type</Label>
            <RadioGroup 
              value={roomType} 
              onValueChange={(v) => setRoomType(v as 'private' | 'group')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="flex items-center gap-1 cursor-pointer">
                  <Lock className="h-4 w-4" />
                  Private
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="group" id="group" />
                <Label htmlFor="group" className="flex items-center gap-1 cursor-pointer">
                  <Users className="h-4 w-4" />
                  Group
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="temporary" className="cursor-pointer">
                Temporary Room
              </Label>
            </div>
            <Switch
              id="temporary"
              checked={isTemporary}
              onCheckedChange={setIsTemporary}
              aria-describedby="temporary-hint"
            />
          </div>
          {isTemporary && (
            <p id="temporary-hint" className="text-xs text-muted-foreground -mt-2">
              Room will be deleted automatically after expiration
            </p>
          )}

          {isTemporary && (
            <div className="space-y-2">
              <Label htmlFor="expires">Expires In</Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger id="expires">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                  <SelectItem value="360">6 hours</SelectItem>
                  <SelectItem value="720">12 hours</SelectItem>
                  <SelectItem value="1440">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Room
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
