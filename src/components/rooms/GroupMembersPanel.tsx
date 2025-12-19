import { useState, useEffect } from 'react';
import { useRooms } from '@/hooks/useRooms';
import { useContacts } from '@/hooks/useContacts';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    UserPlus,
    MoreVertical,
    Trash2,
    Shield,
    Crown,
    Users,
    Loader2,
} from 'lucide-react';
import { AddMemberDialog } from '@/components/rooms/AddMemberDialog';
import { toast } from 'sonner';

interface GroupMembersPanelProps {
    roomId: string;
    roomName: string;
}

interface Member {
    id: string;
    user_id: string;
    role: string;
    joined_at: string;
    profile?: {
        username?: string;
        display_name?: string;
        avatar_url?: string;
        status?: string;
    };
}

export const GroupMembersPanel = ({ roomId, roomName }: GroupMembersPanelProps) => {
    const { user } = useAuth();
    const { isRoomAdmin, removeMember } = useRooms();
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const isAdmin = isRoomAdmin(roomId);

    // Fetch room members
    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const { data: membersData, error } = await supabase
                .from('group_members')
                .select('*')
                .eq('channel_id', roomId)
                .order('joined_at', { ascending: true });

            if (error) throw error;

            if (membersData && membersData.length > 0) {
                // Fetch profiles for all members
                const userIds = membersData.map((m) => m.user_id);
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('user_id, username, display_name, avatar_url, status')
                    .in('user_id', userIds);

                const membersWithProfiles = membersData.map((member) => ({
                    ...member,
                    profile: profiles?.find((p) => p.user_id === member.user_id),
                }));

                setMembers(membersWithProfiles);
            } else {
                setMembers([]);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            toast.error('Failed to load group members');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();

        // Subscribe to realtime member changes
        const channel = supabase
            .channel(`group-members:${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'group_members',
                    filter: `channel_id=eq.${roomId}`,
                },
                () => {
                    fetchMembers();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId]);

    const handleRemoveMember = async (memberId: string, userId: string) => {
        if (userId === user?.id) {
            toast.error("You can't remove yourself. Use leave room instead.");
            return;
        }

        const success = await removeMember(roomId, userId);
        if (success) {
            setMembers((prev) => prev.filter((m) => m.id !== memberId));
        }
    };

    const handlePromoteMember = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'member' ? 'moderator' : 'admin';

        try {
            const { error } = await supabase
                .from('group_members')
                .update({ role: newRole })
                .eq('channel_id', roomId)
                .eq('user_id', userId);

            if (error) throw error;

            toast.success(`Member promoted to ${newRole}`);
            fetchMembers();
        } catch (error) {
            console.error('Error promoting member:', error);
            toast.error('Failed to promote member');
        }
    };

    const handleDemoteMember = async (userId: string) => {
        try {
            const { error } = await supabase
                .from('group_members')
                .update({ role: 'member' })
                .eq('channel_id', roomId)
                .eq('user_id', userId);

            if (error) throw error;

            toast.success('Member demoted');
            fetchMembers();
        } catch (error) {
            console.error('Error demoting member:', error);
            toast.error('Failed to demote member');
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin':
                return <Crown className="h-3 w-3 text-yellow-500" />;
            case 'moderator':
                return <Shield className="h-3 w-3 text-blue-500" />;
            default:
                return null;
        }
    };

    const getRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" => {
        switch (role) {
            case 'admin':
                return 'default';
            case 'moderator':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <div className="flex flex-col h-full border-l border-border">
            <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">
                        Members ({members.length})
                    </h3>
                </div>
                {isAdmin && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowAddDialog(true)}
                        aria-label="Add member"
                    >
                        <UserPlus className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1">
                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : members.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                        No members yet
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {members.map((member) => (
                            <MemberItem
                                key={member.id}
                                member={member}
                                isCurrentUser={member.user_id === user?.id}
                                isAdmin={isAdmin}
                                onRemove={() => handleRemoveMember(member.id, member.user_id)}
                                onPromote={() => handlePromoteMember(member.user_id, member.role || 'member')}
                                onDemote={() => handleDemoteMember(member.user_id)}
                                getRoleIcon={getRoleIcon}
                                getRoleBadgeVariant={getRoleBadgeVariant}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>

            <AddMemberDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                roomId={roomId}
                roomName={roomName}
                existingMemberIds={members.map((m) => m.user_id)}
                onMemberAdded={fetchMembers}
            />
        </div>
    );
};

interface MemberItemProps {
    member: Member;
    isCurrentUser: boolean;
    isAdmin: boolean;
    onRemove: () => void;
    onPromote: () => void;
    onDemote: () => void;
    getRoleIcon: (role: string) => React.ReactNode;
    getRoleBadgeVariant: (role: string) => "default" | "secondary" | "outline";
}

const MemberItem = ({
    member,
    isCurrentUser,
    isAdmin,
    onRemove,
    onPromote,
    onDemote,
    getRoleIcon,
    getRoleBadgeVariant,
}: MemberItemProps) => {
    const displayName =
        member.profile?.display_name ||
        member.profile?.username ||
        'User';
    const role = member.role || 'member';

    return (
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={member.profile?.avatar_url} />
                    <AvatarFallback>{displayName[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                        <p className="text-sm font-medium truncate">{displayName}</p>
                        {isCurrentUser && (
                            <Badge variant="outline" className="text-xs h-5">
                                You
                            </Badge>
                        )}
                    </div>
                    {member.profile?.status && (
                        <p className="text-xs text-muted-foreground truncate">
                            {member.profile.status}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Badge variant={getRoleBadgeVariant(role)} className="text-xs h-5 gap-1">
                    {getRoleIcon(role)}
                    {role}
                </Badge>

                {isAdmin && !isCurrentUser && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Member options</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {role === 'member' && (
                                <>
                                    <DropdownMenuItem onClick={onPromote}>
                                        <Shield className="h-4 w-4 mr-2" />
                                        Promote to Moderator
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            {role === 'moderator' && (
                                <>
                                    <DropdownMenuItem onClick={onPromote}>
                                        <Crown className="h-4 w-4 mr-2" />
                                        Promote to Admin
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onDemote}>
                                        Demote to Member
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            {role === 'admin' && (
                                <>
                                    <DropdownMenuItem onClick={onDemote}>
                                        Demote to Member
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            <DropdownMenuItem
                                onClick={onRemove}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Member
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
};
