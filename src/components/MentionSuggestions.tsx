import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, User } from 'lucide-react';

interface MentionUser {
  id: string;
  name: string;
  isMember: boolean;
  displayName: string;
}

interface MentionSuggestionsProps {
  suggestions: MentionUser[];
  selectedIndex: number;
  onSelect: (user: MentionUser) => void;
  onHover: (index: number) => void;
  position?: { top: number; left: number };
  visible: boolean;
}

export const MentionSuggestions = ({
  suggestions,
  selectedIndex,
  onSelect,
  onHover,
  position = { top: 0, left: 0 },
  visible
}: MentionSuggestionsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && containerRef.current && selectedIndex >= 0) {
      const selectedElement = containerRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex, visible]);

  if (!visible || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="absolute z-50 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto min-w-[200px]"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateY(-100%)'
      }}
    >
      {suggestions.map((user, index) => (
        <div
          key={user.id}
          className={`
            flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors
            ${index === selectedIndex 
              ? 'bg-accent text-accent-foreground' 
              : 'hover:bg-accent/50'
            }
            ${index === 0 ? 'rounded-t-lg' : ''}
            ${index === suggestions.length - 1 ? 'rounded-b-lg' : ''}
          `}
          onClick={() => onSelect(user)}
          onMouseEnter={() => onHover(index)}
          role="button"
          tabIndex={-1}
        >
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {user.isMember ? (
              <Crown className="w-3 h-3 text-warning flex-shrink-0" />
            ) : (
              <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-sm font-medium truncate">{user.displayName}</span>
          </div>
          
          <div className="flex items-center gap-1">
            {user.isMember ? (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-warning/10 text-warning border-warning/20">
                Premium
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-muted/50">
                Guest
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};