import { ConversationContext } from "./ConversationContext";

function ConversationProvider({children}){
    return (
        <ConversationContext.Provider value={{  }}>
          {children}
        </ConversationContext.Provider>
    );
}

export default ConversationProvider;