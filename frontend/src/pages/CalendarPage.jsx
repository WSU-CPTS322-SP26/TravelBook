// src/pages/CalendarPage.jsx
import React, { useEffect, useState } from "react";
import { useMessage } from "../context/MessageContext";
import { useAuth } from "../context/AuthContext";

export default function CalendarPage() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [days, setDays] = useState([]);
  const [itinerary, setItinerary] = useState({});


  // Load saved trips from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("savedTrips");
    if (stored) {
      setTrips(JSON.parse(stored));
    }
  }, []);

  // Generate days when date range changes
  useEffect(() => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const dayList = [];
    let current = new Date(start);

    while (current <= end) {
      dayList.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    setDays(dayList);
  }, [startDate, endDate]);

  // Assign a location to a day
  function assignLocation(dayIndex, locationName) {
    setItinerary((prev) => ({
      ...prev,
      [dayIndex]: locationName,
    }));
  }

  // Save itinerary to localStorage
  function saveItinerary() {
    if (!selectedTrip) return;

    const updatedTrip = {
      ...selectedTrip,
      itinerary,
      startDate,
      endDate,
    };

    const updatedTrips = trips.map((t) =>
      t.name === selectedTrip.name ? updatedTrip : t
    );

    localStorage.setItem("savedTrips", JSON.stringify(updatedTrips));
    alert("Trip itinerary saved!");
  }

  return (
    <div className="page-container">
      <h2>Trip Calendar</h2>

      {/* Select Trip */}
      <label>Choose a Trip</label>
      <select
        value={selectedTrip?.name || ""}
        onChange={(e) => {
          const trip = trips.find((t) => t.name === e.target.value);
          setSelectedTrip(trip);
        }}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "12px",
          borderRadius: "8px",
        }}
      >
        <option value="">Select a trip...</option>
        {trips.map((trip, i) => (
          <option key={i} value={trip.name}>
            {trip.name}
          </option>
        ))}
      </select>

      {/* Date Range */}
      {selectedTrip && (
        <>
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "12px",
              borderRadius: "8px",
            }}
          />

          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "12px",
              borderRadius: "8px",
            }}
          />
        </>
      )}

      {/* Day List */}
      {days.length > 0 && selectedTrip && (
        <div style={{ marginTop: "20px" }}>
          <h3>Assign Locations to Each Day</h3>

          {days.map((day, index) => (
            <div
              key={index}
              style={{
                padding: "12px",
                marginBottom: "10px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <strong>
                Day {index + 1} — {day.toDateString()}
              </strong>

              <select
                value={itinerary[index] || ""}
                onChange={(e) => assignLocation(index, e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "8px",
                  borderRadius: "8px",
                }}
              >
                <option value="">Select a location...</option>
                {selectedTrip.locations.map((loc, i) => (
                  <option key={i} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <button
            onClick={saveItinerary}
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
            Save Itinerary
          </button>
        </div>
      )}
    </div>
  );
}
