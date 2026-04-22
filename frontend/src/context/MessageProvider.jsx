import { MessageContext } from "./MessageContext";
import { useState } from "react";
import api from "../api";

export function MessageProvider({children}){
    const [activeConversation, setActiveConversation] = useState(null); // TODO: initialize proper
    

    const sendMessage = async(msgContent, conversationId, reciever) => {
        const res = await api.post("/messages/send", {conversation_id:conversationId, content:msgContent, receiver_user_id:reciever}); // TODO: who is the reciever in a group chat
        return res.data;
    }

    const createConversation = async() => {
        let conversation = await api.post("/messages/conversations", {}).then( (res)=>{ return res.data;} );
        return conversation.id;
    }

    const getConversations = async() => {
        let res = await api.get("/messages/conversations");
        return res.data;
    }
        
    const getConversation = async(conversationId) => {
        let res = await api.get(`/messages/conversations/${conversationId}`);
        return res.data;
    }

    const addConversationParticipant = async (conversationId, userId) => {
        let res = await api.post(`/messages/conversations/${conversationId}/participants/${userId}`);
        return res.data;
    }

    const resolveAuthor = (message, conversationUsers) => {
        const senderId = message?.sender_user_id ?? message?.sender_id;
        const userMap = {};
        (conversationUsers || []).forEach((u) => {
            userMap[u.id] = u.username;
        });
        const mappedAuthor = userMap[senderId];
        const incomingAuthor = message?.author;
        const isGenericIncoming =
            typeof incomingAuthor === "string" && /^User\s+\d+$/i.test(incomingAuthor.trim());

        return mappedAuthor ?? (!isGenericIncoming ? incomingAuthor : undefined) ?? `User ${senderId}`;
    };

    const getConversationName = (conversation, currentUser) => {
        if (!conversation) return `Conversation ${conversation?.id}`;
        if (conversation.is_group) {
            const explicitName = conversation.name?.trim();
            if (explicitName) return explicitName;

            const participantNames = (conversation.users || [])
                .map((participant) => participant.username?.trim() || `User ${participant.id}`)
                .filter(Boolean);

            return participantNames.length > 0
                ? participantNames.join(", ")
                : `Conversation ${conversation.id}`;
        }
        const otherUser = (conversation.users || []).find((participant) => participant.id !== currentUser?.id);
        return otherUser?.username ?? `Conversation ${conversation.id}`;
    };

    return (
        <MessageContext.Provider value={{activeConversation, setActiveConversation, createConversation, sendMessage, getConversation, getConversations, addConversationParticipant, resolveAuthor, getConversationName}}>
          {children}
        </MessageContext.Provider>
    );
}

export default MessageProvider;