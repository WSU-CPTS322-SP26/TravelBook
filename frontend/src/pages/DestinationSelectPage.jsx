// src/pages/DestinationSelectPage.js
import React from "react";
import { useNavigate } from "react-router-dom";

const topDestinations = [
  { name: "Barcelona", dates: "June 10 – June 15" },
  { name: "New York City", dates: "June 10 – June 15" },
  { name: "Paris", dates: "June 10 – June 15" },
  { name: "Tokyo", dates: "June 10 – June 15" },
];

export default function DestinationSelectPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="destination-header">
        <div>
          <h2>Select Destination</h2>
          <p className="muted">June 10 – June 15</p>
        </div>
      </div>

      <div className="card">
        <label className="field-label">Search destination</label>
        <input
          className="text-input"
          placeholder="Try 'Barcelona', 'Tokyo'..."
        />
      </div>

      <div className="card">
        <div className="card-header-row">
          <h3>Top Destinations</h3>
        </div>
        <div className="top-destinations-grid">
          {topDestinations.map((d) => (
            <div key={d.name} className="destination-pill">
              <div>
                <div className="destination-name">{d.name}</div>
                <div className="destination-dates">{d.dates}</div>
              </div>
              <button className="btn-small">Select</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header-row">
          <div>
            <h3>Explore Destinations on Map</h3>
            <p className="muted">See where your next adventure could be.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate("/map")}>
            Open Map
          </button>
        </div>
      </div>
    </div>
  );
}
