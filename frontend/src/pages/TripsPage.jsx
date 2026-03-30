//Generative AI was utilized to generate this code
// src/pages/TripListPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useTrip } from "../context/TripContext";
import { useAuth } from "../context/AuthContext";
import PlanTripPage from "../components/TripCreation";
import NotificationBox from "../components/NotificationBox";

export default function TripListPage() {
  const [trips, setTrips] = useState([]);
  const [notification, setNotification] = useState(["Hello", "This is a notification"]);
  const [openTripIndex, setOpenTripIndex] = useState(null);
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

  // Toggle trip details
  function toggleTrip(index) {
    setOpenTripIndex(openTripIndex === index ? null : index);
  }

  return (
    <div className="page-container">
      {notification && <NotificationBox title={notification[0]} message={notification[1]} />}
      
      {/* Plan Trip Modal */}
      {showPlanModal && (
        <div className="modal-overlay" onClick={() => setShowPlanModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Plan Your Trip</h2>
              <button 
                className="modal-close"
                onClick={() => setShowPlanModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <PlanTripPage 
                isModal={true}
                onClose={() => setShowPlanModal(false)}
                onTripCreated={() => setNotification(["Success", "Trip created!"])}
              />
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowPlanModal(false)}
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
      )}

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

      {trips.length === 0 && <p>You haven't saved any trips yet.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {trips.map((trip, index) => (
          <li
            key={index}
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
              onClick={() => toggleTrip(index)}
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

            {/* Trip Details */}
            {openTripIndex === index && (
              <div style={{ marginTop: "12px" }}>
                <h4>Locations</h4>
                <ul>
                  {trip.locations.map((loc, i) => (
                    <li key={i}>
                      {loc.name} — ({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})
                    </li>
                  ))}
                </ul>

                {trip.itinerary && (
                  <>
                    <h4>Itinerary</h4>
                    <ul>
                      {Object.entries(trip.itinerary).map(([dayIndex, locName]) => (
                        <li key={dayIndex}>
                          Day {Number(dayIndex) + 1}: {locName}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

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
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
