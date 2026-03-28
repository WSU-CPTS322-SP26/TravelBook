// src/pages/TripsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTrip } from "../context/TripContext";
import { useAuth } from "../context/AuthContext";
import { useEvent } from "../context/EventContext";

export default function TripListPage() {
  const [trips, setTrips] = useState([]);
  const [tripEvents, setTripEvents] = useState({});
  const [openTripIndex, setOpenTripIndex] = useState(null);

  const navigate = useNavigate();
  const { getTrips, setActiveTrip, deleteTrip } = useTrip();
  const { token } = useAuth();
  const { getEventsByTrip } = useEvent();

  useEffect(() => {
    const _fetchTrips = async () => {
      if (!token) return;
      const data = await getTrips().then((data) =>
        data.map((trip) => ({ ...trip, locations: [] }))
      );
      setTrips(data);

      const events = {};
      await Promise.all(
        data.map(async (trip) => {
          events[trip.id] = await getEventsByTrip(trip.id);
        })
      );
      setTripEvents(events);
    };
    _fetchTrips();
  }, [token]);

  async function deleteTripFromList(index) {
    const updated = trips.filter((_, i) => i !== index);
    const selected = await getTrips().then((data) => data[index]);
    deleteTrip(selected.id);
    setTrips(updated);
    localStorage.setItem("savedTrips", JSON.stringify(updated));
  }

  function toggleTrip(index) {
    setOpenTripIndex(openTripIndex === index ? null : index);
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Your Trips</h2>
          <p className="page-subtitle">
            {trips.length > 0
              ? `${trips.length} trip${trips.length !== 1 ? "s" : ""} planned`
              : "Start planning your next adventure"}
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate("/plan-trip")}
        >
          + New Trip
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🗺️</div>
          <p>You haven't planned any trips yet.<br />Create one to get started!</p>
        </div>
      ) : (
        <div className="trips-list">
          {trips.map((trip, index) => {
            const events = tripEvents[trip.id] ?? [];
            const isOpen = openTripIndex === index;
            return (
              <div
                key={index}
                className={`trip-card${isOpen ? " open" : ""}`}
              >
                <div
                  className="trip-card-header"
                  onClick={() => toggleTrip(index)}
                >
                  <div className="trip-card-main">
                    <div className="trip-card-name">{trip.name}</div>
                    <div className="trip-card-meta">
                      <span className="trip-meta-chip">
                        📍 {events.length} location{events.length !== 1 ? "s" : ""}
                      </span>
                      {trip.startDate && trip.endDate && (
                        <span className="trip-meta-chip">
                          📅 {trip.startDate} → {trip.endDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="trip-card-actions">
                    <button
                      className="btn-teal btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTrip(trip);
                      }}
                    >
                      Set Active
                    </button>
                    <button
                      className="btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTripFromList(index);
                      }}
                    >
                      Delete
                    </button>
                    <span className="trip-card-chevron">▾</span>
                  </div>
                </div>

                {isOpen && (
                  <div className="trip-card-body">
                    <p className="section-label">Locations</p>
                    {events.length === 0 ? (
                      <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                        No locations saved yet.
                      </p>
                    ) : (
                      <ul className="trip-locations-list">
                        {events.map((event, i) => (
                          <li key={i} className="trip-location-item">
                            <span className="trip-location-dot" />
                            <span>
                              {event.name}{" "}
                              <span className="text-muted">
                                ({event.location.latitude.toFixed(4)},{" "}
                                {event.location.longitude.toFixed(4)})
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {trip.itinerary && (
                      <>
                        <p className="section-label mt-2">Itinerary</p>
                        <ul className="trip-locations-list">
                          {Object.entries(trip.itinerary).map(([dayIndex, locName]) => (
                            <li key={dayIndex} className="trip-location-item">
                              <span className="trip-location-dot" style={{ background: "var(--amber)" }} />
                              <span>Day {Number(dayIndex) + 1}: {locName}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    <button
                      className="btn-primary btn-full mt-2"
                      style={{ borderRadius: "var(--radius-md)" }}
                      onClick={() =>
                        navigate(`/chat/${encodeURIComponent(trip.name)}`)
                      }
                    >
                      💬 Open Group Chat
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
