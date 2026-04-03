import React from "react";
import { UserList } from "@/components/UserList";
import { RoomsList } from "@/components/rooms/RoomsList";
import { ContactsList } from "@/components/contacts/ContactsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, UserPlus } from "lucide-react";
import type { OnlineUser, Room } from "@/hooks/useChatState";

interface ChatSidebarProps {
  showMobileSidebar: boolean;
  sidebarTab: "users" | "rooms" | "contacts";
  setSidebarTab: (tab: "users" | "rooms" | "contacts") => void;
  userList: OnlineUser[];
  guestName: string;
  selectedRoom: Room | null;
  onUserClick: (name: string, isMember: boolean, key: string) => void;
  onGuestNameChange: (name: string) => void;
  onMentionUser: (username: string) => void;
  onSelectRoom: (room: Room | null) => void;
  onStartPrivateChat: (contactId: string, contactName: string) => void;
  onCloseMobileSidebar: () => void;
}

export const ChatSidebar = React.memo(function ChatSidebar({
  showMobileSidebar,
  sidebarTab,
  setSidebarTab,
  userList,
  guestName,
  selectedRoom,
  onUserClick,
  onGuestNameChange,
  onMentionUser,
  onSelectRoom,
  onStartPrivateChat,
  onCloseMobileSidebar,
}: ChatSidebarProps) {
  return (
    <>
      {/* Mobile sidebar overlay */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden
          ${showMobileSidebar ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={onCloseMobileSidebar}
      />

      {/* Sidebar with user list */}
      <div
        className={`
          fixed left-0 top-0 h-full z-50 transition-transform md:relative md:translate-x-0 md:z-auto
          ${showMobileSidebar ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Tabs
          value={sidebarTab}
          onValueChange={(value) => setSidebarTab(value as "users" | "rooms" | "contacts")}
          className="flex flex-col h-full"
        >
          <div className="p-3 border-b border-border">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users" className="flex items-center gap-1.5 text-xs">
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="rooms" className="flex items-center gap-1.5 text-xs">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rooms</span>
              </TabsTrigger>
              <TabsTrigger value="contacts" className="flex items-center gap-1.5 text-xs">
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Contacts</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="users" className="flex-1 overflow-hidden m-0">
            <UserList
              users={userList}
              guestName={guestName}
              onUserClick={onUserClick}
              onGuestNameChange={onGuestNameChange}
              onMentionUser={onMentionUser}
            />
          </TabsContent>

          <TabsContent value="rooms" className="flex-1 overflow-hidden m-0">
            <RoomsList
              onSelectRoom={(room) => {
                onSelectRoom(room);
                onCloseMobileSidebar();
              }}
              selectedRoomId={selectedRoom?.id}
            />
          </TabsContent>

          <TabsContent value="contacts" className="flex-1 overflow-hidden m-0">
            <ContactsList
              onStartChat={(contactId, contactName) => {
                onStartPrivateChat(contactId, contactName);
                onCloseMobileSidebar();
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
});
