from fastapi import APIRouter
from backend.db import get_random_quizzes,get_quiz_info,save_quiz_attempt

router = APIRouter(prefix="/employee", tags=["employee"])

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


