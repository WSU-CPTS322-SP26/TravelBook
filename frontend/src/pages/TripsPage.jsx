// src/pages/TripsPage.js
import React from "react";

const trips = [
  {
    id: 1,
    title: "Barcelona Getaway",
    dates: "June 15 – June 20",
    image:
      "https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=800",
    participants: ["A", "S", "E", "M"],
  },
  {
    id: 2,
    title: "New York City Adventure",
    dates: "August 5 – August 9",
    image:
      "https://images.pexels.com/photos/313782/pexels-photo-313782.jpeg?auto=compress&cs=tinysrgb&w=800",
    participants: ["A", "S", "E", "M", "J"],
  },
  {
    id: 3,
    title: "Cancun Beach Trip",
    dates: "December 27 – January 3",
    image:
      "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800",
    participants: ["A", "S", "E", "M", "J"],
  },
];

export default function TripsPage() {
  return (
    <div className="page-container">
      <h2>My Trips</h2>
      <div className="trip-list">
        {trips.map((trip) => (
          <div key={trip.id} className="trip-card">
            <div
              className="trip-image"
              style={{ backgroundImage: `url(${trip.image})` }}
            />
            <div className="trip-content">
              <h3>{trip.title}</h3>
              <p className="trip-dates">{trip.dates}</p>
              <div className="trip-footer">
                <div className="avatar-stack">
                  {trip.participants.map((p, idx) => (
                    <div key={idx} className="avatar-circle">
                      {p}
                    </div>
                  ))}
                </div>
                <button className="btn-outline">View Trip</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
