import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, user-agent, accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Received request:', { 
      url: req.url, 
      origin: req.headers.get('origin'),
      userAgent: req.headers.get('user-agent'),
      body: requestBody 
    });
    
    const { message, username, mentions } = requestBody;

    if (!message || !username) {
      console.error('Missing required fields:', { message: !!message, username: !!username });
      return new Response(
        JSON.stringify({ error: 'Message and username are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if this is a health check or bot mention
    const isHealthCheck = username === 'status-check' && message === 'ping';
    const isBotMention = message.toLowerCase().startsWith('@bot') || 
                        mentions?.some((m: any) => m.username?.toLowerCase() === 'bot');

    if (!isHealthCheck && !isBotMention) {
      return new Response(
        JSON.stringify({ error: 'Not a bot mention' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle health check
    if (isHealthCheck) {
      return new Response(
        JSON.stringify({ 
          success: true,
          botResponse: "Bot is online and ready!",
          messageId: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract the actual message content (remove @bot mention)
    const cleanMessage = message.replace(/^@bot\s*/i, '').trim();

    if (!cleanMessage) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'No message content provided',
          botResponse: "Hi! I'm here to help. What would you like to know?"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing bot request:', { cleanMessage, username });

    // Send to n8n webhook (MAIN CHAT ENDPOINT) with proper error handling and timeout
    let webhookResponse;
    let webhookData;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      console.log('Calling n8n webhook with bot message:', cleanMessage);
      
      webhookResponse = await fetch('https://michelbr.app.n8n.cloud/webhook/8c9a5f1d-03df-46b1-89db-db79c4facba0/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'OpenChat-Bot/1.0',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: cleanMessage,
          username: username,
          mentions: mentions,
          isBot: true // Flag to indicate this is a bot mention request
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log('n8n webhook response status:', webhookResponse.status);

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error('n8n webhook error:', webhookResponse.status, webhookResponse.statusText, errorText);
        
        // Return a friendly error instead of throwing
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Bot is temporarily busy. Please try again in a moment.',
            botResponse: "I'm having trouble processing your request right now. Please try again in a few moments!"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      webhookData = await webhookResponse.json();
      console.log('n8n webhook response data:', webhookData);
      
    } catch (fetchError) {
      console.error('Network error calling n8n webhook:', fetchError);
      
      // Return a friendly error for network issues
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Bot is temporarily unavailable. Please try again later.',
          botResponse: "I'm currently offline. Please try again later!"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the bot response from n8n webhook
    let botResponse = '';
    if (typeof webhookData === 'string') {
      botResponse = webhookData;
    } else if (webhookData && webhookData.response) {
      botResponse = webhookData.response;
    } else if (webhookData && webhookData.message) {
      botResponse = webhookData.message;
    } else if (webhookData && webhookData.botResponse) {
      botResponse = webhookData.botResponse;
    } else if (webhookData && webhookData.content) {
      botResponse = webhookData.content;
    } else {
      console.log('Unexpected n8n webhook response format:', webhookData);
      botResponse = "I received your message but couldn't process it properly. Please try again.";
    }

    // If botResponse is still an object (like JSON), try to extract content
    if (typeof botResponse === 'object' && botResponse !== null) {
      if (botResponse.content) {
        botResponse = botResponse.content;
      } else if (botResponse.message) {
        botResponse = botResponse.message;
      } else {
        // If it's still an object, stringify it as fallback
        botResponse = JSON.stringify(botResponse);
      }
    }

    console.log('Final bot response from n8n:', botResponse);

    // NOTE: The n8n webhook should handle saving the bot message to the database
    // If the n8n workflow doesn't save the message, we can enable this code:
    /*
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('messages')
      .insert({
        content: botResponse,
        sender_name: 'bot',
        sender_id: null,
        mentions: [],
        is_bot_message: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting bot message:', error);
      throw new Error('Failed to save bot response');
    }
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        botResponse: botResponse,
        messageId: webhookData?.messageId || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-bot function:', error);
    
    // Return a friendly error with 200 status to prevent frontend errors
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Bot is temporarily unavailable. Please try again later.',
        botResponse: "I'm sorry, I'm having technical difficulties right now. Please try again later!",
        details: error.message
      }),
      { 
        status: 200, // Use 200 so frontend can handle the error gracefully
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});