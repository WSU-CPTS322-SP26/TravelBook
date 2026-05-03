// Generative Ai was used to develop this code
// src/pages/BillingPage.jsx
import React, { useState } from "react";
import CheckoutForm from "../components/CheckoutForm";
import { useBilling } from "../hooks/useBilling";

const plans = [
  {
    name: "Voyager",
    tier: 0,
    price: 0,
    description: "Perfect for solo travelers",
    features: ["Basic app access"],
  },
  {
    name: "Pathfinder",
    tier: 1,
    price: 9,
    description: "For the frequent traveler",
    features: ["Access to the map", "Increased storage limits"],
  },
  {
    name: "Pioneer",
    tier: 2,
    price: 24,
    description: "For travel squads",
    features: ["Everything in the previous tiers", "Further increased storage limits"],
  },
];
function PaymentModal({ onClose, amount}) {

  return (
    <div className="modal-overlay" onClick={onClose}>
    <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
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
    const {subscription, deleteSubscription, updateSubscription} = useBilling();
    const [billing, setBilling] = useState("monthly");
    const [showPayment, setShowPayment] = useState(false);
    const currentDate = new Date().toISOString();

    const isCurrentPlan = (plan) => { return subscription && plan.tier===subscription.tier };

    const getNextBillingDate = (subscription) => {
        if (!subscription) return "N/A";
        const start = new Date(subscription.start_date);
        const next = new Date(start);
        if (subscription.monthly) {
            next.setMonth(next.getMonth() + 1);
        } else {
            next.setFullYear(next.getFullYear() + 1);
        }
            return next.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    };
    return (
        <div className="page-container">
        {showPayment && <PaymentModal onClose={() => setShowPayment(false)} amount={subscription && subscription.price}/>}
        <div className="billing-container">
            <h1 className="billing-heading">Choose your plan</h1>

        <div className="toggle-wrapper">
          <button className={`toggle-btn${billing === "monthly" ? " active" : ""}`} onClick={() => setBilling("monthly")}>Monthly</button>
          <button className={`toggle-btn${billing === "yearly"  ? " active" : ""}`} onClick={() => setBilling("yearly")}>
            Yearly
            <span style={{ background:"rgba(59,130,246,0.3)", border:"1px solid rgba(59,130,246,0.4)", color:"#93c5fd", fontSize:"0.7rem", padding:"2px 8px", borderRadius:"20px" }}>Save 20%</span>
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
                    <button className={(isCurrentPlan(plan))?"plan-btn active":"plan-btn" } onClick={()=>{updateSubscription( 
                        { tier: plan.tier, monthly:(billing==="monthly"), price: Math.round(plan.price * 100), start_date:currentDate} 
                        )}}>
                    {isCurrentPlan(plan) ? "Current Plan" : "Get Started"}
                    </button>
                </div>
                );
            })}
            </div>

            <div className="billing-box">
            <h3 className="billing-title">Billing Details</h3>
            <div className="billing-row">
                <span className="billing-label">Current plan</span>
                <span className="billing-value">{ (subscription) ? plans[subscription.tier].name + " - " + (subscription.monthly?"Monthly":"Yearly") : "No plan selected"}</span>
            </div>
            <div className="billing-row">
                    <span className="billing-label">Next billing date</span>
                    <span className="billing-value">{getNextBillingDate(subscription)}</span>
            </div>
            <div className="billing-actions">
                <button className="btn-secondary" style={{borderRadius:"8px"}} onClick={() => setShowPayment(true)}>Make Payment</button>
                <button className="btn-danger" onClick={ () => {
                    if(window.confirm("Are you sure you want to cancel your subscription?")) deleteSubscription() }} >Cancel Subscription</button>
            </div>
            </div>
        </div>
        </div>
    );
}