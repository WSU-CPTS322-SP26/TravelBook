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
    return (
        <MessageContext.Provider value={{activeConversation, setActiveConversation, createConversation, sendMessage, getConversation, getConversations, addConversationParticipant}}>
          {children}
        </MessageContext.Provider>
    );
}

export default MessageProvider;