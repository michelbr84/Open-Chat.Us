import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Edit, 
  Trash2, 
  TestTube, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ContentFilter {
  id: string;
  filter_name: string;
  filter_pattern: string;
  filter_type: string;
  severity_level: number;
  action_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const ContentFilterManager: React.FC = () => {
  const [filters, setFilters] = useState<ContentFilter[]>([]);
  const [editingFilter, setEditingFilter] = useState<ContentFilter | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [testText, setTestText] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    filter_name: '',
    filter_pattern: '',
    filter_type: 'keyword',
    severity_level: 1,
    action_type: 'flag',
    is_active: true
  });

  const { toast } = useToast();

  const loadFilters = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_filters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFilters((data || []) as unknown as ContentFilter[]);
    } catch (error) {
      console.error('Error loading filters:', error);
      toast({
        title: 'Error',
        description: 'Failed to load content filters',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  const resetForm = () => {
    setFormData({
      filter_name: '',
      filter_pattern: '',
      filter_type: 'keyword',
      severity_level: 1,
      action_type: 'flag',
      is_active: true
    });
    setEditingFilter(null);
    setIsCreating(false);
  };

  const handleSave = async () => {
    try {
      if (editingFilter) {
        // Update existing filter
        const { error } = await supabase
          .from('content_filters')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingFilter.id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Filter updated successfully',
        });
      } else {
        // Create new filter
        const { error } = await supabase
          .from('content_filters')
          .insert([formData] as any);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Filter created successfully',
        });
      }
      
      resetForm();
      await loadFilters();
    } catch (error) {
      console.error('Error saving filter:', error);
      toast({
        title: 'Error',
        description: 'Failed to save filter',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (filter: ContentFilter) => {
    setFormData({
      filter_name: filter.filter_name,
      filter_pattern: filter.filter_pattern,
      filter_type: filter.filter_type,
      severity_level: filter.severity_level,
      action_type: filter.action_type,
      is_active: filter.is_active
    });
    setEditingFilter(filter);
    setIsCreating(true);
  };

  const handleDelete = async (filterId: string) => {
    if (!confirm('Are you sure you want to delete this filter?')) return;
    
    try {
      const { error } = await supabase
        .from('content_filters')
        .delete()
        .eq('id', filterId);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Filter deleted successfully',
      });
      
      await loadFilters();
    } catch (error) {
      console.error('Error deleting filter:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete filter',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (filterId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('content_filters')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', filterId);

      if (error) throw error;
      
      await loadFilters();
    } catch (error) {
      console.error('Error toggling filter:', error);
      toast({
        title: 'Error',
        description: 'Failed to update filter status',
        variant: 'destructive',
      });
    }
  };

  const testFilters = () => {
    if (!testText.trim()) return;
    
    const results = filters
      .filter(f => f.is_active)
      .map(filter => {
        let matches = false;
        
        try {
          switch (filter.filter_type) {
            case 'regex':
              matches = new RegExp(filter.filter_pattern, 'i').test(testText);
              break;
            case 'keyword':
              matches = testText.toLowerCase().includes(filter.filter_pattern.toLowerCase());
              break;
            case 'phrase':
              matches = testText.toLowerCase() === filter.filter_pattern.toLowerCase();
              break;
          }
        } catch (error) {
          console.error('Error testing filter:', error);
        }
        
        return {
          filter,
          matches
        };
      })
      .filter(result => result.matches);
    
    setTestResults(results);
  };

  const validateRegex = (pattern: string) => {
    if (formData.filter_type !== 'regex') return true;
    try {
      new RegExp(pattern);
      return true;
    } catch {
      return false;
    }
  };

  const getSeverityBadge = (level: number) => {
    const colors = {
      1: 'bg-blue-500',
      2: 'bg-yellow-500',
      3: 'bg-orange-500',
      4: 'bg-red-500',
      5: 'bg-red-700'
    };
    return (
      <Badge className={`${colors[level as keyof typeof colors]} text-white`}>
        Level {level}
      </Badge>
    );
  };

  const getActionBadge = (action: string) => {
    const config = {
      flag: { color: 'bg-blue-500', icon: AlertTriangle },
      warn: { color: 'bg-yellow-500', icon: AlertTriangle },
      auto_remove: { color: 'bg-red-500', icon: XCircle }
    };
    const { color, icon: Icon } = config[action as keyof typeof config] || config.flag;
    
    return (
      <Badge className={`${color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {action.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Content Filter Management
          </CardTitle>
          <CardDescription>
            Create and manage automated content filters with regex validation and testing tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Filter List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Active Filters ({filters.length})</CardTitle>
                <Button 
                  onClick={() => setIsCreating(true)}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Filter
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : filters.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No content filters configured
                      </div>
                    ) : (
                      filters.map((filter) => (
                        <Card key={filter.id} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{filter.filter_name}</h4>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={filter.is_active}
                                onCheckedChange={(checked) => handleToggleActive(filter.id, checked)}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(filter)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(filter.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{filter.filter_type}</Badge>
                              {getSeverityBadge(filter.severity_level)}
                              {getActionBadge(filter.action_type)}
                            </div>
                            
                            <p className="text-sm font-mono bg-muted p-2 rounded">
                              {filter.filter_pattern}
                            </p>
                            
                            <p className="text-xs text-muted-foreground">
                              Created {format(new Date(filter.created_at), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Filter Form or Test Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isCreating ? (editingFilter ? 'Edit Filter' : 'Create Filter') : 'Test Filters'}
                </CardTitle>
                {isCreating && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isCreating ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="filter-name">Filter Name</Label>
                      <Input
                        id="filter-name"
                        value={formData.filter_name}
                        onChange={(e) => setFormData({ ...formData, filter_name: e.target.value })}
                        placeholder="e.g., Spam Detection"
                      />
                    </div>

                    <div>
                      <Label htmlFor="filter-type">Filter Type</Label>
                      <Select 
                        value={formData.filter_type} 
                        onValueChange={(value) => setFormData({ ...formData, filter_type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="keyword">Keyword Match</SelectItem>
                          <SelectItem value="phrase">Exact Phrase</SelectItem>
                          <SelectItem value="regex">Regular Expression</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="filter-pattern">
                        Pattern
                        {formData.filter_type === 'regex' && 
                          !validateRegex(formData.filter_pattern) && 
                          formData.filter_pattern && (
                            <span className="text-red-500 ml-2">Invalid regex</span>
                          )
                        }
                      </Label>
                      <Textarea
                        id="filter-pattern"
                        value={formData.filter_pattern}
                        onChange={(e) => setFormData({ ...formData, filter_pattern: e.target.value })}
                        placeholder={
                          formData.filter_type === 'regex' 
                            ? 'e.g., \\b(spam|scam)\\b'
                            : formData.filter_type === 'keyword'
                            ? 'e.g., spam'
                            : 'e.g., this is spam'
                        }
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="severity">Severity Level</Label>
                        <Select 
                          value={formData.severity_level.toString()} 
                          onValueChange={(value) => setFormData({ ...formData, severity_level: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Low</SelectItem>
                            <SelectItem value="2">2 - Medium</SelectItem>
                            <SelectItem value="3">3 - High</SelectItem>
                            <SelectItem value="4">4 - Critical</SelectItem>
                            <SelectItem value="5">5 - Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="action">Action Type</Label>
                        <Select 
                          value={formData.action_type} 
                          onValueChange={(value) => setFormData({ ...formData, action_type: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flag">Flag for Review</SelectItem>
                            <SelectItem value="warn">Warn User</SelectItem>
                            <SelectItem value="auto_remove">Auto Remove</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is-active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is-active">Active</Label>
                    </div>

                    <Button 
                      onClick={handleSave}
                      disabled={!formData.filter_name || !formData.filter_pattern || !validateRegex(formData.filter_pattern)}
                      className="w-full"
                    >
                      {editingFilter ? 'Update Filter' : 'Create Filter'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="test-text">Test Content</Label>
                      <Textarea
                        id="test-text"
                        value={testText}
                        onChange={(e) => setTestText(e.target.value)}
                        placeholder="Enter text to test against all active filters..."
                        rows={4}
                      />
                    </div>

                    <Button 
                      onClick={testFilters}
                      disabled={!testText.trim()}
                      className="flex items-center gap-2"
                    >
                      <TestTube className="h-4 w-4" />
                      Test Filters
                    </Button>

                    {testResults.length > 0 && (
                      <div className="space-y-3">
                        <Separator />
                        <h4 className="font-medium">Test Results</h4>
                        {testResults.map(({ filter }) => (
                          <div key={filter.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-red-800">{filter.filter_name}</span>
                              <div className="flex items-center gap-2">
                                {getSeverityBadge(filter.severity_level)}
                                {getActionBadge(filter.action_type)}
                              </div>
                            </div>
                            <p className="text-sm text-red-600">
                              Triggered by pattern: <code>{filter.filter_pattern}</code>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {testText && testResults.length === 0 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="h-4 w-4" />
                          <span>No filters triggered - content appears clean</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};