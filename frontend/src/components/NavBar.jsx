// src/components/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">TripBuddy</div>
      <div className="navbar-center">
        <NavLink to="/trips" className="nav-link">
          Trips
        </NavLink>
        <NavLink to="/destinations" className="nav-link">
          Destinations
        </NavLink>
        <NavLink to="/map" className="nav-link">
          Map
        </NavLink>
        <NavLink to="/chat" className="nav-link">
          Group Chat
        </NavLink>
      </div>
      <div className="navbar-right">
        <span className="navbar-user">{user?.name}</span>
        <button className="btn-secondary" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
