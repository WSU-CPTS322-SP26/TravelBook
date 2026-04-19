import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./styles.css";
import AuthProvider from "./context/AuthProvider";
import MessageProvider from "./context/MessageProvider";
import TripProvider from "./context/TripProvider";
import EventProvider from "./context/EventProvider";
import { WebSocketProvider } from "./context/WebSocketContext";
import FriendProvider from "./context/FriendProvider";
import NotificationProvider from "./context/NotificationProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <WebSocketProvider>
        <FriendProvider>
          <EventProvider>
            <TripProvider>
              <MessageProvider>
                <NotificationProvider>
                  <App />
                </NotificationProvider>
              </MessageProvider>
            </TripProvider>
          </EventProvider>
        </FriendProvider>
      </WebSocketProvider>
    </AuthProvider>
  </BrowserRouter>,
);
