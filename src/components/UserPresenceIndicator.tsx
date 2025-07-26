import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUserPresence } from '@/hooks/useUserPresence';

interface UserPresenceIndicatorProps {
  userId: string;
  userName?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const UserPresenceIndicator = ({ 
  userId, 
  userName, 
  size = 'sm', 
  showText = false 
}: UserPresenceIndicatorProps) => {
  const { getUserStatus } = useUserPresence();
  const userStatus = getUserStatus(userId);

  if (!userStatus) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      case 'offline':
      default:
        return 'Offline';
    }
  };

  const dotSize = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }[size];

  const StatusDot = () => (
    <div
      className={`${dotSize} rounded-full ${getStatusColor(userStatus.status)} border-2 border-background`}
    />
  );

  const statusText = getStatusText(userStatus.status);
  const customMessage = userStatus.custom_message;
  
  const tooltipContent = (
    <div className="text-center">
      <div className="font-medium">{userName || 'User'}</div>
      <div className="text-sm">{statusText}</div>
      {customMessage && (
        <div className="text-xs text-muted-foreground mt-1">
          "{customMessage}"
        </div>
      )}
    </div>
  );

  if (showText) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="flex items-center gap-1.5">
              <StatusDot />
              <span className="text-xs">{statusText}</span>
              {customMessage && (
                <span className="text-xs text-muted-foreground">
                  - {customMessage}
                </span>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative inline-block">
            <StatusDot />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};