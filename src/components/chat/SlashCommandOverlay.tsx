import { SlashCommandSuggestions } from '@/components/SlashCommandSuggestions';

interface SlashCommandOverlayProps {
  suggestions: Array<{ name: string; description: string; usage: string }>;
  onSelect: (command: string) => void;
  isVisible: boolean;
}

export const SlashCommandOverlay = ({
  suggestions,
  onSelect,
  isVisible,
}: SlashCommandOverlayProps) => {
  return (
    <SlashCommandSuggestions
      suggestions={suggestions}
      onSelect={onSelect}
      isVisible={isVisible}
    />
  );
};
