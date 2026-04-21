import React, { useState } from "react";
import { useFriend } from "../hooks/useFriend";
import { useMessage } from "../hooks/useMessage";
import { useAuth } from "../hooks/useAuth";
import { SuggestedFriend } from "../types/types";
import FriendsList from "../components/FriendsList";

export default function FriendPage() {
  const { friends, isLoadingFriends, suggestedFriends, isLoadingSuggestedFriends } = useFriend();
  const { conversations, isLoadingConversations, sendMessage, createConversation, addConversationParticipant } = useMessage();
  const { user } = useAuth();
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(5);
  const [sendingRequest, setSendingRequest] = useState<number | null>(null);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      // Fetch next batch of suggestions
      setOffset(offset + 5);
    } catch (error) {
      console.error("Failed to load more suggestions:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAddFriend = async (userId: number, friendName: string) => {
    if (!user) return;
    setSendingRequest(userId);
    try {
      // Find or create a DM conversation with the friend
      let conversationId: number | null = null;

      // Check if there's already a conversation with this friend
      if (conversations) {
        const existingConversation = conversations.find(
          (conv) =>
            !conv.is_group &&
            conv.users?.some((u) => u.id === userId)
        );
        if (existingConversation) {
          conversationId = existingConversation.id;
        }
      }

      // If no existing conversation, create one and add the friend
      if (!conversationId) {
        conversationId = await createConversation();
        // Add the friend as a participant to the newly created conversation
        await addConversationParticipant(conversationId, userId);
      }

      // Send the friend request message
      await sendMessage(
        `${user.name} is requesting to add you as a friend. [FRIEND_REQUEST_${userId}_${user.id}]`,
        conversationId,
        userId
      );
    } catch (error) {
      console.error("Failed to send friend request:", error);
    } finally {
      setSendingRequest(null);
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
        {isLoadingSuggestedFriends ? (
          <p>Loading suggestions...</p>
        ) : !suggestedFriends || suggestedFriends.length === 0 ? (
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
                    onClick={() => handleAddFriend(suggestion.id, suggestion.name)}
                    className="btn-primary"
                    disabled={sendingRequest === suggestion.id}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      opacity: sendingRequest === suggestion.id ? 0.6 : 1,
                    }}
                  >
                    {sendingRequest === suggestion.id ? "Sending..." : "Add"}
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