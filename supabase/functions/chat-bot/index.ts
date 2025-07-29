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

    // Send to n8n webhook with better error handling
    let n8nResponse;
    let n8nData;
    
    try {
      n8nResponse = await fetch('https://michelbr.app.n8n.cloud/webhook/8c9a5f1d-03df-46b1-89db-db79c4facba0/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'OpenChat-Bot/1.0',
        },
        body: JSON.stringify({
          user: username,
          text: cleanMessage,
          timestamp: new Date().toISOString(),
          platform: 'open-chat-us'
        }),
      });

      console.log('n8n response status:', n8nResponse.status);

      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text();
        console.error('n8n webhook error:', n8nResponse.status, n8nResponse.statusText, errorText);
        
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

      n8nData = await n8nResponse.json();
      console.log('n8n response data:', n8nData);
      
    } catch (fetchError) {
      console.error('Network error calling n8n:', fetchError);
      
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

    // Parse the AI response from n8n
    let botResponse = '';
    if (typeof n8nData === 'string') {
      botResponse = n8nData;
    } else if (n8nData.response) {
      botResponse = n8nData.response;
    } else if (n8nData.message) {
      botResponse = n8nData.message;
    } else if (n8nData.text) {
      botResponse = n8nData.text;
    } else if (n8nData.choices && n8nData.choices[0] && n8nData.choices[0].message) {
      botResponse = n8nData.choices[0].message.content;
    } else {
      console.log('Unexpected n8n response format:', n8nData);
      botResponse = "I received your message but couldn't process it properly. Please try again.";
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