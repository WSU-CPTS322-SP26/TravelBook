// src/components/TripCreation.jsx
import React, { useState } from "react";
import { useTrip } from "../hooks/useTrip";
import { useMessage } from "../hooks/useMessage";

export default function TripCreation({ onClose = null, onTripCreated = null }) {
  const [tripName, setTripName] = useState("");
  const [saving, setSaving] = useState(false);
  const { createTrip } = useTrip();
  const { createConversation } = useMessage();

  async function saveTrip() {
    if (!tripName.trim()) return;
    setSaving(true);
    const newTrip = { name: tripName, locations: [], createdAt: new Date().toISOString() };
    const cId = await createConversation();
    await createTrip(tripName, cId, "");
    if (onTripCreated) onTripCreated(newTrip);
    setTripName("");
    setSaving(false);
    if (onClose) onClose();
  }

  return (
    <div className="modal-overlay" onClick={() => onClose && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Plan a New Trip</h2>
          <button className="modal-close" onClick={() => onClose && onClose()}>×</button>
        </div>

        <div className="modal-body">
          <div className="field-group" style={{ marginBottom: "var(--space-md)" }}>
            <label className="field-label">Trip Name</label>
            <input
              className="text-input"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="e.g. Spring Break Europe 🌍"
              onKeyDown={(e) => e.key === "Enter" && saveTrip()}
              autoFocus
            />
          </div>

          <button
            className="btn-primary btn-full"
            style={{ borderRadius: "var(--radius-md)", padding: "clamp(0.65rem,1vw,0.9rem)" }}
            onClick={saveTrip}
            disabled={saving || !tripName.trim()}
          >
            {saving ? "Creating…" : "✓ Create Trip"}
          </button>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => onClose && onClose()}>Cancel</button>
        </div>
      </div>
    </div>
  );
}