// src/pages/ChatPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import {useWebSocketContext } from "../context/WebSocketContext"
import {WS_EVENTS} from "../services/constant";
import { useAuth } from "../context/AuthContext";
import { useTrip } from "../context/TripContext";
import { useMessage } from "../context/MessageContext";

export default function ChatPage() {
      // const {activeTrip} = useTrip();
  const {conversationId} = useParams();
  const conversationIdNum = Number(conversationId);
  const {user} = useAuth();
  const {getConversation, getConversations, sendMessage: sendContextMessage} = useMessage();
  const [currentConversation, setCurrentConversation] = useState(null);

  const { 
    sendMessage, 
    sendTyping, 
    subscribe,
    joinConversation,
    leaveConversation,
    isConnected 
  } = useWebSocketContext();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUserId = user?.id;


  // Join / leave conversation
  useEffect(() => {
    // Join conversation when component mounts
    joinConversation(conversationIdNum);
    
    // Leave conversation when component unmounts or conversation changes
    return () => {
      leaveConversation(conversationIdNum);
    };
  }, [conversationIdNum, joinConversation, leaveConversation]);

  // Load message history — wait for auth to resolve before fetching
  useEffect(() => {
    if (!currentUserId) return;
    getConversation(conversationIdNum)
      .then(data => {
        setCurrentConversation(data);
        const userMap = {};
        (data.users || []).forEach(u => { userMap[u.id] = u.username; });
        const msgs = Array.isArray(data.messages) ? data.messages : [];
        setMessages(msgs.map(m => ({
          ...m,
          mine: m.sender_user_id === currentUserId,
          author: userMap[m.sender_user_id] ?? `User ${m.sender_user_id}`,
        })));
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .catch(err => console.error('Error loading messages:', err));
  }, [conversationIdNum, currentUserId]);

  // Subscribe to new message
  useEffect(() => {
    const unsubscribe = subscribe(WS_EVENTS.NEW_MESSAGE, (data) => {
      const msg = data.message;
      if (Number(msg.conversation_id) !== conversationIdNum) return;
      const mine = (msg.sender_user_id ?? msg.sender_id) === currentUserId;
      // Skip echo of our own messages — already added optimistically on send
      if (mine) return;
      setMessages(prev => [...prev, { ...msg, mine }]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    
    return unsubscribe;
  }, [conversationIdNum, currentUserId, subscribe]);

  // Subcribing to typing indicator
  useEffect(() => {
      const unsubscribe = subscribe(WS_EVENTS.USER_TYPING, (data) => {
        if (Number(data.conversation_id) === conversationIdNum) {
          // Add user to typing list
          setTypingUsers(prev => {
            if (!prev.includes(data.user_id)) {
              return [...prev, data.user_id];
            }
            return prev;
          });
          
          // Remove after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(id => id !== data.user_id));
          }, 3000);
        }
      });
      
      return unsubscribe;
    }, [conversationIdNum, subscribe]);


  // Send message
  const handleSend = () => {
    const text = inputMessage.trim();
    if (!text || !isConnected) return;
    // Optimistically add own message immediately
    setMessages(prev => [...prev, {
      id: Date.now(),
      conversation_id: conversationIdNum,
      sender_user_id: currentUserId,
      content: text,
      mine: true,
    }]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    sendMessage(conversationIdNum, text);
    sendContextMessage(text, conversationIdNum, user.id);
    setInputMessage('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };


  // Hnadle input change
    const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    
    // Send typing indicator
    if (isConnected) {
      sendTyping(conversationIdNum);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      // Could send "stopped typing" event if needed
    }, 3000);
  };

  // Handle Enter key to send message
    const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

    const getConversationName = () => {
        if (!currentConversation) return `Conversation ${conversationIdNum}`;
          if (currentConversation.is_group) {
              return currentConversation.name ?? `Conversation ${currentConversation.id}`;
          }
  
        const otherUser = (currentConversation.users || []).find((participant) => participant.id !== user.id);
          return otherUser?.username ?? `Conversation ${currentConversation.id}`;
      };

  return (
    <div className="page-container chat-page">
      <div className="chat-header">
        <div>
          {getConversationName()}
        </div>
        <div className="avatar-stack">
          <div className="avatar-circle">A</div>
          <div className="avatar-circle">S</div>
          <div className="avatar-circle">E</div>
          <div className="avatar-circle">M</div>
        </div>
      </div>

      <div className="chat-body">
        {messages.map((m, index) => (
          <div
            key={m.id ?? index} // not a long term fix
            className={`chat-message-row ${m.mine ? "mine" : "theirs"}`}
          >
            {!m.mine && <div className="chat-author">{m.author}</div>}
            <div className={`chat-bubble ${m.mine ? "mine" : "theirs"}`}>
              {m.content || m.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-container">
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="text-input"
          disabled={!isConnected}
        />
      </div>
    </div>
  );
}
