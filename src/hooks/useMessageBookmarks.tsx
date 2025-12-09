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
  } | null;
}

export const useMessageBookmarks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<BookmarkedMessage[]>([]);
  const [bookmarkedMessageIds, setBookmarkedMessageIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

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
        .from('bookmarks')
        .select('id, message_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get message details separately
      const messageIds = (data || []).map((b: any) => b.message_id);
      let messages: any[] = [];
      if (messageIds.length > 0) {
        const { data: msgData } = await supabase
          .from('messages')
          .select('*')
          .in('id', messageIds);
        messages = msgData || [];
      }

      const bookmarksData = (data || []).map((b: any) => ({
        ...b,
        message: messages.find((m: any) => m.id === b.message_id) || null
      }));

      setBookmarks(bookmarksData);
      setBookmarkedMessageIds(new Set(bookmarksData.map((b: any) => b.message_id)));
    } catch (error: any) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addBookmark = async (messageId: string) => {
    if (!user) {
      toast({ title: "Login required", description: "Please log in to bookmark messages.", variant: "destructive" });
      return false;
    }
    if (bookmarkedMessageIds.has(messageId)) return true;

    try {
      const { error } = await supabase.from('bookmarks').insert({ user_id: user.id, message_id: messageId });
      if (error) throw error;
      setBookmarkedMessageIds(prev => new Set(prev).add(messageId));
      toast({ title: "Message bookmarked" });
      loadBookmarks();
      return true;
    } catch (error: any) {
      console.error('Error adding bookmark:', error);
      return false;
    }
  };

  const removeBookmark = async (messageId: string) => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('message_id', messageId);
      if (error) throw error;
      setBookmarkedMessageIds(prev => { const s = new Set(prev); s.delete(messageId); return s; });
      setBookmarks(prev => prev.filter(b => b.message_id !== messageId));
      toast({ title: "Bookmark removed" });
      return true;
    } catch (error: any) {
      return false;
    }
  };

  const toggleBookmark = async (messageId: string) => {
    return bookmarkedMessageIds.has(messageId) ? await removeBookmark(messageId) : await addBookmark(messageId);
  };

  const isBookmarked = (messageId: string) => bookmarkedMessageIds.has(messageId);

  return { bookmarks, isLoading, addBookmark, removeBookmark, toggleBookmark, isBookmarked, bookmarkCount: bookmarks.length, loadBookmarks };
};
