//Generative AI was utilized to generate this code
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";
import AuthProvider from "./context/AuthProvider";
import MessageProvider from "./context/MessageProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <MessageProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MessageProvider>
  </BrowserRouter>
);
