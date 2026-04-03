import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useThreadedReplies } from "@/hooks/useThreadedReplies";
import { useChatState } from "@/hooks/useChatState";
import { useChatSubscriptions } from "@/hooks/useChatSubscriptions";
import { useChatActions } from "@/hooks/useChatActions";
import { AgeGate } from "@/components/AgeGate";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { LoginModal } from "@/components/LoginModal";
import { DonateModal } from "@/components/DonateModal";
import { PrivateChat } from "@/components/PrivateChat";
import { BookmarksPanel } from "@/components/BookmarksPanel";

const Index = () => {
  const { user } = useAuth();
  const { replyingTo, startReply, cancelReply, sendReply, loadThreadReplies, getThreadReplies } = useThreadedReplies();

  // All state from the original Chat.tsx
  const state = useChatState();

  // Set up all Supabase subscriptions (messages, presence, search, etc.)
  useChatSubscriptions({
    ageVerified: state.ageVerified,
    selectedRoom: state.selectedRoom,
    user,
    guestName: state.guestName,
    searchQuery: state.searchQuery,
    messages: state.messages,
    hasMore: state.hasMore,
    isLoadingMore: state.isLoadingMore,
    setMessages: state.setMessages,
    setSearchResults: state.setSearchResults,
    setHasMore: state.setHasMore,
    setIsLoadingMore: state.setIsLoadingMore,
    setUserList: state.setUserList,
    setAgeVerified: state.setAgeVerified,
    setGuestName: state.setGuestName,
    messagesEndRef: state.messagesEndRef,
    presenceChannelRef: state.presenceChannelRef,
    loadingRef: state.loadingRef,
  });

  // All action handlers (send, edit, delete, reactions, etc.)
  const actions = useChatActions({
    messages: state.messages,
    setMessages: state.setMessages,
    guestName: state.guestName,
    setGuestName: state.setGuestName,
    selectedRoom: state.selectedRoom,
    setShowLogin: state.setShowLogin,
    setShowMobileSidebar: state.setShowMobileSidebar,
    setActivePrivateChat: state.setActivePrivateChat,
    setMentionToAdd: state.setMentionToAdd,
    setShouldClearMention: state.setShouldClearMention,
    shouldClearMention: state.shouldClearMention,
    presenceChannelRef: state.presenceChannelRef,
    lastMessageTimeRef: state.lastMessageTimeRef,
  });

  // Thread toggle handler
  const handleToggleThread = useCallback((messageId: string) => {
    state.setOpenThreads((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
        loadThreadReplies(messageId);
      }
      return newSet;
    });
  }, [loadThreadReplies]);

  const isSearching = state.searchQuery.length > 0;
  const displayMessages = isSearching ? state.searchResults : state.messages;

  if (!state.ageVerified) {
    return <AgeGate onConfirm={() => state.setAgeVerified(true)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-chat-background">
      <ChatHeader
        searchQuery={state.searchQuery}
        onSearchChange={state.setSearchQuery}
        onLoginClick={() => state.setShowLogin(true)}
        onDonateClick={() => state.setShowDonate(true)}
        onOpenPrivateChat={actions.handleOpenPrivateChat}
        onShowBookmarks={() => state.setShowBookmarks(true)}
        onExportChat={actions.handleExportChat}
        currentRoom={state.selectedRoom}
        onRoomSelect={state.setSelectedRoom}
      />

      <ChatContainer
        // Sidebar props
        showMobileSidebar={state.showMobileSidebar}
        sidebarTab={state.sidebarTab}
        setSidebarTab={state.setSidebarTab}
        userList={state.userList}
        guestName={state.guestName}
        selectedRoom={state.selectedRoom}
        onUserClick={actions.handleUserClick}
        onGuestNameChange={actions.handleGuestNameChange}
        onMentionUser={actions.handleMentionUser}
        onSelectRoom={state.setSelectedRoom}
        onStartPrivateChat={(id, name) => state.setActivePrivateChat({ id, name })}
        onCloseMobileSidebar={() => state.setShowMobileSidebar(false)}
        onToggleMobileSidebar={() => state.setShowMobileSidebar(!state.showMobileSidebar)}
        // Message list props
        displayMessages={displayMessages}
        isSearching={isSearching}
        searchQuery={state.searchQuery}
        searchResults={state.searchResults}
        isLoadingMore={state.isLoadingMore}
        loadingRef={state.loadingRef}
        messagesEndRef={state.messagesEndRef}
        user={user}
        reactions={actions.reactions}
        openThreads={state.openThreads}
        replyingTo={replyingTo}
        onReact={actions.handleReaction}
        onReport={actions.handleReport}
        onEdit={actions.handleEdit}
        onDelete={actions.handleDelete}
        onStartReply={startReply}
        onOpenPrivateChat={actions.handleOpenPrivateChat}
        onToggleThread={handleToggleThread}
        onSendReply={sendReply}
        onCancelReply={cancelReply}
        getThreadReplies={getThreadReplies}
        loadThreadReplies={loadThreadReplies}
        // Message input props
        onSendMessage={actions.sendPublicMessage}
        mentionToAdd={state.mentionToAdd}
        onMentionAdded={actions.handleMentionAdded}
      />

      {/* Modals and overlays */}
      {state.showLogin && <LoginModal onClose={() => state.setShowLogin(false)} />}
      {state.showDonate && <DonateModal onClose={() => state.setShowDonate(false)} />}
      {state.activePrivateChat && (
        <PrivateChat partner={state.activePrivateChat} onClose={() => state.setActivePrivateChat(null)} />
      )}

      {/* Bookmarks Modal */}
      {state.showBookmarks && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <BookmarksPanel
            onClose={() => state.setShowBookmarks(false)}
            onMessageClick={(messageId) => {
              const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
              if (messageElement) {
                messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
                messageElement.classList.add("ring-2", "ring-primary", "ring-opacity-50");
                setTimeout(() => {
                  messageElement.classList.remove("ring-2", "ring-primary", "ring-opacity-50");
                }, 2000);
              }
              state.setShowBookmarks(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
