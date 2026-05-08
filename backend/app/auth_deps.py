from fastapi import HTTPException, Header, Depends
from . import firebase_config

async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    parts = authorization.split()
    if parts[0].lower() != "bearer" or len(parts) != 2:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    token = parts[1]
    decoded = firebase_config.verify_firebase_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return decoded

async def get_current_user_role(current_user = Depends(get_current_user)):
    """Fetch user role from Firestore"""
    user_doc = firebase_config.db.collection("users").document(current_user['uid']).get()
    if not user_doc.exists:
        raise HTTPException(status_code=403, detail="User profile not found")
    role = user_doc.to_dict().get("role")
    if not role:
        raise HTTPException(status_code=403, detail="User role not set")
    return {"uid": current_user['uid'], "email": current_user.get('email'), "role": role}