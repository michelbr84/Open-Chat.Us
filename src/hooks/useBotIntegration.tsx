import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BotStatus {
  isOnline: boolean;
  lastChecked: Date;
  responseTime?: number;
}

export const useBotIntegration = () => {
  const [botStatus, setBotStatus] = useState<BotStatus>({
    isOnline: true, // Start optimistically online
    lastChecked: new Date(),
    responseTime: undefined
  });
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const { toast } = useToast();

  // Check bot status by testing the edge function instead of direct n8n call
  const checkBotStatus = async (): Promise<boolean> => {
    setIsCheckingStatus(true);
    try {
      const startTime = Date.now();
      
      // Test the edge function with a health check message
      const { data, error } = await supabase.functions.invoke('chat-bot', {
        body: {
          message: 'ping',
          username: 'status-check',
          mentions: []
        }
      });

      const responseTime = Date.now() - startTime;
      // For health checks, the edge function should return success even with "Not a bot mention" 
      // since it's just checking if the service is running
      const isOnline = !error && data !== null;

      setBotStatus(prev => ({
        ...prev,
        isOnline,
        lastChecked: new Date(),
        responseTime: isOnline ? responseTime : undefined
      }));
      
      return isOnline;

    } catch (error) {
      console.error('Bot status check error:', error);
      setBotStatus(prev => ({
        ...prev,
        isOnline: false,
        lastChecked: new Date(),
        responseTime: undefined
      }));
      return false;
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Send message to bot and return response data
  const sendMessageToBot = async (message: string, username: string, mentions: any[] = []) => {
    try {
      console.log('🚀 Sending message to bot via edge function:', { message, username, mentions });

      const { data, error } = await supabase.functions.invoke('chat-bot', {
        body: {
          message,
          username,
          mentions
        }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        toast({
          title: "Bot error",
          description: "Failed to send message to the AI bot. Please try again.",
          variant: "destructive",
        });
        
        // Mark bot as offline and return error
        setBotStatus(prev => ({
          ...prev,
          isOnline: false,
          lastChecked: new Date()
        }));
        return { success: false, error: 'Edge function error' };
      }

      console.log('✅ Bot response received:', data);
      
      // Handle different response formats
      if (data?.success === false) {
        // Bot returned an error but with a friendly message
        console.log('⚠️ Bot returned error with message:', data.error);
        if (data.botResponse) {
          // Bot gave us a friendly error response, show it to user but treat as success for UI
          console.log('🔄 Displaying bot error message to user:', data.botResponse);
          return { success: true, botResponse: data.botResponse, savedToDatabase: false };
        } else {
          // No friendly response, show error toast
          console.log('❌ No bot response, showing error toast');
          toast({
            title: "Bot unavailable",
            description: data.error || "Bot is having issues right now.",
            variant: "destructive",
          });
          return { success: false, error: data.error || 'Bot error' };
        }
      }

      // Mark bot as online since we got a response
      setBotStatus(prev => ({
        ...prev,
        isOnline: true,
        lastChecked: new Date()
      }));

      // Successful response
      return { 
        success: true, 
        botResponse: data?.botResponse || "I received your message!",
        messageId: data?.messageId,
        savedToDatabase: data?.savedToDatabase || false
      };

    } catch (error) {
      console.error('❌ Failed to send message to bot:', error);
      toast({
        title: "Connection error",
        description: "Could not connect to the AI bot. Please check your connection.",
        variant: "destructive",
      });
      
      // Mark bot as offline on connection errors
      setBotStatus(prev => ({
        ...prev,
        isOnline: false,
        lastChecked: new Date()
      }));
      return { success: false, error: 'Connection failed' };
    }
  };

  // Check if a message is intended for the bot
  const isBotMention = (content: string, mentions: any[] = []): boolean => {
    const startsWithBot = content.toLowerCase().trim().startsWith('@bot');
    const hasBotMention = mentions?.some(mention => 
      mention.username?.toLowerCase() === 'bot' || 
      mention.display_name?.toLowerCase() === 'bot'
    );
    return startsWithBot || hasBotMention;
  };

  // Check bot status only when needed (not on interval to avoid spam)
  useEffect(() => {
    // Initial status check on mount
    checkBotStatus();
  }, []);

  return {
    botStatus,
    isCheckingStatus,
    checkBotStatus,
    sendMessageToBot,
    isBotMention,
  };
};