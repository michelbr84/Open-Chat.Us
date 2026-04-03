import { useState, useCallback } from 'react';
import logger from '@/utils/logger';
import { useToast } from '@/hooks/use-toast';

export interface SlashCommand {
  name: string;
  description: string;
  usage: string;
  handler: (args: string[]) => Promise<string | null>;
}

export const useSlashCommands = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Available slash commands
  const commands: SlashCommand[] = [
    {
      name: 'help',
      description: 'Show available slash commands',
      usage: '/help [command]',
      handler: async (args: string[]) => {
        if (args.length > 0) {
          const command = commands.find(cmd => cmd.name === args[0]);
          if (command) {
            return `**${command.name}**: ${command.description}\nUsage: \`${command.usage}\``;
          }
          return `Command "${args[0]}" not found. Use \`/help\` to see all commands.`;
        }
        
        const helpText = commands
          .map(cmd => `**/${cmd.name}** - ${cmd.description}`)
          .join('\n');
        
        return `**Available Commands:**\n${helpText}\n\nUse \`/help [command]\` for detailed usage.`;
      },
    },
    {
      name: 'shrug',
      description: 'Add a shrug emoticon',
      usage: '/shrug [text]',
      handler: async (args: string[]) => {
        const text = args.join(' ');
        return text ? `${text} ¯\\_(ツ)_/¯` : '¯\\_(ツ)_/¯';
      },
    },
    {
      name: 'flip',
      description: 'Flip text upside down',
      usage: '/flip <text>',
      handler: async (args: string[]) => {
        if (args.length === 0) {
          return 'Usage: `/flip <text>` - Please provide text to flip.';
        }
        
        const flipMap: { [key: string]: string } = {
          'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ',
          'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd',
          'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x',
          'y': 'ʎ', 'z': 'z', '?': '¿', '!': '¡', '.': '˙', ',': "'", ' ': ' '
        };
        
        const text = args.join(' ').toLowerCase();
        const flipped = text.split('').map(char => flipMap[char] || char).reverse().join('');
        return `(╯°□°）╯︵ ${flipped}`;
      },
    },
    {
      name: 'roll',
      description: 'Roll dice',
      usage: '/roll [XdY] (default: 1d6)',
      handler: async (args: string[]) => {
        const dicePattern = /^(\d+)?d(\d+)$/i;
        const input = args[0] || '1d6';
        const match = input.match(dicePattern);
        
        if (!match) {
          return 'Usage: `/roll [XdY]` - Example: `/roll 2d6` or just `/roll` for 1d6';
        }
        
        const numDice = parseInt(match[1] || '1');
        const numSides = parseInt(match[2]);
        
        if (numDice > 10) {
          return 'Maximum 10 dice allowed.';
        }
        
        if (numSides > 100) {
          return 'Maximum 100 sides allowed.';
        }
        
        const rolls = [];
        for (let i = 0; i < numDice; i++) {
          rolls.push(Math.floor(Math.random() * numSides) + 1);
        }
        
        const total = rolls.reduce((sum, roll) => sum + roll, 0);
        const rollsText = rolls.join(', ');
        
        if (numDice === 1) {
          return `🎲 Rolled ${input}: **${total}**`;
        }
        
        return `🎲 Rolled ${input}: [${rollsText}] = **${total}**`;
      },
    },
    {
      name: 'time',
      description: 'Show current time',
      usage: '/time',
      handler: async () => {
        const now = new Date();
        return `🕐 Current time: **${now.toLocaleString()}**`;
      },
    },
  ];

  const parseSlashCommand = useCallback((input: string) => {
    if (!input.startsWith('/')) return null;
    
    const parts = input.slice(1).split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    const command = commands.find(cmd => cmd.name === commandName);
    return command ? { command, args } : null;
  }, [commands]);

  const executeSlashCommand = useCallback(async (input: string): Promise<string | null> => {
    const parsed = parseSlashCommand(input);
    if (!parsed) return null;
    
    setIsProcessing(true);
    try {
      const result = await parsed.command.handler(parsed.args);
      return result;
    } catch (error) {
      logger.error('Slash command error', { error });
      toast({
        title: 'Command Error',
        description: 'Failed to execute command. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [parseSlashCommand, toast]);

  const getSuggestions = useCallback((input: string) => {
    if (!input.startsWith('/')) return [];
    
    const commandText = input.slice(1).toLowerCase();
    return commands
      .filter(cmd => cmd.name.startsWith(commandText))
      .slice(0, 5)
      .map(cmd => ({
        name: `/${cmd.name}`,
        description: cmd.description,
        usage: cmd.usage,
      }));
  }, [commands]);

  return {
    commands,
    executeSlashCommand,
    getSuggestions,
    isProcessing,
    isSlashCommand: (input: string) => input.startsWith('/'),
  };
};