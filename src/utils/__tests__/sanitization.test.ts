import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  sanitizeMessageContent,
  sanitizeGuestName,
  isContentValidationRateLimited,
  sanitizeUrl,
  containsInappropriateContent,
  renderLinksInText,
} from '../sanitization';

describe('sanitizeMessageContent', () => {
  it('returns empty string for falsy input', () => {
    expect(sanitizeMessageContent('')).toBe('');
    expect(sanitizeMessageContent(null as any)).toBe('');
    expect(sanitizeMessageContent(undefined as any)).toBe('');
    expect(sanitizeMessageContent(123 as any)).toBe('');
  });

  it('trims whitespace', () => {
    expect(sanitizeMessageContent('  hello  ')).toBe('hello');
  });

  it('strips script tags', () => {
    const result = sanitizeMessageContent('<script>alert("xss")</script>');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
  });

  it('strips onerror attributes', () => {
    const result = sanitizeMessageContent('<img onerror="alert(1)" src="x">');
    expect(result).not.toContain('onerror');
  });

  it('removes javascript: URLs', () => {
    const result = sanitizeMessageContent('<a href="javascript:alert(1)">click</a>');
    expect(result).not.toContain('javascript:');
  });

  it('removes vbscript: URLs', () => {
    const result = sanitizeMessageContent('vbscript:msgbox("xss")');
    expect(result).not.toContain('vbscript:');
  });

  it('strips iframe tags', () => {
    const result = sanitizeMessageContent('<iframe src="http://evil.com"></iframe>');
    expect(result).not.toContain('<iframe');
  });

  it('strips style tags', () => {
    const result = sanitizeMessageContent('<style>body{display:none}</style>');
    expect(result).not.toContain('<style');
  });

  it('preserves allowed tags structure', () => {
    // KEEP_CONTENT is false, so DOMPurify strips content from forbidden tags
    // but allowed tags like <b>, <i>, <code> are kept
    const boldResult = sanitizeMessageContent('<b>bold</b>');
    expect(boldResult).toContain('<b>');
    const italicResult = sanitizeMessageContent('<i>italic</i>');
    expect(italicResult).toContain('<i>');
    const codeResult = sanitizeMessageContent('<code>code</code>');
    expect(codeResult).toContain('<code>');
  });

  it('preserves plain text content', () => {
    expect(sanitizeMessageContent('Hello, world!')).toBe('Hello, world!');
  });

  it('strips forbidden attributes from allowed tags', () => {
    const result = sanitizeMessageContent('<b onmouseover="alert(1)">text</b>');
    expect(result).not.toContain('onmouseover');
    // The tag itself is preserved (content behavior depends on DOMPurify config)
    expect(result).toContain('<b>');
  });
});

describe('sanitizeGuestName', () => {
  it('rejects empty or non-string input', () => {
    expect(sanitizeGuestName('').valid).toBe(false);
    expect(sanitizeGuestName(null as any).valid).toBe(false);
    expect(sanitizeGuestName(undefined as any).valid).toBe(false);
  });

  it('accepts valid names', () => {
    const result = sanitizeGuestName('Player1');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('Player1');
  });

  it('accepts names with underscores and hyphens', () => {
    expect(sanitizeGuestName('cool-user').valid).toBe(true);
    expect(sanitizeGuestName('cool_user').valid).toBe(true);
  });

  it('rejects names shorter than 3 characters', () => {
    const result = sanitizeGuestName('ab');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least 3 characters');
  });

  it('rejects names longer than 20 characters', () => {
    const result = sanitizeGuestName('a'.repeat(21));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('20 characters or less');
  });

  it('rejects names with special characters', () => {
    expect(sanitizeGuestName('user@name').valid).toBe(false);
    expect(sanitizeGuestName('user name').valid).toBe(false);
    expect(sanitizeGuestName('user!name').valid).toBe(false);
  });

  it('rejects restricted patterns - admin', () => {
    expect(sanitizeGuestName('admin123').valid).toBe(false);
    expect(sanitizeGuestName('ADMIN').valid).toBe(false);
    expect(sanitizeGuestName('myadmin').valid).toBe(false);
  });

  it('rejects restricted patterns - mod/moderator', () => {
    expect(sanitizeGuestName('moderator1').valid).toBe(false);
    expect(sanitizeGuestName('supermod').valid).toBe(false);
  });

  it('rejects restricted patterns - bot', () => {
    expect(sanitizeGuestName('chatbot').valid).toBe(false);
    expect(sanitizeGuestName('Bot123').valid).toBe(false);
  });

  it('rejects restricted patterns - support/staff/system', () => {
    expect(sanitizeGuestName('support1').valid).toBe(false);
    expect(sanitizeGuestName('staffmem').valid).toBe(false);
    expect(sanitizeGuestName('system01').valid).toBe(false);
  });

  it('rejects restricted patterns - official/verified/service', () => {
    expect(sanitizeGuestName('official1').valid).toBe(false);
    expect(sanitizeGuestName('verified1').valid).toBe(false);
    expect(sanitizeGuestName('service01').valid).toBe(false);
  });

  it('rejects only-number names', () => {
    expect(sanitizeGuestName('12345').valid).toBe(false);
  });

  it('rejects repeated-character names', () => {
    expect(sanitizeGuestName('aaa').valid).toBe(false);
    expect(sanitizeGuestName('111').valid).toBe(false);
  });

  it('strips HTML tags from names', () => {
    const result = sanitizeGuestName('<b>User</b>Name');
    // DOMPurify strips tags but keeps content
    expect(result.sanitized).not.toContain('<b>');
  });

  it('trims whitespace', () => {
    const result = sanitizeGuestName('  ValidName  ');
    expect(result.sanitized).toBe('ValidName');
    expect(result.valid).toBe(true);
  });
});

