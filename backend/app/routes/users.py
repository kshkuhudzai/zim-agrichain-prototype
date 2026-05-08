from fastapi import APIRouter, Depends
from ..auth_deps import get_current_user_role

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me")
async def get_me(role_info = Depends(get_current_user_role)):
    """Return current user's role and basic info"""
    return {
        "uid": role_info['uid'],
        "email": role_info['email'],
        "role": role_info['role']
    }