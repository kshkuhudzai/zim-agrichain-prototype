from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from typing import List
from .. import firebase_config
from ..models import ListingCreate, ListingResponse
from ..auth_deps import get_current_user_role

router = APIRouter(prefix="/listings", tags=["listings"])
db = firebase_config.get_db()
LISTINGS_COLLECTION = "listings"

def is_farmer(role_info):
    if role_info['role'] != 'farmer':
        raise HTTPException(status_code=403, detail="Only farmers can create listings")
    return role_info

@router.post("/", response_model=ListingResponse)
async def create_listing(listing: ListingCreate, role_info = Depends(get_current_user_role)):
    is_farmer(role_info)
    doc_ref = db.collection(LISTINGS_COLLECTION).document()
    listing_data = listing.dict()
    listing_data.update({
        "id": doc_ref.id,
        "farmer_id": role_info['uid'],
        "status": "active",
        "created_at": datetime.now()
    })
    doc_ref.set(listing_data)
    return ListingResponse(**listing_data)

@router.get("/", response_model=List[ListingResponse])
async def get_active_listings():
    docs = db.collection(LISTINGS_COLLECTION).where("status", "==", "active").stream()
    return [ListingResponse(**doc.to_dict() | {"id": doc.id}) for doc in docs]

@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(listing_id: str):
    doc = db.collection(LISTINGS_COLLECTION).document(listing_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Listing not found")
    return ListingResponse(**doc.to_dict() | {"id": doc.id})

@router.get("/my-listings", response_model=List[ListingResponse])
async def get_my_listings(role_info = Depends(get_current_user_role)):
    if role_info['role'] != 'farmer':
        raise HTTPException(status_code=403, detail="Only farmers can view their listings")
    docs = db.collection(LISTINGS_COLLECTION).where("farmer_id", "==", role_info['uid']).stream()
    return [ListingResponse(**doc.to_dict() | {"id": doc.id}) for doc in docs]

@router.get("/with-bids", response_model=List[dict])
async def get_listings_with_bids(role_info = Depends(get_current_user_role)):
    """Performance: fetch farmer's listings with their bids embedded"""
    if role_info['role'] != 'farmer':
        raise HTTPException(status_code=403, detail="Only farmers")
    listings_snapshot = db.collection(LISTINGS_COLLECTION).where("farmer_id", "==", role_info['uid']).stream()
    result = []
    for listing_doc in listings_snapshot:
        listing_data = listing_doc.to_dict()
        listing_data["id"] = listing_doc.id
        bids_snapshot = db.collection("bids").where("listing_id", "==", listing_doc.id).stream()
        bids = [bid.to_dict() | {"id": bid.id} for bid in bids_snapshot]
        listing_data["bids"] = bids
        result.append(listing_data)
    return result