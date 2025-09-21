import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatUser {
  id: number;
  username: string;
  avatar?: string;
}

interface ChatContextType {
  isOpen: boolean;
  selectedUserId: number | null;
  openChatWith: (user: ChatUser) => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const openChatWith = (user: ChatUser) => {
    console.log('🔥 开启与用户的聊天:', user);
    setSelectedUserId(user.id);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    // 不清除selectedUserId，保持选中状态
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const value: ChatContextType = {
    isOpen,
    selectedUserId,
    openChatWith,
    closeChat,
    toggleChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
