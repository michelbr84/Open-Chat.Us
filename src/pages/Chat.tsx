import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useMessageReports } from '@/hooks/useMessageReports';
import { useMessageEditing } from '@/hooks/useMessageEditing';
import { useThreadedReplies } from '@/hooks/useThreadedReplies';
import { useSecureMessageHandling } from '@/hooks/useSecureMessageHandling';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { getOrCreateGuestId, getOrCreateGuestName, updateGuestName, clearGuestData, validateGuestSession } from '@/utils/secureGuestId';
import { sanitizeGuestName } from '@/utils/sanitization';
import { AgeGate } from '@/components/AgeGate';
import { ChatHeader } from '@/components/ChatHeader';
import { HelpButton } from '@/components/HelpButton';
import { UserList } from '@/components/UserList';
import { ChatMessage } from '@/components/ChatMessage';
import { MessageInput } from '@/components/MessageInput';
import { ThreadedReplyButton } from '@/components/ThreadedReplyButton';
import { ThreadReplyInput } from '@/components/ThreadReplyInput';
import { PrivateChat } from '@/components/PrivateChat';
import { LoginModal } from '@/components/LoginModal';
import { DonateModal } from '@/components/DonateModal';
import { BookmarksPanel } from '@/components/BookmarksPanel';
import { Users } from 'lucide-react';
import { sendMentionNotifications } from '@/utils/mentionNotifications';
import { useBotIntegration } from '@/hooks/useBotIntegration';

interface Message {
  id: string;
  content: string;
  sender_name: string;
  sender_id: string | null;
  created_at: string;
  edited_at?: string | null;
  is_deleted?: boolean;
  mentions?: any[] | null;
  reply_count?: number;
  parent_message_id?: string | null;
  is_bot_message?: boolean;
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
  const { replyingTo, startReply, cancelReply, sendReply, loadThreadReplies, getThreadReplies } = useThreadedReplies();
  const { validateAndSanitizeMessage, logSecurityEvent } = useSecureMessageHandling();
  const { logSecurityEvent: logSecurity } = useSecurityMonitoring();
  const { botStatus, sendMessageToBot, isBotMention } = useBotIntegration();

