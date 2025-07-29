import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, username, mentions } = await req.json();

    if (!message || !username) {
      return new Response(
        JSON.stringify({ error: 'Message and username are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if this is a bot mention
    const isBotMention = message.toLowerCase().startsWith('@bot') || 
                        mentions?.some((m: any) => m.username.toLowerCase() === 'bot');

    if (!isBotMention) {
      return new Response(
        JSON.stringify({ error: 'Not a bot mention' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract the actual message content (remove @bot mention)
    const cleanMessage = message.replace(/^@bot\s*/i, '').trim();

    if (!cleanMessage) {
      return new Response(
        JSON.stringify({ error: 'No message content provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing bot request:', { cleanMessage, username });

    // Send to n8n webhook
    const n8nResponse = await fetch('https://michelbr.app.n8n.cloud/webhook/8c9a5f1d-03df-46b1-89db-db79c4facba0/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: cleanMessage,
        username: username,
        timestamp: new Date().toISOString(),
        platform: 'open-chat-us'
      }),
    });

    if (!n8nResponse.ok) {
      console.error('n8n webhook error:', n8nResponse.status, n8nResponse.statusText);
      throw new Error(`n8n webhook returned ${n8nResponse.status}`);
    }

    const n8nData = await n8nResponse.json();
    console.log('n8n response:', n8nData);

    // Get the AI response from n8n
    let botResponse = '';
    if (typeof n8nData === 'string') {
      botResponse = n8nData;
    } else if (n8nData.response) {
      botResponse = n8nData.response;
    } else if (n8nData.message) {
      botResponse = n8nData.message;
    } else if (n8nData.text) {
      botResponse = n8nData.text;
    } else {
      botResponse = "I'm processing your request, but I didn't get a clear response. Please try again.";
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert bot response into messages table
    const { data, error } = await supabase
      .from('messages')
      .insert({
        content: botResponse,
        sender_name: 'bot',
        sender_id: null, // Bot doesn't have a user ID
        mentions: [], // Bot doesn't mention others in responses
        is_bot_message: true // We'll add this field to identify bot messages
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting bot message:', error);
      throw new Error('Failed to save bot response');
    }

    console.log('Bot message saved:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        botResponse: botResponse,
        messageId: data.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-bot function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Bot is temporarily unavailable',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});