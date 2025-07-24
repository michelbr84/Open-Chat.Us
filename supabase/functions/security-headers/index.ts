import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const securityHeaders = {
  // Frame protection (proper HTTP header)
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://lbadeqrxsvhfuygxvyqf.supabase.co https://cdn.gpteng.co;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://lbadeqrxsvhfuygxvyqf.supabase.co wss://lbadeqrxsvhfuygxvyqf.supabase.co https://cdn.gpteng.co;
    font-src 'self' data: https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    frame-ancestors 'none';
  `.replace(/\s+/g, ' ').trim(),
  
  // Additional security headers
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  
  // HSTS (if using HTTPS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
}

serve(async (req) => {
  console.log(`Security headers function called: ${req.method} ${req.url}`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: { ...corsHeaders, ...securityHeaders }
    })
  }

  try {
    const url = new URL(req.url)
    
    if (url.pathname === '/ping') {
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          headers: Object.keys(securityHeaders)
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
            ...securityHeaders
          }
        }
      )
    }

    // Return security headers configuration
    return new Response(
      JSON.stringify({ 
        securityHeaders: securityHeaders,
        corsHeaders: corsHeaders,
        message: 'Security headers configuration endpoint',
        usage: 'Use these headers in your reverse proxy or CDN configuration'
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
          ...securityHeaders
        }
      }
    )

  } catch (error) {
    console.error('Security headers function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
          ...securityHeaders
        }
      }
    )
  }
})