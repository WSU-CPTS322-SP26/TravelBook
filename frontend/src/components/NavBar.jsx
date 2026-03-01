// Generative AI was utilized to generate this code
// src/components/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useTrip } from "../context/TripContext"  

export default function Navbar({ user, onLogout }) {
  let {activeTrip} = useTrip();
  return (
    <nav className="navbar">
      <div className="navbar-left">TravelBook</div>
      <div className="navbar-center">
        <NavLink to="/trips" className="nav-link">
          Trips
        </NavLink>
        <NavLink to="/calendar" className="nav-link">
          Calendar
        </NavLink>
        <NavLink to="/map" className="nav-link">
          Map
        </NavLink>
        <NavLink to="/chat" className="nav-link">
          Group Chat
        </NavLink>
        <NavLink to="/plan-trip" className="nav-link">
        Plan Trip
        </NavLink>
      </div>
     <div className="navbar-right">
      <span className="navbar-user">{user?.username}</span>
      {activeTrip && (
        <span style={{ opacity: 0.6, fontSize: "0.9em" }}>
          | {activeTrip.name}
        </span>
      )}
      <button className="btn-secondary" onClick={onLogout}>
        Logout
      </button>
    </div>
    </nav>
  );
}
