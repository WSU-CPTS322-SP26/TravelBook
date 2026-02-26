//Generative AI was utilized to generate this code
// src/App.jsx
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TripsPage from "./pages/TripsPage";
import DestinationSelectPage from "./pages/CalendarPage";
import MapPage from "./pages/MapPage";
import ChatPage from "./pages/ChatPage";
import Navbar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import PlanTripPage from "./pages/PlanTripPage";
import CalendarPage from "./pages/CalendarPage";
import api from "./api"
import generateId from "./generateId";



function App() {
  const [user, setUser] = useState(null);

  const generateAccessToken = async(username, password) => {
    const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);
      let res = await api.post("/auth/token", params);
      api.interceptors.request.use((config)=>{
        config.headers.Authorization=`Bearer ${res.data.access_token}`;
        return config;
      });
  }

  let handleLogin = async (username, password) => {
    try{
      await generateAccessToken(username, password);
      setUser({ name: username});
    } catch(err){
      console.log(err, "Attempting registration...");
      handleRegister(username, password);
    }
    
  };

  let handleRegister = async (username, password) => {
    try{
      const userId = generateId();
      const params = {id: userId, email: username, username:username, password:password};
      await api.post("/auth/register", params).then( async ()=>{ await generateAccessToken(username, password) } );

      setUser({ name: username});
    } catch(err){
      console.log(err)
    }
    
  };

  const handleLogout = () => {
    api.interceptors.request.clear();
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
