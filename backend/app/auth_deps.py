from fastapi import HTTPException, Header
from . import firebase_config


async def get_current_user(authorization: str = Header(None)):
    """Extract and verify Firebase ID token from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    parts = authorization.split()
    if parts[0].lower() != "bearer" or len(parts) != 2:
        raise HTTPException(status_code=401, detail="Invalid authorization header format. Expected 'Bearer <token>'")

    token = parts[1]
    decoded = firebase_config.verify_firebase_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return decoded