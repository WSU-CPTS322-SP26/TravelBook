import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import api from "../api";

export default function CheckoutForm({amount}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
    const formatAmount = (amount) => {
        const dollars = Math.floor(amount / 100);
        const remainder = (amount % 100).toString().padStart(2, "0");
        return `$${dollars}.${remainder}`;
    }

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    const { data } = await api.post("/billing/create-payment-intent", { amount: {amount} });

    const { error, paymentIntent } = await stripe.confirmCardPayment(data.client_secret, {
      payment_method: {
        card: elements.getElement(CardElement),
      }
    });

    if (error) {
      setError(error.message);
    } else if (paymentIntent.status === "succeeded") {
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) return <p style={{ color: "#4CAF50" }}>Payment successful!</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* CardElement is Stripe's secure hosted input */}
      <div style={{
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid rgba(148,163,184,0.2)",
        background: "rgba(255,255,255,0.05)"
      }}>
        <CardElement options={{
          style: {
            base: {
              color: "#ffffff",
              fontSize: "16px",
              "::placeholder": { color: "rgba(148,163,184,0.5)" }
            }
          }
        }} />
      </div>

      {error && <p style={{ color: "#f87171", fontSize: "0.875rem" }}>{error}</p>}

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Processing..." : `Pay ${formatAmount(amount)}`}
      </button>
    </div>
  );
}