import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface BookmarkedMessage {
  id: string;
  message_id: string;
  created_at: string;
  message: {
    id: string;
    content: string;
    sender_name: string;
    sender_id: string;
    created_at: string;
    mentions?: any[];
  };
}

export const useMessageBookmarks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<BookmarkedMessage[]>([]);
  const [bookmarkedMessageIds, setBookmarkedMessageIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Load user's bookmarks
  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      setBookmarkedMessageIds(new Set());
      return;
    }

    loadBookmarks();
  }, [user]);

  const loadBookmarks = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('message_bookmarks')
        .select(`
          id,
          message_id,
          created_at,
          message:messages!message_bookmarks_message_id_fkey (
            id,
            content,
            sender_name,
            sender_id,
            created_at,
            mentions
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bookmarksData = data as BookmarkedMessage[];
      setBookmarks(bookmarksData);
      
      // Create a set of bookmarked message IDs for quick lookup
      const messageIds = new Set(bookmarksData.map(b => b.message_id));
      setBookmarkedMessageIds(messageIds);
    } catch (error: any) {
      console.error('Error loading bookmarks:', error);
      toast({
        title: "Failed to load bookmarks",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add bookmark
  const addBookmark = async (messageId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to bookmark messages.",
        variant: "destructive",
      });
      return false;
    }

    if (bookmarkedMessageIds.has(messageId)) {
      return true; // Already bookmarked
    }

    try {
      const { error } = await supabase
        .from('message_bookmarks')
        .insert({
          user_id: user.id,
          message_id: messageId,
        });

      if (error) throw error;

      // Update local state
      setBookmarkedMessageIds(prev => new Set(prev).add(messageId));
      
      toast({
        title: "Message bookmarked",
        description: "Message saved to your bookmarks.",
      });

      // Reload bookmarks to get the full message data
      loadBookmarks();
      return true;
    } catch (error: any) {
      console.error('Error adding bookmark:', error);
      toast({
        title: "Failed to bookmark message",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Remove bookmark
  const removeBookmark = async (messageId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('message_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('message_id', messageId);

      if (error) throw error;

      // Update local state
      setBookmarkedMessageIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });

      setBookmarks(prev => prev.filter(b => b.message_id !== messageId));

      toast({
        title: "Bookmark removed",
        description: "Message removed from your bookmarks.",
      });

      return true;
    } catch (error: any) {
      console.error('Error removing bookmark:', error);
      toast({
        title: "Failed to remove bookmark",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Toggle bookmark
  const toggleBookmark = async (messageId: string) => {
    if (bookmarkedMessageIds.has(messageId)) {
      return await removeBookmark(messageId);
    } else {
      return await addBookmark(messageId);
    }
  };

  // Check if message is bookmarked
  const isBookmarked = (messageId: string) => {
    return bookmarkedMessageIds.has(messageId);
  };

  // Get bookmark count for statistics
  const bookmarkCount = bookmarks.length;

  return {
    bookmarks,
    isLoading,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    bookmarkCount,
    loadBookmarks,
  };
};