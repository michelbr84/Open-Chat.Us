import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getOrCreateGuestName, clearGuestData } from "@/utils/secureGuestId";
import logger from "@/utils/logger";
import type { Message, Room, OnlineUser } from "@/hooks/useChatState";

const PAGE_SIZE = 50;

interface UseChatSubscriptionsParams {
  ageVerified: boolean;
  selectedRoom: Room | null;
  user: any;
  guestName: string;
  searchQuery: string;
  messages: Message[];
  hasMore: boolean;
  isLoadingMore: boolean;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setSearchResults: React.Dispatch<React.SetStateAction<Message[]>>;
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoadingMore: React.Dispatch<React.SetStateAction<boolean>>;
  setUserList: React.Dispatch<React.SetStateAction<OnlineUser[]>>;
  setAgeVerified: React.Dispatch<React.SetStateAction<boolean>>;
  setGuestName: React.Dispatch<React.SetStateAction<string>>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  presenceChannelRef: React.MutableRefObject<any>;
  loadingRef: React.RefObject<HTMLDivElement>;
}

export function useChatSubscriptions(params: UseChatSubscriptionsParams) {
  const {
    ageVerified, selectedRoom, user, guestName, searchQuery,
    messages, hasMore, isLoadingMore,
    setMessages, setSearchResults, setHasMore, setIsLoadingMore,
    setUserList, setAgeVerified, setGuestName,
    messagesEndRef, presenceChannelRef, loadingRef,
  } = params;
  const { toast } = useToast();

  // Load initial messages
  const loadInitialMessages = async () => {
    let query = supabase.from("messages").select("*").eq("is_deleted", false) as any;

    if (selectedRoom) {
      query = query.eq("channel_id", selectedRoom.id);
    } else {
      query = query.is("channel_id", null);
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(PAGE_SIZE);

    if (!error && data) {
      if (data.length < PAGE_SIZE) setHasMore(false);

      const transformedMessages = data.map((msg: any) => ({
        ...msg,
        mentions: Array.isArray(msg.mentions) ? msg.mentions : [],
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
      let query = supabase
        .from("messages")
        .select("*")
        .eq("is_deleted", false)
        .lt("created_at", oldestMessage.created_at) as any;

      if (selectedRoom) {
        query = query.eq("channel_id", selectedRoom.id);
      } else {
        query = query.is("channel_id", null);
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(PAGE_SIZE);

      if (error) throw error;

      if (data) {
        if (data.length < PAGE_SIZE) setHasMore(false);

        const transformedMessages = data.map((msg: any) => ({
          ...msg,
          mentions: Array.isArray(msg.mentions) ? msg.mentions : [],
        }));

        setMessages((prev) => [...transformedMessages.reverse(), ...prev]);
      }
    } catch (error) {
      logger.error("Error loading more messages", { error });
      toast({
        title: "Error",
        description: "Failed to load older messages",
        variant: "destructive",
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
      { threshold: 0.5 },
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, messages]);

  // Check age verification on mount
  useEffect(() => {
    const previouslyConfirmed = localStorage.getItem("ageVerified");
    if (previouslyConfirmed === "true") {
      setAgeVerified(true);
    }
  }, []);

  // Initialize secure guest identity
  useEffect(() => {
    if (ageVerified && !user && !guestName) {
      const secureGuestName = getOrCreateGuestName();
      setGuestName(secureGuestName);
    }

    if (user && guestName) {
      clearGuestData();
      setGuestName("");
    }
  }, [ageVerified, user, guestName]);

  // Load recent messages and subscribe to new ones
  useEffect(() => {
    if (!ageVerified) return;

    setHasMore(true);
    loadInitialMessages();

    const channelName = selectedRoom ? `room-messages-${selectedRoom.id}` : "public-messages";
    const messagesChannel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: "messages" },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: selectedRoom ? `channel_id=eq.${selectedRoom.id}` : "channel_id=is.null",
        },
        (payload) => {
          try {
            logger.debug("New message received via realtime", { messageId: payload.new.id });
            setMessages((prev) => {
              const messageExists = prev.some((msg) => msg.id === payload.new.id);
              if (messageExists) {
                logger.debug("Message already exists, skipping duplicate");
                return prev;
              }
              const transformedMessage = {
                ...payload.new,
                mentions: Array.isArray(payload.new.mentions) ? payload.new.mentions : [],
              };
              return [...prev, transformedMessage as Message];
            });
          } catch (error) {
            logger.error("Error processing new message", { error });
          }
        },
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, (payload) => {
        logger.debug("Message updated via realtime", { messageId: payload.new.id });
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === payload.new.id) {
              return {
                ...payload.new,
                mentions: Array.isArray(payload.new.mentions) ? payload.new.mentions : [],
              } as Message;
            }
            return msg;
          }),
        );
      })
      .subscribe((status) => {
        logger.debug("Messages subscription status", { status });
        if (status === "SUBSCRIBED") {
          logger.debug("Successfully subscribed to real-time messages");
        } else if (status === "CHANNEL_ERROR") {
          logger.error("Channel subscription error - attempting reconnection");
          setTimeout(() => {
            if (messagesChannel.state === "errored") {
              messagesChannel.unsubscribe();
            }
          }, 2000);
        } else if (status === "TIMED_OUT") {
          logger.error("Channel subscription timed out");
        } else if (status === "CLOSED") {
          logger.debug("Channel subscription closed");
        }
      });

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [ageVerified, selectedRoom]);

  // Handle user presence
  useEffect(() => {
    if (!ageVerified) return;

    if (presenceChannelRef.current) {
      supabase.removeChannel(presenceChannelRef.current);
      presenceChannelRef.current = null;
    }

    const setupPresence = () => {
      const currentUser = user;
      const currentGuestName = guestName;

      if (!currentUser && !currentGuestName) return;

      const name = currentUser ? currentUser.user_metadata?.name || currentUser.email : currentGuestName;
      const key = currentUser ? currentUser.id : `${currentGuestName}_${Date.now()}`;
      const isMember = !!currentUser;

      const channel = supabase.channel("online-users", {
        config: { presence: { key } },
      });

      channel
        .on("presence", { event: "sync" }, () => {
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
          if (status === "SUBSCRIBED") {
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
    if (searchQuery === "") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, searchQuery]);

  // Handle mobile keyboard resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    return () => window.visualViewport?.removeEventListener("resize", handleResize);
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
        .from("messages")
        .select("*")
        .ilike("content", `%${searchQuery}%`)
        .order("created_at", { ascending: true });

      if (!error) {
        const transformedResults = (data || []).map((msg: any) => ({
          ...msg,
          mentions: Array.isArray(msg.mentions) ? msg.mentions : [],
        }));
        setSearchResults(transformedResults);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, ageVerified]);
}
