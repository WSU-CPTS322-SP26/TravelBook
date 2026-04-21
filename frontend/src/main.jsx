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
import NotificationProvider from "./context/NotificationProvider";
import BillingProvider from "./context/BillingProvider";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51TKoEdHc8lUnBcDVmGFbt3bjPiBIBsCayfPaRYOEiLkgSe4Mbj3Qfxww3FrNbUKOoBuf2tpOdmofV2thD61prvjh00y12sobRW")

ReactDOM.createRoot(document.getElementById("root")).render(

  <BrowserRouter>
    <AuthProvider>
      <WebSocketProvider>
        <FriendProvider>
          <EventProvider>
            <TripProvider>
              <MessageProvider>
                <NotificationProvider>
                  <BillingProvider>
                    <Elements stripe = {stripePromise}>
                      <App />
                    </Elements>
                  </BillingProvider>
                </NotificationProvider>
              </MessageProvider>
            </TripProvider>
          </EventProvider>
        </FriendProvider>
      </WebSocketProvider>
    </AuthProvider>
  </BrowserRouter>,
);
