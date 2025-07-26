import { supabase } from '@/integrations/supabase/client';

interface MentionData {
  user_id: string;
  username: string;
  display_name: string;
}

/**
 * Send notifications for mentions in a message
 */
export const sendMentionNotifications = async (
  messageId: string,
  messageContent: string,
  senderName: string,
  senderId: string | null,
  mentions: MentionData[]
) => {
  // Filter out self-mentions and invalid mentions
  const validMentions = mentions.filter(mention => 
    mention.user_id && 
    mention.user_id !== senderId &&
    mention.username && 
    mention.display_name
  );

  if (validMentions.length === 0) {
    return { success: true, processed_mentions: 0 };
  }

  try {
    // For now, we'll use a simple console log approach
    // In a production app, you'd call the edge function or implement proper notifications
    
    console.log('🔔 Mention notifications would be sent for:', {
      messageId,
      messageContent: messageContent.slice(0, 100) + (messageContent.length > 100 ? '...' : ''),
      senderName,
      senderId,
      mentions: validMentions
    });

    // You could call an edge function for notifications:
    // const { data, error } = await supabase.functions.invoke('mention-notification', {
    //   body: {
    //     message_id: messageId,
    //     message_content: messageContent,
    //     sender_name: senderName,
    //     sender_id: senderId,
    //     mentions: validMentions
    //   }
    // });

    // if (error) throw error;

    return { 
      success: true, 
      processed_mentions: validMentions.length 
    };

  } catch (error) {
    console.error('Error sending mention notifications:', error);
    return { 
      success: false, 
      error: error.message,
      processed_mentions: 0 
    };
  }
};