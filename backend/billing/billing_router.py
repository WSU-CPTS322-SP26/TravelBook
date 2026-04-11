from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database.models import User, PaymentIntentRequest
from database.session import get_session
from auth.auth_handler import get_current_user
from typing import List
import os
import stripe

stripe.api_key = os.getenv("STRIPE_API_KEY")
router = APIRouter(tags=["billing"])

@router.post("/create-payment-intent")
def create_payment_intent(request: PaymentIntentRequest, current_user: User = Depends(get_current_user)):
    print("yayy, money")
    intent = stripe.PaymentIntent.create(
        amount=request.amount,  # in cents, $1.00 = 100
        currency="usd",
    )
    return { "client_secret": intent.client_secret }