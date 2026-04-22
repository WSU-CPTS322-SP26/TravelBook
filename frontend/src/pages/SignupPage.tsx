// Generative Ai was used to develop this code
// src/pages/SignupPage.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const validateForm = () => {
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) { setError("All fields are required"); return false; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return false; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return false; }
    if (!email.includes("@")) { setError("Invalid email format"); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    setLoading(true);
    try {
      await register(name.trim(), username.trim(), email.trim(), password.trim());
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">✈ TravelBook</div>
        <h1 className="auth-heading">Create account</h1>
        <p className="auth-subtitle">Join and start planning trips with friends.</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          {[
            { label: "Full Name",        val: name,            set: setName,            type: "text",     ph: "Enter your full name" },
            { label: "Username",         val: username,        set: setUsername,        type: "text",     ph: "Choose a username" },
            { label: "Email",            val: email,           set: setEmail,           type: "email",    ph: "Enter your email" },
            { label: "Password",         val: password,        set: setPassword,        type: "password", ph: "Create a password" },
            { label: "Confirm Password", val: confirmPassword, set: setConfirmPassword, type: "password", ph: "Confirm your password" },
          ].map(({ label, val, set, type, ph }) => (
            <div className="field-group" key={label}>
              <label className="field-label">{label}</label>
              <input className="text-input" type={type} value={val} onChange={(e) => set(e.target.value)} placeholder={ph} disabled={loading} />
            </div>
          ))}
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? "Creating account…" : "Create account →"}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}