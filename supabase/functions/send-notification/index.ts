import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  userId: string;
  type: 'mention' | 'dm' | 'reaction' | 'achievement' | 'announcement' | 'system';
  title: string;
  message?: string;
  data?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { userId, type, title, message, data }: NotificationRequest = await req.json();

    if (!userId || !type || !title) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, type, title' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Insert notification into database
    const { data: notification, error: insertError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data,
        is_read: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting notification:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create notification' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get user's notification preferences
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('notification_preferences')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    const preferences = userProfile?.notification_preferences || {
      mentions: true,
      dms: true,
      reactions: true,
      announcements: true,
    };

    // Check if user wants this type of notification
    const shouldNotify = preferences[type] !== false;

    if (!shouldNotify) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          notification_id: notification.id,
          message: 'Notification created but not sent due to user preferences'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Here you could add push notification logic for mobile apps
    // For now, we're relying on the real-time subscription in the frontend

    console.log(`Notification created: ${notification.id} for user ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification_id: notification.id,
        message: 'Notification sent successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);