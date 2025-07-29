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

    // Send to LLM endpoint with proper error handling and timeout
    let llmResponse;
    let llmData;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      console.log('Calling LLM endpoint with message:', cleanMessage);
      
      llmResponse = await fetch('https://salty-buses-repair.loca.lt/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'OpenChat-Bot/1.0',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful AI assistant in a chat room. Be friendly, concise, and helpful."
            },
            {
              role: "user", 
              content: cleanMessage
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
          user: username
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log('LLM response status:', llmResponse.status);

      if (!llmResponse.ok) {
        const errorText = await llmResponse.text();
        console.error('LLM endpoint error:', llmResponse.status, llmResponse.statusText, errorText);
        
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

      llmData = await llmResponse.json();
      console.log('LLM response data:', llmData);
      
    } catch (fetchError) {
      console.error('Network error calling LLM endpoint:', fetchError);
      
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

    // Parse the AI response from LLM endpoint (OpenAI format)
    let botResponse = '';
    if (typeof llmData === 'string') {
      botResponse = llmData;
    } else if (llmData.choices && llmData.choices[0] && llmData.choices[0].message) {
      // Standard OpenAI format
      botResponse = llmData.choices[0].message.content;
    } else if (llmData.response) {
      botResponse = llmData.response;
    } else if (llmData.message) {
      botResponse = llmData.message;
    } else if (llmData.text) {
      botResponse = llmData.text;
    } else if (llmData.content) {
      // Handle cases where the response is wrapped in a content field
      botResponse = llmData.content;
    } else {
      console.log('Unexpected LLM response format:', llmData);
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

    console.log('Final bot response to save:', botResponse);

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