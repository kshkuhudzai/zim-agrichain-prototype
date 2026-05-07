from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from typing import List
from .. import firebase_config
from ..models import BidCreate, BidResponse
from ..auth_deps import get_current_user
from ..services.email_client import send_email

router = APIRouter(prefix="/bids", tags=["bids"])
db = firebase_config.get_db()
BIDS_COLLECTION = "bids"
LISTINGS_COLLECTION = "listings"
USERS_COLLECTION = "users"


async def get_user_email(user_id: str):
    """Fetch user's email from Firestore, fallback to Firebase Auth"""
    user_doc = db.collection(USERS_COLLECTION).document(user_id).get()
    if user_doc.exists:
        email = user_doc.to_dict().get("email")
        if email:
            return email
    try:
        user = firebase_config.auth_client.get_user(user_id)
        return user.email
    except Exception as e:
        print(f"Could not fetch email for {user_id}: {e}")
        return None


@router.post("/", response_model=BidResponse)
async def create_bid(bid: BidCreate, current_user=Depends(get_current_user)):
    """Driver places a bid on a listing (authenticated)"""
    listing_doc = db.collection(LISTINGS_COLLECTION).document(bid.listing_id).get()
    if not listing_doc.exists:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing_data = listing_doc.to_dict()
    if listing_data.get("status") != "active":
        raise HTTPException(status_code=400, detail="Listing is no longer active")

    doc_ref = db.collection(BIDS_COLLECTION).document()
    bid_data = bid.dict()
    bid_data.update({
        "id": doc_ref.id,
        "driver_id": current_user['uid'],
        "status": "pending",
        "created_at": datetime.now()
    })
    doc_ref.set(bid_data)

    # Send email to farmer
    farmer_id = listing_data.get("farmer_id")
    farmer_email = await get_user_email(farmer_id)
    if farmer_email:
        subject = f"New bid on your {listing_data.get('crop_name')}"
        body = f"""A driver has placed a bid on your listing.

Crop: {listing_data.get('crop_name')}
Quantity: {listing_data.get('quantity_kg')} kg
From: {listing_data.get('location')} to {listing_data.get('destination', 'market')}
Bid amount (transport): ${bid.bid_price}
Driver: {current_user.get('email')}

Login to accept or reject the bid.
"""
        send_email(farmer_email, subject, body)
    else:
        print(f"Could not send email to farmer {farmer_id}: no email found")

    return BidResponse(**bid_data)


@router.get("/listing/{listing_id}", response_model=List[BidResponse])
async def get_bids_for_listing(listing_id: str):
    docs = db.collection(BIDS_COLLECTION).where("listing_id", "==", listing_id).stream()
    bids = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        bids.append(BidResponse(**data))
    return bids


@router.put("/{bid_id}/accept")
async def accept_bid(bid_id: str, current_user=Depends(get_current_user)):
    """Farmer accepts a bid. Only listing owner can accept."""
    bid_doc = db.collection(BIDS_COLLECTION).document(bid_id).get()
    if not bid_doc.exists:
        raise HTTPException(status_code=404, detail="Bid not found")

    bid_data = bid_doc.to_dict()
    listing_id = bid_data.get("listing_id")

    listing_doc = db.collection(LISTINGS_COLLECTION).document(listing_id).get()
    if not listing_doc.exists:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing_data = listing_doc.to_dict()
    if listing_data.get("farmer_id") != current_user['uid']:
        raise HTTPException(status_code=403, detail="Only the farmer who posted the listing can accept bids")

    bid_doc.reference.update({"status": "accepted"})
    db.collection(LISTINGS_COLLECTION).document(listing_id).update({"status": "matched"})

    # Send email to driver
    driver_id = bid_data.get("driver_id")
    driver_email = await get_user_email(driver_id)
    if driver_email:
        subject = f"Your bid on {listing_data.get('crop_name')} has been accepted!"
        body = f"""Congratulations! Your bid has been accepted.

Crop: {listing_data.get('crop_name')}
Quantity: {listing_data.get('quantity_kg')} kg
Pickup: {listing_data.get('location')}
Dropoff: {listing_data.get('destination', 'market')}
Your bid price: ${bid_data.get('bid_price')}

Please arrange pickup with the farmer.

Thank you for using ZimAgriChain.
"""
        send_email(driver_email, subject, body)
    else:
        print(f"Could not send email to driver {driver_id}: no email found")

    return {"message": "Bid accepted", "listing_id": listing_id, "bid_id": bid_id}


@router.put("/{bid_id}/reject")
async def reject_bid(bid_id: str, current_user=Depends(get_current_user)):
    """Farmer rejects a bid."""
    bid_doc = db.collection(BIDS_COLLECTION).document(bid_id).get()
    if not bid_doc.exists:
        raise HTTPException(status_code=404, detail="Bid not found")
    bid_data = bid_doc.to_dict()
    listing_id = bid_data.get("listing_id")
    listing_doc = db.collection(LISTINGS_COLLECTION).document(listing_id).get()
    if not listing_doc.exists:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing_doc.to_dict().get("farmer_id") != current_user['uid']:
        raise HTTPException(status_code=403, detail="Not authorized")
    bid_doc.reference.update({"status": "rejected"})
    return {"message": "Bid rejected"}