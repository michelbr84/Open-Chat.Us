import { MentionSuggestions } from '@/components/MentionSuggestions';

interface MentionOverlayProps {
  suggestions: Array<{ id: string; name: string; isMember: boolean; displayName: string }>;
  selectedIndex: number;
  onSelect: (user: { name: string; id: string }) => void;
  onHover: (index: number) => void;
  position: { top: number; left: number };
  visible: boolean;
}

export const MentionOverlay = ({
  suggestions,
  selectedIndex,
  onSelect,
  onHover,
  position,
  visible,
}: MentionOverlayProps) => {
  return (
    <MentionSuggestions
      suggestions={suggestions}
      selectedIndex={selectedIndex}
      onSelect={onSelect}
      onHover={onHover}
      position={position}
      visible={visible && suggestions.length > 0}
    />
  );
};
