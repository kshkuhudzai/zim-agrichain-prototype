from fastapi import APIRouter, Depends, HTTPException
from ..auth_deps import get_current_user_role
from .. import firebase_config

router = APIRouter(prefix="/drivers", tags=["drivers"])
db = firebase_config.get_db()

@router.post("/location")
async def update_location(location: dict, role_info = Depends(get_current_user_role)):
    """Driver updates live location – only drivers allowed"""
    if role_info['role'] != 'driver':
        raise HTTPException(status_code=403, detail="Only drivers can update location")
    db.collection("driver_locations").document(role_info['uid']).set({
        "lat": location.get("lat"),
        "lng": location.get("lng"),
        "updated_at": firebase_config.firestore.SERVER_TIMESTAMP
    })
    return {"status": "ok"}

@router.get("/location/{driver_id}")
async def get_driver_location(driver_id: str, role_info = Depends(get_current_user_role)):
    """Farmer or buyer can view driver location – any authenticated user"""
    doc = db.collection("driver_locations").document(driver_id).get()
    if doc.exists:
        return doc.to_dict()
    return {"error": "Location not available"}

# Delivery confirmation (escrow step 1)
@router.post("/confirm-delivery")
async def confirm_delivery(data: dict, role_info = Depends(get_current_user_role)):
    """
    Driver confirms that goods have been delivered.
    This will later trigger payment release to farmer.
    """
    if role_info['role'] != 'driver':
        raise HTTPException(status_code=403, detail="Only drivers can confirm delivery")
    listing_id = data.get("listing_id")
    if not listing_id:
        raise HTTPException(status_code=400, detail="Missing listing_id")
    # Verify the driver is assigned to this listing (via accepted bid)
    bids_ref = db.collection("bids").where("listing_id", "==", listing_id).where("driver_id", "==", role_info['uid']).where("status", "==", "accepted")
    bids = bids_ref.stream()
    if not any(bids):
        raise HTTPException(status_code=403, detail="You are not assigned to this delivery")
    # Update listing status to "delivered" (waiting for farmer confirmation)
    listing_ref = db.collection("listings").document(listing_id)
    listing_ref.update({"status": "pending_farmer_confirmation"})
    return {"message": "Delivery marked. Awaiting farmer confirmation."}