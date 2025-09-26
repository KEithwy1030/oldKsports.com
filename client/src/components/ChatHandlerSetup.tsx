import React, { useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { setChatHandler } from './UserHoverCard';

const ChatHandlerSetup: React.FC = () => {
  const { openChatWith } = useChat();

  useEffect(() => {
    // 设置全局聊天处理函数
    setChatHandler(openChatWith);
  }, [openChatWith]);

  return null; // 这个组件不渲染任何内容
};

export default ChatHandlerSetup;
