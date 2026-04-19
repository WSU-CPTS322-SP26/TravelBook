// src/pages/ChatPage.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import PollBox from "../components/PollBox";
import PollCreation from "../components/PollCreation";
import { useParams } from "react-router-dom";
import { useWebSocketContext } from "../context/WebSocketContext";
import { useNotifications } from "../context/NotificationContext";
import { WS_EVENTS } from "../services/constant";
import { useAuth } from "../context/AuthContext";
import { useMessage } from "../context/MessageContext";
import { MessageType } from "../types/types";
import AvatarStack from "../components/AvatarStack";

const MemoizedAvatarStack = React.memo(AvatarStack);

export default function ChatPage() {
  const { conversationId } = useParams();
  const conversationIdNum = Number(conversationId);
  const { user } = useAuth();
  const { getConversation, sendMessage: sendContextMessage } = useMessage();
  const [currentConversation, setCurrentConversation] = useState(null);

  const { sendMessage, sendTyping, subscribe, joinConversation, leaveConversation, updateVote, addPoll, isConnected } = useWebSocketContext();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [showPollCreation, setShowPollCreation] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUserId = user?.id;

  const { setActiveConversation } = useNotifications();

  useEffect(() => {
    setActiveConversation(conversationIdNum);
    return () => setActiveConversation(null);
  }, [conversationIdNum]);

  const MessageBoxType = (message) => {
    switch (message.type) {
      case MessageType.TEXT:
        return (
          <div className={`chat-bubble ${message.sender_user_id === currentUserId ? "mine" : "theirs"}`}>
            {message.content || message.text}
          </div>
        );
      case MessageType.POLL:
        return <PollBox poll={message} onVote={(option) => handleVote(message, option)} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!isConnected || !currentUserId) return;
    joinConversation(conversationIdNum);
    return () => { if (isConnected) leaveConversation(conversationIdNum); };
  }, [conversationIdNum, currentUserId, isConnected, joinConversation, leaveConversation]);

  useEffect(() => {
    if (!currentUserId) return;
    getConversation(conversationIdNum)
      .then((data) => {
        setCurrentConversation(data);
        const userMap = {};
        (data.users || []).forEach((u) => { userMap[u.id] = u.username; });
        const msgs = Array.isArray(data.messages) ? data.messages : [];
        setMessages(msgs.map((m) => ({ ...m, author: userMap[m.sender_user_id] ?? `User ${m.sender_user_id}` })));
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .catch((err) => console.error("Error loading messages:", err));
  }, [conversationIdNum, currentUserId]);

  useEffect(() => {
    const scroll = () => setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    const unsubMsg  = subscribe(WS_EVENTS.NEW_MESSAGE, (data) => {
      if (Number(data.message.conversation_id) !== conversationIdNum) return;
      setMessages((prev) => [...prev, { ...data.message }]); scroll();
    });
    const unsubPoll = subscribe(WS_EVENTS.ADD_POLL, (data) => {
      if (Number(data.message.conversation_id) !== conversationIdNum) return;
      setMessages((prev) => [...prev, { ...data.message }]); scroll();
    });
    return () => { unsubMsg(); unsubPoll(); };
  }, [conversationIdNum, currentUserId, subscribe]);

  useEffect(() => {
    const unsub = subscribe(WS_EVENTS.USER_TYPING, (data) => {
      if (Number(data.conversation_id) !== conversationIdNum) return;
      setTypingUsers((prev) => prev.includes(data.user_id) ? prev : [...prev, data.user_id]);
      setTimeout(() => setTypingUsers((prev) => prev.filter((id) => id !== data.user_id)), 3000);
    });
    return unsub;
  }, [conversationIdNum, subscribe]);

  const handleSend = () => {
    const text = inputMessage.trim();
    if (!text || !isConnected) return;
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    sendMessage(conversationIdNum, text);
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
    addPoll(conversationIdNum, poll.content, poll.meta_data);
    setShowPollCreation(false);
  };

  const handleVote = (pollMessage, selectedOption) => {
    const updatedMetaData = { ...pollMessage.meta_data };
    if (!updatedMetaData.options) updatedMetaData.options = {};
    Object.keys(updatedMetaData.options).forEach((opt) => {
      if (opt !== selectedOption) updatedMetaData.options[opt] = updatedMetaData.options[opt].filter((id) => id !== currentUserId);
    });
    if (!updatedMetaData.options[selectedOption]) updatedMetaData.options[selectedOption] = [];
    if (!updatedMetaData.options[selectedOption].includes(currentUserId)) updatedMetaData.options[selectedOption].push(currentUserId);
    updateVote(conversationIdNum, pollMessage.content, updatedMetaData);
  };

  const getConversationName = () => {
    if (!currentConversation) return `Conversation ${conversationIdNum}`;
    if (currentConversation.is_group) return currentConversation.name ?? `Conversation ${currentConversation.id}`;
    const other = (currentConversation.users || []).find((p) => p.id !== user.id);
    return other?.username ?? `Conversation ${currentConversation.id}`;
  };

  const userIds = useMemo(() => (currentConversation?.users || []).map((u) => u.id), [currentConversation?.users]);

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
          <h2 className="chat-title">{getConversationName()}</h2>
          <span className={`status-badge ${isConnected ? "connected" : "disconnected"}`}>
            {isConnected ? "Live" : "Offline"}
          </span>
        </div>
        <MemoizedAvatarStack userIds={userIds} />
      </div>

      <div className="chat-body">
        {messages.length === 0 && (
          <div style={{ textAlign: "center", margin: "auto", color: "var(--muted)", fontSize: "0.9rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>💬</div>
            No messages yet — say hello!
          </div>
        )}
        {messages.map((m, index) => (
          <div key={m.id ?? index} className={`chat-message-row ${m.sender_user_id === currentUserId ? "mine" : "theirs"}`}>
            {m.sender_user_id !== currentUserId && <div className="chat-author">{m.author}</div>}
            {MessageBoxType(m)}
          </div>
        ))}
        {typingUsers.length > 0 && (
          <div className="chat-message-row theirs">
            <div className="chat-bubble theirs" style={{ opacity: 0.6, fontStyle: "italic" }}>typing…</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input row */}
      <div className="chat-input-row">
        {/* Media button */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setShowMediaOptions(!showMediaOptions)}
            style={{
              width: "clamp(38px,3.2vw,50px)", height: "clamp(38px,3.2vw,50px)",
              borderRadius: "50%", background: "var(--border-mid)",
              border: "1px solid var(--border-mid)", color: "var(--cream-dim)",
              fontSize: "1.3rem", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all var(--t) var(--ease)",
            }}
          >
            +
          </button>
          {showMediaOptions && (
            <div style={{
              position: "absolute", bottom: "calc(100% + 8px)", left: 0,
              background: "var(--navy-card)", border: "1px solid var(--border-mid)",
              borderRadius: "var(--radius-md)", overflow: "hidden",
              boxShadow: "var(--shadow-md)", minWidth: "130px",
              animation: "slideDown 0.15s var(--ease)",
            }}>
              {["image", "video", "file", "poll"].map((type) => (
                <button key={type} onClick={() => handleAddMedia(type)} style={{
                  display: "block", width: "100%", padding: "0.6rem 1rem", textAlign: "left",
                  background: "transparent", border: "none", color: "var(--cream-dim)",
                  fontSize: "0.9rem", fontFamily: "var(--font-body)",
                  borderBottom: "1px solid var(--border)", cursor: "pointer",
                  transition: "background var(--t) var(--ease)",
                }}
                  onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.07)"}
                  onMouseLeave={(e) => e.target.style.background = "transparent"}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          className="chat-input"
          value={inputMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isConnected ? "Type a message…" : "Connecting…"}
          disabled={!isConnected}
        />

        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!isConnected || !inputMessage.trim()}
          aria-label="Send"
        >
          ➤
        </button>
      </div>

      {/* Poll creation modal */}
      {showPollCreation && (
        <div className="modal-overlay" onClick={() => setShowPollCreation(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Poll</h2>
              <button className="modal-close" onClick={() => setShowPollCreation(false)}>×</button>
            </div>
            <div className="modal-body">
              <PollCreation onCreate={handlePollCreate} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
