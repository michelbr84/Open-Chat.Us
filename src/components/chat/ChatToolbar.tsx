import React from "react";
import { Users } from "lucide-react";

interface ChatToolbarProps {
  showMobileSidebar: boolean;
  onToggleMobileSidebar: () => void;
}

export const ChatToolbar = React.memo(function ChatToolbar({
  showMobileSidebar,
  onToggleMobileSidebar,
}: ChatToolbarProps) {
  return (
    <button
      onClick={onToggleMobileSidebar}
      className="md:hidden absolute top-4 left-4 z-10 bg-primary text-primary-foreground rounded-full p-2 shadow-lg"
    >
      <Users className="w-5 h-5" />
    </button>
  );
});
