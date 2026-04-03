import React from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ThreadedReplyButton } from "@/components/ThreadedReplyButton";
import { ThreadReplyInput } from "@/components/ThreadReplyInput";
import type { Message } from "@/hooks/useChatState";

interface ChatMessageListProps {
  displayMessages: Message[];
  isSearching: boolean;
  searchQuery: string;
  searchResults: Message[];
  isLoadingMore: boolean;
  loadingRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  user: any;
  guestName: string;
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
}

export const ChatMessageList = React.memo(function ChatMessageList({
  displayMessages,
  isSearching,
  searchQuery,
  searchResults,
  isLoadingMore,
  loadingRef,
  messagesEndRef,
  user,
  guestName,
  reactions,
  openThreads,
  replyingTo,
  onReact,
  onReport,
  onEdit,
  onDelete,
  onStartReply,
  onOpenPrivateChat,
  onToggleThread,
  onSendReply,
  onCancelReply,
  getThreadReplies,
  loadThreadReplies,
}: ChatMessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 pt-16 md:pt-4 space-y-1">
      {/* Loading indicator for pagination */}
      <div ref={loadingRef} className="h-4 w-full flex justify-center items-center py-2">
        {isLoadingMore && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
        )}
      </div>

      {isSearching && (
        <div className="mb-4 p-3 bg-muted rounded-lg animate-fade-in">
          <h3 className="font-semibold text-sm mb-2">Search Results ({searchResults.length})</h3>
          {searchResults.length === 0 && (
            <p className="text-sm text-muted-foreground">No messages found for "{searchQuery}"</p>
          )}
        </div>
      )}

      {displayMessages.map((message) => {
        const isOwn = user ? message.sender_id === user.id : message.sender_name === guestName;
        const threadReplies = getThreadReplies(message.id);
        const isThreadOpen = openThreads.has(message.id);

        return (
          <div key={message.id} className="group">
            <ChatMessage
              message={message}
              isOwn={isOwn}
              guestName={guestName}
              reactions={reactions[message.id]}
              onReact={onReact}
              onReport={onReport}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onStartReply}
              onPrivateMessage={onOpenPrivateChat}
            />

            {/* Thread Reply Button */}
            <div className="ml-10 mb-2">
              <ThreadedReplyButton
                messageId={message.id}
                replyCount={message.reply_count || 0}
                onStartReply={onStartReply}
                onToggleThread={(messageId) => {
                  if (isThreadOpen) {
                    onToggleThread(messageId);
                  } else {
                    onToggleThread(messageId);
                    loadThreadReplies(messageId);
                  }
                }}
                isThreadOpen={isThreadOpen}
              />
            </div>

            {/* Thread Replies */}
            {isThreadOpen && threadReplies.length > 0 && (
              <div className="ml-10 space-y-2 mb-4">
                {threadReplies.map((reply) => (
                  <div key={reply.id} className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{reply.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(reply.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="pl-4 border-l-2 border-muted">{reply.content}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input */}
            {replyingTo === message.id && (
              <div className="ml-10 mb-4">
                <ThreadReplyInput parentMessageId={message.id} onSendReply={onSendReply} onCancel={onCancelReply} />
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
});
