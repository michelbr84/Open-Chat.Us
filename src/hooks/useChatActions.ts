import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMessageReactions } from "@/hooks/useMessageReactions";
import { useMessageReports } from "@/hooks/useMessageReports";
import { useMessageEditing } from "@/hooks/useMessageEditing";
import { useSecureMessageHandling } from "@/hooks/useSecureMessageHandling";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { useBotIntegration } from "@/hooks/useBotIntegration";
import { sanitizeGuestName } from "@/utils/sanitization";
import { updateGuestName } from "@/utils/secureGuestId";
import { sendMentionNotifications } from "@/utils/mentionNotifications";
import logger from "@/utils/logger";
import type { Message, Room } from "@/hooks/useChatState";

interface UseChatActionsParams {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  guestName: string;
  setGuestName: React.Dispatch<React.SetStateAction<string>>;
  selectedRoom: Room | null;
  setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMobileSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  setActivePrivateChat: React.Dispatch<React.SetStateAction<{ id: string; name: string } | null>>;
  setMentionToAdd: React.Dispatch<React.SetStateAction<string>>;
  setShouldClearMention: React.Dispatch<React.SetStateAction<boolean>>;
  shouldClearMention: boolean;
  presenceChannelRef: React.MutableRefObject<any>;
  lastMessageTimeRef: React.MutableRefObject<number>;
}

