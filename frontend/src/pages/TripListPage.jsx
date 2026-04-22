//Generative AI was utilized to generate this code
// src/pages/TripListPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTrip } from "../hooks/useTrip";
import { useAuth } from "../hooks/useAuth";
import PlanTripPage from "../components/TripCreation";

export default function TripListPage() {
  const [trips, setTrips] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const navigate = useNavigate();
  const { trips: fetchedTrips, isLoadingTrips, tripsError, deleteTrip } = useTrip();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !fetchedTrips) {
      setTrips([]);
      return;
    }
    const data = fetchedTrips.map((trip) => ({ ...trip, locations: [] }));
    setTrips(data);
  }, [user, fetchedTrips]);

  async function deleteTripFromList(index) {
    const updated = trips.filter((_, i) => i !== index);
    const selected = trips[index];
    if (!selected) return;
    await deleteTrip(selected.id);
    setTrips(updated);
    localStorage.setItem("savedTrips", JSON.stringify(updated));
  }

  return (
    <div className="page-container">
      {showPlanModal && <PlanTripPage onClose={() => setShowPlanModal(false)} />}

      <div className="page-header">
        <div>
          <h2 className="page-title">Your Trips</h2>
          <p className="page-subtitle">
            {trips.length > 0 ? `${trips.length} trip${trips.length !== 1 ? "s" : ""} planned` : "Start planning your next adventure"}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowPlanModal(true)}>+ New Trip</button>
      </div>

      {isLoadingTrips && <div className="card"><p>Loading trips...</p></div>}
      {tripsError && <div className="card"><p>Error loading trips: {tripsError.message}</p></div>}

      {!isLoadingTrips && !tripsError && trips.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🗺️</div>
          <p>No trips yet.<br />Create one to get started!</p>
        </div>
      ) : !isLoadingTrips && !tripsError ? (
        <div className="trips-list">
          {trips.map((trip, index) => (
            <div key={trip.id} className="trip-card" onClick={() => navigate(`/trips/${trip.id}`)}>
              <div className="trip-card-header">
                <div className="trip-card-main">
                  <div className="trip-card-name">{trip.name}</div>
                  <div className="trip-card-meta">
                    <span className="trip-meta-chip">📍 {trip.locations.length} locations</span>
                    {trip.startDate && trip.endDate && (
                      <span className="trip-meta-chip">📅 {trip.startDate} → {trip.endDate}</span>
                    )}
                  </div>
                </div>
                <div className="trip-card-actions">
                  <button className="btn-danger" onClick={(e) => { e.stopPropagation(); deleteTripFromList(index); }}>Delete</button>
                  <span style={{ color: "var(--muted)", fontSize: "1.1rem" }}>›</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
