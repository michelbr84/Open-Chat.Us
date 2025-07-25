import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const securityHeaders = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' https://lbadeqrxsvhfuygxvyqf.supabase.co https://cdn.gpteng.co;
    style-src 'self' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://lbadeqrxsvhfuygxvyqf.supabase.co wss://lbadeqrxsvhfuygxvyqf.supabase.co https://cdn.gpteng.co;
    font-src 'self' data: https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    frame-ancestors 'none';
    form-action 'self';
    upgrade-insecure-requests;
    report-uri /csp-report;
  `.replace(/\s+/g, ' ').trim(),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

serve(async (req) => {
  const { method, url } = req;
  const parsedUrl = new URL(url);

  console.log(`${method} ${parsedUrl.pathname} - Security headers endpoint`);

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response(null, { 
      headers: { ...corsHeaders, ...securityHeaders },
      status: 200 
    });
  }

  try {
    // Ping endpoint for health checks
    if (parsedUrl.pathname.endsWith('/ping')) {
      const response = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Security headers service is running',
        headers_configured: Object.keys(securityHeaders).length,
      };

      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
          ...securityHeaders,
        },
        status: 200,
      });
    }

    // Main endpoint - return security configuration
    const response = {
      securityHeaders,
      corsHeaders,
      message: 'Security headers configured successfully',
      csp_includes_frame_ancestors: securityHeaders['Content-Security-Policy'].includes('frame-ancestors'),
    };

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
        ...securityHeaders,
      },
      status: 200,
    });

  } catch (error) {
    console.error('Security headers error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
          ...securityHeaders,
        },
        status: 500,
      }
    );
  }
});