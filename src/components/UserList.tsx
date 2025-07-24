import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Pencil, Check, X, Users } from 'lucide-react';

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
}

export const UserList = ({ users, guestName, onUserClick, onGuestNameChange }: UserListProps) => {
  const { user } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(guestName);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onGuestNameChange(tempName.trim());
      setEditingName(false);
    }
  };

  const handleCancelEdit = () => {
    setTempName(guestName);
    setEditingName(false);
  };

  return (
    <aside className="w-full md:w-64 chat-sidebar border-r border-border flex flex-col h-full">
      <div className="p-3 md:p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4" />
          <h3 className="font-semibold text-sm">
            Online Users ({users.length})
          </h3>
        </div>
        
        {/* Guest name editor */}
        {!user && (
          <div className="space-y-2">
            {editingName ? (
              <div className="flex items-center gap-1">
                 <Input
                   value={tempName}
                   onChange={(e) => setTempName(e.target.value)}
                   className="h-8 md:h-7 text-sm md:text-xs"
                   placeholder="Your nickname"
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') handleSaveName();
                     if (e.key === 'Escape') handleCancelEdit();
                   }}
                 />
                 <Button size="sm" variant="ghost" onClick={handleSaveName} className="h-8 w-8 md:h-7 md:w-7 p-0">
                   <Check className="w-4 h-4 md:w-3 md:h-3" />
                 </Button>
                 <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8 md:h-7 md:w-7 p-0">
                   <X className="w-4 h-4 md:w-3 md:h-3" />
                 </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">You:</span>
                <span className="font-medium user-guest">{guestName}</span>
                 <Button
                   size="sm"
                   variant="ghost"
                   onClick={() => setEditingName(true)}
                   className="h-6 w-6 md:h-5 md:w-5 p-0"
                 >
                   <Pencil className="w-3 h-3" />
                 </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-1 p-2">
          {users.map(({ name, isMember, key }) => {
            const isCurrentUser = !user ? name === guestName : user?.user_metadata?.name === name || user?.email === name;
            
            return (
              <li
                key={key}
                className={`
                  px-3 py-3 md:py-2 rounded-md cursor-pointer text-sm md:text-sm transition-colors
                  hover:bg-muted/50 active:bg-muted
                  ${isCurrentUser ? 'font-semibold bg-muted' : ''}
                `}
                onClick={() => !isCurrentUser && onUserClick(name, isMember, key)}
              >
                <div className="flex items-center justify-between">
                  <span className={isMember ? 'user-member' : 'user-guest'}>
                    {isCurrentUser ? 'You' : name}
                  </span>
                  <div className="flex items-center gap-1">
                    {!isMember && (
                      <span className="text-xs text-muted-foreground">(guest)</span>
                    )}
                    <div className="w-2 h-2 rounded-full user-online bg-current"></div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};