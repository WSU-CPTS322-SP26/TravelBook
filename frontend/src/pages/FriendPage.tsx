import React, { useEffect, useState } from "react";
import { useFriend } from "../context/FriendContext";
import { SuggestedFriend } from "../types/types";

export default function FriendPage() {
  const { friends, getFriends, addFriend, getSuggestedFriends } = useFriend();
  const [loading, setLoading] = useState(true);
  const [suggestedFriends, setSuggestedFriends] = useState<SuggestedFriend[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        await getFriends();
        // Load initial 5 suggestions
        const suggestions = await getSuggestedFriends(5);
        setSuggestedFriends(suggestions);
        setOffset(5);
      } catch (error) {
        console.error("Failed to fetch friends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      // Fetch the next 5 suggestions (but we need to get all then slice)
      const allSuggestions = await getSuggestedFriends(offset + 5);
      setSuggestedFriends(allSuggestions);
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
      // Remove from suggested after adding
      setSuggestedFriends(suggestedFriends.filter(s => s.id !== userId));
    } catch (error) {
      console.error("Failed to add friend:", error);
    }
  };

  return (
    <div className="page-container">
      <h1>Friends</h1>

      {/* Friends List Section */}
      <div className="friends-section">
        <h2>Your Friends ({friends.length})</h2>

        {loading ? (
          <p>Loading friends...</p>
        ) : friends.length === 0 ? (
          <p>You haven't added any friends yet.</p>
        ) : (
          <div className="friends-list">
            {friends.map((friend) => (
              <div key={friend.id} className="friend-card">
                <div className="friend-info">
                  <h3>{friend.username || `User ${friend.id}`}</h3>
                </div>
                <button
                  className="btn-secondary"
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                  }}
                >
                  Message
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions Section */}
      <div className="suggestions-section">
        <h2>Suggested Friends</h2>
        {suggestedFriends.length === 0 ? (
          <p>No suggestions available.</p>
        ) : (
          <>
            <div className="suggestions-list">
              {suggestedFriends.map((suggestion) => (
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