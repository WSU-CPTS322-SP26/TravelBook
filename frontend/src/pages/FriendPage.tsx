import React, { useState } from "react";
import { useFriend } from "../hooks/useFriend";
import { SuggestedFriend } from "../types/types";
import FriendsList from "../components/FriendsList";

export default function FriendPage() {
  const { friends = [], isLoadingFriends, addFriend, getSuggestedFriends } = useFriend();
  const suggestedFriendsQuery = getSuggestedFriends(5);
  const suggestedFriends = suggestedFriendsQuery?.data || [];
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(5);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      // Fetch next batch of suggestions
      getSuggestedFriends(offset + 5);
      setOffset(offset + 5);
    } catch {}
    finally { setLoadingMore(false); }
  };

  const handleAddFriend = async (userId: number) => {
    try {
      await addFriend(userId);
    } catch (error) {
      console.error("Failed to add friend:", error);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Friends</h1>
          <p className="page-subtitle">{friends.length} friend{friends.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="friends-section">
        <p className="section-label">Your Friends</p>
        {isLoadingFriends ? (
          <div><div className="skeleton skeleton-line full" /><div className="skeleton skeleton-line medium" /></div>
        ) : friends.length === 0 ? (
          <div className="empty-state card"><div className="empty-state-icon">👥</div><p>No friends yet.<br />Add some from the suggestions below!</p></div>
        ) : (
          <FriendsList friends={friends} />
        )}
      </div>

      <div className="suggestions-section">
        <p className="section-label">Suggested Friends</p>
        {suggestedFriends.length === 0 ? (
          <p className="text-muted" style={{ fontSize: "0.9rem" }}>No suggestions available.</p>
        ) : (
          <>
            <div className="suggestions-list">
              {suggestedFriends.map((s) => (
                <div key={s.id} className="suggestion-card">
                  <div className="suggestion-info">
                    <h3>{s.name}</h3>
                    <p className="suggestion-meta">{s.mutual} mutual friend{s.mutual !== 1 ? "s" : ""}</p>
                  </div>
                  <button className="btn-teal" onClick={() => handleAddFriend(s.id)}>+ Add</button>
                </div>
              ))}
            </div>
            <button className="btn-secondary mt-3" onClick={handleLoadMore} disabled={loadingMore} style={{ opacity: loadingMore ? 0.6 : 1 }}>
              {loadingMore ? "Loading…" : "Load More"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}