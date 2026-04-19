// src/pages/TripPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTrip } from "../context/TripContext";
import { useFriend } from "../context/FriendContext";
import { useMessage } from "../context/MessageContext";
import { Trip } from "../types/types";
import EditableField from "../components/EditableField";
import FriendsList from "../components/FriendsList";
import EventList from "../components/EventList";

export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const { getTrip, updateTrip } = useTrip();
  const { getName, friends, getFriends } = useFriend();
  const { getConversation, addConversationParticipant } = useMessage();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) { setError("No trip ID provided"); setLoading(false); return; }
      try { setTrip(await getTrip(Number(id))); }
      catch (err) { setError("Failed to load trip details"); }
      finally { setLoading(false); }
    };
    fetchTrip();
  }, [id, getTrip]);

  useEffect(() => {
    if (!trip) return;
    getName(trip.user_id).then(setCreatorName);
  }, [trip, getName]);

  useEffect(() => {
    if (!trip?.conversation_id) { setParticipants([]); return; }
    getConversation(trip.conversation_id)
      .then((conv) => setParticipants((conv.users || []).map((u: any) => ({ id: u.id, name: u.name || u.username || `User ${u.id}` }))))
      .catch(() => setParticipants([]));
  }, [trip, getConversation]);

  useEffect(() => {
    if (!trip) return;
    setTitleDraft(trip.name || "");
    setDescriptionDraft(trip.description || "");
    setStartDateDraft(trip.start_date ? trip.start_date.slice(0, 10) : "");
    setEndDateDraft(trip.end_date ? trip.end_date.slice(0, 10) : "");
  }, [trip]);

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Not set";

  const saveTitle = async () => {
    if (!trip || !titleDraft.trim()) return;
    setTrip(await updateTrip(trip.id, { name: titleDraft.trim() }));
    setIsEditingTitle(false);
  };
  const saveDescription = async () => {
    if (!trip) return;
    setTrip(await updateTrip(trip.id, { description: descriptionDraft.trim() || null }));
    setIsEditingDescription(false);
  };
  const saveDates = async () => {
    if (!trip) return;
    setTrip(await updateTrip(trip.id, { start_date: startDateDraft || null, end_date: endDateDraft || null }));
    setIsEditingDates(false);
  };
  const openParticipantsModal = async () => { try { await getFriends(); } catch {} setShowParticipantsModal(true); };
  const handleAddParticipant = async (friend: any) => {
    if (!trip?.conversation_id) return;
    setAddingParticipantId(friend.id);
    try {
      const updated = await addConversationParticipant(trip.conversation_id, friend.id);
      setParticipants((updated.users || []).map((u: any) => ({ id: u.id, name: u.name || u.username || `User ${u.id}` })));
    } catch {}
    finally { setAddingParticipantId(null); }
  };

  if (loading) return <div className="page-container"><div className="skeleton-line full mt-4" style={{ height: 40 }} /></div>;
  if (error || !trip) return (
    <div className="page-container">
      <div className="error-message">
        <p>{error || "Trip not found"}</p>
        <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <button className="btn-secondary" style={{ marginBottom: "var(--space-md)" }} onClick={() => navigate(-1)}>← Back</button>

      <div className="trip-detail-card">
        {/* Participants modal */}
        {showParticipantsModal && (
          <div className="modal-overlay" onClick={() => setShowParticipantsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Participants</h2>
                <button className="modal-close" onClick={() => setShowParticipantsModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {friends.length === 0
                  ? <p className="text-muted">No friends available to add yet.</p>
                  : <FriendsList friends={friends} actionLabel={addingParticipantId ? "Adding…" : "Add"} onAction={handleAddParticipant} disabledIds={participants.map((p) => p.id)} />
                }
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
            editContent={<input className="text-input inline-edit-input" value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} />}
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
            editContent={<><h3>Description</h3><textarea className="text-input inline-edit-input" rows={4} value={descriptionDraft} onChange={(e) => setDescriptionDraft(e.target.value)} placeholder="Add a description" /></>}
            viewContent={<><h3>Description</h3><p className="trip-description">{trip.description || "No description yet."}</p></>}
          />

          <div className="trip-info-grid">
            <EditableField
              className="trip-info-item"
              isEditing={isEditingDates}
              onToggleEdit={() => setIsEditingDates((v) => !v)}
              onSave={saveDates}
              onCancel={() => setIsEditingDates(false)}
              editContent={<><label>Start Date</label><input type="date" className="text-input inline-edit-input" value={startDateDraft} onChange={(e) => setStartDateDraft(e.target.value)} /><label>End Date</label><input type="date" className="text-input inline-edit-input" value={endDateDraft} onChange={(e) => setEndDateDraft(e.target.value)} /></>}
              viewContent={<><label>Trip Dates</label><p>Start: {formatDate(trip.start_date)}</p><p>End: {formatDate(trip.end_date)}</p></>}
            />
            <div className="trip-info-item"><label>Trip Creator</label><p>{creatorName}</p></div>
            <div className="trip-info-item">
              <div className="participants-header">
                <label>Participants</label>
                <button className="participants-add-btn" onClick={openParticipantsModal} disabled={!trip.conversation_id}>+</button>
              </div>
              {participants.length === 0
                ? <p className="text-muted" style={{ fontSize: "0.9rem" }}>No participants yet.</p>
                : <ul className="participants-list">{participants.map((p) => <li key={p.id} className="participant-pill">{p.name}</li>)}</ul>
              }
            </div>
          </div>

          <div className="event-list-wide"><EventList tripId={trip.id} /></div>
        </div>

        <div style={{ padding: "var(--space-sm) var(--space-md)" }}>
          <button className="btn-teal btn-full" style={{ borderRadius: "var(--radius-md)", padding: "clamp(0.6rem,1vw,0.85rem)" }}
            onClick={() => navigate(`/chat/${encodeURIComponent(String(trip.conversation_id))}`)}>
            💬 Open Group Chat
          </button>
        </div>
      </div>
    </div>
  );
}
