// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    onLogin(username.trim(), password.trim());
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">✈ TravelBook</div>
        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subtitle">Plan trips with your friends — all in one place.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label className="field-label">Username</label>
            <input className="text-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" autoComplete="username" />
          </div>
          <div className="field-group">
            <label className="field-label">Password</label>
            <input type="password" className="text-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" />
          </div>
          <button type="submit" className="btn-primary auth-btn">Sign in →</button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
