from fastapi import APIRouter, Query
from backend.db import get_problem_solving_cases, get_problem_solving_case_by_id
from typing import Optional

router = APIRouter(prefix="/problem-solving", tags=["problem-solving"])

@router.get("/cases")
async def get_cases(
    dimension: Optional[str] = Query(None, description="Filter by skill dimension"),
    role: Optional[str] = Query(None, description="Filter by role"),
    limit: int = Query(10, description="Maximum number of cases to return")
):
    """
    Get problem solving cases from the database
    """
    try:
        cases = get_problem_solving_cases(dimension=dimension, role=role, limit=limit)
        return {
            "success": True,
            "data": cases,
            "count": len(cases)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "data": []
        }

@router.get("/cases/{case_id}")
async def get_case_by_id(case_id: int):
    """
    Get a specific problem solving case by ID
    """
    try:
        case = get_problem_solving_case_by_id(case_id)
        if case:
            return {
                "success": True,
                "data": case
            }
        else:
            return {
                "success": False,
                "error": "Case not found",
                "data": None
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "data": None
        }
