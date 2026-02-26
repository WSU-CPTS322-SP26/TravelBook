//Generative AI was utilized to generate this code
// src/pages/TripListPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function TripListPage() {
  const [trips, setTrips] = useState([]);
  
  const [openTripIndex, setOpenTripIndex] = useState(null);
  const navigate = useNavigate();
  
 /*
    const newTrip = {
        name: tripName,
        locations: savedLocations,
        createdAt: new Date().toISOString(),
      };
    */
 const getTrips = async() =>{
    let res = await api.get("/trips/getTrips");
    console.log(res.data);
    return res.data;
  }
  
  
  getTrips();
  

  //Load trips from localStorage
  useEffect(() => {
    // TODO: Add location getting once events are implemented
    const _fetchTrips = async () => {
      const data = await getTrips().then( (data) => {return data.map(trip => ({ ...trip, locations: [] })); } );
      setTrips(data);
    };
    _fetchTrips();
  }, []);


  // Delete a trip
  async function deleteTrip(index) {
    const updated = trips.filter((_, i) => i !== index);
    let selected = await getTrips().then((data)=> { return data[index];});
    api.delete(`/trips/${selected.id}`)
    setTrips(updated);
    localStorage.setItem("savedTrips", JSON.stringify(updated));
  }

  // Toggle trip details
  function toggleTrip(index) {
    setOpenTripIndex(openTripIndex === index ? null : index);
  }

  return (
    <div className="page-container">
      <h2>Your Trips</h2>

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

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTrip(index);
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
