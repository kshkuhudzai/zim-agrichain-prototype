from fastapi import APIRouter, HTTPException
from datetime import datetime
from typing import List
from .. import firebase_config
from ..models import TransactionRecord

router = APIRouter(prefix="/transactions", tags=["transactions"])
db = firebase_config.get_db()
TRANSACTIONS_COLLECTION = "transactions"
LISTINGS_COLLECTION = "listings"
BIDS_COLLECTION = "bids"


@router.post("/complete")
async def complete_transaction(listing_id: str, buyer_id: str, driver_id: str, final_price: float):
    """Create an immutable transaction record after delivery is confirmed"""
    # Verify listing and bid exist
    listing_doc = db.collection(LISTINGS_COLLECTION).document(listing_id).get()
    if not listing_doc.exists:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Create transaction record with mock blockchain hash
    doc_ref = db.collection(TRANSACTIONS_COLLECTION).document()
    transaction_data = {
        "id": doc_ref.id,
        "listing_id": listing_id,
        "buyer_id": buyer_id,
        "driver_id": driver_id,
        "final_price": final_price,
        "status": "completed",
        "blockchain_ref": f"mock_tx_{datetime.now().timestamp()}",  # Simulated blockchain hash
        "timestamp": datetime.now()
    }
    doc_ref.set(transaction_data)

    # Update listing status to delivered
    db.collection(LISTINGS_COLLECTION).document(listing_id).update({"status": "delivered"})

    return {"message": "Transaction recorded immutably", "transaction": transaction_data}


@router.get("/listing/{listing_id}", response_model=List[dict])
async def get_transactions_for_listing(listing_id: str):
    """Get all transactions for a listing (audit trail)"""
    docs = db.collection(TRANSACTIONS_COLLECTION).where("listing_id", "==", listing_id).stream()
    transactions = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        transactions.append(data)
    return transactions


@router.get("/")
async def get_all_transactions():
    """Get all transactions (admin view)"""
    docs = db.collection(TRANSACTIONS_COLLECTION).stream()
    transactions = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        transactions.append(data)
    return transactions