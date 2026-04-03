import { describe, it, expect } from 'vitest';
import {
  parseMentions,
  createMentionString,
  extractMentionsFromData,
  isUserMentioned,
  formatMessageWithMentions,
} from '../mentionParser';

describe('parseMentions', () => {
  it('detects a single mention', () => {
    const result = parseMentions('Hello @john!');
    expect(result.mentions).toHaveLength(1);
    expect(result.mentions[0].username).toBe('john!');
  });

  it('detects multiple mentions', () => {
    const result = parseMentions('@alice and @bob are here');
    expect(result.mentions).toHaveLength(2);
    expect(result.mentions[0].username).toBe('alice');
    expect(result.mentions[1].username).toBe('bob');
  });

  it('detects quoted mentions with spaces', () => {
    const result = parseMentions('Hey @"John Doe" welcome');
    expect(result.mentions).toHaveLength(1);
    expect(result.mentions[0].username).toBe('John Doe');
  });

  it('returns empty mentions for text without mentions', () => {
    const result = parseMentions('No mentions here');
    expect(result.mentions).toHaveLength(0);
  });

  it('preserves original content', () => {
    const content = 'Hello @world';
    const result = parseMentions(content);
    expect(result.content).toBe(content);
  });

  it('correctly captures start and end indices', () => {
    const result = parseMentions('Hey @alice!');
    const mention = result.mentions[0];
    expect(mention.start_index).toBe(4);
    // @alice! is the match (unquoted captures non-whitespace)
    expect(mention.end_index).toBeGreaterThan(mention.start_index);
  });

  it('handles mention at start of string', () => {
    const result = parseMentions('@admin hello');
    expect(result.mentions).toHaveLength(1);
    expect(result.mentions[0].start_index).toBe(0);
  });

  it('handles empty string', () => {
    const result = parseMentions('');
    expect(result.mentions).toHaveLength(0);
  });
});

describe('createMentionString', () => {
  it('creates simple mention for single-word names', () => {
    expect(createMentionString('alice')).toBe('@alice');
  });

  it('wraps names with spaces in quotes', () => {
    expect(createMentionString('John Doe')).toBe('@"John Doe"');
  });

  it('does not wrap names without spaces', () => {
    expect(createMentionString('john_doe')).toBe('@john_doe');
  });
});

describe('extractMentionsFromData', () => {
  it('extracts mentions from valid data', () => {
    const data = [
      { user_id: '1', username: 'alice', display_name: 'Alice', start_index: 0, end_index: 6 },
    ];
    const result = extractMentionsFromData(data);
    expect(result).toHaveLength(1);
    expect(result[0].user_id).toBe('1');
    expect(result[0].username).toBe('alice');
    expect(result[0].display_name).toBe('Alice');
  });

  it('returns empty array for non-array input', () => {
    expect(extractMentionsFromData(null as any)).toEqual([]);
    expect(extractMentionsFromData(undefined as any)).toEqual([]);
    expect(extractMentionsFromData('string' as any)).toEqual([]);
  });

  it('handles missing fields with defaults', () => {
    const data = [{}];
    const result = extractMentionsFromData(data);
    expect(result[0].user_id).toBe('');
    expect(result[0].username).toBe('');
    expect(result[0].display_name).toBe('');
    expect(result[0].start_index).toBe(0);
    expect(result[0].end_index).toBe(0);
  });

  it('falls back display_name to username', () => {
    const data = [{ username: 'bob' }];
    const result = extractMentionsFromData(data);
    expect(result[0].display_name).toBe('bob');
  });
});

describe('isUserMentioned', () => {
  const mentions = [
    { user_id: 'user-1', username: 'alice' },
    { user_id: 'user-2', username: 'bob' },
  ];

  it('returns true when user_id matches', () => {
    expect(isUserMentioned(mentions, 'user-1')).toBe(true);
  });

  it('returns true when username matches', () => {
    expect(isUserMentioned(mentions, 'alice')).toBe(true);
  });

  it('returns false when user is not mentioned', () => {
    expect(isUserMentioned(mentions, 'user-99')).toBe(false);
  });

  it('returns false for empty mentions array', () => {
    expect(isUserMentioned([], 'user-1')).toBe(false);
  });

  it('returns false for non-array input', () => {
    expect(isUserMentioned(null as any, 'user-1')).toBe(false);
  });

  it('returns false for empty userId', () => {
    expect(isUserMentioned(mentions, '')).toBe(false);
  });
});

describe('formatMessageWithMentions', () => {
  it('returns single text segment when no mentions', () => {
    const result = formatMessageWithMentions('Hello world', []);
    expect(result.segments).toHaveLength(1);
    expect(result.segments[0].type).toBe('text');
    expect(result.segments[0].content).toBe('Hello world');
  });

  it('returns single text segment for null mentions', () => {
    const result = formatMessageWithMentions('Hello world', null as any);
    expect(result.segments).toHaveLength(1);
    expect(result.segments[0].type).toBe('text');
  });

  it('splits content into text and mention segments', () => {
    const content = 'Hey @alice how are you';
    const mentions = [
      { user_id: 'u1', username: 'alice', display_name: 'Alice', start_index: 4, end_index: 10 },
    ];
    const result = formatMessageWithMentions(content, mentions);

    // Should have: "Hey " (text), "@alice" (mention), " how are you" (text)
    expect(result.segments.length).toBe(3);
    expect(result.segments[0].type).toBe('text');
    expect(result.segments[0].content).toBe('Hey ');
    expect(result.segments[1].type).toBe('mention');
    expect(result.segments[1].content).toBe('@alice');
    expect(result.segments[2].type).toBe('text');
    expect(result.segments[2].content).toBe(' how are you');
  });

  it('handles mention at start of content', () => {
    const content = '@bob hello';
    const mentions = [
      { user_id: 'u2', username: 'bob', start_index: 0, end_index: 4 },
    ];
    const result = formatMessageWithMentions(content, mentions);
    expect(result.segments[0].type).toBe('mention');
    expect(result.segments[0].content).toBe('@bob');
  });

  it('handles multiple mentions sorted correctly', () => {
    const content = '@alice and @bob';
    const mentions = [
      { user_id: 'u2', username: 'bob', start_index: 11, end_index: 15 },
      { user_id: 'u1', username: 'alice', start_index: 0, end_index: 6 },
    ];
    const result = formatMessageWithMentions(content, mentions);
    // Mentions should be sorted by start_index
    expect(result.segments[0].type).toBe('mention');
    expect(result.segments[0].content).toBe('@alice');
    expect(result.segments[1].type).toBe('text');
    expect(result.segments[2].type).toBe('mention');
    expect(result.segments[2].content).toBe('@bob');
  });
});
