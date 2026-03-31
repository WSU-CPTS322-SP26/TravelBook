// src/pages/PlanTripPage.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import generateId from "../generateId";
import { useTrip } from "../context/TripContext";
import { useMessage } from "../context/MessageContext";
import { useEvent } from "../context/EventContext"

export default function PlanTripPage() {
  const [tripName, setTripName] = useState("");
  const [savedLocations, setSavedLocations] = useState([]);
  const [savedTrips, setSavedTrips] = useState([]);
  const { createTrip, activeTrip, setActiveTrip } = useTrip();
  const { createConversation } = useMessage();
  const { getEventsByTrip } = useEvent();


  // Load saved locations from localStorage (optional)
  useEffect(() => {
    const fn = async () => {
      setSavedLocations( await getEventsByTrip(activeTrip.id) );
    };

    if( activeTrip) fn();
  }, [activeTrip]);

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
    
    setSavedTrips((prev) => [...prev, newTrip]);
    createConversation().then( (cId) => { createTrip(tripName, cId, "") } );


    // Optional: persist trips
    localStorage.setItem(
      "savedTrips",
      JSON.stringify([...savedTrips, newTrip])
    );

    // Reset
    setTripName("");
  }

  // Delete a location from the trip plan
  function deleteLocation(index) {
    const updated = savedLocations.filter((_, i) => i !== index);
    setSavedLocations(updated);
    localStorage.setItem("savedLocations", JSON.stringify(updated));
  }


  return (
    <div className="page-container">
      <h2>Plan Your Trip</h2>

      {/* Trip Name Input */}
      <input
        value={tripName}
        onChange={(e) => setTripName(e.target.value)}
        placeholder="Trip name (e.g., Spring Break 2025)"
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "12px",
          borderRadius: "8px",
        }}
      />

      {/* Saved Locations */}
      <h3>Saved Locations</h3>

      {!activeTrip ? 
      (!activeTrip && <p>No active trip selected.</p>) :
      (savedLocations.length === 0 && <p>No saved locations yet.</p>)}

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
              
              {loc.name} — ({loc.location.latitude.toFixed(4)}, {loc.location.longitude.toFixed(4)})
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

      {/* Saved Trips */}
      {savedTrips.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>Your Trips</h3>
          <ul>
            {savedTrips.map((trip, i) => (
              <li key={i}>
                <strong>{trip.name}</strong> — {trip.locations.length} stops
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
