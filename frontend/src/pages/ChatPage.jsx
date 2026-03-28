// src/pages/ChatPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWebSocketContext } from "../context/WebSocketContext";
import { WS_EVENTS } from "../services/constant";
import { useAuth } from "../context/AuthContext";
import { useMessage } from "../context/MessageContext";

export default function ChatPage() {
  const { conversationId } = useParams();
  const conversationIdNum = Number(conversationId);
  const { user } = useAuth();
  const { getConversation, sendMessage: sendContextMessage } = useMessage();
  const [currentConversation, setCurrentConversation] = useState(null);

  const {
    sendMessage,
    sendTyping,
    subscribe,
    joinConversation,
    leaveConversation,
    isConnected,
  } = useWebSocketContext();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUserId = user?.id;

  useEffect(() => {
    joinConversation(conversationIdNum);
    return () => leaveConversation(conversationIdNum);
  }, [conversationIdNum, joinConversation, leaveConversation]);

  useEffect(() => {
    if (!currentUserId) return;
    getConversation(conversationIdNum)
      .then((data) => {
        setCurrentConversation(data);
        const userMap = {};
        (data.users || []).forEach((u) => { userMap[u.id] = u.username; });
        const msgs = Array.isArray(data.messages) ? data.messages : [];
        setMessages(
          msgs.map((m) => ({
            ...m,
            mine: m.sender_user_id === currentUserId,
            author: userMap[m.sender_user_id] ?? `User ${m.sender_user_id}`,
          }))
        );
        setTimeout(
          () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          100
        );
      })
      .catch((err) => console.error("Error loading messages:", err));
  }, [conversationIdNum, currentUserId]);

  useEffect(() => {
    const unsub = subscribe(WS_EVENTS.NEW_MESSAGE, (data) => {
      const msg = data.message;
      if (Number(msg.conversation_id) !== conversationIdNum) return;
      const mine = (msg.sender_user_id ?? msg.sender_id) === currentUserId;
      if (mine) return;
      setMessages((prev) => [...prev, { ...msg, mine }]);
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    });
    return unsub;
  }, [conversationIdNum, currentUserId, subscribe]);

  useEffect(() => {
    const unsub = subscribe(WS_EVENTS.USER_TYPING, (data) => {
      if (Number(data.conversation_id) === conversationIdNum) {
        setTypingUsers((prev) =>
          prev.includes(data.user_id) ? prev : [...prev, data.user_id]
        );
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((id) => id !== data.user_id));
        }, 3000);
      }
    });
    return unsub;
  }, [conversationIdNum, subscribe]);

  const handleSend = () => {
    const text = inputMessage.trim();
    if (!text || !isConnected) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        conversation_id: conversationIdNum,
        sender_user_id: currentUserId,
        content: text,
        mine: true,
      },
    ]);
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getConversationName = () => {
    if (!currentConversation) return `Conversation ${conversationIdNum}`;
    if (currentConversation.is_group) {
      return currentConversation.name ?? `Conversation ${currentConversation.id}`;
    }
    const otherUser = (currentConversation.users || []).find(
      (p) => p.id !== user.id
    );
    return otherUser?.username ?? `Conversation ${currentConversation.id}`;
  };

  const avatarColors = ["avatar-amber", "avatar-teal", "avatar-rose", ""];

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h2 className="chat-title">{getConversationName()}</h2>
        <span className={`status-badge ${isConnected ? "connected" : "disconnected"}`}>
          {isConnected ? "Live" : "Offline"}
        </span>
        <div className="avatar-stack">
          {["A", "S", "E", "M"].map((letter, i) => (
            <div key={i} className={`avatar-circle ${avatarColors[i]}`}>
              {letter}
            </div>
          ))}
        </div>
      </div>

      <div className="chat-body">
        {messages.length === 0 && (
          <div style={{ textAlign: "center", margin: "auto", color: "var(--muted)", fontSize: "0.85rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💬</div>
            No messages yet. Say hello!
          </div>
        )}
        {messages.map((m, index) => (
          <div
            key={m.id ?? index}
            className={`chat-message-row ${m.mine ? "mine" : "theirs"}`}
          >
            {!m.mine && <div className="chat-author">{m.author}</div>}
            <div className={`chat-bubble ${m.mine ? "mine" : "theirs"}`}>
              {m.content || m.text}
            </div>
          </div>
        ))}
        {typingUsers.length > 0 && (
          <div className="chat-message-row theirs">
            <div className="chat-bubble theirs" style={{ opacity: 0.6, fontStyle: "italic" }}>
              typing…
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-row">
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
    </div>
  );
}
