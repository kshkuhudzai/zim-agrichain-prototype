from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ========== Listing (Farmer posts crop for sale) ==========
class ListingCreate(BaseModel):
    farmer_id: str
    crop_name: str
    quantity_kg: float
    price_per_kg: float
    location: str
    destination: str          # NEW: drop-off location
    harvest_date: str
    notes: Optional[str] = None

class ListingResponse(BaseModel):
    id: str
    farmer_id: str
    crop_name: str
    quantity_kg: float
    price_per_kg: float
    location: str
    destination: str          # NEW
    status: str
    created_at: datetime
    harvest_date: str
    notes: Optional[str] = None

# ========== Bid (Driver offers transport) ==========
class BidCreate(BaseModel):
    listing_id: str
    driver_id: str
    bid_price: float
    vehicle_type: str
    estimated_arrival_hours: int

class BidResponse(BaseModel):
    id: str
    listing_id: str
    driver_id: str
    bid_price: float
    status: str
    created_at: datetime
    vehicle_type: str
    estimated_arrival_hours: int

# ========== Transaction (Immutable log) ==========
class TransactionRecord(BaseModel):
    listing_id: str
    buyer_id: str
    driver_id: str
    final_price: float
    status: str
    blockchain_ref: str
    timestamp: datetime