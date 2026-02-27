// src/pages/LoginPage.jsx
import React, { useState } from "react";

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
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Plan trips with your friends in one place.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field-label">Username</label>
          <input
            className="text-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter a name"
          />
          <input
            className="text-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          <button type="submit" className="btn-primary auth-btn">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