  // App state
  const [ageVerified, setAgeVerified] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);

  // User state
  const [guestName, setGuestName] = useState('');
  const [userList, setUserList] = useState<OnlineUser[]>([]);

  // Private chat state
  const [activePrivateChat, setActivePrivateChat] = useState<{ id: string; name: string } | null>(null);

  // Mention state
  const [mentionToAdd, setMentionToAdd] = useState<string>('');
  const [shouldClearMention, setShouldClearMention] = useState(false);

  // Thread state
  const [openThreads, setOpenThreads] = useState<Set<string>>(new Set());

  // Pagination state
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 50;

  // Load initial messages
  const loadInitialMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (!error && data) {
      if (data.length < PAGE_SIZE) setHasMore(false);

      const transformedMessages = data.map(msg => ({
        ...msg,
        mentions: Array.isArray(msg.mentions) ? msg.mentions : []
      }));
      setMessages(transformedMessages.reverse());
    }
  };

  // Load more messages (older)
  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || messages.length === 0) return;

    setIsLoadingMore(true);
    const oldestMessage = messages[0];

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('is_deleted', false)
        .lt('created_at', oldestMessage.created_at)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;

      if (data) {
        if (data.length < PAGE_SIZE) setHasMore(false);

        const transformedMessages = data.map(msg => ({
          ...msg,
          mentions: Array.isArray(msg.mentions) ? msg.mentions : []
        }));

        setMessages(prev => [...transformedMessages.reverse(), ...prev]);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
      toast({
        title: "Error",
        description: "Failed to load older messages",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Setup Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreMessages();
        }
      },
      { threshold: 0.5 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, messages]);

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

    loadInitialMessages();

    // Subscribe to new and updated messages with enhanced debugging and error handling
    const messagesChannel = supabase
      .channel('public-messages', {
        config: {
          broadcast: { self: false }, // Disable self-broadcast to avoid echo
          presence: { key: 'messages' }
        }
      })
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          try {
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
          } catch (error) {
            console.error('❌ Error processing new message:', error);
          }
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
          console.error('❌ Channel subscription error - attempting reconnection');
          // Attempt to resubscribe after a delay
          setTimeout(() => {
            if (messagesChannel.state === 'errored') {
              messagesChannel.unsubscribe();
              // The effect will re-run and create a new subscription
            }
          }, 2000);
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

  // Handle mobile keyboard resize
  useEffect(() => {
    const handleResize = () => {
      // Small delay to ensure layout has updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

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

    // SEAMLESS BOT INTEGRATION: Bot responses are automatically saved to Supabase and appear in real-time to all users
    // Check if this message is intended for the bot
    if (isBotMention(content, mentions)) {
      console.log('🤖 Bot mention detected, sending to bot...');

      // Show loading toast
      toast({
        title: "Sending message to AI...",
        description: "The bot is processing your request.",
      });

      // Send to bot and handle the response
      const botResponse = await sendMessageToBot(content, senderName, mentions, null); // Always null for public chat in this context

      if (botResponse.success && botResponse.botResponse) {
        // Bot responded successfully - verify if it was saved to database
        console.log('✅ Bot responded successfully:', {
          response: botResponse.botResponse,
          messageId: botResponse.messageId,
          savedToDatabase: botResponse.savedToDatabase
        });

        if (botResponse.savedToDatabase) {
          toast({
            title: "AI response received!",
            description: "The bot has responded to your message.",
            variant: "default",
          });
        } else {
          // Bot responded but wasn't saved to database
          toast({
            title: "Partial bot response",
            description: "Bot responded but the message may not be visible to all users.",
            variant: "destructive",
          });
        }

        // Don't send the user's @bot message to the database - only the bot response should appear
        return;
      } else {
        // If bot failed, show error but don't send the user message either
        console.log('🔴 Bot failed:', botResponse.error);
        toast({
          title: "Bot unavailable",
          description: botResponse.error || "The AI bot is temporarily unavailable.",
          variant: "destructive",
        });
        return;
      }
    }

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

        // Optimistic update: Add message to UI immediately
        // The real-time subscription handles deduplication via ID check
        setMessages((prev) => {
          const messageExists = prev.some(msg => msg.id === data.id);
          if (messageExists) return prev;

          const newMessage = {
            ...data,
            mentions: Array.isArray(data.mentions) ? data.mentions : []
          } as Message;

          return [...prev, newMessage]; // Add to end (Oldest -> Newest)
        });

        // Send mention notifications if there are mentions (but not for bot mentions)
        if (mentions && mentions.length > 0) {
          const nonBotMentions = mentions.filter(m => m.username?.toLowerCase() !== 'bot');
          if (nonBotMentions.length > 0) {
            sendMentionNotifications(
              data.id,
              content,
              senderName,
              user?.id || null,
              nonBotMentions
            ).catch(err => console.error('Failed to send mention notifications:', err));
          }
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

  // Handle user click for adding mention (removed private chat functionality)
  const handleUserClick = (name: string, isMember: boolean, key: string) => {
    // This function is no longer used since UserList now calls onMentionUser directly
    // Keeping for backward compatibility but redirecting to mention
    handleMentionUser(name);
  };

  // Handle user mention
  const handleMentionUser = (username: string) => {
    setMentionToAdd(username);
    setShouldClearMention(true);
    setShowMobileSidebar(false); // Close mobile sidebar
  };

  // Handle mention added
  const handleMentionAdded = () => {
    if (shouldClearMention) {
      setMentionToAdd('');
      setShouldClearMention(false);
    }
  };

  // Handle opening private chat from message actions or header notification
  const handleOpenPrivateChat = (senderId: string, senderName: string) => {
    // Check if user is logged in for private messaging
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to send private messages.",
        variant: "destructive",
      });
      setShowLogin(true);
      return;
    }

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

  // Handle chat export
  const handleExportChat = () => {
    try {
      const dataStr = JSON.stringify(messages, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `chat-export-${new Date().toISOString().slice(0, 10)}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast({
        title: "Chat Exported",
        description: "Your chat history has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export chat history.",
        variant: "destructive"
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
  const handleEdit = async (messageId: string, newContent: string) => {
    // Store original state for revert
    const originalMessage = messages.find(m => m.id === messageId);

    // Optimistic update
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, content: newContent, edited_at: new Date().toISOString() }
        : msg
    ));

    const success = await editMessage(messageId, newContent);
    if (!success) {
      toast({
        title: "Edit failed",
        description: "Failed to save changes. Reverting...",
        variant: "destructive"
      });
      // Revert change
      if (originalMessage) {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? originalMessage : msg
        ));
      }
    }
  };

  // Handle message deletion
  const handleDelete = async (messageId: string) => {
    // Store original state for revert
    const originalMessage = messages.find(m => m.id === messageId);

    // Optimistic update
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, is_deleted: true, content: 'This message was deleted' }
        : msg
    ));

    const success = await deleteMessage(messageId);
    if (!success) {
      toast({
        title: "Delete failed",
        description: "Failed to delete message. Reverting...",
        variant: "destructive"
      });
      // Revert change
      if (originalMessage) {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? originalMessage : msg
        ));
      }
    }
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
        onShowBookmarks={() => setShowBookmarks(true)}
        onExportChat={handleExportChat}
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
            onMentionUser={handleMentionUser}
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
            {/* Loading indicator for pagination */}
            <div ref={loadingRef} className="h-4 w-full flex justify-center items-center py-2">
              {isLoadingMore && <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>}
            </div>

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

              const threadReplies = getThreadReplies(message.id);
              const isThreadOpen = openThreads.has(message.id);

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
                    onReply={startReply}
                    onPrivateMessage={handleOpenPrivateChat}
                  />

                  {/* Thread Reply Button */}
                  <div className="ml-10 mb-2">
                    <ThreadedReplyButton
                      messageId={message.id}
                      replyCount={message.reply_count || 0}
                      onStartReply={startReply}
                      onToggleThread={(messageId) => {
                        if (isThreadOpen) {
                          setOpenThreads(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(messageId);
                            return newSet;
                          });
                        } else {
                          setOpenThreads(prev => new Set(prev).add(messageId));
                          loadThreadReplies(messageId);
                        }
                      }}
                      isThreadOpen={isThreadOpen}
                    />
                  </div>

                  {/* Thread Replies */}
                  {isThreadOpen && threadReplies.length > 0 && (
                    <div className="ml-10 space-y-2 mb-4">
                      {threadReplies.map((reply) => (
                        <div key={reply.id} className="text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{reply.username}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="pl-4 border-l-2 border-muted">
                            {reply.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  {replyingTo === message.id && (
                    <div className="ml-10 mb-4">
                      <ThreadReplyInput
                        parentMessageId={message.id}
                        onSendReply={sendReply}
                        onCancel={cancelReply}
                      />
                    </div>
                  )}
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
              mentionToAdd={mentionToAdd}
              onMentionAdded={handleMentionAdded}
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

      {/* Bookmarks Modal */}
      {showBookmarks && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <BookmarksPanel
            onClose={() => setShowBookmarks(false)}
            onMessageClick={(messageId) => {
              // Scroll to message if it's visible
              const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
              if (messageElement) {
                messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Highlight the message briefly
                messageElement.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
                setTimeout(() => {
                  messageElement.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
                }, 2000);
              }
              setShowBookmarks(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
