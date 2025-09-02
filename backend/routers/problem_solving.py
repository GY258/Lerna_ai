from fastapi import APIRouter, Query
from backend.db import get_problem_solving_cases, get_problem_solving_case_by_id
from backend.llm_helper import generate_problem_solving_feedback
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/problem-solving", tags=["problem-solving"])

class ProblemSolvingFeedbackRequest(BaseModel):
    case_title: str
    case_background: str
    case_problem: str
    user_response: str
    user_role: str
    skill_dimension: str

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

@router.post("/feedback")
async def get_problem_solving_feedback(request: ProblemSolvingFeedbackRequest):
    """
    Generate AI feedback for problem solving case analysis
    """
    try:
        feedback = generate_problem_solving_feedback(
            case_title=request.case_title,
            case_background=request.case_background,
            case_problem=request.case_problem,
            user_response=request.user_response,
            user_role=request.user_role,
            skill_dimension=request.skill_dimension
        )
        
        return {
            "success": True,
            "feedback": feedback
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "feedback": "抱歉，无法生成反馈。请稍后再试。"
        }
