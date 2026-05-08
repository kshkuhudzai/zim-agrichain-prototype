from fastapi import APIRouter, Depends, HTTPException
from ..auth_deps import get_current_user_role
from .. import firebase_config

router = APIRouter(prefix="/transactions", tags=["transactions"])
db = firebase_config.get_db()


@router.get("/my")
async def get_my_transactions(role_info=Depends(get_current_user_role)):
    """
    Return transactions where the current user is buyer, driver, or the farmer who owns the listing.
    """
    uid = role_info['uid']
    role = role_info['role']

    # First, get all listings where this user is the farmer
    farmer_listing_ids = []
    if role == 'farmer':
        listings = db.collection("listings").where("farmer_id", "==", uid).stream()
        farmer_listing_ids = [doc.id for doc in listings]

    # Query transactions: buyer_id == uid OR driver_id == uid OR listing_id in farmer_listing_ids
    transactions = []
    # By buyer
    buyer_tx = db.collection("transactions").where("buyer_id", "==", uid).stream()
    # By driver
    driver_tx = db.collection("transactions").where("driver_id", "==", uid).stream()
    # By farmer (listing_id in list)
    farmer_tx = []
    if farmer_listing_ids:
        # Firestore 'in' query limited to 10, so handle in batches or use a loop
        for listing_id in farmer_listing_ids:
            tx = db.collection("transactions").where("listing_id", "==", listing_id).stream()
            farmer_tx.extend(tx)

    all_docs = list(buyer_tx) + list(driver_tx) + farmer_tx
    seen = set()
    for doc in all_docs:
        if doc.id not in seen:
            seen.add(doc.id)
            data = doc.to_dict()
            data["id"] = doc.id
            # Enrich with listing info (crop name etc.)
            listing_doc = db.collection("listings").document(data["listing_id"]).get()
            if listing_doc.exists:
                listing_data = listing_doc.to_dict()
                data["crop_name"] = listing_data.get("crop_name")
                data["quantity_kg"] = listing_data.get("quantity_kg")
                data["price_per_kg"] = listing_data.get("price_per_kg")
            transactions.append(data)

    # Sort by timestamp descending
    transactions.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return transactions