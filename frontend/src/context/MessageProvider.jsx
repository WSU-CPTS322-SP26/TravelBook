import { MessageContext } from "./MessageContext";
import { useState } from "react";
import api from "../api";

function MessageProvider({children}){
    const [_activeConversation, setActiveConversation] = useState(null); // TODO: initialize proper
    
    /* @router.post("/send")
    def send_message(message: Message,
        db: Session = Depends(get_session), 
        current_user: User = Depends(get_current_user)):*/
    const sendMessage = async(msgContent, conversationId, reciever) => {
        api.post("/messages/send", {conversation_id:conversationId, content:msgContent, receiver_user_id:reciever}); // TODO: who is the reciever in a group chat

    }
    /* @router.post("/conversation")
        def create_conversation(conversation: Conversation,
        db: Session = Depends(get_session), 
        current_user: User = Depends(get_current_user)): */
    const createConversation = async() => {
        let conversation = await api.post("/messages/conversation", {}).then( (res)=>{ return res.data;} );
        return conversation.id;
    }
        
    /* @router.get("/conversation/{conversation_id}", response_model=List[Message])
    def get_conversation(conversation_id: int,
        db: Session = Depends(get_session), 
        current_user: User = Depends(get_current_user)): */
    const getConversation = async(conversationId) => {
        console.log(`passing ${conversationId}`);
        return await api.get(`/messages/conversation/${conversationId}`)
    }
    return (
        <MessageContext.Provider value={{setActiveConversation, createConversation, sendMessage, getConversation}}>
          {children}
        </MessageContext.Provider>
    );
}

export default MessageProvider;