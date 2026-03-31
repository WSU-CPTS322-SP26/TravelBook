import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";
import AuthProvider from "./context/AuthProvider";
import MessageProvider from "./context/MessageProvider";
import TripProvider from "./context/TripProvider";
import EventProvider from "./context/EventProvider";
import { WebSocketProvider } from "./context/WebSocketContext";
import FriendProvider from "./context/FriendProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <WebSocketProvider>
        <FriendProvider>
          <EventProvider>
            <TripProvider>
              <MessageProvider>
                <App />
              </MessageProvider>
            </TripProvider>
          </EventProvider>
        </FriendProvider>
      </WebSocketProvider>
    </AuthProvider>
  </BrowserRouter>,
);
