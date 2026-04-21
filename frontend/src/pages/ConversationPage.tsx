// Generative AI was used to develop this code
// src/pages/ConversationPage.tsx
import { useState, useEffect } from "react";
import { useMessage } from "../hooks/useMessage";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Conversation } from "../types/types";

export default function ConversationPage() {
    const { conversations = [] } = useMessage();
    const { user } = useAuth();

    const navigate = useNavigate();

    const handleConversationClick = (conversationId: number) => {
        console.log(`Clicked conversation ${conversationId}`);
        navigate(`/chat/${conversationId}`);

    };

    const getConversationName = (conv: Conversation): string => {
        if (conv.is_group) {
            const explicitName = conv.name?.trim();
            if (explicitName) return explicitName;

            const participantNames = (conv.users || [])
                .map((participant) => participant.username?.trim() || `User ${participant.id}`)
                .filter(Boolean);

            return participantNames.length > 0
                ? participantNames.join(", ")
                : `Conversation ${conv.id}`;
        }
        console.log(`current user ${user}`)
        const otherUser = conv.users.find((participant) => participant.id !== user?.id);
        return otherUser?.username ?? `Conversation ${conv.id}`;
    };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Messages</h2>
          <p className="page-subtitle">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
      {conversations.length === 0 ? (
        <div className="empty-state card"><div className="empty-state-icon">💬</div><p>No conversations yet.<br />Create a trip to start chatting.</p></div>
      ) : (
        <div className="conversation-list">
          {conversations.map((conv, i) => {
            const name = getConversationName(conv);
            return (
              <div key={i} className="conversation-card" onClick={() => navigate(`/chat/${conv.id}`)}>
                <div className="conversation-avatar">{name.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="conversation-name">{name}</div>
                  <div className="conversation-sub">{conv.is_group ? "Group chat" : "Direct message"} · #{conv.id}</div>
                </div>
                <span style={{ marginLeft:"auto", color:"var(--muted)", fontSize:"1.1rem" }}>›</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}