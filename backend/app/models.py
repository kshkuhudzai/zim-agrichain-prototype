from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ========== Listing (Farmer posts crop for sale) ==========
class ListingCreate(BaseModel):
    farmer_id: str
    crop_name: str          # e.g., "Maize", "Tomatoes"
    quantity_kg: float
    price_per_kg: float
    location: str           # e.g., "Harare", "Bulawayo"
    harvest_date: str       # ISO format date
    notes: Optional[str] = None

class ListingResponse(BaseModel):
    id: str
    farmer_id: str
    crop_name: str
    quantity_kg: float
    price_per_kg: float
    location: str
    status: str             # "active", "matched", "delivered"
    created_at: datetime
    harvest_date: str
    notes: Optional[str] = None

# ========== Bid (Driver offers transport) ==========
class BidCreate(BaseModel):
    listing_id: str
    driver_id: str
    bid_price: float          # Transport cost
    vehicle_type: str         # "truck", "van", "pickup"
    estimated_arrival_hours: int

class BidResponse(BaseModel):
    id: str
    listing_id: str
    driver_id: str
    bid_price: float
    status: str               # "pending", "accepted", "rejected"
    created_at: datetime
    vehicle_type: str
    estimated_arrival_hours: int

# ========== Transaction (Immutable log) ==========
class TransactionRecord(BaseModel):
    listing_id: str
    buyer_id: str
    driver_id: str
    final_price: float        # Crop price + transport
    status: str               # "completed", "disputed"
    blockchain_ref: str       # Mock transaction hash
    timestamp: datetime