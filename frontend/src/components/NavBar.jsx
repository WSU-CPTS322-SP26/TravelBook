// Generative AI was utilized to generate this code
// src/components/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useTrip } from "../hooks/useTrip"

export default function Navbar({ user, onLogout }) {
  const { activeTrip } = useTrip();
  return (
    <nav className="navbar">
      <div className="navbar-brand">✈ TravelBook</div>
      <div className="navbar-center">
        <NavLink to="/trips"    className="nav-link">Trips</NavLink>
        <NavLink to="/calendar" className="nav-link">Calendar</NavLink>
        <NavLink to="/map"      className="nav-link">Map</NavLink>
        <NavLink to="/chat"     className="nav-link">Chat</NavLink>
        <NavLink to="/friends"  className="nav-link">Friends</NavLink>
        <NavLink to="/billing"  className="nav-link">Billing</NavLink>
      </div>
      <div className="navbar-right">
        <span className="navbar-user">{user?.username}</span>
        {activeTrip && <span className="navbar-trip-badge">📍 {activeTrip.name}</span>}
        <button className="btn-secondary" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}
