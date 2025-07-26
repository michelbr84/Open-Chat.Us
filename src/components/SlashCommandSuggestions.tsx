import React from 'react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';

interface SlashCommandSuggestion {
  name: string;
  description: string;
  usage: string;
}

interface SlashCommandSuggestionsProps {
  suggestions: SlashCommandSuggestion[];
  onSelect: (command: string) => void;
  isVisible: boolean;
}

export const SlashCommandSuggestions: React.FC<SlashCommandSuggestionsProps> = ({
  suggestions,
  onSelect,
  isVisible,
}) => {
  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 z-50">
      <div className="bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-hidden">
        <Command>
          <CommandList>
            <CommandEmpty>No commands found.</CommandEmpty>
            <CommandGroup>
              {suggestions.map((suggestion, index) => (
                <CommandItem
                  key={suggestion.name}
                  onSelect={() => onSelect(suggestion.name)}
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-mono text-primary font-medium">
                      {suggestion.name}
                    </span>
                    <span className="text-xs text-muted-foreground flex-1">
                      {suggestion.description}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono opacity-75">
                    {suggestion.usage}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </div>
  );
};