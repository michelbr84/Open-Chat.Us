import DOMPurify from 'dompurify';

// XSS Protection Configuration
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code', 'a'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  KEEP_CONTENT: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

// Restricted words/patterns for guest names
const RESTRICTED_NAME_PATTERNS = [
  /admin/i,
  /moderator/i,
  /mod/i,
  /support/i,
  /staff/i,
  /system/i,
  /bot/i,
  /service/i,
  /official/i,
  /verified/i,
  /\b(fuck|shit|damn|hell|ass|bitch|bastard|crap)\b/i,
  /^(.)\1{2,}$/, // Repeated characters like "aaa", "111"
  /^\d+$/, // Only numbers
];

// Sanitize message content for XSS protection
export const sanitizeMessageContent = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // First pass: basic HTML sanitization
  const sanitized = DOMPurify.sanitize(content.trim(), PURIFY_CONFIG);
  
  // Second pass: additional content filtering
  return sanitized
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:(?!image\/[a-z]+;base64,)/gi, '') // Only allow data: for images
    .replace(/vbscript:/gi, '') // Remove vbscript: URLs
    .replace(/<script[\s\S]*?<\/script>/gi, '') // Extra script tag removal
    .trim();
};

// Validate and sanitize guest names
export const sanitizeGuestName = (name: string): { valid: boolean; sanitized: string; error?: string } => {
  if (!name || typeof name !== 'string') {
    return { valid: false, sanitized: '', error: 'Name is required' };
  }

  // Basic sanitization
  let sanitized = DOMPurify.sanitize(name.trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  }).trim();

  // Length validation
  if (sanitized.length < 3) {
    return { valid: false, sanitized, error: 'Name must be at least 3 characters' };
  }

  if (sanitized.length > 20) {
    return { valid: false, sanitized, error: 'Name must be 20 characters or less' };
  }

  // Character validation - only alphanumeric, underscore, hyphen
  if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
    return { valid: false, sanitized, error: 'Name can only contain letters, numbers, underscore, and hyphen' };
  }

  // Check against restricted patterns
  for (const pattern of RESTRICTED_NAME_PATTERNS) {
    if (pattern.test(sanitized)) {
      return { valid: false, sanitized, error: 'This name is not allowed' };
    }
  }

  return { valid: true, sanitized };
};

// Rate limiting for content validation
const contentValidationCache = new Map<string, { count: number; lastReset: number }>();
const VALIDATION_RATE_LIMIT = 10; // Max validations per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

export const isContentValidationRateLimited = (identifier: string): boolean => {
  const now = Date.now();
  const cached = contentValidationCache.get(identifier);

  if (!cached || now - cached.lastReset > RATE_LIMIT_WINDOW) {
    contentValidationCache.set(identifier, { count: 1, lastReset: now });
    return false;
  }

  if (cached.count >= VALIDATION_RATE_LIMIT) {
    return true;
  }

  cached.count++;
  return false;
};

// Sanitize URLs for safe redirects
export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Only allow http/https URLs
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // Invalid URL
  }

  return '';
};

// Content filtering for inappropriate material
export const containsInappropriateContent = (content: string): boolean => {
  const inappropriatePatterns = [
    /\b(spam|scam|phishing|hack|virus|malware)\b/i,
    /\b(bitcoin|crypto|investment|money)\s+(guaranteed|fast|easy|instant)\b/i,
    /\b(click\s+here|visit\s+now|buy\s+now|limited\s+time)\b/i,
    /(\b\w+\.\w{2,}\b.*){3,}/, // Multiple URLs
  ];

  return inappropriatePatterns.some(pattern => pattern.test(content));
};

// Convert URLs in text to clickable links while maintaining XSS safety
export const renderLinksInText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Sanitize without trimming to preserve whitespace
  const sanitized = DOMPurify.sanitize(text, {
    ...PURIFY_CONFIG,
    KEEP_CONTENT: true
  })
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:(?!image\/[a-z]+;base64,)/gi, '') // Only allow data: for images
    .replace(/vbscript:/gi, '') // Remove vbscript: URLs
    .replace(/<script[\s\S]*?<\/script>/gi, ''); // Extra script tag removal
  
  // URL detection regex - matches http/https URLs
  const urlRegex = /(https?:\/\/[^\s<>"']+[^\s<>"'.,;!?])/gi;
  
  return sanitized.replace(urlRegex, (url) => {
    // Sanitize the URL to ensure it's safe
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) {
      return url; // Return original text if URL is invalid
    }
    
    // Create a safe clickable link
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 underline transition-colors">${url}</a>`;
  });
};