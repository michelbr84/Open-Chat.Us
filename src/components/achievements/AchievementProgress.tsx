import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target } from 'lucide-react';

interface CategoryProgress {
  category: string;
  unlocked: number;
  total: number;
  percentage: number;
}

interface AchievementProgressProps {
  progress: CategoryProgress[];
  totalUnlocked: number;
  totalAchievements: number;
  className?: string;
}

export const AchievementProgress = ({ 
  progress, 
  totalUnlocked, 
  totalAchievements,
  className = "" 
}: AchievementProgressProps) => {
  const overallPercentage = totalAchievements > 0 ? (totalUnlocked / totalAchievements) * 100 : 0;

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'league': return '🏆';
      case 'cup': return '🏅';
      case 'financial': return '💰';
      case 'development': return '🌱';
      case 'social': return '👥';
      default: return '⭐';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Achievement Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <Badge variant="secondary">
              {totalUnlocked}/{totalAchievements}
            </Badge>
          </div>
          <Progress value={overallPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {overallPercentage.toFixed(1)}% complete
          </p>
        </div>

        {/* Category Progress */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Target className="w-4 h-4" />
            Categories
          </div>
          
          {progress.map((category) => (
            <div key={category.category} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {getCategoryIcon(category.category)} {category.category}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {category.unlocked}/{category.total}
                </Badge>
              </div>
              <Progress value={category.percentage} className="h-1.5" />
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{totalUnlocked}</div>
            <div className="text-xs text-muted-foreground">Unlocked</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-muted-foreground">
              {totalAchievements - totalUnlocked}
            </div>
            <div className="text-xs text-muted-foreground">Remaining</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};