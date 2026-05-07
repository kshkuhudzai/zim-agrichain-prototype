from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from typing import List
from .. import firebase_config
from ..models import ListingCreate, ListingResponse
from ..auth_deps import get_current_user

router = APIRouter(prefix="/listings", tags=["listings"])
db = firebase_config.get_db()
LISTINGS_COLLECTION = "listings"

@router.post("/", response_model=ListingResponse)
async def create_listing(listing: ListingCreate, current_user = Depends(get_current_user)):
    """Farmer posts a new crop listing (authenticated)"""
    doc_ref = db.collection(LISTINGS_COLLECTION).document()
    listing_data = listing.dict()
    listing_data.update({
        "id": doc_ref.id,
        "farmer_id": current_user['uid'],
        "status": "active",
        "created_at": datetime.now()
    })
    doc_ref.set(listing_data)
    return ListingResponse(**listing_data)

@router.get("/", response_model=List[ListingResponse])
async def get_active_listings():
    """Get all active listings (public)"""
    docs = db.collection(LISTINGS_COLLECTION).where("status", "==", "active").stream()
    listings = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        listings.append(ListingResponse(**data))
    return listings

@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(listing_id: str):
    """Get a single listing by ID"""
    doc = db.collection(LISTINGS_COLLECTION).document(listing_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Listing not found")
    data = doc.to_dict()
    data["id"] = doc.id
    return ListingResponse(**data)

@router.get("/my-listings", response_model=List[ListingResponse])
async def get_my_listings(current_user = Depends(get_current_user)):
    """Get listings posted by the authenticated farmer"""
    docs = db.collection(LISTINGS_COLLECTION).where("farmer_id", "==", current_user['uid']).stream()
    listings = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        listings.append(ListingResponse(**data))
    return listings