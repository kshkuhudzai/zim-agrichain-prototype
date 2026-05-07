from fastapi import APIRouter, Depends
from ..auth_deps import get_current_user
from .. import firebase_config

router = APIRouter(prefix="/drivers", tags=["drivers"])
db = firebase_config.get_db()

@router.post("/location")
async def update_location(location: dict, current_user = Depends(get_current_user)):
    """Driver updates their live location"""
    db.collection("driver_locations").document(current_user['uid']).set({
        "lat": location.get("lat"),
        "lng": location.get("lng"),
        "updated_at": firebase_config.firestore.SERVER_TIMESTAMP
    })
    return {"status": "ok"}

@router.get("/location/{driver_id}")
async def get_driver_location(driver_id: str):
    """Farmer fetches driver's live location"""
    doc = db.collection("driver_locations").document(driver_id).get()
    if doc.exists:
        return doc.to_dict()
    return {"error": "Location not available"}