import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";
import AuthProvider from "./context/AuthProvider";
import MessageProvider from "./context/MessageProvider";
import TripProvider from "./context/TripProvider";
import EventProvider from "./context/EventProvider";


ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <EventProvider>
      <TripProvider>
        <MessageProvider>
          <AuthProvider>
            <App/>
          </AuthProvider>
        </MessageProvider>
      </TripProvider>
    </EventProvider>
  </BrowserRouter>
);
