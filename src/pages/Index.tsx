import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useMessageReports } from '@/hooks/useMessageReports';
import { useMessageEditing } from '@/hooks/useMessageEditing';
import { getOrCreateGuestId, getOrCreateGuestName, updateGuestName, clearGuestData, isValidGuestName } from '@/utils/secureGuestId';
import { AgeGate } from '@/components/AgeGate';
import { ChatHeader } from '@/components/ChatHeader';
import { UserList } from '@/components/UserList';
import { ChatMessage } from '@/components/ChatMessage';
import { MessageInput } from '@/components/MessageInput';
import { PrivateChat } from '@/components/PrivateChat';
import { LoginModal } from '@/components/LoginModal';
import { DonateModal } from '@/components/DonateModal';

interface Message {
  id: string;
  content: string;
  sender_name: string;
  sender_id: string | null;
  created_at: string;
  edited_at?: string | null;
  is_deleted?: boolean;
}

interface OnlineUser {
  name: string;
  isMember: boolean;
  key: string;
}

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { reactions, toggleReaction } = useMessageReactions();
  const { submitReport } = useMessageReports();
  const { editMessage, deleteMessage } = useMessageEditing();
  
  // App state
  const [ageVerified, setAgeVerified] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  
  // User state
  const [guestName, setGuestName] = useState('');
  const [userList, setUserList] = useState<OnlineUser[]>([]);
  
  // Private chat state
  const [activePrivateChat, setActivePrivateChat] = useState<{id: string; name: string} | null>(null);
  
  // Refs and throttling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const presenceChannelRef = useRef<any>(null);
  const lastMessageTimeRef = useRef(0);


  // Check age verification on mount
  useEffect(() => {
    const previouslyConfirmed = localStorage.getItem('ageVerified');
    if (previouslyConfirmed === 'true') {
      setAgeVerified(true);
    }
  }, []);

  // Initialize secure guest identity
  useEffect(() => {
    if (ageVerified && !user && !guestName) {
      const secureGuestName = getOrCreateGuestName();
      setGuestName(secureGuestName);
    }
    
    // Clear guest data when user logs in
    if (user && guestName) {
      clearGuestData();
      setGuestName('');
    }
  }, [ageVerified, user, guestName]);

  // Load recent messages and subscribe to new ones
  useEffect(() => {
    if (!ageVerified) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('is_deleted', false) // Don't load deleted messages
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        setMessages(data.reverse());
      }
    };

    loadMessages();

    // Subscribe to new and updated messages
    const messagesChannel = supabase
      .channel('public-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === payload.new.id ? payload.new as Message : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [ageVerified]);

  // Handle user presence
  useEffect(() => {
    if (!ageVerified) return;

    // Remove existing channel
    if (presenceChannelRef.current) {
      supabase.removeChannel(presenceChannelRef.current);
      presenceChannelRef.current = null;
    }

    const setupPresence = () => {
      const currentUser = user;
      const currentGuestName = guestName;
      
      if (!currentUser && !currentGuestName) return;

      const name = currentUser 
        ? (currentUser.user_metadata?.name || currentUser.email)
        : currentGuestName;
      
      const key = currentUser ? currentUser.id : `${currentGuestName}_${Date.now()}`;
      const isMember = !!currentUser;

      const channel = supabase.channel('online-users', {
        config: { presence: { key } }
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const online: OnlineUser[] = [];
          
          for (const presenceKey in state) {
            state[presenceKey].forEach((entry: any) => {
              online.push({
                name: entry.name,
                isMember: entry.isMember,
                key: presenceKey,
              });
            });
          }
          
          setUserList(online);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            channel.track({ name, isMember });
          }
        });

      presenceChannelRef.current = channel;
    };

    setupPresence();

    return () => {
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
        presenceChannelRef.current = null;
      }
    };
  }, [ageVerified, user, guestName]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (searchQuery === '') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, searchQuery]);

  // Handle search
  useEffect(() => {
    if (!ageVerified) return;
    
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const performSearch = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .ilike('content', `%${searchQuery}%`)
        .order('created_at', { ascending: true });

      if (!error) {
        setSearchResults(data || []);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, ageVerified]);

  // Send public message with enhanced security validation
  const sendPublicMessage = async (content: string) => {
    // Client-side rate limiting (backup to server-side)
    const now = Date.now();
    if (now - lastMessageTimeRef.current < 1000) {
      toast({
        title: "Slow down!",
        description: "Please wait a moment before sending another message.",
        variant: "destructive",
      });
      return;
    }
    lastMessageTimeRef.current = now;

    const senderName = user 
      ? (user.user_metadata?.name || user.email)
      : guestName;

    try {
      const { error } = await supabase.from('messages').insert({
        content,
        sender_name: senderName,
        sender_id: user?.id || null,
      });

      if (error) {
        // Handle specific error types
        if (error.message.includes('too long')) {
          toast({
            title: "Message too long",
            description: "Please keep your message under 1000 characters.",
            variant: "destructive",
          });
        } else if (error.message.includes('prohibited content')) {
          toast({
            title: "Message blocked",
            description: "Your message contains prohibited content.",
            variant: "destructive",
          });
        } else if (error.message.includes('rate limit')) {
          toast({
            title: "Rate limited",
            description: "You're sending messages too quickly. Please slow down.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Failed to send message",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Failed to send message. Please check your connection.",
        variant: "destructive",
      });
    }
  };

  // Handle user click for private messaging
  const handleUserClick = (name: string, isMember: boolean, key: string) => {
    if (!isMember) {
      toast({
        title: "Cannot message guest",
        description: "This user is not available for private chat.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      setShowLogin(true);
      return;
    }

    // Open private chat
    setActivePrivateChat({ id: key, name });
  };

  // Handle guest name change with validation
  const handleGuestNameChange = async (newName: string) => {
    if (!presenceChannelRef.current) return;

    // Validate guest name
    if (!isValidGuestName(newName)) {
      toast({
        title: "Invalid name",
        description: "Name must be 3-20 characters and contain only letters, numbers, dashes, and underscores.",
        variant: "destructive",
      });
      return;
    }

    try {
      await presenceChannelRef.current.untrack();
      await presenceChannelRef.current.track({ 
        name: newName, 
        isMember: false 
      });
      setGuestName(newName);
      updateGuestName(newName);
    } catch (error) {
      console.error('Failed to change name:', error);
      toast({
        title: "Failed to change name",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle emoji reactions - now connected to real backend
  const handleReaction = (messageId: string, emoji: string) => {
    toggleReaction(messageId, emoji);
  };

  // Handle message reporting - now connected to real backend
  const handleReport = (messageId: string, reason: string, details?: string) => {
    submitReport(messageId, reason, details);
  };

  // Handle message editing
  const handleEdit = (messageId: string, newContent: string) => {
    editMessage(messageId, newContent);
  };

  // Handle message deletion
  const handleDelete = (messageId: string) => {
    deleteMessage(messageId);
  };

  const isSearching = searchQuery.length > 0;
  const displayMessages = isSearching ? searchResults : messages;

  if (!ageVerified) {
    return <AgeGate onConfirm={() => setAgeVerified(true)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-chat-background">
      <ChatHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLoginClick={() => setShowLogin(true)}
        onDonateClick={() => setShowDonate(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <UserList
          users={userList}
          guestName={guestName}
          onUserClick={handleUserClick}
          onGuestNameChange={handleGuestNameChange}
        />

        <main className="flex-1 flex flex-col">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {isSearching && (
              <div className="mb-4 p-3 bg-muted rounded-lg animate-fade-in">
                <h3 className="font-semibold text-sm mb-2">
                  Search Results ({searchResults.length})
                </h3>
                {searchResults.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No messages found for "{searchQuery}"
                  </p>
                )}
              </div>
            )}

            {displayMessages.map((message) => {
              const isOwn = user 
                ? message.sender_id === user.id
                : message.sender_name === guestName;

              return (
                <div key={message.id} className="group">
                  <ChatMessage 
                    message={message} 
                    isOwn={isOwn}
                    guestName={guestName}
                    reactions={reactions[message.id]}
                    onReact={handleReaction}
                    onReport={handleReport}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          {!isSearching && (
            <MessageInput
              onSendMessage={sendPublicMessage}
              placeholder="Type a message..."
            />
          )}
        </main>
      </div>

      {/* Modals and overlays */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showDonate && <DonateModal onClose={() => setShowDonate(false)} />}
      {activePrivateChat && (
        <PrivateChat
          partner={activePrivateChat}
          onClose={() => setActivePrivateChat(null)}
        />
      )}
    </div>
  );
};

export default Index;
