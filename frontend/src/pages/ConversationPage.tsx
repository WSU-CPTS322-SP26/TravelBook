import { useState, useEffect } from "react";
import { useMessage } from "../context/MessageContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Conversation } from "../types/types";

export default function ConversationPage() {
  const { getConversations } = useMessage();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      const convs = await getConversations();
      setConversations(convs);
    };
    fetchConversations();
  }, []);

  const handleConversationClick = (conversationId: number) => {
    navigate(`/chat/${conversationId}`);
  };

  const getConversationName = (conv: Conversation): string => {
    if (conv.is_group) {
      return conv.name ?? `Conversation ${conv.id}`;
    }
    const otherUser = conv.users.find((p) => p.id !== user?.id);
    return otherUser?.username ?? `Conversation ${conv.id}`;
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Messages</h2>
          <p className="page-subtitle">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">💬</div>
          <p>No conversations yet.<br />Create a trip to start chatting with your group.</p>
        </div>
      ) : (
        <div className="conversation-list">
          {conversations.map((conv, index) => {
            const name = getConversationName(conv);
            return (
              <div
                key={index}
                className="conversation-card"
                onClick={() => handleConversationClick(conv.id)}
              >
                <div className="conversation-avatar">
                  {getInitial(name)}
                </div>
                <div>
                  <div className="conversation-name">{name}</div>
                  <div className="conversation-sub">
                    {conv.is_group ? "Group chat" : "Direct message"} · #{conv.id}
                  </div>
                </div>
                <span style={{ marginLeft: "auto", color: "var(--muted)", fontSize: "1rem" }}>›</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
