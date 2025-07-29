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
    isOnline: false,
    lastChecked: new Date(),
    responseTime: undefined
  });
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const { toast } = useToast();

  // Check bot status by testing the edge function
  const checkBotStatus = async (): Promise<boolean> => {
    setIsCheckingStatus(true);
    try {
      const startTime = Date.now();
      
      // Make a simple health check to our edge function
      const { data, error } = await supabase.functions.invoke('chat-bot', {
        body: {
          message: '@bot health check',
          username: 'system',
          mentions: [{ username: 'bot' }]
        }
      });

      const responseTime = Date.now() - startTime;

      if (error) {
        console.error('Bot status check failed:', error);
        setBotStatus(prev => ({
          ...prev,
          isOnline: false,
          lastChecked: new Date(),
          responseTime: undefined
        }));
        return false;
      }

      setBotStatus(prev => ({
        ...prev,
        isOnline: true,
        lastChecked: new Date(),
        responseTime
      }));
      return true;

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

  // Send message to bot
  const sendMessageToBot = async (message: string, username: string, mentions: any[] = []) => {
    if (!botStatus.isOnline) {
      toast({
        title: "Bot unavailable",
        description: "The AI bot is currently offline. Please try again later.",
        variant: "destructive",
      });
      return false;
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
        return false;
      }

      console.log('Bot response received:', data);
      return true;

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
      return false;
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

  // Check bot status periodically
  useEffect(() => {
    // Initial status check
    checkBotStatus();

    // Check every 2 minutes
    const interval = setInterval(checkBotStatus, 2 * 60 * 1000);

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