export function useChatActions(params: UseChatActionsParams) {
  const {
    messages, setMessages, guestName, setGuestName,
    selectedRoom, setShowLogin, setShowMobileSidebar,
    setActivePrivateChat, setMentionToAdd, setShouldClearMention,
    shouldClearMention, presenceChannelRef, lastMessageTimeRef,
  } = params;

  const { user } = useAuth();
  const { toast } = useToast();
  const { reactions, toggleReaction } = useMessageReactions();
  const { submitReport } = useMessageReports();
  const { editMessage, deleteMessage } = useMessageEditing();
  const { validateAndSanitizeMessage, logSecurityEvent } = useSecureMessageHandling();
  const { logSecurityEvent: logSecurity } = useSecurityMonitoring();
  const { botStatus, sendMessageToBot, isBotMention } = useBotIntegration();

  // Send public message with enhanced security validation and mentions support
  const sendPublicMessage = useCallback(async (content: string, mentions: any[] = []) => {
    // Client-side rate limiting
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

    const senderName = user ? user.user_metadata?.name || user.email : guestName;

    // Check if this message is intended for the bot
    if (isBotMention(content, mentions)) {
      logger.debug("Bot mention detected, sending to bot");

      toast({
        title: "Sending message to AI...",
        description: "The bot is processing your request.",
      });

      const botResponse = await sendMessageToBot(content, senderName, mentions, selectedRoom?.id || null);

      if (botResponse.success && botResponse.botResponse) {
        logger.debug("Bot responded successfully", {
          messageId: botResponse.messageId,
          savedToDatabase: botResponse.savedToDatabase,
        });

        if (botResponse.savedToDatabase) {
          toast({
            title: "AI response received!",
            description: "The bot has responded to your message.",
            variant: "default",
          });
        } else {
          toast({
            title: "Partial bot response",
            description: "Bot responded but the message may not be visible to all users.",
            variant: "destructive",
          });
        }

        return;
      } else {
        logger.warn("Bot failed", { error: botResponse.error });
        toast({
          title: "Bot unavailable",
          description: botResponse.error || "The AI bot is temporarily unavailable.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      logger.debug("Sending message", {
        senderName,
        channel_id: selectedRoom?.id || null,
      });
      const { data, error } = await supabase
        .from("messages")
        .insert({
          content,
          sender_name: senderName,
          sender_id: user?.id || null,
          mentions: mentions || [],
          channel_id: selectedRoom?.id || null,
        })
        .select()
        .single();

      if (error) {
        logger.error("Error sending message", { error });
      } else {
        logger.debug("Message sent successfully", { messageId: data.id });

        // Optimistic update
        setMessages((prev) => {
          const messageExists = prev.some((msg) => msg.id === data.id);
          if (messageExists) return prev;

          const newMessage = {
            ...data,
            mentions: Array.isArray(data.mentions) ? data.mentions : [],
          } as Message;

          return [...prev, newMessage];
        });

        // Send mention notifications if there are mentions (but not for bot mentions)
        if (mentions && mentions.length > 0) {
          const nonBotMentions = mentions.filter((m) => m.username?.toLowerCase() !== "bot");
          if (nonBotMentions.length > 0) {
            sendMentionNotifications(data.id, content, senderName, user?.id || null, nonBotMentions).catch((err) =>
              logger.error("Failed to send mention notifications", { error: err }),
            );
          }
        }
      }

      if (error) {
        if (error.message.includes("too long")) {
          toast({
            title: "Message too long",
            description: "Please keep your message under 1000 characters.",
            variant: "destructive",
          });
        } else if (error.message.includes("prohibited content")) {
          toast({
            title: "Message blocked",
            description: "Your message contains prohibited content.",
            variant: "destructive",
          });
        } else if (error.message.includes("rate limit")) {
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
  }, [user, guestName, selectedRoom, isBotMention, sendMessageToBot, toast]);

  // Handle user click for adding mention
  const handleUserClick = useCallback((name: string, isMember: boolean, key: string) => {
    handleMentionUser(name);
  }, []);

  // Handle user mention
  const handleMentionUser = useCallback((username: string) => {
    setMentionToAdd(username);
    setShouldClearMention(true);
    setShowMobileSidebar(false);
  }, []);

  // Handle mention added
  const handleMentionAdded = useCallback(() => {
    if (shouldClearMention) {
      setMentionToAdd("");
      setShouldClearMention(false);
    }
  }, [shouldClearMention]);

  // Handle opening private chat
  const handleOpenPrivateChat = useCallback((senderId: string, senderName: string) => {
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
  }, [user, toast]);

  // Handle guest name change with enhanced validation
  const handleGuestNameChange = useCallback(async (newName: string) => {
    if (!presenceChannelRef.current) return;

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
      logSecurityEvent("guest_name_change", {
        oldName: guestName,
        newName: validation.sanitized,
        timestamp: new Date().toISOString(),
      });

      await presenceChannelRef.current.untrack();
      await presenceChannelRef.current.track({
        name: validation.sanitized,
        isMember: false,
      });
      setGuestName(validation.sanitized);
      updateGuestName(validation.sanitized);
    } catch (error) {
      logger.error("Failed to change name", { error });
      toast({
        title: "Failed to change name",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  }, [guestName, toast, logSecurityEvent]);

  // Handle chat export
  const handleExportChat = useCallback(() => {
    try {
      const dataStr = JSON.stringify(messages, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `chat-export-${new Date().toISOString().slice(0, 10)}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      toast({
        title: "Chat Exported",
        description: "Your chat history has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export chat history.",
        variant: "destructive",
      });
    }
  }, [messages, toast]);

  // Handle emoji reactions
  const handleReaction = useCallback((messageId: string, emoji: string) => {
    toggleReaction(messageId, emoji);
  }, [toggleReaction]);

  // Handle message reporting
  const handleReport = useCallback((messageId: string, reason: string, details?: string) => {
    submitReport(messageId, reason, details);
  }, [submitReport]);

  // Handle message editing
  const handleEdit = useCallback(async (messageId: string, newContent: string) => {
    const originalMessage = messages.find((m) => m.id === messageId);

    // Optimistic update
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, content: newContent, edited_at: new Date().toISOString() } : msg,
      ),
    );

    const success = await editMessage(messageId, newContent);
    if (!success) {
      toast({
        title: "Edit failed",
        description: "Failed to save changes. Reverting...",
        variant: "destructive",
      });
      if (originalMessage) {
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? originalMessage : msg)));
      }
    }
  }, [messages, editMessage, toast]);

  // Handle message deletion
  const handleDelete = useCallback(async (messageId: string) => {
    const originalMessage = messages.find((m) => m.id === messageId);

    // Optimistic update
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, is_deleted: true, content: "This message was deleted" } : msg,
      ),
    );

    const success = await deleteMessage(messageId);
    if (!success) {
      toast({
        title: "Delete failed",
        description: "Failed to delete message. Reverting...",
        variant: "destructive",
      });
      if (originalMessage) {
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? originalMessage : msg)));
      }
    }
  }, [messages, deleteMessage, toast]);

  return {
    reactions,
    sendPublicMessage,
    handleUserClick,
    handleMentionUser,
    handleMentionAdded,
    handleOpenPrivateChat,
    handleGuestNameChange,
    handleExportChat,
    handleReaction,
    handleReport,
    handleEdit,
    handleDelete,
  };
}
