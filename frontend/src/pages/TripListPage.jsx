//Generative AI was utilized to generate this code
// src/pages/TripListPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTrip } from "../context/TripContext";
import { useAuth } from "../context/AuthContext";
import PlanTripPage from "../components/TripCreation";

export default function TripListPage() {
  const [trips, setTrips] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const navigate = useNavigate();
  const {getTrips, setActiveTrip, deleteTrip} = useTrip();
  const { token } = useAuth();
  
 /*
    const newTrip = {
        name: tripName,
        locations: savedLocations,
        createdAt: new Date().toISOString(),
      };
    */
  

  // makeover heavily influenced by AI
  useEffect(() => {
    // TODO: Add location getting once events are implemented
    const _fetchTrips = async () => {
      if(!token) { return; }
      const data = await getTrips().then( (data) => {return data.map(trip => ({ ...trip, locations: [] })); } );
      setTrips(data);
    };
    _fetchTrips();
  }, [token]);


  // Delete a trip
  async function deleteTripFromList(index) {
    const updated = trips.filter((_, i) => i !== index);
    let selected = await getTrips().then((data)=> { return data[index];});
    deleteTrip(selected.id);
    setTrips(updated);
    localStorage.setItem("savedTrips", JSON.stringify(updated));
  }
  return (
    <div className="page-container">
      {/* Plan Trip Modal */}
      {showPlanModal && <PlanTripPage onClose={() => setShowPlanModal(false)} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Your Trips</h2>
        <button
          onClick={() => setShowPlanModal(true)}
          style={{
            padding: "10px 16px",
            borderRadius: "6px",
            background: "#2563eb",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          + Add Trip
        </button>
      </div>

      {trips.length === 0 && <p>Create your first trip!</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {trips.map((trip, index) => (
          <li
            key={trip.id}
            style={{
              marginBottom: "12px",
              padding: "12px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* Trip Header */}
            <div
              onClick={() => navigate(`/trips/${trip.id}`)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              <div>
                <strong>{trip.name}</strong>
                <br />
                <span>{trip.locations.length} saved locations</span>
                {trip.startDate && trip.endDate && (
                  <div style={{ fontSize: "0.9em", opacity: 0.8 }}>
                    {trip.startDate} → {trip.endDate}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTrip(trip); // from TripContext
                  }}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    background: "#4CAF50",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Set Active
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTripFromList(index);
                  }}
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
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
