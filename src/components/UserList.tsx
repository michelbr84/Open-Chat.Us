import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Pencil, Check, X, Users, Crown, Shield, User } from 'lucide-react';
import { sanitizeGuestName } from '@/utils/sanitization';
import { useToast } from '@/hooks/use-toast';

interface OnlineUser {
  name: string;
  isMember: boolean;
  key: string;
}

interface UserListProps {
  users: OnlineUser[];
  guestName: string;
  onUserClick: (name: string, isMember: boolean, key: string) => void;
  onGuestNameChange: (newName: string) => void;
  onMentionUser: (username: string) => void;
}

export const UserList = ({ users, guestName, onUserClick, onGuestNameChange, onMentionUser }: UserListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(guestName);

  const handleSaveName = () => {
    const validation = sanitizeGuestName(tempName);
    
    if (!validation.valid) {
      toast({
        title: "Invalid name",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    onGuestNameChange(validation.sanitized);
    setEditingName(false);
    toast({
      title: "Name updated",
      description: "Your display name has been updated successfully.",
    });
  };

  const handleCancelEdit = () => {
    setTempName(guestName);
    setEditingName(false);
  };

  const getUserIcon = (userName: string, isMember: boolean, isCurrentUser: boolean) => {
    if (isMember) {
      return <Crown className="w-3 h-3 text-warning" />;
    }
    if (isCurrentUser) {
      return <User className="w-3 h-3 text-primary" />;
    }
    return <User className="w-3 h-3 text-muted-foreground" />;
  };

  const getUserBadge = (userName: string, isMember: boolean, isCurrentUser: boolean) => {
    if (isMember) {
      return <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-warning/10 text-warning border-warning/20">Premium</Badge>;
    }
    if (isCurrentUser) {
      return <Badge variant="outline" className="text-xs px-1.5 py-0.5">You</Badge>;
    }
    return <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-muted/50">Guest</Badge>;
  };

  return (
    <aside className="w-full md:w-64 chat-sidebar border-r border-border flex flex-col h-full">
      <div className="p-3 md:p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Online Users</h3>
          <Badge variant="outline" className="text-xs">{users.length}</Badge>
        </div>
        
        {/* Guest name editor with enhanced security */}
        {!user && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground font-medium">Your Name:</div>
            {editingName ? (
              <div className="space-y-2">
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="h-8 text-sm"
                  placeholder="Enter your name"
                  maxLength={20}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={handleSaveName}
                    className="h-6 px-2 text-xs"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  3-20 characters, letters/numbers only
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <User className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{guestName}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingName(true)}
                  className="h-6 w-6 p-0 hover:bg-accent"
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced user list with security indicators */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {users.map(({ name, isMember, key }) => {
            const isCurrentUser = !user ? name === guestName : user?.user_metadata?.name === name || user?.email === name;
            
            return (
              <div
                key={key}
                className={`
                  flex items-center gap-2 p-2 rounded-md transition-colors cursor-pointer group
                  ${isCurrentUser 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-accent/50'
                  }
                  ${!isCurrentUser ? 'hover:bg-accent' : ''}
                `}
                onClick={() => !isCurrentUser && onMentionUser(name)}
              >
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {getUserIcon(name, isMember, isCurrentUser)}
                  <span 
                    className={`text-sm truncate ${
                      isCurrentUser ? 'font-medium text-primary' : ''
                    }`}
                    title={name}
                  >
                    {isCurrentUser ? 'You' : name}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  {getUserBadge(name, isMember, isCurrentUser)}
                  {isMember && (
                    <div className="w-2 h-2 bg-warning rounded-full" title="Premium Member" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security notice */}
      <div className="p-3 border-t border-border bg-muted/30">
        <div className="text-xs text-muted-foreground text-center">
          <Shield className="w-3 h-3 inline mr-1" />
          Secure Guest Session
        </div>
      </div>
    </aside>
  );
};