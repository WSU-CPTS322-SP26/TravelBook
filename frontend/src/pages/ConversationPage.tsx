import { useState, useEffect } from "react";
import { useMessage } from "../context/MessageContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Conversation } from "../types/types";

export default function ConversationPage() {
    const { getConversations } = useMessage();
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);

    let navigate = useNavigate();

    useEffect(() => {
        const fetchConversations = async () => {
            const convs = await getConversations();
            setConversations(convs);
        };
        fetchConversations();
    }, []);

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
        <>
        <div className="page-container conversation-page">
        <ul style={{ listStyle: "none", padding: 0 }}>
            {conversations.map((conv, index) =>
                <li key={index}
            style={{
              marginBottom: "12px",
              padding: "12px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            >
                <div 
                    onClick={() => handleConversationClick(conv.id)}
                >
                    <strong>{getConversationName(conv)}</strong>
                </div>
            </li>
            )}
        </ul>
        </div>
        </>
    )
}