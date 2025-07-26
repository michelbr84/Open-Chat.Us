import { useState } from 'react';
import { Bell, Settings, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

export const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    preferences,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    requestNotificationPermission,
    hasPermission,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(notificationId);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return '💬';
      case 'dm':
        return '📩';
      case 'reaction':
        return '❤️';
      case 'achievement':
        return '🏆';
      case 'announcement':
        return '📢';
      default:
        return '🔔';
    }
  };

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Tabs defaultValue="notifications" className="w-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 px-2"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
              <TabsList className="grid w-auto grid-cols-2">
                <TabsTrigger value="notifications" className="text-xs">
                  <Bell className="h-3 w-3 mr-1" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">
                  <Settings className="h-3 w-3 mr-1" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="notifications" className="m-0">
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                  <p className="text-sm">You'll see new notifications here</p>
                </div>
              ) : (
                <>
                  {unreadNotifications.length > 0 && (
                    <>
                      <div className="p-3 text-sm font-medium text-muted-foreground bg-muted/50">
                        New ({unreadNotifications.length})
                      </div>
                      {unreadNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 hover:bg-muted/50 cursor-pointer border-l-4 border-l-primary bg-primary/5"
                          onClick={() => handleNotificationClick(notification.id, notification.is_read)}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-lg">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                  {notification.title}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              </div>
                              {notification.message && (
                                <p className="text-sm text-muted-foreground">
                                  {notification.message}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {readNotifications.length > 0 && (
                    <>
                      {unreadNotifications.length > 0 && <Separator />}
                      <div className="p-3 text-sm font-medium text-muted-foreground bg-muted/30">
                        Earlier
                      </div>
                      {readNotifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 hover:bg-muted/30 cursor-pointer opacity-70"
                          onClick={() => handleNotificationClick(notification.id, notification.is_read)}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-lg opacity-60">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm">{notification.title}</p>
                              {notification.message && (
                                <p className="text-sm text-muted-foreground">
                                  {notification.message}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="m-0">
            <div className="p-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3">Browser Notifications</h4>
                {!hasPermission ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Enable browser notifications to get notified even when OpenChat is not active.
                    </p>
                    <Button onClick={requestNotificationPermission} size="sm" className="w-full">
                      Enable Browser Notifications
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-green-600">✓ Browser notifications enabled</p>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mentions" className="text-sm">
                      Mentions
                    </Label>
                    <Switch
                      id="mentions"
                      checked={preferences.mentions}
                      onCheckedChange={(checked) =>
                        updatePreferences({ ...preferences, mentions: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dms" className="text-sm">
                      Direct Messages
                    </Label>
                    <Switch
                      id="dms"
                      checked={preferences.dms}
                      onCheckedChange={(checked) =>
                        updatePreferences({ ...preferences, dms: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reactions" className="text-sm">
                      Reactions
                    </Label>
                    <Switch
                      id="reactions"
                      checked={preferences.reactions}
                      onCheckedChange={(checked) =>
                        updatePreferences({ ...preferences, reactions: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="announcements" className="text-sm">
                      Announcements
                    </Label>
                    <Switch
                      id="announcements"
                      checked={preferences.announcements}
                      onCheckedChange={(checked) =>
                        updatePreferences({ ...preferences, announcements: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};