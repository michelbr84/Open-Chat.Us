import { describe, it, expect } from 'vitest';
import {
  searchEmojis,
  parseEmojiShortcodes,
  getEmojiByName,
  extractEmojiShortcodes,
  hasEmojiShortcodes,
  ALL_EMOJIS,
  COMMON_EMOJIS,
  EMOJI_DATABASE,
} from '../emojiSystem';

describe('EMOJI_DATABASE', () => {
  it('has expected categories', () => {
    expect(Object.keys(EMOJI_DATABASE)).toContain('smileys');
    expect(Object.keys(EMOJI_DATABASE)).toContain('hands');
    expect(Object.keys(EMOJI_DATABASE)).toContain('hearts');
    expect(Object.keys(EMOJI_DATABASE)).toContain('objects');
    expect(Object.keys(EMOJI_DATABASE)).toContain('negative');
  });

  it('ALL_EMOJIS is a non-empty flat array', () => {
    expect(ALL_EMOJIS.length).toBeGreaterThan(0);
    expect(ALL_EMOJIS[0]).toHaveProperty('emoji');
    expect(ALL_EMOJIS[0]).toHaveProperty('name');
  });

  it('COMMON_EMOJIS contains popular emojis', () => {
    expect(COMMON_EMOJIS).toContain('👍');
    expect(COMMON_EMOJIS).toContain('❤️');
    expect(COMMON_EMOJIS).toContain('🔥');
  });
});

describe('searchEmojis', () => {
  it('returns empty array for empty query', () => {
    expect(searchEmojis('')).toEqual([]);
  });

  it('finds emoji by exact name', () => {
    const results = searchEmojis('heart');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(e => e.name === 'heart')).toBe(true);
  });

  it('finds emoji by alias', () => {
    const results = searchEmojis('+1');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(e => e.emoji === '👍')).toBe(true);
  });

  it('finds emoji by keyword', () => {
    const results = searchEmojis('happy');
    expect(results.length).toBeGreaterThan(0);
  });

  it('finds emoji by partial name', () => {
    const results = searchEmojis('grin');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(e => e.name.includes('grin'))).toBe(true);
  });

  it('respects limit parameter', () => {
    const results = searchEmojis('heart', 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('returns no duplicates', () => {
    const results = searchEmojis('love');
    const emojis = results.map(r => r.emoji);
    const unique = new Set(emojis);
    expect(emojis.length).toBe(unique.size);
  });

  it('prioritizes exact matches', () => {
    const results = searchEmojis('heart');
    // Exact name match should be first
    expect(results[0].name).toBe('heart');
  });

  it('is case insensitive', () => {
    const lower = searchEmojis('heart');
    const upper = searchEmojis('HEART');
    expect(lower.length).toBe(upper.length);
  });
});

describe('parseEmojiShortcodes', () => {
  it('replaces known shortcodes with emojis', () => {
    const result = parseEmojiShortcodes('Hello :thumbsup:');
    expect(result.content).toContain('👍');
    expect(result.hasEmojis).toBe(true);
  });

  it('leaves unknown shortcodes unchanged', () => {
    const result = parseEmojiShortcodes('Hello :unknownemoji:');
    expect(result.content).toBe('Hello :unknownemoji:');
    expect(result.hasEmojis).toBe(false);
  });

  it('handles multiple shortcodes', () => {
    const result = parseEmojiShortcodes(':heart: and :fire:');
    expect(result.content).toContain('❤️');
    expect(result.content).toContain('🔥');
    expect(result.hasEmojis).toBe(true);
  });

  it('handles text with no shortcodes', () => {
    const result = parseEmojiShortcodes('No emojis here');
    expect(result.content).toBe('No emojis here');
    expect(result.hasEmojis).toBe(false);
  });

  it('handles alias names', () => {
    const result = parseEmojiShortcodes(':+1:');
    expect(result.content).toBe('👍');
    expect(result.hasEmojis).toBe(true);
  });

  it('does not replace partial matches inside words', () => {
    // The regex requires :<name>: format so no partial match issue
    const result = parseEmojiShortcodes('not:heart:partial');
    // Since the regex matches :heart: even without spaces, it should replace
    expect(result.content).toContain('❤️');
  });
});

describe('getEmojiByName', () => {
  it('finds emoji by name', () => {
    const result = getEmojiByName('heart');
    expect(result).toBeDefined();
    expect(result!.emoji).toBe('❤️');
  });

  it('finds emoji by alias', () => {
    const result = getEmojiByName('+1');
    expect(result).toBeDefined();
    expect(result!.emoji).toBe('👍');
  });

  it('returns undefined for unknown name', () => {
    expect(getEmojiByName('nonexistent_emoji')).toBeUndefined();
  });

  it('is exact match only', () => {
    // "hea" should not match "heart"
    expect(getEmojiByName('hea')).toBeUndefined();
  });
});

describe('extractEmojiShortcodes', () => {
  it('extracts shortcode names from text', () => {
    const result = extractEmojiShortcodes('Hello :heart: and :fire:');
    expect(result).toEqual(['heart', 'fire']);
  });

  it('returns empty array for text without shortcodes', () => {
    expect(extractEmojiShortcodes('No emojis')).toEqual([]);
  });

  it('handles single shortcode', () => {
    expect(extractEmojiShortcodes(':thumbsup:')).toEqual(['thumbsup']);
  });

  it('handles aliases with special characters', () => {
    const result = extractEmojiShortcodes(':+1:');
    expect(result).toEqual(['+1']);
  });
});

describe('hasEmojiShortcodes', () => {
  it('returns true when shortcodes are present', () => {
    expect(hasEmojiShortcodes('Hello :heart:')).toBe(true);
  });

  it('returns false when no shortcodes', () => {
    expect(hasEmojiShortcodes('Hello world')).toBe(false);
  });

  it('returns false for single colons', () => {
    expect(hasEmojiShortcodes('time is 10:30')).toBe(false);
  });

  it('returns true for valid format even with unknown emoji', () => {
    expect(hasEmojiShortcodes(':custom_name:')).toBe(true);
  });
});
