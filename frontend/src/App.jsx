// src/App.jsx
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TripsPage from "./pages/TripsPage";
import DestinationSelectPage from "./pages/DestinationSelectPage";
import MapPage from "./pages/MapPage";
import ChatPage from "./pages/ChatPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (username) => {
    setUser({ name: username });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="app-root">
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route
          path="/login"
          element={
            user ? <Navigate to="/trips" replace /> : <LoginPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/trips"
          element={
            <ProtectedRoute user={user}>
              <TripsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/destinations"
          element={
            <ProtectedRoute user={user}>
              <DestinationSelectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute user={user}>
              <MapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute user={user}>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={user ? "/trips" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

export default App;