describe('isContentValidationRateLimited', () => {
  beforeEach(() => {
    // Reset by using a unique identifier per test
  });

  it('allows the first request', () => {
    const id = `test-${Date.now()}-${Math.random()}`;
    expect(isContentValidationRateLimited(id)).toBe(false);
  });

  it('allows up to 10 requests', () => {
    const id = `ratelimit-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 10; i++) {
      isContentValidationRateLimited(id);
    }
    // The 11th should be rate limited
    expect(isContentValidationRateLimited(id)).toBe(true);
  });

  it('does not rate limit different identifiers', () => {
    const id1 = `user1-${Date.now()}-${Math.random()}`;
    const id2 = `user2-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 10; i++) {
      isContentValidationRateLimited(id1);
    }
    // id2 should still be fine
    expect(isContentValidationRateLimited(id2)).toBe(false);
  });
});

describe('sanitizeUrl', () => {
  it('returns empty string for falsy input', () => {
    expect(sanitizeUrl('')).toBe('');
    expect(sanitizeUrl(null as any)).toBe('');
    expect(sanitizeUrl(undefined as any)).toBe('');
  });

  it('allows http URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com/');
  });

  it('allows https URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
  });

  it('rejects javascript: URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
  });

  it('rejects data: URLs', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
  });

  it('rejects ftp: URLs', () => {
    expect(sanitizeUrl('ftp://files.example.com')).toBe('');
  });

  it('rejects invalid URLs', () => {
    expect(sanitizeUrl('not a url')).toBe('');
  });

  it('preserves URL path and query parameters', () => {
    const url = 'https://example.com/path?key=value&foo=bar';
    expect(sanitizeUrl(url)).toBe(url);
  });
});

describe('containsInappropriateContent', () => {
  it('detects spam keywords', () => {
    expect(containsInappropriateContent('this is spam')).toBe(true);
    expect(containsInappropriateContent('click here now')).toBe(true);
    expect(containsInappropriateContent('buy now today')).toBe(true);
  });

  it('detects crypto scam patterns', () => {
    expect(containsInappropriateContent('bitcoin guaranteed profits')).toBe(true);
    expect(containsInappropriateContent('crypto fast returns')).toBe(true);
  });

  it('allows normal content', () => {
    expect(containsInappropriateContent('Hello, how are you?')).toBe(false);
    expect(containsInappropriateContent('Nice to meet you!')).toBe(false);
  });
});

describe('renderLinksInText', () => {
  it('returns empty string for falsy input', () => {
    expect(renderLinksInText('')).toBe('');
    expect(renderLinksInText(null as any)).toBe('');
    expect(renderLinksInText(undefined as any)).toBe('');
  });

  it('converts http URLs to clickable links', () => {
    const result = renderLinksInText('Visit http://example.com today');
    expect(result).toContain('<a href="http://example.com/"');
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it('converts https URLs to clickable links', () => {
    const result = renderLinksInText('Check https://example.com/page');
    expect(result).toContain('<a href="https://example.com/page"');
  });

  it('preserves non-URL text', () => {
    const result = renderLinksInText('Hello world');
    expect(result).toBe('Hello world');
  });

  it('sanitizes script tags in text with links', () => {
    const result = renderLinksInText('<script>alert(1)</script> https://example.com');
    expect(result).not.toContain('<script');
  });

  it('removes javascript: protocol from text', () => {
    const result = renderLinksInText('javascript:alert(1)');
    expect(result).not.toContain('javascript:');
  });
});
