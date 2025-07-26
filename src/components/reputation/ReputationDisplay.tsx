import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Award } from 'lucide-react';
import { UserReputation } from '@/hooks/useReputation';

interface ReputationDisplayProps {
  reputation: UserReputation;
  className?: string;
  compact?: boolean;
}

export const ReputationDisplay = ({ 
  reputation, 
  className = "",
  compact = false 
}: ReputationDisplayProps) => {
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

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="outline" className={getLevelColor(reputation.levelName)}>
          <Star className="w-3 h-3 mr-1" />
          {reputation.levelName}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {reputation.reputation_score} pts
        </span>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          Reputation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level & Points */}
        <div className="text-center space-y-2">
          <Badge 
            variant="outline" 
            className={`text-lg px-4 py-2 ${getLevelColor(reputation.levelName)}`}
          >
            <Award className="w-4 h-4 mr-2" />
            {reputation.levelName}
          </Badge>
          <div className="text-2xl font-bold">{reputation.reputation_score}</div>
          <div className="text-sm text-muted-foreground">reputation points</div>
        </div>

        {/* Progress to Next Level */}
        {reputation.pointsToNextLevel > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress to next level</span>
              <span className="text-muted-foreground">
                {reputation.pointsToNextLevel} points needed
              </span>
            </div>
            <Progress 
              value={100 - (reputation.pointsToNextLevel / (reputation.pointsToNextLevel + 100)) * 100} 
              className="h-2"
            />
          </div>
        )}

        {/* Level Info */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold">#{reputation.rank || '?'}</div>
            <div className="text-xs text-muted-foreground">Rank</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">Lv. {reputation.level}</div>
            <div className="text-xs text-muted-foreground">Level</div>
          </div>
        </div>

        {/* Recent Activity Indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          Keep participating to earn more points!
        </div>
      </CardContent>
    </Card>
  );
};