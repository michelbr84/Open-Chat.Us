import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Users, 
  Flag, 
  AlertTriangle, 
  Activity, 
  MessageSquare,
  Clock,
  TrendingUp,
  Settings
} from 'lucide-react';
import { ModerationOverview } from '@/components/admin/ModerationOverview';
import { UserManagement } from '@/components/admin/UserManagement';
import { ModerationQueue } from '@/components/admin/ModerationQueue';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { ActionHistory } from '@/components/admin/ActionHistory';
import { EnhancedModerationQueue } from '@/components/admin/EnhancedModerationQueue';
import { ContentFilterManager } from '@/components/admin/ContentFilterManager';
import { EnhancedUserManagement } from '@/components/admin/EnhancedUserManagement';

export const AdminDashboard = () => {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">OpenChat Moderation Center</p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              <Shield className="h-3 w-3 mr-1" />
              Administrator
            </Badge>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="enhanced-queue" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Enhanced Queue
            </TabsTrigger>
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Legacy Queue
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Content Filters
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Action History
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ModerationOverview />
          </TabsContent>

          <TabsContent value="enhanced-queue" className="space-y-6">
            <EnhancedModerationQueue />
          </TabsContent>

          <TabsContent value="queue" className="space-y-6">
            <ModerationQueue />
          </TabsContent>

          <TabsContent value="filters" className="space-y-6">
            <ContentFilterManager />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <EnhancedUserManagement />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <ActionHistory />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};