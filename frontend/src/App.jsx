//Generative AI was utilized to generate this code
// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TripsPage from "./pages/TripsPage";
import MapPage from "./pages/MapPage";
import ChatPage from "./pages/ChatPage";
import ConversationPage from "./pages/ConversationPage";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import PlanTripPage from "./pages/PlanTripPage";
import CalendarPage from "./pages/CalendarPage";

import { WebSocketProvider } from "./context/WebSocketContext";
import { AuthProvider } from "./context/AuthProvider";
import { MessageProvider } from "./context/MessageProvider";
import { FriendProvider } from "./context/FriendProvider";
import { TripProvider } from "./context/TripProvider";

import { useAuth } from "./context/AuthContext";


function App() {
  const {user, login, logout} = useAuth();

  return (
    <AuthProvider>
    <WebSocketProvider>
    <MessageProvider>
    <FriendProvider>
    <TripProvider>
      <div className="app-root">
        {user && <NavBar user={user} onLogout={logout} />}
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to="/trips" replace /> : <LoginPage onLogin={login} />}/>

          <Route path="/trips" element={
              <ProtectedRoute user={user}>
                <TripsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/calendar" element={
              <ProtectedRoute user={user}>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route path="/map" element={
              <ProtectedRoute user={user}>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute user={user}>
                <ConversationPage />
              </ProtectedRoute>
            }
          />
          <Route path="/plan-trip" element={
              <ProtectedRoute user={user}>
                <PlanTripPage />
              </ProtectedRoute>
            }
          />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
          <Route path="*" element={<Navigate to={user ? "/trips" : "/login"} replace />} />
        </Routes>
      </div>
    </TripProvider>
    </FriendProvider>
    </MessageProvider>
    </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
