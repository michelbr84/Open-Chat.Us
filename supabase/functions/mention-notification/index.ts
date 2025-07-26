import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MentionData {
  user_id: string;
  username: string;
  display_name: string;
}

interface NotificationRequest {
  message_id: string;
  message_content: string;
  sender_name: string;
  sender_id: string;
  mentions: MentionData[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { message_id, message_content, sender_name, sender_id, mentions }: NotificationRequest = await req.json();

    console.log('Processing mention notifications for message:', message_id);
    console.log('Mentions:', mentions);

    // Process each mention
    for (const mention of mentions) {
      // Skip if user is mentioning themselves
      if (mention.user_id === sender_id) {
        console.log('Skipping self-mention for user:', mention.user_id);
        continue;
      }

      // For now, we'll just log the notification
      // In a real app, you would:
      // 1. Create a notification record in the database
      // 2. Send a push notification
      // 3. Send an email notification (if enabled)
      
      console.log(`Notification: ${sender_name} mentioned ${mention.display_name} in message: "${message_content}"`);
      
      // You could insert into a notifications table:
      // await supabase
      //   .from('notifications')
      //   .insert({
      //     user_id: mention.user_id,
      //     type: 'mention',
      //     title: `${sender_name} mentioned you`,
      //     message: message_content,
      //     metadata: {
      //       message_id,
      //       sender_id,
      //       sender_name
      //     }
      //   });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed_mentions: mentions.length 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing mention notifications:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process mention notifications',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});