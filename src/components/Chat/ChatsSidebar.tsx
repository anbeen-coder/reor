import React, { useEffect, useState } from "react";
import { ChatHistory } from "./Chat";
import { ChatHistoryMetadata } from "./hooks/use-chat-history";

interface ChatListProps {
  // chatHistories: ChatHistory[];
  chatHistoriesMetadata: ChatHistoryMetadata[];
  currentChatHistory: ChatHistory | undefined;
  onSelect: (chatID: string) => void;
  newChat: () => void;
  setChatHistoriesMetadata: (chat: ChatHistoryMetadata[]) => void;
}

export const ChatsSidebar: React.FC<ChatListProps> = ({
  chatHistoriesMetadata,
  currentChatHistory,
  onSelect,
  newChat,
  setChatHistoriesMetadata,
}) => {
  const [reversedChatHistoriesMetadata, setReversedChatHistoriesMetadata] =
    useState<ChatHistoryMetadata[]>([]);
  useEffect(() => {
    setReversedChatHistoriesMetadata(chatHistoriesMetadata.reverse());
  }, [chatHistoriesMetadata]);

  useEffect(() => {
    const deleteChatRow = window.ipcRenderer.receive(
      "remove-chat-at-id",
      (chatID) => {
        setChatHistoriesMetadata(chatHistoriesMetadata.filter(item => item.id !== chatID));        
        window.electronStore.updateAllChatHistories(chatID);
      }
    );

    return () => {
      deleteChatRow();
    }
  }, [chatHistoriesMetadata]);

  return (
    <div className="h-full overflow-y-auto bg-neutral-800">
      <div
        className="mt-1 mb-1 mr-1 ml-1 flex items-center justify-center cursor-pointer px-4 py-[2px] bg-neutral-600 hover:bg-neutral-700 text-white border border-transparent hover:border-white rounded transition duration-150 ease-in-out"
        onClick={newChat}
      >
        <span className="text-sm"> + New Chat</span>
      </div>

      {reversedChatHistoriesMetadata.map((chatMetadata) => (
        <ChatItem
          key={chatMetadata.id}
          // chat={chat}
          chatMetadata={chatMetadata}
          selectedChatID={currentChatHistory?.id || ""}
          onChatSelect={onSelect}
        />
      ))}
    </div>
  );
};

interface ChatItemProps {
  chatMetadata: ChatHistoryMetadata;
  selectedChatID: string | null;
  onChatSelect: (path: string) => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({
  chatMetadata,
  selectedChatID,
  onChatSelect,
}) => {
  const isSelected = chatMetadata.id === selectedChatID;

  const itemClasses = `flex items-center cursor-pointer px-2 py-1 border-b border-gray-200 hover:bg-neutral-700 h-full mt-0 mb-0 ${
    isSelected ? "bg-neutral-700 text-white font-semibold" : "text-gray-200"
  }`;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    window.contextChatMenu.showChatItemContext(chatMetadata);
  }

  return (
    <div>
      <div
        onClick={() => onChatSelect(chatMetadata.id)}
        className={itemClasses}
        onContextMenu={handleContextMenu}
      >
        <span className={`text-[13px] flex-1 truncate mt-0`}>
          {chatMetadata.displayName}
        </span>
      </div>
    </div>
  );
};