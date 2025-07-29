import React from 'react';
import { parseMarkdown, MarkdownSegment } from '@/utils/markdownFormatter';
import { parseEmojiShortcodes } from '@/utils/emojiSystem';
import { formatMessageWithMentions, isUserMentioned } from '@/utils/mentionParser';
import { renderLinksInText } from '@/utils/sanitization';
import { useAuth } from '@/hooks/useAuth';

interface MessageRendererProps {
  content: string;
  mentions?: any[];
  className?: string;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ 
  content, 
  mentions = [], 
  className = '' 
}) => {
  const { user } = useAuth();

  // Step 0: Handle JSON content from bot responses
  let processedContent = content;
  try {
    // Check if content is a JSON string (common with bot responses)
    if (content.startsWith('{') && content.endsWith('}')) {
      const parsed = JSON.parse(content);
      if (parsed.content) {
        processedContent = parsed.content;
      } else if (parsed.message) {
        processedContent = parsed.message;
      } else if (parsed.text) {
        processedContent = parsed.text;
      }
    }
  } catch (e) {
    // If it's not valid JSON, use the original content
    processedContent = content;
  }

  // Step 1: Parse emoji shortcodes first
  const { content: emojiProcessedContent } = parseEmojiShortcodes(processedContent);
  
  // Step 2: Format mentions
  const { segments: mentionSegments } = formatMessageWithMentions(emojiProcessedContent, mentions);
  
  // Step 3: Process each segment for markdown and render
  const renderSegment = (segment: any, index: number) => {
    if (segment.type === 'mention') {
      const isCurrentUser = user && (
        segment.mention?.user_id === user.id || 
        segment.mention?.username === user.user_metadata?.name ||
        segment.mention?.username === user.email
      );
      
      return (
        <span
          key={`mention-${index}`}
          className={`
            inline-block px-1.5 py-0.5 mx-0.5 rounded text-sm font-medium
            ${isCurrentUser 
              ? 'bg-primary/20 text-primary border border-primary/30' 
              : 'bg-accent text-accent-foreground border border-border'
            }
            hover:bg-opacity-80 transition-colors cursor-pointer
          `}
          title={`Mentioned user: ${segment.mention?.display_name || segment.content}`}
          onClick={() => {
            console.log('Clicked mention:', segment.mention);
          }}
        >
          {segment.content}
        </span>
      );
    }
    
    // Process regular text for markdown
    const markdownSegments = parseMarkdown(segment.content);
    
    return (
      <span key={`text-${index}`}>
        {markdownSegments.map((mdSegment, mdIndex) => 
          renderMarkdownSegment(mdSegment, `${index}-${mdIndex}`)
        )}
      </span>
    );
  };

  const renderMarkdownSegment = (segment: MarkdownSegment, key: string) => {
    switch (segment.type) {
      case 'bold':
        return <strong key={key} className="font-bold">{segment.content}</strong>;
        
      case 'italic':
        return <em key={key} className="italic">{segment.content}</em>;
        
      case 'underline':
        return <u key={key} className="underline">{segment.content}</u>;
        
      case 'strikethrough':
        return <s key={key} className="line-through opacity-75">{segment.content}</s>;
        
      case 'inline-code':
        return (
          <code key={key} className="px-1.5 py-0.5 mx-0.5 bg-muted text-muted-foreground rounded text-sm font-mono">
            {segment.content}
          </code>
        );
        
      case 'code-block':
        return (
          <div key={key} className="my-2 p-3 bg-muted rounded-lg border">
            {segment.language && (
              <div className="text-xs text-muted-foreground mb-2 font-mono opacity-75">
                {segment.language}
              </div>
            )}
            <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
              <code>{segment.content}</code>
            </pre>
          </div>
        );
        
      case 'blockquote':
        return (
          <div key={key} className="my-2 pl-3 border-l-4 border-primary/30 bg-primary/5 py-2 pr-3 rounded-r">
            <div className="text-sm italic text-muted-foreground">
              {segment.content}
            </div>
          </div>
        );
        
      case 'link':
        return (
          <a 
            key={key}
            href={segment.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
          >
            {segment.content}
          </a>
        );
        
      case 'list-item':
        return (
          <div key={key} className="flex items-start gap-2 my-1">
            <span className="text-primary mt-1.5 text-xs">•</span>
            <span className="flex-1">{segment.content}</span>
          </div>
        );
        
      default:
        // Regular text with link detection
        return (
          <span 
            key={key}
            dangerouslySetInnerHTML={{ 
              __html: renderLinksInText(segment.content) 
            }}
          />
        );
    }
  };

  return (
    <div className={`text-sm leading-relaxed break-words ${className}`}>
      {mentionSegments.map((segment, index) => renderSegment(segment, index))}
    </div>
  );
};