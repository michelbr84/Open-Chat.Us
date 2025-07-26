import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface MentionUser {
  id: string;
  name: string;
  isMember: boolean;
  displayName: string;
}

interface UseMentionSearchResult {
  searchQuery: string;
  searchUsers: (query: string) => void;
  suggestions: MentionUser[];
  isLoading: boolean;
  clearSuggestions: () => void;
}

export const useMentionSearch = (onlineUsers: Array<{ name: string; isMember: boolean; key: string }>): UseMentionSearchResult => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchUsers = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    // Filter online users based on query
    const filteredUsers = onlineUsers
      .filter(onlineUser => {
        const currentUserName = user?.user_metadata?.name || user?.email || '';
        // Exclude current user from suggestions
        if (onlineUser.name === currentUserName) return false;
        
        const searchLower = query.toLowerCase();
        return onlineUser.name.toLowerCase().includes(searchLower);
      })
      .map(onlineUser => ({
        id: onlineUser.key,
        name: onlineUser.name,
        isMember: onlineUser.isMember,
        displayName: onlineUser.name
      }))
      .slice(0, 8); // Limit to 8 suggestions

    setSuggestions(filteredUsers);
    setIsLoading(false);
  }, [onlineUsers, user]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    searchUsers,
    suggestions,
    isLoading,
    clearSuggestions
  };
};