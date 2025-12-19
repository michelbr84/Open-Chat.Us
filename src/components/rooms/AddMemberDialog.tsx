import { useState } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { useRooms } from '@/hooks/useRooms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, UserPlus, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface AddMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roomId: string;
    roomName: string;
    existingMemberIds: string[];
    onMemberAdded?: () => void;
}

export const AddMemberDialog = ({
    open,
    onOpenChange,
    roomId,
    roomName,
    existingMemberIds,
    onMemberAdded,
}: AddMemberDialogProps) => {
    const { contacts } = useContacts();
    const { searchUsers } = useContacts();
    const { addMember } = useRooms();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [addingUserIds, setAddingUserIds] = useState<Set<string>>(new Set());

    // Filter contacts to exclude existing members
    const availableContacts = contacts.filter(
        (contact) => !existingMemberIds.includes(contact.contact_user_id)
    );

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const results = await searchUsers(query);
        // Filter out existing members
        const filtered = results.filter(
            (result) => !existingMemberIds.includes(result.user_id)
        );
        setSearchResults(filtered);
        setIsSearching(false);
    };

    const handleAddMember = async (userId: string, userName: string) => {
        setAddingUserIds((prev) => new Set(prev).add(userId));

        const success = await addMember(roomId, userId);

        setAddingUserIds((prev) => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
        });

        if (success) {
            toast.success(`${userName} added to ${roomName}`);
            onMemberAdded?.();

            // Remove from available lists
            setSearchResults((prev) => prev.filter((r) => r.user_id !== userId));
        }
    };

    const handleClose = () => {
        setSearchQuery('');
        setSearchResults([]);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Add Members to {roomName}
                    </DialogTitle>
                    <DialogDescription>
                        Add members from your contacts or search for users
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="contacts" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="contacts">Contacts</TabsTrigger>
                        <TabsTrigger value="search">Search Users</TabsTrigger>
                    </TabsList>

                    {/* Contacts Tab */}
                    <TabsContent value="contacts" className="space-y-4">
                        <ScrollArea className="h-[300px] pr-4">
                            {availableContacts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                                    <p>No available contacts</p>
                                    <p className="text-xs mt-1">All contacts are already members</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {availableContacts.map((contact) => {
                                        const displayName =
                                            contact.nickname ||
                                            contact.contact_profile?.display_name ||
                                            contact.contact_profile?.username ||
                                            'User';

                                        return (
                                            <UserItem
                                                key={contact.id}
                                                userId={contact.contact_user_id}
                                                displayName={displayName}
                                                username={contact.contact_profile?.username}
                                                avatarUrl={contact.contact_profile?.avatar_url}
                                                isAdding={addingUserIds.has(contact.contact_user_id)}
                                                onAdd={() =>
                                                    handleAddMember(contact.contact_user_id, displayName)
                                                }
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    {/* Search Tab */}
                    <TabsContent value="search" className="space-y-4">
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

                        <ScrollArea className="h-[250px] pr-4">
                            {isSearching ? (
                                <div className="flex items-center justify-center h-20">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="space-y-2">
                                    {searchResults.map((result) => (
                                        <UserItem
                                            key={result.user_id}
                                            userId={result.user_id}
                                            displayName={result.display_name || result.username || 'User'}
                                            username={result.username}
                                            avatarUrl={result.avatar_url}
                                            isAdding={addingUserIds.has(result.user_id)}
                                            onAdd={() =>
                                                handleAddMember(
                                                    result.user_id,
                                                    result.display_name || result.username || 'User'
                                                )
                                            }
                                        />
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
                        </ScrollArea>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface UserItemProps {
    userId: string;
    displayName: string;
    username?: string;
    avatarUrl?: string;
    isAdding: boolean;
    onAdd: () => void;
}

const UserItem = ({
    displayName,
    username,
    avatarUrl,
    isAdding,
    onAdd,
}: UserItemProps) => {
    return (
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{displayName[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{displayName}</p>
                    {username && displayName !== username && (
                        <p className="text-xs text-muted-foreground truncate">
                            @{username}
                        </p>
                    )}
                </div>
            </div>

            <Button
                size="sm"
                variant="outline"
                onClick={onAdd}
                disabled={isAdding}
                className="h-8"
            >
                {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add
                    </>
                )}
            </Button>
        </div>
    );
};
