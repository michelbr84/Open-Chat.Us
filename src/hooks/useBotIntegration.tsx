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

  // Check bot status with a simple test (don't create actual messages)
  const checkBotStatus = async (): Promise<boolean> => {
    setIsCheckingStatus(true);
    try {
      const startTime = Date.now();
      
      // Try to reach the n8n webhook directly for status check
      const testResponse = await fetch('https://michelbr.app.n8n.cloud/webhook/8c9a5f1d-03df-46b1-89db-db79c4facba0/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'OpenChat-StatusCheck/1.0',
        },
        body: JSON.stringify({
          user: 'status-check',
          text: 'ping',
          timestamp: new Date().toISOString(),
          platform: 'open-chat-us'
        }),
      });

      const responseTime = Date.now() - startTime;
      const isOnline = testResponse.ok || testResponse.status < 500;

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
    if (!botStatus.isOnline) {
      toast({
        title: "Bot unavailable",
        description: "The AI bot is currently offline. Please try again later.",
        variant: "destructive",
      });
      return { success: false, error: 'Bot offline' };
    }

    try {
      console.log('Sending message to bot:', { message, username, mentions });

      const { data, error } = await supabase.functions.invoke('chat-bot', {
        body: {
          message,
          username,
          mentions
        }
      });

      if (error) {
        console.error('Error sending message to bot:', error);
        toast({
          title: "Bot error",
          description: "Failed to send message to the AI bot. Please try again.",
          variant: "destructive",
        });
        
        // Check if bot is still online
        checkBotStatus();
        return { success: false, error: 'Edge function error' };
      }

      console.log('Bot response received:', data);
      
      // Handle different response formats
      if (data?.success === false) {
        // Bot returned an error but with a friendly message
        toast({
          title: "Bot response",
          description: data.error || "Bot is having issues right now.",
          variant: "default",
        });
        return { success: true, botResponse: data.botResponse || data.error };
      }

      // Successful response
      return { 
        success: true, 
        botResponse: data?.botResponse || "I received your message!",
        messageId: data?.messageId 
      };

    } catch (error) {
      console.error('Failed to send message to bot:', error);
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

  // Check bot status periodically (less frequently to avoid spam)
  useEffect(() => {
    // Initial status check
    checkBotStatus();

    // Check every 5 minutes (reduced frequency)
    const interval = setInterval(checkBotStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    botStatus,
    isCheckingStatus,
    checkBotStatus,
    sendMessageToBot,
    isBotMention,
  };
};