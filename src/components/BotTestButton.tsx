import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Loader2 } from 'lucide-react';
import { useBotIntegration } from '@/hooks/useBotIntegration';
import { useToast } from '@/hooks/use-toast';

export const BotTestButton = () => {
  const [isTestingBot, setIsTestingBot] = useState(false);
  const { sendMessageToBot, botStatus } = useBotIntegration();
  const { toast } = useToast();

  const testBotIntegration = async () => {
    setIsTestingBot(true);
    
    try {
      console.log('🧪 Testing bot integration...');
      const result = await sendMessageToBot('@bot Hello, this is a test', 'TestUser', [
        { user_id: 'bot', username: 'bot', display_name: 'bot', start_index: 0, end_index: 4 }
      ]);
      
      console.log('🧪 Bot test result:', result);
      
      if (result.success) {
        toast({
          title: "Bot test successful! ✅",
          description: `Bot responded: ${result.botResponse?.substring(0, 100)}...`,
          variant: "default",
        });
      } else {
        toast({
          title: "Bot test failed ❌",
          description: result.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('🧪 Bot test error:', error);
      toast({
        title: "Bot test error ❌",
        description: "Failed to test bot integration",
        variant: "destructive",
      });
    } finally {
      setIsTestingBot(false);
    }
  };

  return (
    <Button
      onClick={testBotIntegration}
      disabled={isTestingBot}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isTestingBot ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Bot className="w-4 h-4" />
      )}
      Test Bot
      <span className={`ml-2 w-2 h-2 rounded-full ${
        botStatus.isOnline ? 'bg-green-500' : 'bg-red-500'
      }`} />
    </Button>
  );
};