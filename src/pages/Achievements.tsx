import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trophy, Search, Filter, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAchievements } from '@/hooks/useAchievements';
import { useReputation } from '@/hooks/useReputation';
import { AchievementCard } from '@/components/achievements/AchievementCard';
import { AchievementProgress } from '@/components/achievements/AchievementProgress';
import { ReputationDisplay } from '@/components/reputation/ReputationDisplay';

export const Achievements = () => {
  const { user } = useAuth();
  const { 
    achievements, 
    userAchievements, 
    loading, 
    getAchievementsByCategory,
    hasAchievement,
    getAchievementProgress,
    getTotalAchievementPoints
  } = useAchievements();
  const { reputation } = useReputation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  // Get unique categories
  const categories = ['all', ...new Set(achievements.map(a => a.category))];
  
  // Filter achievements
  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesFilter = !showUnlockedOnly || hasAchievement(achievement.achievement_code);
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

  // Get progress data
  const progressData = getAchievementProgress();
  const totalUnlocked = userAchievements.length;
  const totalAchievements = achievements.length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-muted rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-4">
            <Card className="animate-pulse">
              <CardContent className="p-4 space-y-4">
                <div className="h-20 bg-muted rounded" />
                <div className="h-32 bg-muted rounded" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8 text-primary" />
          Achievements
        </h1>
        <p className="text-muted-foreground">
          Track your progress and unlock rewards
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <Input
                  placeholder="Search achievements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Filter className="w-4 h-4 mt-1" />
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showUnlockedOnly}
                    onChange={(e) => setShowUnlockedOnly(e.target.checked)}
                    className="rounded"
                  />
                  Show unlocked only
                </label>
                
                <Badge variant="secondary">
                  {filteredAchievements.length} achievement{filteredAchievements.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Grid */}
          <div className="space-y-3">
            {filteredAchievements.map(achievement => {
              const userAchievement = userAchievements.find(ua => ua.achievement_code === achievement.achievement_code);
              return (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={!!userAchievement}
                  unlockedAt={userAchievement?.unlocked_at}
                />
              );
            })}
            
            {filteredAchievements.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No achievements found.</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filters.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reputation Display */}
          {user && <ReputationDisplay reputation={reputation} />}
          
          {/* Achievement Progress */}
          <AchievementProgress
            progress={progressData}
            totalUnlocked={totalUnlocked}
            totalAchievements={totalAchievements}
          />

          {/* Achievement Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{totalUnlocked}</div>
                  <div className="text-xs text-muted-foreground">Unlocked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{getTotalAchievementPoints()}</div>
                  <div className="text-xs text-muted-foreground">Points Earned</div>
                </div>
              </div>
              
              <div className="text-center pt-2 border-t">
                <div className="text-lg font-bold">
                  {totalAchievements > 0 ? ((totalUnlocked / totalAchievements) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-xs text-muted-foreground">Completion Rate</div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          {userAchievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Unlocks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {userAchievements.slice(0, 3).map(achievement => (
                  <div key={achievement.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Trophy className="w-4 h-4 text-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {achievement.achievement_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(achievement.unlocked_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      +{achievement.points_awarded}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};