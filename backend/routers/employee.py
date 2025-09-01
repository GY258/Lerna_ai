from fastapi import APIRouter
from backend.db import get_random_quizzes,get_quiz_info,save_quiz_attempt
from backend.config import SKILL_DIMENSIONS

router = APIRouter(prefix="/employee", tags=["employee"])

@router.get("/skill-dimensions/{role}")
async def get_skill_dimensions(role: str):
    """
    Get skill dimensions for a specific role
    """
    if role in SKILL_DIMENSIONS["roles"]:
        return {
            "role": role,
            "skill_dimensions": SKILL_DIMENSIONS["roles"][role]["skill_dimensions"]
        }
    else:
        return {"error": f"Role '{role}' not found"}

@router.get("/roles")
async def get_available_roles():
    """
    Get all available roles
    """
    return {"roles": list(SKILL_DIMENSIONS["roles"].keys())}

@router.post("/skill-dimensions")
async def get_user_skill_dimensions(payload: dict):
    """
    Get skill dimensions for a user based on their role
    Expected payload: {"role": "store_manager" or "head_chef"}
    """
    role = payload.get("role")
    if not role:
        return {"error": "Role is required"}
    
    if role in SKILL_DIMENSIONS["roles"]:
        return {
            "role": role,
            "skill_dimensions": SKILL_DIMENSIONS["roles"][role]["skill_dimensions"]
        }
    else:
        return {"error": f"Role '{role}' not found"}

@router.get("/quizzes/{user_id}")
async def get_quizzes_for_user(user_id: str):
    # Later: lookup assigned quizzes from DB
    # For now: return 3 random quizzes
    selected_quizzes = get_random_quizzes(count=20)
    return selected_quizzes

@router.post("/submit")
async def submit_quiz(payload: dict):
    quiz_id = payload["quiz_id"]
    user_id = payload["user_id"]
    answer = payload["answer"]

    quiz = get_quiz_info(quiz_id)
    correct = (answer.strip().lower() == quiz["answer"].strip().lower())

    save_quiz_attempt(user_id, quiz_id, answer, correct)

    return {"correct": correct, "score": 1 if correct else 0}


