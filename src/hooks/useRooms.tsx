import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Room {
  id: string;
  name: string;
  description?: string;
  type: string;
  room_type: string;
  is_temporary: boolean;
  max_participants: number;
  expires_at?: string;
  created_by?: string;
  status?: string;
  created_at: string;
}

interface RoomMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export const useRooms = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's rooms
  const fetchRooms = useCallback(async () => {
    if (!user) {
      setRooms([]);
      setIsLoading(false);
      return;
    }

    try {
      // Get rooms where user is creator or member
      const { data: ownedRooms, error: ownedError } = await supabase
        .from('channels')
        .select('*')
        .eq('created_by', user.id)
        .in('room_type', ['private', 'group']);

      if (ownedError) throw ownedError;

      // Get rooms user is a member of via group_members
      const { data: memberRooms, error: memberError } = await supabase
        .from('group_members')
        .select('channel_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const memberChannelIds = memberRooms?.map(m => m.channel_id) || [];
      
      let joinedRooms: any[] = [];
      if (memberChannelIds.length > 0) {
        const { data: joinedData, error: joinedError } = await supabase
          .from('channels')
          .select('*')
          .in('id', memberChannelIds)
          .in('room_type', ['private', 'group']);

        if (joinedError) throw joinedError;
        joinedRooms = joinedData || [];
      }

      // Combine and deduplicate rooms
      const allRooms = [...(ownedRooms || []), ...joinedRooms];
      const uniqueRooms = allRooms.reduce((acc: Room[], room) => {
        if (!acc.find(r => r.id === room.id)) {
          acc.push(room as Room);
        }
        return acc;
      }, []);

      // Filter out expired temporary rooms
      const validRooms = uniqueRooms.filter(room => {
        if (room.is_temporary && room.expires_at) {
          return new Date(room.expires_at) > new Date();
        }
        return true;
      });

      setRooms(validRooms);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Fetch room members when current room changes
  useEffect(() => {
    if (!currentRoom) return;

    const fetchRoomMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('group_members')
          .select('*')
          .eq('channel_id', currentRoom.id);

        if (error) throw error;
        setRoomMembers((data || []) as RoomMember[]);
      } catch (error) {
        console.error('Error fetching room members:', error);
      }
    };

    fetchRoomMembers();
  }, [currentRoom]);

  // Create a new room (persistent or temporary)
  const createRoom = async (
    name: string, 
    description?: string, 
    roomType: 'private' | 'group' = 'private',
    isTemporary: boolean = false,
    expiresInMinutes: number = 60
  ) => {
    if (!user) {
      toast.error('You must be logged in to create a room');
      return null;
    }

    try {
      const expiresAt = isTemporary 
        ? new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString()
        : null;

      const { data: room, error: roomError } = await supabase
        .from('channels')
        .insert({
          name: name.trim(),
          description: description?.trim(),
          type: 'private',
          room_type: roomType,
          is_temporary: isTemporary,
          expires_at: expiresAt,
          created_by: user.id,
          status: 'active',
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          channel_id: room.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) {
        console.error('Error adding creator as member:', memberError);
      }

      setRooms(prev => [...prev, room as Room]);
      toast.success(`${isTemporary ? 'Temporary room' : 'Room'} "${name}" created!`);
      
      return room as Room;
    } catch (error: any) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
      return null;
    }
  };

  // Delete a room (only for creator/admin)
  const deleteRoom = async (roomId: string) => {
    if (!user) return false;

    try {
      const room = rooms.find(r => r.id === roomId);
      if (!room || room.created_by !== user.id) {
        toast.error('Only the room creator can delete this room');
        return false;
      }

      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', roomId);

      if (error) throw error;

      setRooms(prev => prev.filter(r => r.id !== roomId));
      
      if (currentRoom?.id === roomId) {
        setCurrentRoom(null);
      }

      toast.success('Room deleted successfully!');
      return true;
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Failed to delete room');
      return false;
    }
  };

  // Add member to room
  const addMember = async (roomId: string, userId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          channel_id: roomId,
          user_id: userId,
          role: 'member',
          invited_by: user.id,
        });

      if (error) throw error;

      toast.success('Member added successfully!');
      return true;
    } catch (error: any) {
      console.error('Error adding member:', error);
      if (error.code === '23505') {
        toast.error('User is already a member');
      } else {
        toast.error('Failed to add member');
      }
      return false;
    }
  };

  // Remove member from room
  const removeMember = async (roomId: string, userId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('channel_id', roomId)
        .eq('user_id', userId);

      if (error) throw error;

      setRoomMembers(prev => prev.filter(m => !(m.channel_id === roomId && m.user_id === userId)));
      toast.success('Member removed successfully!');
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
      return false;
    }
  };

  // Leave a room
  const leaveRoom = async (roomId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('channel_id', roomId)
        .eq('user_id', user.id);

      if (error) throw error;

      setRooms(prev => prev.filter(r => r.id !== roomId));
      
      if (currentRoom?.id === roomId) {
        setCurrentRoom(null);
      }

      toast.success('Left room successfully!');
      return true;
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error('Failed to leave room');
      return false;
    }
  };

  // Check if user is admin of a room
  const isRoomAdmin = (roomId: string): boolean => {
    if (!user) return false;
    const room = rooms.find(r => r.id === roomId);
    if (room?.created_by === user.id) return true;
    const membership = roomMembers.find(m => m.channel_id === roomId && m.user_id === user.id);
    return membership?.role === 'admin';
  };

  return {
    rooms,
    currentRoom,
    roomMembers,
    isLoading,
    setCurrentRoom,
    createRoom,
    deleteRoom,
    addMember,
    removeMember,
    leaveRoom,
    isRoomAdmin,
    refreshRooms: fetchRooms,
  };
};
