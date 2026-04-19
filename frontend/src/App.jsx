//Generative AI was utilized to generate this code
// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TripListPage from "./pages/TripListPage";
import TripPage from "./pages/TripPage";
import MapPage from "./pages/MapPage";
import ChatPage from "./pages/ChatPage";
import ConversationPage from "./pages/ConversationPage";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import CalendarPage from "./pages/CalendarPage";
import SignupPage from "./pages/SignupPage";
import FriendPage from "./pages/FriendPage";
import { useAuth } from "./context/AuthContext";
import BillingPage from "./pages/BillingPage";


function App() {
  const {user, login, logout} = useAuth();

  return (
      <div className="app-root">
        {user && <NavBar user={user} onLogout={logout} />}
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to="/trips" replace /> : <LoginPage onLogin={login} />}/>

          <Route path="/signup" element={
            user ? <Navigate to="/trips" replace /> : <SignupPage />}/>

          <Route path="/trips" element={
              <ProtectedRoute user={user}>
                <TripListPage />
              </ProtectedRoute>
            }
          />
          <Route path="/trips/:id" element={
              <ProtectedRoute user={user}>
                <TripPage />
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
          <Route path="/friends" element={
              <ProtectedRoute user={user}>
                <FriendPage />
              </ProtectedRoute>
            }
          />
          <Route path="/billing" element={
              <ProtectedRoute user={user}>
                <BillingPage />
              </ProtectedRoute>
            }
          />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
          <Route path="*" element={<Navigate to={user ? "/trips" : "/login"} replace />} />
        </Routes>
      </div>
  );
}

export default App;
