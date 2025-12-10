import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Star } from 'lucide-react';
import { LeaderboardEntry } from '@/hooks/useLeaderboard';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
  showDetailed?: boolean;
}

export const LeaderboardCard = ({ 
  entry, 
  isCurrentUser = false,
  showDetailed = false 
}: LeaderboardCardProps) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-600" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">#{rank}</span>;
    }
  };

  const getLevelColor = (levelName: string) => {
    switch (levelName) {
      case 'Newcomer': return 'text-slate-600 border-slate-300';
      case 'Regular': return 'text-green-600 border-green-300';
      case 'Contributor': return 'text-blue-600 border-blue-300';
      case 'Veteran': return 'text-purple-600 border-purple-300';
      case 'Expert': return 'text-orange-600 border-orange-300';
      case 'Master': return 'text-red-600 border-red-300';
      case 'Legend': return 'text-yellow-600 border-yellow-300';
      default: return 'text-slate-600 border-slate-300';
    }
  };

  const displayName = entry.username || 'Anonymous';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      isCurrentUser ? 'ring-2 ring-primary' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className="flex-shrink-0">
            {getRankIcon(entry.rank)}
          </div>

          {/* Avatar */}
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={entry.avatar_url} alt={displayName} />
            <AvatarFallback>
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">
                {displayName}
                {isCurrentUser && (
                  <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                )}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${getLevelColor(entry.levelName)}`}>
                <Star className="w-3 h-3 mr-1" />
                {entry.levelName}
              </Badge>
              
              {showDetailed && (
                <Badge variant="secondary" className="text-xs">
                  {entry.achievements_count} achievements
                </Badge>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold">{entry.total_points}</div>
            <div className="text-xs text-muted-foreground">points</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
