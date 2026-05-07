from fastapi import APIRouter, HTTPException
from datetime import datetime
from typing import List
from .. import firebase_config
from ..models import BidCreate, BidResponse

router = APIRouter(prefix="/bids", tags=["bids"])
db = firebase_config.get_db()
BIDS_COLLECTION = "bids"
LISTINGS_COLLECTION = "listings"


@router.post("/", response_model=BidResponse)
async def create_bid(bid: BidCreate):
    """Driver places a bid on a listing"""
    # Verify listing exists and is active
    listing_doc = db.collection(LISTINGS_COLLECTION).document(bid.listing_id).get()
    if not listing_doc.exists:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing_data = listing_doc.to_dict()
    if listing_data.get("status") != "active":
        raise HTTPException(status_code=400, detail="Listing is no longer active")

    # Create bid
    doc_ref = db.collection(BIDS_COLLECTION).document()
    bid_data = bid.dict()
    bid_data.update({
        "id": doc_ref.id,
        "status": "pending",
        "created_at": datetime.now()
    })
    doc_ref.set(bid_data)
    return BidResponse(**bid_data)


@router.get("/listing/{listing_id}", response_model=List[BidResponse])
async def get_bids_for_listing(listing_id: str):
    """Get all bids for a specific listing (farmer sees bids)"""
    docs = db.collection(BIDS_COLLECTION).where("listing_id", "==", listing_id).stream()
    bids = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        bids.append(BidResponse(**data))
    return bids


@router.put("/{bid_id}/accept")
async def accept_bid(bid_id: str):
    """Farmer accepts a bid (matches driver with listing)"""
    bid_doc = db.collection(BIDS_COLLECTION).document(bid_id).get()
    if not bid_doc.exists:
        raise HTTPException(status_code=404, detail="Bid not found")

    bid_data = bid_doc.to_dict()
    listing_id = bid_data.get("listing_id")

    # Update bid status to accepted
    bid_doc.reference.update({"status": "accepted"})

    # Update listing status to matched
    db.collection(LISTINGS_COLLECTION).document(listing_id).update({"status": "matched"})

    return {"message": "Bid accepted, driver notified", "listing_id": listing_id, "bid_id": bid_id}