//Generative AI was utilized to generate this code
// src/App.jsx
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TripsPage from "./pages/TripsPage";
import DestinationSelectPage from "./pages/CalendarPage";
import MapPage from "./pages/MapPage";
import ChatPage from "./pages/ChatPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PlanTripPage from "./pages/PlanTripPage";
import CalendarPage from "./pages/CalendarPage";



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
          path="/Calendar"
          element={
            <ProtectedRoute user={user}>
              <CalendarPage />
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
        <Route
         path="/plan-trip"
         element={
          <ProtectedRoute user={user}>
         <PlanTripPage />
         </ProtectedRoute>
        } 
        />
        <Route path="*" element={<Navigate to={user ? "/trips" : "/login"} replace />} />
        
        <Route path="/chat/:tripName" element={<ChatPage />} />

      </Routes>
    </div>
  );
}

export default App;
