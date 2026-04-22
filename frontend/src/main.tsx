import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./styles.css";
import { WebSocketProvider } from "./context/WebSocketContext";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import NotificationProvider from "./context/NotificationProvider";

const stripePromise = loadStripe("pk_test_51TKoEdHc8lUnBcDVmGFbt3bjPiBIBsCayfPaRYOEiLkgSe4Mbj3Qfxww3FrNbUKOoBuf2tpOdmofV2thD61prvjh00y12sobRW")
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <WebSocketProvider>
        <NotificationProvider>
          <Elements stripe = {stripePromise}>
            <App />
          </Elements>
        </NotificationProvider>
      </WebSocketProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
