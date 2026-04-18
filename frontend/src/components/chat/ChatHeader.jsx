import React from "react";
import AvatarStack from "../AvatarStack";

const MemoizedAvatarStack = React.memo(AvatarStack);

export default function ChatHeader({ conversationName, userIds }) {
  return (
    <div className="chat-header">
      <div>{conversationName}</div>
      <MemoizedAvatarStack userIds={userIds} />
    </div>
  );
}
