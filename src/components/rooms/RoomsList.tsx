import { useState } from 'react';
import { useRooms } from '@/hooks/useRooms';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { CreateRoomModal } from './CreateRoomModal';
import { 
  Plus, 
  Lock, 
  Users, 
  Clock, 
  MoreVertical, 
  Trash2, 
  LogOut,
  MessageSquare 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RoomsListProps {
  onSelectRoom?: (room: any) => void;
  selectedRoomId?: string;
}

export const RoomsList = ({ onSelectRoom, selectedRoomId }: RoomsListProps) => {
  const { user } = useAuth();
  const { rooms, isLoading, deleteRoom, leaveRoom, isRoomAdmin } = useRooms();
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!user) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Lock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Login to access private rooms</p>
      </div>
    );
  }

  const persistentRooms = rooms.filter(r => !r.is_temporary);
  const temporaryRooms = rooms.filter(r => r.is_temporary);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="font-semibold text-sm">Private Rooms</h3>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => setShowCreateModal(true)}
          aria-label="Create new room"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Loading rooms...
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No rooms yet</p>
            <Button 
              size="sm" 
              variant="link" 
              onClick={() => setShowCreateModal(true)}
              className="mt-2"
            >
              Create your first room
            </Button>
          </div>
        ) : (
          <div className="p-2 space-y-4">
            {/* Persistent Rooms */}
            {persistentRooms.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground px-2 mb-2">
                  Saved Rooms
                </p>
                <div className="space-y-1">
                  {persistentRooms.map((room) => (
                    <RoomItem
                      key={room.id}
                      room={room}
                      isSelected={selectedRoomId === room.id}
                      isAdmin={isRoomAdmin(room.id)}
                      onSelect={() => onSelectRoom?.(room)}
                      onDelete={() => deleteRoom(room.id)}
                      onLeave={() => leaveRoom(room.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Temporary Rooms */}
            {temporaryRooms.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground px-2 mb-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Temporary Rooms
                </p>
                <div className="space-y-1">
                  {temporaryRooms.map((room) => (
                    <RoomItem
                      key={room.id}
                      room={room}
                      isSelected={selectedRoomId === room.id}
                      isAdmin={isRoomAdmin(room.id)}
                      onSelect={() => onSelectRoom?.(room)}
                      onDelete={() => deleteRoom(room.id)}
                      onLeave={() => leaveRoom(room.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <CreateRoomModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        onRoomCreated={onSelectRoom}
      />
    </div>
  );
};

interface RoomItemProps {
  room: any;
  isSelected: boolean;
  isAdmin: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onLeave: () => void;
}

const RoomItem = ({ room, isSelected, isAdmin, onSelect, onDelete, onLeave }: RoomItemProps) => {
  const expiresAt = room.expires_at ? new Date(room.expires_at) : null;
  const timeLeft = expiresAt ? formatDistanceToNow(expiresAt, { addSuffix: true }) : null;

  return (
    <div
      className={`
        flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors
        ${isSelected 
          ? 'bg-primary/10 border border-primary/20' 
          : 'hover:bg-muted/50'
        }
      `}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {room.room_type === 'group' ? (
          <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{room.name}</p>
          {room.is_temporary && timeLeft && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Expires {timeLeft}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {room.is_temporary && (
          <Badge variant="outline" className="text-xs h-5">
            Temp
          </Badge>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Room options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isAdmin ? (
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Room
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onLeave(); }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave Room
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
