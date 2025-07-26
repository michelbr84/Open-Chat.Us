import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useMessageReports } from '@/hooks/useMessageReports';
import { useMessageEditing } from '@/hooks/useMessageEditing';
import { useSecureMessageHandling } from '@/hooks/useSecureMessageHandling';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { getOrCreateGuestId, getOrCreateGuestName, updateGuestName, clearGuestData, validateGuestSession } from '@/utils/secureGuestId';
import { sanitizeGuestName } from '@/utils/sanitization';
import { AgeGate } from '@/components/AgeGate';
import { ChatHeader } from '@/components/ChatHeader';
import { UserList } from '@/components/UserList';
import { ChatMessage } from '@/components/ChatMessage';
import { MessageInput } from '@/components/MessageInput';
import { PrivateChat } from '@/components/PrivateChat';
import { LoginModal } from '@/components/LoginModal';
import { DonateModal } from '@/components/DonateModal';
import { Users } from 'lucide-react';
import { sendMentionNotifications } from '@/utils/mentionNotifications';

interface Message {
  id: string;
  content: string;
  sender_name: string;
  sender_id: string | null;
  created_at: string;
  edited_at?: string | null;
  is_deleted?: boolean;
  mentions?: any[] | null;
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
  const { validateAndSanitizeMessage, logSecurityEvent } = useSecureMessageHandling();
  const { logSecurityEvent: logSecurity } = useSecurityMonitoring();
  
  // App state
  const [ageVerified, setAgeVerified] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
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
        // Transform the data to ensure mentions is properly typed
        const transformedMessages = data.map(msg => ({
          ...msg,
          mentions: Array.isArray(msg.mentions) ? msg.mentions : []
        }));
        setMessages(transformedMessages.reverse());
      }
    };

    loadMessages();

    // Subscribe to new and updated messages with enhanced debugging
    const messagesChannel = supabase
      .channel('public-messages', {
        config: {
          broadcast: { self: true }
        }
      })
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('✅ New message received via realtime:', payload.new);
          setMessages((prev) => {
            // Check if message already exists to prevent duplicates
            const messageExists = prev.some(msg => msg.id === payload.new.id);
            if (messageExists) {
              console.log('📝 Message already exists, skipping duplicate');
              return prev;
            }
            // Transform the payload to ensure mentions is properly typed
            const transformedMessage = {
              ...payload.new,
              mentions: Array.isArray(payload.new.mentions) ? payload.new.mentions : []
            };
            return [...prev, transformedMessage as Message];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('✏️ Message updated via realtime:', payload.new);
          setMessages((prev) => 
            prev.map((msg) => {
              if (msg.id === payload.new.id) {
                // Transform the payload to ensure mentions is properly typed
                return {
                  ...payload.new,
                  mentions: Array.isArray(payload.new.mentions) ? payload.new.mentions : []
                } as Message;
              }
              return msg;
            })
          );
        }
      )
      .subscribe((status) => {
        console.log('📡 Messages subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time messages');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel subscription error');
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Channel subscription timed out');
        } else if (status === 'CLOSED') {
          console.log('📴 Channel subscription closed');
        }
      });

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
        // Transform the data to ensure mentions is properly typed
        const transformedResults = (data || []).map(msg => ({
          ...msg,
          mentions: Array.isArray(msg.mentions) ? msg.mentions : []
        }));
        setSearchResults(transformedResults);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, ageVerified]);

  // Send public message with enhanced security validation and mentions support
  const sendPublicMessage = async (content: string, mentions: any[] = []) => {
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
      console.log('📤 Sending message:', { content, senderName, sender_id: user?.id || null, mentions });
      const { data, error } = await supabase.from('messages').insert({
        content,
        sender_name: senderName,
        sender_id: user?.id || null,
        mentions: mentions || [],
      }).select().single();

      if (error) {
        console.error('❌ Error sending message:', error);
      } else {
        console.log('✅ Message sent successfully:', data);
        
        // Send mention notifications if there are mentions
        if (mentions && mentions.length > 0) {
          sendMentionNotifications(
            data.id,
            content,
            senderName,
            user?.id || null,
            mentions
          ).catch(err => console.error('Failed to send mention notifications:', err));
        }
      }

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
    setShowMobileSidebar(false); // Close mobile sidebar
  };

  // Handle opening private chat from header notification
  const handleOpenPrivateChat = (senderId: string, senderName: string) => {
    setActivePrivateChat({ id: senderId, name: senderName });
  };

  // Handle guest name change with enhanced validation
  const handleGuestNameChange = async (newName: string) => {
    if (!presenceChannelRef.current) return;

    // Use enhanced sanitization
    const validation = sanitizeGuestName(newName);
    
    if (!validation.valid) {
      toast({
        title: "Invalid name",
        description: validation.error || "Please choose a different name.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Log security event
      logSecurityEvent('guest_name_change', { 
        oldName: guestName, 
        newName: validation.sanitized,
        timestamp: new Date().toISOString()
      });

      await presenceChannelRef.current.untrack();
      await presenceChannelRef.current.track({ 
        name: validation.sanitized, 
        isMember: false 
      });
      setGuestName(validation.sanitized);
      updateGuestName(validation.sanitized);
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
        onOpenPrivateChat={handleOpenPrivateChat}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile sidebar overlay */}
        <div className={`
          fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden
          ${showMobileSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `} onClick={() => setShowMobileSidebar(false)} />
        
        {/* Sidebar with user list */}
        <div className={`
          fixed left-0 top-0 h-full z-50 transition-transform md:relative md:translate-x-0 md:z-auto
          ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <UserList
            users={userList}
            guestName={guestName}
            onUserClick={handleUserClick}
            onGuestNameChange={handleGuestNameChange}
          />
        </div>

        <main className="flex-1 flex flex-col relative">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="md:hidden absolute top-4 left-4 z-10 bg-primary text-primary-foreground rounded-full p-2 shadow-lg"
          >
            <Users className="w-5 h-5" />
          </button>
          
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 pt-16 md:pt-4 space-y-1">
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
              onlineUsers={userList}
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
