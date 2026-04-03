import { describe, it, expect } from 'vitest';
import {
  parseMarkdown,
  hasMarkdownFormatting,
  stripMarkdown,
  escapeMarkdown,
} from '../markdownFormatter';

describe('parseMarkdown', () => {
  it('returns empty array for empty input', () => {
    expect(parseMarkdown('')).toEqual([]);
  });

  it('returns plain text as single text segment', () => {
    const result = parseMarkdown('Hello world');
    expect(result).toEqual([{ type: 'text', content: 'Hello world' }]);
  });

  it('parses bold text', () => {
    const result = parseMarkdown('This is **bold** text');
    expect(result).toContainEqual({ type: 'bold', content: 'bold' });
  });

  it('parses italic text', () => {
    const result = parseMarkdown('This is *italic* text');
    expect(result).toContainEqual({ type: 'italic', content: 'italic' });
  });

  it('parses underline text', () => {
    const result = parseMarkdown('This is __underlined__ text');
    expect(result).toContainEqual({ type: 'underline', content: 'underlined' });
  });

  it('parses strikethrough text', () => {
    const result = parseMarkdown('This is ~~deleted~~ text');
    expect(result).toContainEqual({ type: 'strikethrough', content: 'deleted' });
  });

  it('parses inline code', () => {
    const result = parseMarkdown('Use `const x = 1` here');
    expect(result).toContainEqual({ type: 'inline-code', content: 'const x = 1' });
  });

  it('parses code blocks with language', () => {
    const result = parseMarkdown('```js\nconsole.log("hi")\n```');
    const codeBlock = result.find(s => s.type === 'code-block');
    expect(codeBlock).toBeDefined();
    expect(codeBlock!.language).toBe('js');
    expect(codeBlock!.content).toContain('console.log');
  });

  it('parses code blocks without language', () => {
    const result = parseMarkdown('```\nsome code\n```');
    const codeBlock = result.find(s => s.type === 'code-block');
    expect(codeBlock).toBeDefined();
    expect(codeBlock!.language).toBeUndefined();
  });

  it('parses links', () => {
    const result = parseMarkdown('Click [here](https://example.com) now');
    const link = result.find(s => s.type === 'link');
    expect(link).toBeDefined();
    expect(link!.content).toBe('here');
    expect(link!.url).toBe('https://example.com');
  });

  it('parses blockquotes', () => {
    const result = parseMarkdown('> This is a quote');
    expect(result).toContainEqual({ type: 'blockquote', content: 'This is a quote' });
  });

  it('parses list items with -', () => {
    const result = parseMarkdown('- Item one');
    expect(result).toContainEqual({ type: 'list-item', content: 'Item one' });
  });

  it('parses list items with *', () => {
    const result = parseMarkdown('* Item two');
    expect(result).toContainEqual({ type: 'list-item', content: 'Item two' });
  });

  it('handles multiple formatting types in one string', () => {
    // Note: **bold** matches both the bold pattern (**...**) and the italic pattern (*...*)
    // at overlapping positions. The overlap filter keeps the first match (bold) and
    // the remaining *italic* overlaps with the inner * from bold, so only bold is parsed.
    const result = parseMarkdown('**bold** then `code`');
    const types = result.map(s => s.type);
    expect(types).toContain('bold');
    expect(types).toContain('inline-code');
  });

  it('preserves text between formatted segments', () => {
    const result = parseMarkdown('before **bold** after');
    expect(result[0]).toEqual({ type: 'text', content: 'before ' });
    expect(result[1]).toEqual({ type: 'bold', content: 'bold' });
    expect(result[2]).toEqual({ type: 'text', content: ' after' });
  });
});

describe('hasMarkdownFormatting', () => {
  it('detects bold', () => {
    expect(hasMarkdownFormatting('**bold**')).toBe(true);
  });

  it('detects italic', () => {
    expect(hasMarkdownFormatting('*italic*')).toBe(true);
  });

  it('detects underline', () => {
    expect(hasMarkdownFormatting('__underline__')).toBe(true);
  });

  it('detects strikethrough', () => {
    expect(hasMarkdownFormatting('~~strike~~')).toBe(true);
  });

  it('detects inline code', () => {
    expect(hasMarkdownFormatting('`code`')).toBe(true);
  });

  it('detects code blocks', () => {
    expect(hasMarkdownFormatting('```code```')).toBe(true);
  });

  it('detects blockquotes', () => {
    expect(hasMarkdownFormatting('> quote')).toBe(true);
  });

  it('detects links', () => {
    expect(hasMarkdownFormatting('[text](url)')).toBe(true);
  });

  it('detects list items', () => {
    expect(hasMarkdownFormatting('- item')).toBe(true);
    expect(hasMarkdownFormatting('* item')).toBe(true);
    expect(hasMarkdownFormatting('+ item')).toBe(true);
  });

  it('returns false for plain text', () => {
    expect(hasMarkdownFormatting('Just plain text')).toBe(false);
  });
});

describe('stripMarkdown', () => {
  it('strips bold', () => {
    expect(stripMarkdown('**bold**')).toBe('bold');
  });

  it('strips italic', () => {
    expect(stripMarkdown('*italic*')).toBe('italic');
  });

  it('strips underline', () => {
    expect(stripMarkdown('__underline__')).toBe('underline');
  });

  it('strips strikethrough', () => {
    expect(stripMarkdown('~~strike~~')).toBe('strike');
  });

  it('strips inline code', () => {
    expect(stripMarkdown('`code`')).toBe('code');
  });

  it('strips links keeping text', () => {
    expect(stripMarkdown('[click here](https://example.com)')).toBe('click here');
  });

  it('strips blockquotes', () => {
    expect(stripMarkdown('> quote text')).toBe('quote text');
  });

  it('strips list markers', () => {
    expect(stripMarkdown('- list item')).toBe('list item');
    expect(stripMarkdown('* list item')).toBe('list item');
    expect(stripMarkdown('+ list item')).toBe('list item');
  });

  it('strips multiple formats in one string', () => {
    expect(stripMarkdown('**bold** and *italic*')).toBe('bold and italic');
  });

  it('returns plain text unchanged', () => {
    expect(stripMarkdown('plain text')).toBe('plain text');
  });
});

describe('escapeMarkdown', () => {
  it('escapes asterisks', () => {
    expect(escapeMarkdown('**bold**')).toBe('\\*\\*bold\\*\\*');
  });

  it('escapes underscores', () => {
    expect(escapeMarkdown('__underline__')).toBe('\\_\\_underline\\_\\_');
  });

  it('escapes tildes', () => {
    expect(escapeMarkdown('~~strike~~')).toBe('\\~\\~strike\\~\\~');
  });

  it('escapes backticks', () => {
    expect(escapeMarkdown('`code`')).toBe('\\`code\\`');
  });

  it('escapes brackets and parentheses', () => {
    expect(escapeMarkdown('[text](url)')).toBe('\\[text\\]\\(url\\)');
  });

  it('leaves plain text unchanged', () => {
    expect(escapeMarkdown('plain text')).toBe('plain text');
  });
});
