import React, { useState } from "react";
import { useFriend } from "../hooks/useFriend";
import { SuggestedFriend } from "../types/types";
import FriendsList from "../components/FriendsList";

export default function FriendPage() {
  const { friends, isLoadingFriends, addFriend, getSuggestedFriends } = useFriend();
  const suggestedQuery = getSuggestedFriends(5);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(5);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      // Fetch next batch of suggestions
      getSuggestedFriends(offset + 5);
      setOffset(offset + 5);
    } catch (error) {
      console.error("Failed to load more suggestions:", error);
    } finally {
      setLoadingMore(false);
    }
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
      <h1>Friends</h1>

      {/* Friends List Section */}
      <div className="friends-section">
        <h2>Your Friends ({friends?.length || 0})</h2>

        {isLoadingFriends ? (
          <p>Loading friends...</p>
        ) : !friends || friends.length === 0 ? (
          <p>You haven't added any friends yet.</p>
        ) : (
          <FriendsList friends={friends} />
        )}
      </div>

      {/* Suggestions Section */}
      <div className="suggestions-section">
        <h2>Suggested Friends</h2>
        {suggestedQuery.isLoading ? (
          <p>Loading suggestions...</p>
        ) : !suggestedQuery.data || suggestedQuery.data.length === 0 ? (
          <p>No suggestions available.</p>
        ) : (
          <>
            <div className="suggestions-list">
              {suggestedQuery.data.map((suggestion) => (
                <div key={suggestion.id} className="suggestion-card">
                  <div className="suggestion-info">
                    <h3>{suggestion.name}</h3>
                    <p className="suggestion-meta">{suggestion.mutual} mutual friends</p>
                  </div>
                  <button
                    onClick={() => handleAddFriend(suggestion.id)}
                    className="btn-primary"
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                    }}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="btn-secondary"
              style={{
                marginTop: "16px",
                padding: "10px 16px",
                borderRadius: "6px",
                cursor: loadingMore ? "not-allowed" : "pointer",
                opacity: loadingMore ? 0.6 : 1,
              }}
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}