import { useCallback, useState, useEffect } from "react";
import { useWebSocketContext } from "../context/WebSocketContext";
import { WS_EVENTS } from "../services/constant";

const normalizeIncomingMessage = (rawMessage = {}) => ({
  ...rawMessage,
  sender_user_id: rawMessage.sender_user_id ?? rawMessage.sender_id,
});

export const useChatSocket = () => {
  const {
    isConnected,
    subscribe,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    addPoll,
    updateVote,
  } = useWebSocketContext();

  const joinConversationRoom = useCallback(
    (conversationId) => {
      joinConversation(conversationId);
    },
    [joinConversation]
  );

  const leaveConversationRoom = useCallback(
    (conversationId) => {
      leaveConversation(conversationId);
    },
    [leaveConversation]
  );

  const sendTextMessage = useCallback(
    (conversationId, text) => {
      sendMessage(conversationId, text);
    },
    [sendMessage]
  );

  const sendTypingIndicator = useCallback(
    (conversationId) => {
      sendTyping(conversationId);
    },
    [sendTyping]
  );

  const createPoll = useCallback(
    (conversationId, content, metaData) => {
      addPoll(conversationId, content, metaData);
    },
    [addPoll]
  );

  const votePoll = useCallback(
    (conversationId, content, metaData) => {
      updateVote(conversationId, content, metaData);
    },
    [updateVote]
  );

  const onNewMessage = useCallback(
    (handler) =>
      subscribe(WS_EVENTS.NEW_MESSAGE, (data) => {
        handler(normalizeIncomingMessage(data?.message));
      }),
    [subscribe]
  );

  const onNewPoll = useCallback(
    (handler) =>
      subscribe(WS_EVENTS.ADD_POLL, (data) => {
        handler(normalizeIncomingMessage(data?.message));
      }),
    [subscribe]
  );

  const useTypingUsers = (conversationId) => {
    const [typingUsers, setTypingUsers] = useState([]);

    useEffect(() => {
      const unsubscribe = subscribe(WS_EVENTS.USER_TYPING, (data) => {
        if (Number(data.conversation_id) === conversationId) {
          setTypingUsers((prev) => {
            if (!prev.includes(data.user_id)) {
              return [...prev, data.user_id];
            }
            return prev;
          });

          // Auto-remove after 3 seconds
          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((id) => id !== data.user_id));
          }, 3000);
        }
      });

      return unsubscribe;
    }, [conversationId, subscribe]);

    return typingUsers;
  };

  return {
    isConnected,
    joinConversationRoom,
    leaveConversationRoom,
    sendTextMessage,
    sendTypingIndicator,
    createPoll,
    votePoll,
    onNewMessage,
    onNewPoll,
    useTypingUsers,
  };
};
