from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database.models import User, PaymentIntentRequest, SubscriptionCreate, Subscription
from database.session import get_session
from auth.auth_handler import get_current_user
from typing import List
import os
import stripe

stripe.api_key = os.getenv("STRIPE_API_KEY")
router = APIRouter(tags=["billing"])



@router.post("/subscribe")
def create_subscription(subscription:SubscriptionCreate,
                        db: Session = Depends(get_session),
                        current_user: User = Depends(get_current_user)):
    db_sub = Subscription.model_validate(subscription, update={"user_id": current_user.id})
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub

@router.get("/get_current")
def get_subscription(db: Session = Depends(get_session), 
                     current_user: User = Depends(get_current_user)):
    subscription = db.exec(select(Subscription).where(Subscription.user_id == current_user.id)).first()
    if not subscription:
        raise HTTPException(status_code=404, detail="Trip not found")
    return subscription

@router.put("/update")
def update_subscription(subscription: SubscriptionCreate, 
                        db: Session=Depends(get_session), 
                        current_user: User=Depends(get_current_user)):
    db_sub = db.exec(select(Subscription).where(Subscription.user_id == current_user.id)).first()
    if not db_sub:
        raise HTTPException(status_code=404, detail="Event not found")
    db_sub.tier = subscription.tier
    db_sub.monthly = subscription.monthly
    db_sub.price = subscription.price
    db_sub.start_date = subscription.start_date
    
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub

@router.delete("/delete")
def delete_trip(db: Session = Depends(get_session), 
                current_user: User = Depends(get_current_user)):
    print(f"Deleting subscription for user_id: {current_user.id}")
    db_sub = db.exec(select(Subscription).where(Subscription.user_id == current_user.id)).first()
    print(f"Found: {db_sub}")
    if not db_sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    db.delete(db_sub)
    db.commit()
    return {"detail": "Subscription deleted successfully"}

@router.post("/create-payment-intent")
def create_payment_intent(request: PaymentIntentRequest, current_user: User = Depends(get_current_user)):
    print("yayy, money")
    intent = stripe.PaymentIntent.create(
        amount=request.amount,  # in cents, $1.00 = 100
        currency="usd",
    )
    return { "client_secret": intent.client_secret }