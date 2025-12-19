import { useState } from 'react';
import { useRooms } from '@/hooks/useRooms';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { MessageSquare, Lock, Users, Home } from 'lucide-react';

interface Room {
    id: string;
    name: string;
    room_type: string;
    is_temporary?: boolean;
}

interface RoomSwitcherProps {
    currentRoom: Room | null;
    onRoomSelect: (room: Room | null) => void;
}

export const RoomSwitcher = ({ currentRoom, onRoomSelect }: RoomSwitcherProps) => {
    const { rooms, isLoading } = useRooms();

    const privateRooms = rooms.filter(r => r.room_type === 'private');
    const groupRooms = rooms.filter(r => r.room_type === 'group');

    const getRoomIcon = (roomType: string) => {
        switch (roomType) {
            case 'private':
                return <Lock className="h-4 w-4 mr-2" />;
            case 'group':
                return <Users className="h-4 w-4 mr-2" />;
            default:
                return <MessageSquare className="h-4 w-4 mr-2" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    {currentRoom ? (
                        <>
                            {getRoomIcon(currentRoom.room_type)}
                            <span className="max-w-[150px] truncate">{currentRoom.name}</span>
                        </>
                    ) : (
                        <>
                            <Home className="h-4 w-4" />
                            <span>Public Chat</span>
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Switch Room</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => onRoomSelect(null)}>
                    <Home className="h-4 w-4 mr-2" />
                    Public Chat
                    {!currentRoom && <span className="ml-auto text-xs">✓</span>}
                </DropdownMenuItem>

                {privateRooms.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Private Rooms
                        </DropdownMenuLabel>
                        {privateRooms.map((room) => (
                            <DropdownMenuItem
                                key={room.id}
                                onClick={() => onRoomSelect(room)}
                            >
                                <Lock className="h-4 w-4 mr-2" />
                                <span className="truncate">{room.name}</span>
                                {currentRoom?.id === room.id && <span className="ml-auto text-xs">✓</span>}
                            </DropdownMenuItem>
                        ))}
                    </>
                )}

                {groupRooms.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Group Rooms
                        </DropdownMenuLabel>
                        {groupRooms.map((room) => (
                            <DropdownMenuItem
                                key={room.id}
                                onClick={() => onRoomSelect(room)}
                            >
                                <Users className="h-4 w-4 mr-2" />
                                <span className="truncate">{room.name}</span>
                                {currentRoom?.id === room.id && <span className="ml-auto text-xs">✓</span>}
                            </DropdownMenuItem>
                        ))}
                    </>
                )}

                {rooms.length === 0 && !isLoading && (
                    <DropdownMenuItem disabled>
                        <span className="text-muted-foreground text-sm">No rooms available</span>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
