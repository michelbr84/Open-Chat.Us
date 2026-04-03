import { useState, useRef } from "react";

export interface Message {
  id: string;
  content: string;
  sender_name: string;
  sender_id: string | null;
  created_at: string;
  edited_at?: string | null;
  is_deleted?: boolean;
  mentions?: any[] | null;
  reply_count?: number;
  parent_message_id?: string | null;
  is_bot_message?: boolean;
  channel_id?: string | null;
}

export interface Room {
  id: string;
  name: string;
  room_type: string;
  is_temporary?: boolean;
}

export interface OnlineUser {
  name: string;
  isMember: boolean;
  key: string;
}

export function useChatState() {
  // App state
  const [ageVerified, setAgeVerified] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);

  // User state
  const [guestName, setGuestName] = useState("");
  const [userList, setUserList] = useState<OnlineUser[]>([]);

  // Private chat state
  const [activePrivateChat, setActivePrivateChat] = useState<{ id: string; name: string } | null>(null);

  // Room state
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Sidebar tab state
  const [sidebarTab, setSidebarTab] = useState<"users" | "rooms" | "contacts">("users");

  // Mention state
  const [mentionToAdd, setMentionToAdd] = useState<string>("");
  const [shouldClearMention, setShouldClearMention] = useState(false);

  // Thread state
  const [openThreads, setOpenThreads] = useState<Set<string>>(new Set());

  // Pagination state
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const presenceChannelRef = useRef<any>(null);
  const lastMessageTimeRef = useRef(0);

  return {
    // App state
    ageVerified, setAgeVerified,
    showLogin, setShowLogin,
    showDonate, setShowDonate,
    showMobileSidebar, setShowMobileSidebar,
    showBookmarks, setShowBookmarks,

    // Chat state
    messages, setMessages,
    searchQuery, setSearchQuery,
    searchResults, setSearchResults,

    // User state
    guestName, setGuestName,
    userList, setUserList,

    // Private chat state
    activePrivateChat, setActivePrivateChat,

    // Room state
    selectedRoom, setSelectedRoom,

    // Sidebar tab state
    sidebarTab, setSidebarTab,

    // Mention state
    mentionToAdd, setMentionToAdd,
    shouldClearMention, setShouldClearMention,

    // Thread state
    openThreads, setOpenThreads,

    // Pagination state
    hasMore, setHasMore,
    isLoadingMore, setIsLoadingMore,
    loadingRef,

    // Refs
    messagesEndRef,
    presenceChannelRef,
    lastMessageTimeRef,
  };
}
