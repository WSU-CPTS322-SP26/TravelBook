import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./styles.css";
import { WebSocketProvider } from "./context/WebSocketContext";
import NotificationProvider from "./context/NotificationProvider";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <WebSocketProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </WebSocketProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
