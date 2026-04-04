// src/pages/PlanTripPage.jsx
import React, { useState } from "react";
import { useTrip } from "../context/TripContext";
import { useMessage } from "../context/MessageContext";

export default function PlanTripPage({ onClose = null, onTripCreated = null }) {
  const [tripName, setTripName] = useState("");
  const [savedLocations, setSavedLocations] = useState([]);
  const { createTrip } = useTrip();
  const { createConversation } = useMessage();

  // Save trip
  function saveTrip() {
    if (!tripName ) return;

    /*
    class Trip(SQLModel, table=True):
      id: Optional[int] = Field(default=1, primary_key=True)
      name: str
      description: Optional[str] = None
      user_id: int = Field(foreign_key="user.id")
      conversation_id: Optional[int] = Field(default=1, foreign_key="conversation.id")
      conversation: Optional["Conversation"] = Relationship(back_populates="trip")
      events: List["Event"] = Relationship(back_populates="trip")
      albums: List["Album"] = Relationship(back_populates="trip")
  */

    const newTrip = {
      name: tripName,
      locations: savedLocations,
      createdAt: new Date().toISOString(),
    };
    
    createConversation().then((cId) => { 
      createTrip(tripName, cId, "");
      if (onTripCreated) onTripCreated(newTrip);
    });

    // Reset
    setTripName("");
    setSavedLocations([]);
    
    if (onClose) {
      onClose();
    }
  }

  // Delete a location from the trip plan
  function deleteLocation(index) {
    const updated = savedLocations.filter((_, i) => i !== index);
    setSavedLocations(updated);
  }

  return (
    <div className="modal-overlay" onClick={() => onClose && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Plan Your Trip</h2>
          <button className="modal-close" onClick={() => onClose && onClose()}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Trip Name Input */}
          <input
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="Trip name (e.g., Spring Break 2025)"
            className="text-input"
            style={{
              width: "100%",
              marginBottom: "12px",
            }}
          />

          {/* Saved Locations */}
          <h3>Saved Locations</h3>
          {savedLocations.length === 0 && <p>No saved locations yet.</p>}

          <ul style={{ listStyle: "none", padding: 0 }}>
            {savedLocations.map((loc, index) => (
              <li
                key={index}
                style={{
                  marginBottom: "10px",
                  padding: "10px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  {loc.name} — ({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})
                </span>

                <button
                  onClick={() => deleteLocation(index)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    background: "#d9534f",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>

          {/* Save Trip Button */}
          <button
            onClick={saveTrip}
            style={{
              marginTop: "20px",
              padding: "12px 18px",
              borderRadius: "8px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Save Trip
          </button>
        </div>

        <div className="modal-footer">
          <button
            onClick={() => onClose && onClose()}
            style={{
              padding: "10px 20px",
              borderRadius: "6px",
              background: "transparent",
              color: "#e5e7eb",
              border: "1px solid rgba(148, 163, 184, 0.7)",
              cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
