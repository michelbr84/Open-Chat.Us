import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'dm';
  creator_id?: string;
  member_limit?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  last_read_at: string;
}

export const useChannels = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [channelMembers, setChannelMembers] = useState<ChannelMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's channels
  useEffect(() => {
    if (!user) return;

    const fetchChannels = async () => {
      try {
        // First, get channels the user is a member of
        const { data: membershipData, error: membershipError } = await supabase
          .from('channel_members')
          .select(`
            channel_id,
            role,
            chat_channels (*)
          `)
          .eq('user_id', user.id);

        if (membershipError) throw membershipError;

        // Also get public channels
        const { data: publicChannels, error: publicError } = await supabase
          .from('chat_channels')
          .select('*')
          .eq('type', 'public')
          .eq('is_active', true);

        if (publicError) throw publicError;

        // Combine and deduplicate channels
        const memberChannels = membershipData?.map(m => m.chat_channels).filter(Boolean) || [];
        const allChannels = [...memberChannels, ...publicChannels];
        const uniqueChannels = allChannels.filter((channel, index, self) => 
          index === self.findIndex(c => c.id === channel.id)
        ) as Channel[];

        setChannels(uniqueChannels);

        // Set default channel (General) if no current channel
        if (!currentChannel && uniqueChannels.length > 0) {
          const generalChannel = uniqueChannels.find(c => c.name === 'General') || uniqueChannels[0];
          setCurrentChannel(generalChannel);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching channels:', error);
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, [user]);

  // Fetch channel members when current channel changes
  useEffect(() => {
    if (!currentChannel) return;

    const fetchChannelMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('channel_members')
          .select('*')
          .eq('channel_id', currentChannel.id);

        if (error) throw error;

        setChannelMembers((data || []) as ChannelMember[]);
      } catch (error) {
        console.error('Error fetching channel members:', error);
      }
    };

    fetchChannelMembers();
  }, [currentChannel]);

  // Create a new channel
  const createChannel = async (name: string, description?: string, type: 'public' | 'private' = 'public') => {
    if (!user) {
      toast.error('You must be logged in to create a channel');
      return null;
    }

    try {
      const { data: channel, error: channelError } = await supabase
        .from('chat_channels')
        .insert({
          name: name.trim(),
          description: description?.trim(),
          type,
          creator_id: user.id,
        })
        .select()
        .single();

      if (channelError) throw channelError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channel.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) {
        console.error('Error adding creator as member:', memberError);
      }

      setChannels(prev => [...prev, channel as Channel]);
      toast.success(`Channel "${name}" created successfully!`);
      
      return channel;
    } catch (error: any) {
      console.error('Error creating channel:', error);
      
      if (error.message?.includes('Too many channels')) {
        toast.error('You can only create 5 channels per hour. Please wait before creating another.');
      } else {
        toast.error('Failed to create channel');
      }
      
      return null;
    }
  };

  // Join a channel
  const joinChannel = async (channelId: string) => {
    if (!user) {
      toast.error('You must be logged in to join a channel');
      return false;
    }

    try {
      const { error } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          role: 'member',
        });

      if (error) throw error;

      toast.success('Joined channel successfully!');
      return true;
    } catch (error: any) {
      console.error('Error joining channel:', error);
      
      if (error.code === '23505') {
        toast.error('You are already a member of this channel');
      } else {
        toast.error('Failed to join channel');
      }
      
      return false;
    }
  };

  // Leave a channel
  const leaveChannel = async (channelId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove channel from list if user was a member
      setChannels(prev => prev.filter(c => c.id !== channelId));
      
      // If leaving current channel, switch to General or first available
      if (currentChannel?.id === channelId) {
        const remainingChannels = channels.filter(c => c.id !== channelId);
        if (remainingChannels.length > 0) {
          const generalChannel = remainingChannels.find(c => c.name === 'General') || remainingChannels[0];
          setCurrentChannel(generalChannel);
        } else {
          setCurrentChannel(null);
        }
      }

      toast.success('Left channel successfully!');
      return true;
    } catch (error) {
      console.error('Error leaving channel:', error);
      toast.error('Failed to leave channel');
      return false;
    }
  };

  // Check if user is member of a channel
  const isMember = (channelId: string): boolean => {
    return channelMembers.some(m => m.channel_id === channelId && m.user_id === user?.id);
  };

  // Get user's role in current channel
  const getUserRole = (): string => {
    if (!user || !currentChannel) return 'member';
    
    const membership = channelMembers.find(m => 
      m.channel_id === currentChannel.id && m.user_id === user.id
    );
    
    return membership?.role || 'member';
  };

  return {
    channels,
    currentChannel,
    channelMembers,
    isLoading,
    setCurrentChannel,
    createChannel,
    joinChannel,
    leaveChannel,
    isMember,
    getUserRole,
  };
};