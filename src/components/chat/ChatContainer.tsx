import React from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatToolbar } from "@/components/chat/ChatToolbar";
import { MessageInput } from "@/components/MessageInput";
import { GroupMembersPanel } from "@/components/rooms/GroupMembersPanel";
import type { Message, OnlineUser, Room } from "@/hooks/useChatState";

interface ChatContainerProps {
  // Sidebar props
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
  onToggleMobileSidebar: () => void;

  // Message list props
  displayMessages: Message[];
  isSearching: boolean;
  searchQuery: string;
  searchResults: Message[];
  isLoadingMore: boolean;
  loadingRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  user: any;
  reactions: Record<string, any>;
  openThreads: Set<string>;
  replyingTo: string | null;
  onReact: (messageId: string, emoji: string) => void;
  onReport: (messageId: string, reason: string, details?: string) => void;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
  onStartReply: (messageId: string) => void;
  onOpenPrivateChat: (senderId: string, senderName: string) => void;
  onToggleThread: (messageId: string) => void;
  onSendReply: (parentMessageId: string, content: string) => void;
  onCancelReply: () => void;
  getThreadReplies: (messageId: string) => any[];
  loadThreadReplies: (messageId: string) => void;

  // Message input props
  onSendMessage: (content: string, mentions?: any[]) => void;
  mentionToAdd: string;
  onMentionAdded: () => void;
}

export const ChatContainer = React.memo(function ChatContainer(props: ChatContainerProps) {
  const {
    showMobileSidebar, sidebarTab, setSidebarTab, userList, guestName,
    selectedRoom, onUserClick, onGuestNameChange, onMentionUser,
    onSelectRoom, onStartPrivateChat, onCloseMobileSidebar, onToggleMobileSidebar,
    displayMessages, isSearching, searchQuery, searchResults, isLoadingMore,
    loadingRef, messagesEndRef, user, reactions, openThreads, replyingTo,
    onReact, onReport, onEdit, onDelete, onStartReply, onOpenPrivateChat,
    onToggleThread, onSendReply, onCancelReply, getThreadReplies, loadThreadReplies,
    onSendMessage, mentionToAdd, onMentionAdded,
  } = props;

  return (
    <div className="flex-1 flex overflow-hidden">
      <ChatSidebar
        showMobileSidebar={showMobileSidebar}
        sidebarTab={sidebarTab}
        setSidebarTab={setSidebarTab}
        userList={userList}
        guestName={guestName}
        selectedRoom={selectedRoom}
        onUserClick={onUserClick}
        onGuestNameChange={onGuestNameChange}
        onMentionUser={onMentionUser}
        onSelectRoom={onSelectRoom}
        onStartPrivateChat={onStartPrivateChat}
        onCloseMobileSidebar={onCloseMobileSidebar}
      />

      <main className="flex-1 flex flex-col relative">
        {/* Mobile sidebar toggle */}
        <ChatToolbar
          showMobileSidebar={showMobileSidebar}
          onToggleMobileSidebar={onToggleMobileSidebar}
        />

        {/* Messages area */}
        <ChatMessageList
          displayMessages={displayMessages}
          isSearching={isSearching}
          searchQuery={searchQuery}
          searchResults={searchResults}
          isLoadingMore={isLoadingMore}
          loadingRef={loadingRef}
          messagesEndRef={messagesEndRef}
          user={user}
          guestName={guestName}
          reactions={reactions}
          openThreads={openThreads}
          replyingTo={replyingTo}
          onReact={onReact}
          onReport={onReport}
          onEdit={onEdit}
          onDelete={onDelete}
          onStartReply={onStartReply}
          onOpenPrivateChat={onOpenPrivateChat}
          onToggleThread={onToggleThread}
          onSendReply={onSendReply}
          onCancelReply={onCancelReply}
          getThreadReplies={getThreadReplies}
          loadThreadReplies={loadThreadReplies}
        />

        {/* Message input */}
        {!isSearching && (
          <MessageInput
            onSendMessage={onSendMessage}
            placeholder="Type a message..."
            onlineUsers={userList}
            mentionToAdd={mentionToAdd}
            onMentionAdded={onMentionAdded}
          />
        )}
      </main>

      {/* Group Members Panel - only for group rooms */}
      {user && selectedRoom && selectedRoom.room_type === "group" && (
        <div className="hidden lg:block w-64 border-l border-border">
          <GroupMembersPanel roomId={selectedRoom.id} roomName={selectedRoom.name} />
        </div>
      )}
    </div>
  );
});
