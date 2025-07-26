import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLeaderboard, LeaderboardFilters } from '@/hooks/useLeaderboard';
import { LeaderboardCard } from '@/components/leaderboard/LeaderboardCard';

export const Leaderboard = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<LeaderboardFilters>({
    timeframe: 'all',
    category: 'reputation',
    limit: 50
  });

  const { leaderboard, loading, userRank } = useLeaderboard(filters);

  const handleTimeframeChange = (timeframe: 'all' | 'week' | 'month') => {
    setFilters(prev => ({ ...prev, timeframe }));
  };

  const handleCategoryChange = (category: 'reputation' | 'achievements' | 'messages') => {
    setFilters(prev => ({ ...prev, category }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-muted rounded" />
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                  <div className="w-16 h-8 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
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
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Top community members ranked by reputation and achievements
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <Select value={filters.timeframe} onValueChange={handleTimeframeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <Select value={filters.category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reputation">Reputation</SelectItem>
                  <SelectItem value="achievements">Achievements</SelectItem>
                  <SelectItem value="messages">Messages</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {user && userRank && (
              <Badge variant="secondary" className="ml-auto">
                <Users className="w-3 h-3 mr-1" />
                Your Rank: #{userRank}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🏆 Top 3 Champions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 2nd Place */}
              <div className="order-1 md:order-1">
                <div className="text-center mb-2">
                  <div className="text-4xl">🥈</div>
                  <div className="text-sm font-medium">2nd Place</div>
                </div>
                <LeaderboardCard 
                  entry={leaderboard[1]} 
                  isCurrentUser={user?.id === leaderboard[1]?.id}
                  showDetailed 
                />
              </div>

              {/* 1st Place */}
              <div className="order-0 md:order-2">
                <div className="text-center mb-2">
                  <div className="text-5xl">👑</div>
                  <div className="text-sm font-medium">Champion</div>
                </div>
                <LeaderboardCard 
                  entry={leaderboard[0]} 
                  isCurrentUser={user?.id === leaderboard[0]?.id}
                  showDetailed 
                />
              </div>

              {/* 3rd Place */}
              <div className="order-2 md:order-3">
                <div className="text-center mb-2">
                  <div className="text-4xl">🥉</div>
                  <div className="text-sm font-medium">3rd Place</div>
                </div>
                <LeaderboardCard 
                  entry={leaderboard[2]} 
                  isCurrentUser={user?.id === leaderboard[2]?.id}
                  showDetailed 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Full Rankings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {leaderboard.map((entry) => (
            <LeaderboardCard
              key={entry.id}
              entry={entry}
              isCurrentUser={user?.id === entry.id}
              showDetailed
            />
          ))}
          
          {leaderboard.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No rankings available yet.</p>
              <p className="text-sm">Start participating to appear on the leaderboard!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};