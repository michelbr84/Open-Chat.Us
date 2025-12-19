import { useState } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  UserPlus, 
  MoreVertical, 
  Trash2, 
  MessageSquare, 
  Search, 
  Users,
  Loader2,
  UserX
} from 'lucide-react';

interface ContactsListProps {
  onStartChat?: (userId: string, userName: string) => void;
}

export const ContactsList = ({ onStartChat }: ContactsListProps) => {
  const { user } = useAuth();
  const { contacts, isLoading, addContact, removeContact, searchUsers } = useContacts();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results = await searchUsers(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleAddContact = async (userId: string) => {
    setIsAdding(true);
    const success = await addContact(userId);
    setIsAdding(false);
    if (success) {
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  if (!user) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Login to access your contacts</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="font-semibold text-sm">Contacts</h3>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => setShowAddModal(true)}
          aria-label="Add contact"
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Loading contacts...
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <UserX className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No contacts yet</p>
            <Button 
              size="sm" 
              variant="link" 
              onClick={() => setShowAddModal(true)}
              className="mt-2"
            >
              Add your first contact
            </Button>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {contacts.map((contact) => (
              <ContactItem
                key={contact.id}
                contact={contact}
                onRemove={() => removeContact(contact.id)}
                onStartChat={() => onStartChat?.(
                  contact.contact_user_id, 
                  contact.nickname || contact.contact_profile?.display_name || contact.contact_profile?.username || 'User'
                )}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Add Contact Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add Contact
            </DialogTitle>
            <DialogDescription>
              Search for users to add to your contacts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
                aria-label="Search users"
              />
            </div>

            <div className="min-h-[200px] max-h-[300px] overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <div
                      key={result.user_id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={result.avatar_url} />
                          <AvatarFallback>
                            {(result.display_name || result.username || 'U')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {result.display_name || result.username}
                          </p>
                          {result.username && result.display_name && (
                            <p className="text-xs text-muted-foreground">@{result.username}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddContact(result.user_id)}
                        disabled={isAdding}
                      >
                        {isAdding ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
                  No users found
                </div>
              ) : (
                <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
                  Enter at least 2 characters to search
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ContactItemProps {
  contact: any;
  onRemove: () => void;
  onStartChat: () => void;
}

const ContactItem = ({ contact, onRemove, onStartChat }: ContactItemProps) => {
  const displayName = contact.nickname || 
    contact.contact_profile?.display_name || 
    contact.contact_profile?.username || 
    'User';

  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Avatar className="h-8 w-8">
          <AvatarImage src={contact.contact_profile?.avatar_url} />
          <AvatarFallback>{displayName[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{displayName}</p>
          {contact.contact_profile?.status && (
            <p className="text-xs text-muted-foreground truncate">
              {contact.contact_profile.status}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0"
          onClick={onStartChat}
          aria-label={`Chat with ${displayName}`}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Contact options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onStartChat}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onRemove}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Contact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
