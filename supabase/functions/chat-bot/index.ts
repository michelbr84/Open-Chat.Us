import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, user-agent, accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Get n8n webhook URL from environment
const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL') || '';

// Rate limiting: Track requests per user/IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // Max requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

// Sanitize input to prevent injection
function sanitizeInput(input: string, maxLength: number): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client identifier for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('cf-connecting-ip') ||
      'unknown';

    const requestBody = await req.json();
    console.log('Received request:', {
      url: req.url,
      origin: req.headers.get('origin'),
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

    // Sanitize inputs
    const sanitizedUsername = sanitizeInput(username, 50);
    const sanitizedMessage = sanitizeInput(message, 1000);

    // Rate limit check (use username + IP as identifier)
    const rateLimitKey = `${sanitizedUsername}:${clientIP}`;

    // Skip rate limit for health checks
    const isHealthCheck = sanitizedUsername === 'status-check' && sanitizedMessage === 'ping';

    if (!isHealthCheck && isRateLimited(rateLimitKey)) {
      console.log(`Rate limit exceeded for: ${rateLimitKey}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many requests. Please slow down.',
          botResponse: "You're sending messages too quickly. Please wait a moment before trying again."
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if this is a health check or bot mention
    const isBotMention = sanitizedMessage.toLowerCase().startsWith('@bot') ||
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
    const cleanMessage = sanitizedMessage.replace(/^@bot\s*/i, '').trim();

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

    console.log('Processing bot request:', { cleanMessage, username: sanitizedUsername });

    // Send to n8n webhook with proper error handling and timeout
    let webhookResponse;
    let webhookData;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      console.log('Calling n8n webhook with bot message:', cleanMessage);

      webhookResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'OpenChat-Bot/1.0',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: cleanMessage,
          username: sanitizedUsername,
          mentions: mentions,
          isBot: true
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('n8n webhook response status:', webhookResponse.status);

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error('n8n webhook error:', webhookResponse.status, webhookResponse.statusText, errorText);

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

    // Handle array response (common in n8n)
    let responseData = webhookData;
    if (Array.isArray(webhookData) && webhookData.length > 0) {
      responseData = webhookData[0];
    }

    if (typeof responseData === 'string') {
      botResponse = responseData;
    } else if (responseData && typeof responseData === 'object') {
      if (responseData.output) {
        botResponse = responseData.output;
      } else if (responseData.response) {
        botResponse = responseData.response;
      } else if (responseData.message) {
        botResponse = responseData.message;
      } else if (responseData.botResponse) {
        botResponse = responseData.botResponse;
      } else if (responseData.content) {
        botResponse = responseData.content;
      }
    }

    if (!botResponse) {
      console.log('Unexpected n8n webhook response format:', webhookData);
      botResponse = "I received your message but couldn't process it properly. Please try again.";
    }

    // If botResponse is still an object, try to extract content
    if (typeof botResponse === 'object' && botResponse !== null) {
      if (botResponse.content) {
        botResponse = botResponse.content;
      } else if (botResponse.message) {
        botResponse = botResponse.message;
      } else {
        botResponse = JSON.stringify(botResponse);
      }
    }

    console.log('Final bot response from n8n:', botResponse);

    // Save bot response to Supabase database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    console.log('Saving bot response to database...');
    const { data: messageData, error: insertError } = await supabaseClient
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

    if (insertError) {
      console.error('Error inserting bot message to database:', insertError);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Bot responded but failed to save to database',
          botResponse: botResponse,
          details: insertError.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Bot message saved to database successfully:', messageData.id);

    return new Response(
      JSON.stringify({
        success: true,
        botResponse: botResponse,
        messageId: messageData.id,
        savedToDatabase: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-bot function:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Bot is temporarily unavailable. Please try again later.',
        botResponse: "I'm sorry, I'm having technical difficulties right now. Please try again later!",
        details: error.message
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
