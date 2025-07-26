import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAutoModeration } from '@/hooks/useAutoModeration';
import { 
  Settings,
  Shield, 
  Filter, 
  Plus,
  Trash2,
  Save
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ContentFilter {
  id: string;
  filter_type: string;
  pattern: string;
  is_regex: boolean;
  severity: number;
  is_active: boolean;
  created_at: string;
}

export const AdminSettings = () => {
  const [contentFilters, setContentFilters] = useState<ContentFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFilter, setNewFilter] = useState({
    type: 'profanity',
    pattern: '',
    isRegex: false,
    severity: 1
  });
  
  const { addContentFilter } = useAutoModeration();
  const { toast } = useToast();

  useEffect(() => {
    fetchContentFilters();
  }, []);

  const fetchContentFilters = async () => {
    try {
      const { data, error } = await supabase
        .from('content_filters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContentFilters(data || []);
    } catch (error) {
      console.error('Failed to fetch content filters:', error);
      toast({
        title: "Error",
        description: "Failed to load content filters.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFilter = async () => {
    if (!newFilter.pattern.trim()) {
      toast({
        title: "Missing Pattern",
        description: "Please enter a filter pattern.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addContentFilter(
        newFilter.type,
        newFilter.pattern,
        newFilter.isRegex,
        newFilter.severity
      );

      setNewFilter({
        type: 'profanity',
        pattern: '',
        isRegex: false,
        severity: 1
      });

      fetchContentFilters();
    } catch (error) {
      console.error('Failed to add filter:', error);
    }
  };

  const toggleFilterStatus = async (filterId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('content_filters')
        .update({ is_active: !currentStatus })
        .eq('id', filterId);

      if (error) throw error;

      toast({
        title: "Filter Updated",
        description: `Filter ${!currentStatus ? 'enabled' : 'disabled'} successfully.`
      });

      fetchContentFilters();
    } catch (error) {
      console.error('Failed to update filter:', error);
      toast({
        title: "Error",
        description: "Failed to update filter status.",
        variant: "destructive"
      });
    }
  };

  const deleteFilter = async (filterId: string) => {
    try {
      const { error } = await supabase
        .from('content_filters')
        .delete()
        .eq('id', filterId);

      if (error) throw error;

      toast({
        title: "Filter Deleted",
        description: "Content filter removed successfully."
      });

      fetchContentFilters();
    } catch (error) {
      console.error('Failed to delete filter:', error);
      toast({
        title: "Error",
        description: "Failed to delete filter.",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1: return 'bg-yellow-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityText = (severity: number) => {
    switch (severity) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-32 bg-muted rounded"></div>
              <div className="h-3 w-48 bg-muted rounded"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content Filters Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Content Filters
          </CardTitle>
          <CardDescription>
            Manage auto-moderation patterns and rules for content filtering
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Filter */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Filter
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Filter Type:</label>
                <Select value={newFilter.type} onValueChange={(value) => setNewFilter({...newFilter, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profanity">Profanity</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="keyword">Keyword</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Severity:</label>
                <Select 
                  value={newFilter.severity.toString()} 
                  onValueChange={(value) => setNewFilter({...newFilter, severity: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Low (Warning)</SelectItem>
                    <SelectItem value="2">Medium (Flag)</SelectItem>
                    <SelectItem value="3">High (Block)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Pattern:</label>
              <Input
                placeholder="Enter the pattern to filter..."
                value={newFilter.pattern}
                onChange={(e) => setNewFilter({...newFilter, pattern: e.target.value})}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={newFilter.isRegex}
                onCheckedChange={(checked) => setNewFilter({...newFilter, isRegex: checked})}
              />
              <label className="text-sm">Use Regular Expression</label>
            </div>

            <Button onClick={handleAddFilter} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Filter
            </Button>
          </div>

          {/* Existing Filters */}
          <div className="space-y-3">
            <h3 className="font-medium">Active Filters ({contentFilters.length})</h3>
            
            {contentFilters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No content filters configured</p>
              </div>
            ) : (
              contentFilters.map((filter) => (
                <div key={filter.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          {filter.filter_type}
                        </Badge>
                        <Badge variant="outline" className={`text-white ${getSeverityColor(filter.severity)}`}>
                          {getSeverityText(filter.severity)}
                        </Badge>
                        {filter.is_regex && (
                          <Badge variant="secondary">
                            Regex
                          </Badge>
                        )}
                        <Badge variant={filter.is_active ? 'default' : 'secondary'}>
                          {filter.is_active ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                      
                      <div className="font-mono text-sm bg-muted p-2 rounded">
                        {filter.pattern}
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-2">
                        Created: {new Date(filter.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Switch
                        checked={filter.is_active}
                        onCheckedChange={() => toggleFilterStatus(filter.id, filter.is_active)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteFilter(filter.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>
            Configure auto-moderation thresholds and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Auto-Block Threshold:
              </label>
              <Input 
                type="number" 
                placeholder="100" 
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Score threshold for automatic content blocking
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Auto-Flag Threshold:
              </label>
              <Input 
                type="number" 
                placeholder="60" 
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Score threshold for automatic content flagging
              </p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground p-3 bg-muted rounded">
            <p className="font-medium mb-1">Note:</p>
            <p>System thresholds are currently hardcoded in the auto-moderation engine. Future updates will allow dynamic configuration.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
