// Generative AI was used to devlop this code
// src/pages/ChatPage.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../hooks/useAuth";
import { useMessage } from "../hooks/useMessage";
import { useChatSocket } from "../hooks/useChatSocket";
import ChatHeader from "../components/chat/ChatHeader";
import ChatMessageList from "../components/chat/ChatMessageList";
import ChatComposer from "../components/chat/ChatComposer";
import PollCreation from "../components/PollCreation";

export default function ChatPage() {
  const {conversationId} = useParams();
  const conversationIdNum = Number(conversationId);
  const {user} = useAuth();
  const {getConversation, sendMessage: sendContextMessage, resolveAuthor, getConversationName} = useMessage();
  const conversationQuery = getConversation(conversationIdNum);
  const currentConversation = conversationQuery.data;

  const {
    isConnected,
    joinConversationRoom,
    leaveConversationRoom,
    sendTextMessage,
    sendTypingIndicator,
    createPoll,
    votePoll,
    onNewMessage,
    onNewPoll,
    useTypingUsers,
  } = useChatSocket();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [showPollCreation, setShowPollCreation] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUserId = user?.id;

  const { setActiveConversation } = useNotifications();

  const typingUsers = useTypingUsers(conversationIdNum);

  useEffect(() => {
    setActiveConversation(conversationIdNum);
    return () => setActiveConversation(null);
  }, [conversationIdNum]);

  // Join conversation only after websocket is connected.
  useEffect(() => {
    if (!isConnected || !currentUserId) return;
    joinConversationRoom(conversationIdNum);

    return () => {
      if (isConnected) {
        leaveConversationRoom(conversationIdNum);
      }
    };
  }, [conversationIdNum, currentUserId, isConnected, joinConversationRoom, leaveConversationRoom]);

  // Load message history
  useEffect(() => {
    if (!currentConversation) return;
    const msgs = Array.isArray(currentConversation.messages) ? currentConversation.messages : [];
    setMessages(msgs.map(m => ({
      ...m,
      author: resolveAuthor(m, currentConversation.users),
    })));
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [currentConversation, resolveAuthor]);

  // Subscribe to new messages and polls
  useEffect(() => {
    const handleNewMessage = (msg) => {
      console.log("Received new message", msg);
      if (Number(msg.conversation_id) !== conversationIdNum) return;
      setMessages(prev => [
        ...prev,
        {
          ...msg,
          sender_user_id: msg.sender_user_id ?? msg.sender_id,
          author: resolveAuthor(msg, currentConversation?.users),
        },
      ]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleNewPoll = (msg) => {
      console.log("Received new poll", msg);
      if (Number(msg.conversation_id) !== conversationIdNum) return;
      setMessages(prev => [
        ...prev,
        {
          ...msg,
          sender_user_id: msg.sender_user_id ?? msg.sender_id,
          author: resolveAuthor(msg, currentConversation?.users),
        },
      ]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const unsubscribeMessage = onNewMessage(handleNewMessage);
    const unsubscribePoll = onNewPoll(handleNewPoll);
    
    return () => {
      unsubscribeMessage();
      unsubscribePoll();
    };
  }, [conversationIdNum, currentUserId, onNewMessage, onNewPoll, resolveAuthor, currentConversation?.users]);

  // Send message
  const handleSend = () => {
    const text = inputMessage.trim();
    if (!text || !isConnected) return;
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    sendTextMessage(conversationIdNum, text);
    sendContextMessage(text, conversationIdNum, user.id);
    setInputMessage("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    if (isConnected) sendTyping(conversationIdNum);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {}, 3000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleAddMedia = (mediaType) => {
    if (mediaType === "poll") { setShowPollCreation(true); }
    setShowMediaOptions(false);
  };

  const handlePollCreate = (poll) => {
    const pollContent = poll.content;
    const pollMetaData = poll.meta_data;
    
    // Send poll to backend
    createPoll(conversationIdNum, pollContent, pollMetaData);
    
    // Close the poll creation modal
    setShowPollCreation(false);
  };

  // // Handle input change
  // const handleInputChange = (e) => {
  //   setInputMessage(e.target.value);
    
  //   // Send typing indicator
  //   if (isConnected) {
  //     sendTypingIndicator(conversationIdNum);
  //   }
    
  //   // Clear existing timeout
  //   if (typingTimeoutRef.current) {
  //     clearTimeout(typingTimeoutRef.current);
  //   }
    
  //   // Set new timeout to stop typing indicator after 3 seconds
  //   typingTimeoutRef.current = setTimeout(() => {
  //     // Could send "stopped typing" event if needed
  //   }, 3000);
  // };

  // // Handle Enter key to send message
  // const handleKeyDown = (e) => {
  //   if (e.key === 'Enter' && !e.shiftKey) {
  //     e.preventDefault();
  //     handleSend();
  //   }
  // };

  const handleVote = (pollMessage, selectedOption) => {
    // Build updated meta_data with the vote
    const updatedMetaData = { ...pollMessage.meta_data };
    
    // Ensure options structure exists
    if (!updatedMetaData.options) {
      updatedMetaData.options = {};
    }
    
    // Remove user from all other options first
    Object.keys(updatedMetaData.options).forEach(option => {
      if (option !== selectedOption) {
        updatedMetaData.options[option] = updatedMetaData.options[option].filter(id => id !== currentUserId);
      }
    });
    
    // Ensure selected option exists
    if (!updatedMetaData.options[selectedOption]) {
      updatedMetaData.options[selectedOption] = [];
    }
    
    // Add current user to the selected option if not already there
    if (!updatedMetaData.options[selectedOption].includes(currentUserId)) {
      updatedMetaData.options[selectedOption].push(currentUserId);
    }
    
    // Send vote to backend
    votePoll(conversationIdNum, pollMessage.content, updatedMetaData);
  }

  const conversationName = getConversationName(currentConversation, user);
  const conversationUserIds = useMemo(
    () => (currentConversation?.users || []).map((u) => u.id),
    [currentConversation?.users]
  );

  return (
    <div className="page-container chat-page">
      <ChatHeader conversationName={conversationName} userIds={conversationUserIds} />

      <ChatMessageList
        messages={messages}
        currentUserId={currentUserId}
        onVote={handleVote}
        messagesEndRef={messagesEndRef}
      />

      <ChatComposer
        showMediaOptions={showMediaOptions}
        onToggleMediaOptions={() => setShowMediaOptions(!showMediaOptions)}
        onAddMedia={handleAddMedia}
        inputMessage={inputMessage}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        isConnected={isConnected}
      />

      <PollCreation
        isOpen={showPollCreation}
        onClose={() => setShowPollCreation(false)}
        onCreate={handlePollCreate}
      />
    </div>
  );
}