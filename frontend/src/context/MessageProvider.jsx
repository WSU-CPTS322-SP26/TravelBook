import { MessageContext } from "./MessageContext";
import { useState } from "react";
import api from "../api";

function MessageProvider({children}){
    const [activeConversation, setActiveConversation] = useState(null); // TODO: initialize proper
    

    const sendMessage = async(msgContent, conversationId, reciever) => {
        const res = await api.post("/messages/send", {conversation_id:conversationId, content:msgContent, receiver_user_id:reciever}); // TODO: who is the reciever in a group chat
        return res.data;
    }

    const createConversation = async() => {
        let conversation = await api.post("/messages/conversation", {}).then( (res)=>{ return res.data;} );
        return conversation.id;
    }
        
    const getConversation = async(conversationId) => {
        console.log(`passing ${conversationId}`);
        return await api.get(`/messages/conversation/${conversationId}`)
    }
    return (
        <MessageContext.Provider value={{activeConversation, setActiveConversation, createConversation, sendMessage, getConversation}}>
          {children}
        </MessageContext.Provider>
    );
}

export default MessageProvider;