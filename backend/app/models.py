from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ListingCreate(BaseModel):
    farmer_id: str
    crop_name: str
    quantity_kg: float
    price_per_kg: float
    location: Optional[str] = None
    pickup_lat: float
    pickup_lng: float
    destination: Optional[str] = None   
    dest_lat: float
    dest_lng: float
    harvest_date: str
    notes: Optional[str] = None

class ListingResponse(BaseModel):
    id: str
    farmer_id: str
    crop_name: str
    quantity_kg: float
    price_per_kg: float
    location: Optional[str] = None
    pickup_lat: float
    pickup_lng: float
    destination: Optional[str] = None
    dest_lat: float
    dest_lng: float
    status: str
    created_at: datetime
    harvest_date: str
    notes: Optional[str] = None

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

class TransactionRecord(BaseModel):
    listing_id: str
    buyer_id: str
    driver_id: str
    final_price: float
    status: str
    blockchain_ref: str
    timestamp: datetime