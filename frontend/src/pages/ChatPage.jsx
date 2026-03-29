// src/pages/ChatPage.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import PollBox from "../components/PollBox";
import { useParams } from "react-router-dom";
import {useWebSocketContext } from "../context/WebSocketContext"
import {WS_EVENTS} from "../services/constant";
import { useAuth } from "../context/AuthContext";
import { useTrip } from "../context/TripContext";
import { useMessage } from "../context/MessageContext";
import { MessageType } from "../types/types"
import AvatarStack from "../components/AvatarStack";

const MemoizedAvatarStack = React.memo(AvatarStack);

export default function ChatPage() {
      // const {activeTrip} = useTrip();
  const {conversationId} = useParams();
  const conversationIdNum = Number(conversationId);
  const {user} = useAuth();
  const {getConversation, sendMessage: sendContextMessage} = useMessage();
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
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUserId = user?.id;

  const MessageBoxType = (message) => {
    switch (message.type){
      case MessageType.TEXT:
        // console.log("Rendering text message", message.content);
        return <div className={`chat-bubble ${message.sender_user_id === currentUserId ? "mine" : "theirs"}`}>
              {message.content || message.text}
            </div>;

      case MessageType.POLL:
        console.log("Rendering poll message", message);
        return <PollBox poll={message} onVote={handleVote}/>
            
      case MessageType.IMAGE:
        console.log("Invalid media");
        return;

      case MessageType.VIDEO:
        console.log("Invalid media");
        return;

      default:
        console.log("Invalid media", message);
        return;
    }
  };

  // Join conversation only after websocket is connected.
  // This also re-joins after reconnects because isConnected toggles back to true.
  useEffect(() => {
    if (!isConnected || !currentUserId) return;
    joinConversation(conversationIdNum);

    return () => {
      if (isConnected) {
        leaveConversation(conversationIdNum);
      }
    };
  }, [conversationIdNum, currentUserId, isConnected, joinConversation, leaveConversation]);

  // Load message history — wait for auth to resolve before fetching
  useEffect(() => {
    if (!currentUserId) return;
    getConversation(conversationIdNum)
      .then(data => {
        setCurrentConversation(data);
        const userMap = {};
        (data.users || []).forEach(u => { userMap[u.id] = u.username; });
        const msgs = Array.isArray(data.messages) ? data.messages : [];
        msgs.map(m => console.log("Loaded message", m));
        setMessages(msgs.map(m => ({
          ...m,
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
      console.log("Received new message", msg);
      if (Number(msg.conversation_id) !== conversationIdNum) return;
      setMessages(prev => [...prev, { ...msg }]);
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
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    sendMessage(conversationIdNum, text);
    sendContextMessage(text, conversationIdNum, user.id);
    setInputMessage('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  // Handle media options
  const handleAddMedia = (mediaType) => {
    console.log(`Adding ${mediaType} media`);
    // TODO: Implement media upload functionality
    setShowMediaOptions(false);
  };


  // Handle input change
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

  const handleVote = (option) => {
    // Send vote to backend
    sendMessage(conversationIdNum, '', MessageType.POLL, {
      question: currentConversation.poll_question,
      options: currentConversation.poll_options,
      selected_option: option
    });
  }

  return (
    <div className="page-container chat-page">
      <div className="chat-header">
        <div>
          {getConversationName()}
        </div>
        <MemoizedAvatarStack userIds={useMemo(() => (currentConversation?.users || []).map(u => u.id), [currentConversation?.users])} />
      </div>

      <div className="chat-body">
        {messages.map((m, index) => (
          <div
            key={m.id ?? index} // not a long term fix
            className={`chat-message-row ${m.sender_user_id === currentUserId ? "mine" : "theirs"}`}
          >
            {m.sender_user_id !== currentUserId && <div className="chat-author">{m.author}</div>}
            {MessageBoxType(m)}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-container">
        <div className="media-button-wrapper">
          <button
            className="add-media-btn"
            onClick={() => setShowMediaOptions(!showMediaOptions)}
            title="Add media"
          >
            +
          </button>
          {showMediaOptions && (
            <div className="media-options-menu">
              <button
                className="media-option"
                onClick={() => handleAddMedia('image')}
              >
                Image
              </button>
              <button
                className="media-option"
                onClick={() => handleAddMedia('video')}
              >
                Video
              </button>
              <button
                className="media-option"
                onClick={() => handleAddMedia('file')}
              >
                File
              </button>
              <button
                className="media-option"
                onClick={() => handleAddMedia('poll')}
                >Poll</button>
            </div>
          )}
        </div>
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

