from fastapi import APIRouter
from backend.db import get_all_submissions,get_user_report


router = APIRouter(prefix="/manager", tags=["manager"])

@router.get("/progress")
async def get_all_employee_progress():
    return get_all_submissions()

@router.get("/report/{user_id}")
async def get_user_learning_report(user_id: str):
    # Try get cached report
    existing = get_user_report(user_id)
    if existing:
        return existing
    return None
    
