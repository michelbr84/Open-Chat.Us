import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Lock, Star } from 'lucide-react';
import { Achievement } from '@/hooks/useAchievements';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  unlockedAt?: string;
  className?: string;
}

export const AchievementCard = ({ 
  achievement, 
  isUnlocked, 
  unlockedAt,
  className = "" 
}: AchievementCardProps) => {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'social': return 'border-green-300 bg-green-50';
      case 'content': return 'border-blue-300 bg-blue-50';
      case 'moderation': return 'border-purple-300 bg-purple-50';
      case 'special': return 'border-orange-300 bg-orange-50';
      default: return 'border-slate-300 bg-slate-50';
    }
  };

  return (
    <Card className={`${className} ${getCategoryColor(achievement.category)} transition-all duration-200 hover:shadow-md ${
      isUnlocked ? 'border-2' : 'opacity-60'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-primary/10' : 'bg-muted/30'}`}>
            {isUnlocked ? (
              <Trophy className="w-6 h-6 text-primary" />
            ) : (
              <Lock className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                {achievement.name}
              </h3>
              <Star className="w-4 h-4 text-primary" />
            </div>
            
            <p className={`text-sm ${isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/70'} mb-2`}>
              {achievement.description}
            </p>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {achievement.category}
              </Badge>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  +{achievement.points} pts
                </Badge>
                {isUnlocked && unlockedAt && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
