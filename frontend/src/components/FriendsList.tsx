import React from "react";
import { Friend } from "../types/types";

interface FriendsListProps {
  friends: Friend[];
  actionLabel?: string;
  onAction?: (friend: Friend) => void;
  disabledIds?: number[];
}

export default function FriendsList({
  friends,
  actionLabel = "Message",
  onAction,
  disabledIds = [],
}: FriendsListProps) {
  return (
    <div className="friends-list">
      {friends.map((friend) => (
        <div key={friend.id} className="friend-card">
          <div className="friend-info">
            <h3>{friend.name || friend.username || `User ${friend.id}`}</h3>
          </div>
          <button
            onClick={() => onAction && onAction(friend)}
            disabled={disabledIds.includes(friend.id)}
            className="btn-secondary"
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "0.85rem",
              opacity: disabledIds.includes(friend.id) ? 0.55 : 1,
            }}
          >
            {disabledIds.includes(friend.id) ? "Added" : actionLabel}
          </button>
        </div>
      ))}
    </div>
  );
}
