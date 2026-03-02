// src/pages/ChatPage.jsx
import React, { useState, useRef, useEffect } from "react";
import {useWebSocketContext } from "../context/WebSocketContext"
import {WS_EVENTS} from "../services/constant";
import { useAuth } from "../context/AuthContext";
import { useTrip } from "../context/TripContext";
import { useMessage } from "../context/MessageContext";

export default function ChatPage() {
  const {activeTrip} = useTrip();
  const {user} = useAuth();
  const {getConversation, sendMessage: sendContextMessage} = useMessage();

  const { 
    sendMessage, 
    sendTyping, 
    subscribe,
    joinConversation,
    leaveConversation,
    isConnected 
  } = useWebSocketContext();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUserId = user.id;
  const conversationId = (activeTrip) ? activeTrip.id : -1; // Get from route params or context


  // Join / leave conversation
  useEffect(() => {
    // Join conversation when component mounts
    joinConversation(conversationId);
    
    // Leave conversation when component unmounts or conversation changes
    return () => {
      leaveConversation(conversationId);
    };
  }, [conversationId, joinConversation, leaveConversation]);


// Load message history
  useEffect(() => {
    getConversation(conversationId)
      .then( res => res.data)
      .then(data => setMessages(
        (data ? data : []).map(m => ( {...m, mine: m.sender_user_id === currentUserId} ))
      ))
      .catch(err => console.error('Error loading messages:', err));
  }, [conversationId]);

// Subcribe to new message
  useEffect(() => {
    const unsubscribe = subscribe(WS_EVENTS.NEW_MESSAGE, (data) => {
      console.log("you've got mail")
      // Only add if it's for this conversation
      if (data.message.conversation_id === conversationId) {
        setMessages(prev => [...prev, {
          ...data.message, 
          mine: data.message.sender_id === currentUserId
        }]);
        
        // Auto-scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    });
    
    return unsubscribe; // Cleanup on unmount
  }, [conversationId, subscribe]);

// Subcribing to typing indicator
useEffect(() => {
    const unsubscribe = subscribe(WS_EVENTS.USER_TYPING, (data) => {
      if (data.conversation_id == conversationId) {
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
  }, [conversationId, subscribe]);


// Send message
  const handleSend = () => {
    if (inputValue.trim() && isConnected) {
      sendMessage(conversationId, inputValue.trim());
      sendContextMessage(inputValue.trim(), conversationId, user.id)
      setInputValue('');
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };


  // Hnadle input change
    const handleInputChange = (e) => {
    setInputValue(e.target.value);
    
    // Send typing indicator
    if (isConnected) {
      sendTyping(conversationId);
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

  // Handle key press
    const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="page-container chat-page">
      <div className="chat-header">
        <div>
          <h2>{activeTrip.name}</h2>
          <p className="muted">Group chat • {activeTrip.start_date.split('T')[0]} - {activeTrip.end_date.split('T')[0]}</p>
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
      </div>

      <div className="message-input-container">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="message-input"
          disabled={!isConnected}
        />
        <button 
          onClick={handleSend} 
          className="send-button"
          disabled={!isConnected || !inputValue.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
