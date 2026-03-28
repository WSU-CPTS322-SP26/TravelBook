// src/pages/PlanTripPage.jsx
import React, { useEffect, useState } from "react";
import { useTrip } from "../context/TripContext";
import { useMessage } from "../context/MessageContext";
import { useEvent } from "../context/EventContext";

export default function PlanTripPage() {
  const [tripName, setTripName] = useState("");
  const [savedLocations, setSavedLocations] = useState([]);
  const [savedTrips, setSavedTrips] = useState([]);

  const { createTrip, activeTrip, setActiveTrip } = useTrip();
  const { createConversation } = useMessage();
  const { getEventsByTrip } = useEvent();

  useEffect(() => {
    const fn = async () => {
      setSavedLocations(await getEventsByTrip(activeTrip.id));
    };
    if (activeTrip) fn();
  }, [activeTrip]);

  function saveTrip() {
    if (!tripName) return;
    const newTrip = {
      name: tripName,
      locations: savedLocations,
      createdAt: new Date().toISOString(),
    };
    setSavedTrips((prev) => [...prev, newTrip]);
    createConversation().then((cId) => {
      createTrip(tripName, cId, "");
    });
    localStorage.setItem(
      "savedTrips",
      JSON.stringify([...savedTrips, newTrip])
    );
    setTripName("");
  }

  function deleteLocation(index) {
    const updated = savedLocations.filter((_, i) => i !== index);
    setSavedLocations(updated);
    localStorage.setItem("savedLocations", JSON.stringify(updated));
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Plan a Trip</h2>
          <p className="page-subtitle">Name your trip and review saved locations</p>
        </div>
      </div>

      <div className="plan-trip-grid">
        {/* Create Trip Card */}
        <div className="plan-card">
          <p className="section-label">Trip Details</p>
          <div className="field-group mb-2">
            <label className="field-label">Trip Name</label>
            <input
              className="text-input"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="e.g. Spring Break Europe 🌍"
            />
          </div>
          <button
            className="btn-primary btn-full"
            style={{ borderRadius: "var(--radius-md)", padding: "0.7rem" }}
            onClick={saveTrip}
          >
            ✓ Save Trip
          </button>

          {savedTrips.length > 0 && (
            <>
              <div className="divider mt-3" />
              <p className="section-label">Recently Created</p>
              <div className="flex flex-col gap-1">
                {savedTrips.map((trip, i) => (
                  <div key={i} className="location-item">
                    <span className="location-item-name">✈ {trip.name}</span>
                    <span className="text-muted" style={{ fontSize: "0.78rem" }}>
                      {trip.locations.length} stops
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Saved Locations Card */}
        <div className="plan-card">
          <p className="section-label">Saved Locations</p>

          {!activeTrip ? (
            <div className="empty-state" style={{ padding: "2rem 0.5rem" }}>
              <div className="empty-state-icon">📍</div>
              <p>No active trip selected.<br />Go to Trips and set one as active.</p>
            </div>
          ) : savedLocations.length === 0 ? (
            <div className="empty-state" style={{ padding: "2rem 0.5rem" }}>
              <div className="empty-state-icon">🗺️</div>
              <p>No locations saved yet.<br />Pin spots on the Map page.</p>
            </div>
          ) : (
            <div>
              {savedLocations.map((loc, index) => (
                <div key={index} className="location-item">
                  <div>
                    <div className="location-item-name">📍 {loc.name}</div>
                    <div className="location-item-coords">
                      {loc.location.latitude.toFixed(4)}, {loc.location.longitude.toFixed(4)}
                    </div>
                  </div>
                  <button
                    className="btn-danger"
                    onClick={() => deleteLocation(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
