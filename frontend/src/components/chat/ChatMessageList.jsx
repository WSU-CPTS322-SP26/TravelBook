import React from "react";
import PollBox from "../PollBox";
import { MessageType } from "../../types/types";

const renderMessageBody = (message, currentUserId, onVote) => {
  switch (message.type) {
    case MessageType.TEXT:
      return (
        <div className={`chat-bubble ${message.sender_user_id === currentUserId ? "mine" : "theirs"}`}>
          {message.content || message.text}
        </div>
      );

    case MessageType.POLL:
      return <PollBox poll={message} onVote={(option) => onVote(message, option)} />;

    default:
      return null;
  }
};

export default function ChatMessageList({ messages, currentUserId, onVote, messagesEndRef }) {
  return (
    <div className="chat-body">
      {messages.map((m, index) => (
        <div
          key={m.id ?? index}
          className={`chat-message-row ${m.sender_user_id === currentUserId ? "mine" : "theirs"}`}
        >
          {m.sender_user_id !== currentUserId && <div className="chat-author">{m.author}</div>}
          {renderMessageBody(m, currentUserId, onVote)}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
