interface MentionData {
  user_id: string;
  username: string;
  display_name: string;
  start_index: number;
  end_index: number;
}

interface ParsedMentions {
  content: string;
  mentions: MentionData[];
}

/**
 * Parse message content to extract mentions and create structured data
 */
export const parseMentions = (content: string): ParsedMentions => {
  const mentions: MentionData[] = [];
  let parsedContent = content;
  
  // Pattern to match @mentions (with optional quotes for names with spaces)
  const mentionPattern = /@(?:"([^"]+)"|(\S+))/g;
  let match;
  
  while ((match = mentionPattern.exec(content)) !== null) {
    const fullMatch = match[0];
    const mentionText = match[1] || match[2]; // Quoted or unquoted mention
    const startIndex = match.index;
    const endIndex = match.index + fullMatch.length;
    
    // For now, we'll use the mention text as both user_id and display_name
    // In a real app, you'd look up the actual user ID from the username
    mentions.push({
      user_id: mentionText, // This should be replaced with actual user ID lookup
      username: mentionText,
      display_name: mentionText,
      start_index: startIndex,
      end_index: endIndex
    });
  }
  
  return {
    content: parsedContent,
    mentions
  };
};

/**
 * Create a mention string for insertion into message content
 */
export const createMentionString = (username: string): string => {
  // If username contains spaces, wrap in quotes
  if (username.includes(' ')) {
    return `@"${username}"`;
  }
  return `@${username}`;
};

/**
 * Extract mentions from structured mention data for display
 */
export const extractMentionsFromData = (mentions: any[]): MentionData[] => {
  if (!Array.isArray(mentions)) return [];
  
  return mentions.map(mention => ({
    user_id: mention.user_id || '',
    username: mention.username || '',
    display_name: mention.display_name || mention.username || '',
    start_index: mention.start_index || 0,
    end_index: mention.end_index || 0
  }));
};

/**
 * Check if a user is mentioned in the mentions array
 */
export const isUserMentioned = (mentions: any[], userId: string): boolean => {
  if (!Array.isArray(mentions) || !userId) return false;
  
  return mentions.some(mention => 
    mention.user_id === userId || mention.username === userId
  );
};

/**
 * Format message content for display with mention highlighting
 */
export const formatMessageWithMentions = (content: string, mentions: any[]): { 
  segments: Array<{ type: 'text' | 'mention', content: string, mention?: MentionData }> 
} => {
  if (!Array.isArray(mentions) || mentions.length === 0) {
    return { segments: [{ type: 'text', content }] };
  }

  const segments: Array<{ type: 'text' | 'mention', content: string, mention?: MentionData }> = [];
  let lastIndex = 0;

  // Sort mentions by start_index to process them in order
  const sortedMentions = [...mentions].sort((a, b) => (a.start_index || 0) - (b.start_index || 0));

  for (const mention of sortedMentions) {
    const startIndex = mention.start_index || 0;
    const endIndex = mention.end_index || startIndex;

    // Add text before the mention
    if (startIndex > lastIndex) {
      const textBefore = content.slice(lastIndex, startIndex);
      if (textBefore) {
        segments.push({ type: 'text', content: textBefore });
      }
    }

    // Add the mention
    const mentionText = content.slice(startIndex, endIndex);
    if (mentionText) {
      segments.push({ 
        type: 'mention', 
        content: mentionText,
        mention: {
          user_id: mention.user_id || '',
          username: mention.username || '',
          display_name: mention.display_name || mention.username || '',
          start_index: startIndex,
          end_index: endIndex
        }
      });
    }

    lastIndex = endIndex;
  }

  // Add remaining text after the last mention
  if (lastIndex < content.length) {
    const textAfter = content.slice(lastIndex);
    if (textAfter) {
      segments.push({ type: 'text', content: textAfter });
    }
  }

  return { segments };
};