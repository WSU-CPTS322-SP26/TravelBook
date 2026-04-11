import React, { useState } from "react";
import CheckoutForm from "../components/CheckoutForm";

const plans = [
  {
    name: "Starter",
    price: 0,
    description: "Perfect for solo travelers",
    features: ["1 active trip", "Up to 5 events", "Basic map access", "Group chat"],
  },
  {
    name: "Explorer",
    price: 9,
    description: "For the frequent traveler",
    features: ["Unlimited trips", "Unlimited events", "Full map access", "Group chat", "Calendar planning", "Priority support"],
  },
  {
    name: "Voyager",
    price: 24,
    description: "For travel squads",
    features: ["Everything in Explorer", "Up to 10 collaborators", "Shared itineraries", "Export to PDF", "Dedicated support"],
  },
];
function PaymentModal({ onClose, amount}) {

  return (
    <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
        <h3 className="modal-title">Make Payment</h3>
        <button onClick={onClose} className="modal-close-btn">✕</button>
        </div>
        <CheckoutForm amount={amount}/>
    </div>
    </div>
  );
}

export default function BillingPage() {
    const [billing, setBilling] = useState("monthly");
    const [showPayment, setShowPayment] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(plans[0]); // once billing routes exist, this should go in the context

    const isCurrentPlan = (plan) => { return plan.name===currentPlan.name };

    return (
        <div className="page-container">
        {showPayment && <PaymentModal onClose={() => setShowPayment(false)} amount={currentPlan.price * 100}/>}
        <div className="billing-container">
            <h1 className="billing-heading">Choose your plan</h1>

            <div className="toggle-wrapper">
            <button
                onClick={() => setBilling("monthly")}
                className={(billing === "monthly") ? "toggle-btn active" : "toggle-btn"}
            >
                Monthly
            </button>
            <button
                onClick={() => setBilling("yearly")}
                className={(billing === "yearly") ? "toggle-btn active" : "toggle-btn"}
            >
                Yearly
                <span style={badge}>Save 20%</span>
            </button>
            </div>

            <div className="plans-grid">
            {plans.map((plan) => {
                const price = billing === "yearly" ? Math.round(plan.price * 0.8) : plan.price;
                return (
                <div key={plan.name} className={(isCurrentPlan(plan) ? "plan-card active":"plan-card")}>
                    {isCurrentPlan(plan) && <div className="current-badge">Current Plan</div>}
                    <h2 className="plan-name">{plan.name}</h2>
                    <p className="plan-desc">{plan.description}</p>
                    <div className="price-row">
                    <span className="price">${price}</span>
                    <span className="price-per">/mo</span>
                    </div>
                    <ul className="feature-list">
                    {plan.features.map((f) => (
                        <li key={f} className="feature-item">
                        <span className="feature-check">✓</span> {f}
                        </li>
                    ))}
                    </ul>
                    <button className={(isCurrentPlan(plan))?"plan-btn active":"plan-btn" } onClick={()=>{setCurrentPlan(plan)}}>
                    {isCurrentPlan(plan) ? "Manage Plan" : "Get Started"}
                    </button>
                </div>
                );
            })}
            </div>

            <div className="billing-box">
            <h3 className="billing-title">Billing Details</h3>
            <div className="billing-row">
                <span className="billing-label">Current plan</span>
                <span className="billing-value">{ (currentPlan.name && billing) ? currentPlan.name + " - " + billing.replace(/^./, c=>c.toUpperCase()) : "No plan selected"}</span>
            </div>
            <div className="billing-row">
                <span className="billing-label">Next billing date</span>
                <span className="billing-value">May 4, 2026</span>
            </div>
            <div className="billing-actions">
                <button className="btn-secondary" style={{borderRadius:"8px"}} onClick={() => setShowPayment(true)}>Update Payment</button>
                <button className="btn-danger" onClick={()=>{setCurrentPlan({});}}>Cancel Subscription</button>
            </div>
            </div>
        </div>
        </div>
    );
}

const badge = {
    background: "rgba(59,130,246,0.3)",
    border: "1px solid rgba(59,130,246,0.4)",
    color: "#93c5fd",
    fontSize: "0.7rem",
    padding: "2px 8px",
    borderRadius: "20px",
};
