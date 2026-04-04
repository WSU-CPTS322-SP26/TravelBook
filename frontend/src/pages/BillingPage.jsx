/* Made using generative ai*/
import React, { useState } from "react";
import "./billing.css"

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
    features: ["Everything in Explorer", "Up to 10 collaborators", "Shared itineraries", "AI trip planning", "Export to PDF", "Dedicated support"],
  },
];
function PaymentModal({ onClose, card, setCard}) {

  const formatNumber = (val) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (val) =>
    val.replace(/\D/g, "").slice(0, 4).replace(/(.{2})/, "$1/");

  return (
    <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
        <h3 className="modal-title">Update Payment Method</h3>
        <button onClick={onClose} className="modal-close-btn">✕</button>
        </div>

        {/* Card preview */}
        <div className="card-preview">
        <div className="card-chip">▣</div>
        <div className="card-number">
            {card.number || "•••• •••• •••• ••••"}
        </div>
        <div className="card-bottom">
            <div>
            <div className="card-label">Card Holder</div>
            <div className="card-value">{card.name || "Your Name"}</div>
            </div>
            <div>
            <div className="card-label">Expires</div>
            <div className="card-value">{card.expiry || "MM/YY"}</div>
            </div>
        </div>
        </div>

        {/* Form */}
        <div className="form-group">
        <label className="form-label">Cardholder Name</label>
        <input className="form-input" placeholder="John Smith" value={card.name}
            onChange={(e) => setCard({ ...card, name: e.target.value })} />
        </div>
        <div className="form-group">
        <label className="form-label">Card Number</label>
        <input className="form-input" placeholder="1234 5678 9012 3456" value={card.number}
            onChange={(e) => setCard({ ...card, number: formatNumber(e.target.value) })} />
        </div>
        <div className="form-row">
        <div className="form-group">
            <label className="form-label">Expiry</label>
            <input className="form-input" placeholder="MM/YY" value={card.expiry}
            onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} />
        </div>
        <div className="form-group">
            <label className="form-label">CVC</label>
            <input className="form-input" placeholder="•••" maxLength={3} value={card.cvc}
            onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 3) })} />
        </div>
        </div>
        <button className="btn-submit" onClick={onClose}>
        Save Payment Method
        </button>
    </div>
    </div>
  );
}

export default function BillingPage() {
    const [billing, setBilling] = useState("monthly");
    const [showPayment, setShowPayment] = useState(false);
    const [currentPlan, setCurrentPlan] = useState({}); // once billing routes exist, this should go in the context
    const [card, setCard] = useState({ name: "", number: "", expiry: "", cvc: "" });

    const isCurrentPlan = (plan) => { return plan.name===currentPlan.name };

    return (
        <div className="page-container">
        {showPayment && <PaymentModal onClose={() => setShowPayment(false)} card={card} setCard={setCard} />}
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

            <div class="plans-grid">
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

            {/* Current billing info */}
            <div className="billing-box">
            <h3 className="billing-title">Billing Details</h3>
            <div className="billing-row">
                <span className="billing-label">Current plan</span>
                <span className="billing-value">Explorer — Monthly</span>
            </div>
            <div className="billing-row">
                <span className="billing-label">Next billing date</span>
                <span className="billing-value">May 4, 2026</span>
            </div>
            <div className="billing-row">
                <span className="billing-label">Payment method</span>
                <span className="billing-value">{ card.number ? card.number.slice(0, -4).replace(/\d/g, "•") + card.number.slice(-4) : "No card set"}</span>
            </div>
            <div className="billing-actions">
                <button className="btn-secondary" style={{borderRadius:"8px"}} onClick={() => setShowPayment(true)}>Update Payment</button>
                <button className="btn-danger" onClick={()=>{setCurrentPlan({}); setCard({}) }}>Cancel Subscription</button>
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
