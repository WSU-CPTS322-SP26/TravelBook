import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTrip } from "../hooks/useTrip";
import { useFriend } from "../hooks/useFriend";
import { useMessage } from "../hooks/useMessage";
import { Trip } from "../types/types";
import EditableField from "../components/EditableField";
import FriendsList from "../components/FriendsList";
import EventList from "../components/EventList";

export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = Number(id);
  const { getTrip, updateTrip } = useTrip();
  const tripQuery = getTrip(tripId);
  const { getName, friends } = useFriend();
  const { getConversation, addConversationParticipant } = useMessage();
  const navigate = useNavigate();
  const [creatorName, setCreatorName] = useState("Unknown User");
  const [participants, setParticipants] = useState<Array<{ id: number; name: string }>>([]);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [addingParticipantId, setAddingParticipantId] = useState<number | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [startDateDraft, setStartDateDraft] = useState("");
  const [endDateDraft, setEndDateDraft] = useState("");

  const trip = tripQuery.data;
  const isLoading = tripQuery.isLoading;
  const error = tripQuery.error;
  const creatorNameQuery = trip ? getName(trip.user_id) : null;
  const conversationQuery = trip?.conversation_id ? getConversation(trip.conversation_id) : null;

  useEffect(() => {
    if (creatorNameQuery?.data) {
      setCreatorName(creatorNameQuery.data);
    }
  }, [creatorNameQuery?.data]);

  useEffect(() => {
    if (!conversationQuery?.data?.users) {
      setParticipants([]);
      return;
    }

    const conversation = conversationQuery.data;
    const users = (conversation.users || []).map((user: any) => {
      return {
        id: user.id,
        name: user.name || user.username || `User ${user.id}`,
      };
    });
    setParticipants(users);
  }, [conversationQuery?.data]);

  useEffect(() => {
    if (!trip) return;
    setTitleDraft(trip.name || "");
    setDescriptionDraft(trip.description || "");
    setStartDateDraft(trip.start_date ? trip.start_date.slice(0, 10) : "");
    setEndDateDraft(trip.end_date ? trip.end_date.slice(0, 10) : "");
  }, [trip]);

  if (isLoading) {
    return (
      <div className="page-container">
        <p>Loading trip details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          <p>Error loading trip: {error.message}</p>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary"
            style={{ marginTop: "1rem" }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="page-container">
        <div className="error-message">
          <p>Trip not found</p>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary"
            style={{ marginTop: "1rem" }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const saveTitle = async () => {
    if (!trip || !titleDraft.trim()) return;
    try {
      await updateTrip(trip.id, { name: titleDraft.trim() });
      setIsEditingTitle(false);
    } catch (err) {
      console.error("Error updating title:", err);
    }
  };

  const saveDescription = async () => {
    if (!trip) return;
    try {
      await updateTrip(trip.id, {
        description: descriptionDraft.trim() ? descriptionDraft.trim() : null,
      });
      setIsEditingDescription(false);
    } catch (err) {
      console.error("Error updating description:", err);
    }
  };

  const saveDates = async () => {
    if (!trip) return;
    try {
      await updateTrip(trip.id, {
        start_date: startDateDraft || null,
        end_date: endDateDraft || null,
      });
      setIsEditingDates(false);
    } catch (err) {
      console.error("Error updating dates:", err);
    }
  };

  const openParticipantsModal = async () => {
    // Friends are automatically loaded by the useFriend hook
    setShowParticipantsModal(true);
  };

  const handleAddParticipant = async (friend: any) => {
    if (!trip?.conversation_id) return;
    setAddingParticipantId(friend.id);
    try {
      const updatedConversation = await addConversationParticipant(trip.conversation_id, friend.id);
      const users = (updatedConversation.users || []).map((user: any) => ({
        id: user.id,
        name: user.name || user.username || `User ${user.id}`,
      }));
      setParticipants(users);
    } catch (err) {
      console.error("Error adding participant:", err);
    } finally {
      setAddingParticipantId(null);
    }
  };

  return (
    <div className="page-container">
      <button
        onClick={() => navigate(-1)}
        className="btn-secondary"
        style={{ marginBottom: "1.5rem" }}
      >
        ← Back
      </button>

      <div className="trip-detail-card">
        {showParticipantsModal && (
          <div className="modal-overlay" onClick={() => setShowParticipantsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Participants</h2>
                <button className="modal-close" onClick={() => setShowParticipantsModal(false)}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                {!friends || friends.length === 0 ? (
                  <p>No friends available to add yet.</p>
                ) : (
                  <FriendsList
                    friends={friends}
                    actionLabel={addingParticipantId ? "Adding..." : "Add"}
                    onAction={handleAddParticipant}
                    disabledIds={participants.map((p) => p.id)}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        <div className="trip-detail-header">
          <EditableField
            className="header-editable-field"
            isEditing={isEditingTitle}
            onToggleEdit={() => setIsEditingTitle((v) => !v)}
            onSave={saveTitle}
            onCancel={() => setIsEditingTitle(false)}
            editContent={
              <input
                className="text-input inline-edit-input"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
              />
            }
            viewContent={<h1>{trip.name}</h1>}
          />
        </div>

        <div className="trip-detail-content">
          <EditableField
            className="trip-section"
            isEditing={isEditingDescription}
            onToggleEdit={() => setIsEditingDescription((v) => !v)}
            onSave={saveDescription}
            onCancel={() => setIsEditingDescription(false)}
            editContent={
              <>
                <h3>Description</h3>
                <textarea
                  className="text-input inline-edit-input"
                  rows={4}
                  value={descriptionDraft}
                  onChange={(e) => setDescriptionDraft(e.target.value)}
                  placeholder="Add a description"
                />
              </>
            }
            viewContent={
              <>
                <h3>Description</h3>
                <p className="trip-description">{trip.description || "No description yet."}</p>
              </>
            }
          />

          <div className="trip-info-grid">
            <EditableField
              className="trip-info-item"
              isEditing={isEditingDates}
              onToggleEdit={() => setIsEditingDates((v) => !v)}
              onSave={saveDates}
              onCancel={() => setIsEditingDates(false)}
              editContent={
                <>
                  <label>Start Date</label>
                  <input
                    type="date"
                    className="text-input inline-edit-input"
                    value={startDateDraft}
                    onChange={(e) => setStartDateDraft(e.target.value)}
                  />
                  <label>End Date</label>
                  <input
                    type="date"
                    className="text-input inline-edit-input"
                    value={endDateDraft}
                    onChange={(e) => setEndDateDraft(e.target.value)}
                  />
                </>
              }
              viewContent={
                <>
                  <label>Trip Dates</label>
                  <p>Start: {formatDate(trip.start_date)}</p>
                  <p>End: {formatDate(trip.end_date)}</p>
                </>
              }
            />

            <div className="trip-info-item">
              <label>Trip Creator</label>
              <p>{creatorName}</p>
            </div>

            <div className="trip-info-item">
              <div className="participants-header">
                <label>Participants</label>
                <button
                  className="participants-add-btn"
                  onClick={openParticipantsModal}
                  disabled={!trip.conversation_id}
                >
                  +
                </button>
              </div>
              {participants.length === 0 ? (
                <p>No participants</p>
              ) : (
                <ul className="participants-list">
                  {participants.map((participant) => (
                    <li key={participant.id} className="participant-pill">
                      {participant.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="event-list-wide">
            <EventList tripId={trip.id} />
          </div>
        </div>

        {/* Open Chat Button */}
        <button
          onClick={() => navigate(`/chat/${encodeURIComponent(trip.name)}`)}
          style={{
            marginTop: "10px",
            padding: "10px 16px",
            borderRadius: "8px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Open Group Chat
        </button>
      </div>
    </div>
  );
}