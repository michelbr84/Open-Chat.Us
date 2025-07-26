/**
 * Markdown Formatter for Open-Chat.Us
 * Supports: bold, italic, underline, strikethrough, inline code, code blocks, blockquotes, lists, links
 */

export interface MarkdownSegment {
  type: 'text' | 'bold' | 'italic' | 'underline' | 'strikethrough' | 'inline-code' | 'code-block' | 'blockquote' | 'link' | 'list-item';
  content: string;
  url?: string; // For links
  language?: string; // For code blocks
}

/**
 * Parse markdown text into segments for rendering
 */
export function parseMarkdown(text: string): MarkdownSegment[] {
  if (!text) return [];
  
  const segments: MarkdownSegment[] = [];
  let currentIndex = 0;

  // Regular expressions for markdown patterns (ordered by priority to avoid conflicts)
  const patterns = [
    { type: 'codeBlock', regex: /```(\w+)?\n?([\s\S]*?)```/g },
    { type: 'inlineCode', regex: /`([^`]+)`/g },
    { type: 'bold', regex: /\*\*([^*]+)\*\*/g },
    { type: 'italic', regex: /\*([^*]+)\*/g },
    { type: 'underline', regex: /__([^_]+)__/g },
    { type: 'strikethrough', regex: /~~([^~]+)~~/g },
    { type: 'link', regex: /\[([^\]]+)\]\(([^)]+)\)/g },
    { type: 'blockquote', regex: /^> (.+)$/gm },
    { type: 'listItem', regex: /^[-*+] (.+)$/gm },
  ];

  // Find all matches and their positions
  const matches: Array<{
    type: string;
    match: RegExpMatchArray;
    start: number;
    end: number;
  }> = [];

  for (const { type, regex } of patterns) {
    regex.lastIndex = 0; // Reset regex state
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        type,
        match,
        start: match.index!,
        end: match.index! + match[0].length,
      });
    }
  }

  // Sort matches by position and filter out overlapping matches
  matches.sort((a, b) => a.start - b.start);
  
  // Remove overlapping matches (keep the first one)
  const filteredMatches = [];
  let lastEnd = 0;
  
  for (const match of matches) {
    if (match.start >= lastEnd) {
      filteredMatches.push(match);
      lastEnd = match.end;
    }
  }

  // Process filtered matches and build segments
  for (const { type, match, start, end } of filteredMatches) {
    // Add text before this match
    if (start > currentIndex) {
      const textContent = text.slice(currentIndex, start);
      if (textContent) {
        segments.push({ type: 'text', content: textContent });
      }
    }

    // Add the formatted segment
    switch (type) {
      case 'bold':
        segments.push({ type: 'bold', content: match[1] });
        break;
      case 'italic':
        segments.push({ type: 'italic', content: match[1] });
        break;
      case 'underline':
        segments.push({ type: 'underline', content: match[1] });
        break;
      case 'strikethrough':
        segments.push({ type: 'strikethrough', content: match[1] });
        break;
      case 'inlineCode':
        segments.push({ type: 'inline-code', content: match[1] });
        break;
      case 'codeBlock':
        segments.push({ 
          type: 'code-block', 
          content: match[2] || match[1], 
          language: match[1] && match[2] ? match[1] : undefined 
        });
        break;
      case 'blockquote':
        segments.push({ type: 'blockquote', content: match[1] });
        break;
      case 'link':
        segments.push({ type: 'link', content: match[1], url: match[2] });
        break;
      case 'listItem':
        segments.push({ type: 'list-item', content: match[1] });
        break;
    }

    currentIndex = end;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    const remainingText = text.slice(currentIndex);
    if (remainingText) {
      segments.push({ type: 'text', content: remainingText });
    }
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: text }];
}

/**
 * Check if text contains markdown formatting
 */
export function hasMarkdownFormatting(text: string): boolean {
  const markdownPatterns = [
    /\*\*.*?\*\*/,  // bold
    /\*.*?\*/,      // italic
    /__.*?__/,      // underline
    /~~.*?~~/,      // strikethrough
    /`.*?`/,        // inline code
    /```[\s\S]*?```/, // code block
    /^> /m,         // blockquote
    /\[.*?\]\(.*?\)/, // link
    /^[-*+] /m,     // list item
  ];

  return markdownPatterns.some(pattern => pattern.test(text));
}

/**
 * Strip markdown formatting from text
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')  // bold
    .replace(/\*(.*?)\*/g, '$1')      // italic
    .replace(/__(.*?)__/g, '$1')      // underline
    .replace(/~~(.*?)~~/g, '$1')      // strikethrough
    .replace(/`(.*?)`/g, '$1')        // inline code
    .replace(/```[\s\S]*?```/g, '')   // code block
    .replace(/^> (.+)$/gm, '$1')      // blockquote
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // link
    .replace(/^[-*+] (.+)$/gm, '$1'); // list item
}

/**
 * Escape markdown special characters
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/([*_~`[\]()>+-])/g, '\\$1');
}